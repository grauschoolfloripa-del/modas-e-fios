import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";

/**
 * Cria um pedido (pendente) e uma preferência de pagamento no Mercado Pago
 * (Checkout Pro). O preço vem sempre do banco — nunca do que o navegador
 * envia — para não dar brecha de alguém pagar menos do que deveria.
 */
export async function POST(request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Loja ainda não configurada." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "É preciso estar logada para comprar.", needsLogin: true }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const productSlug = String(body.productSlug || "");
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const deliveryMethod = body.deliveryMethod === "retirada" ? "retirada" : body.deliveryMethod === "envio" ? "envio" : null;
  const shippingAddress = body.shippingAddress && typeof body.shippingAddress === "object" ? body.shippingAddress : null;

  const { data: product } = await supabase
    .from("products")
    .select("id, slug, type, title, price_cents, published")
    .eq("slug", productSlug)
    .single();

  if (!product || !product.published) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  // peça física: telefone e entrega são obrigatórios (curso não precisa)
  if (product.type === "produto") {
    if (!customerName || !phone || !deliveryMethod) {
      return NextResponse.json({ error: "Preencha seus dados de contato e entrega." }, { status: 400 });
    }
    if (deliveryMethod === "envio") {
      const required = ["cep", "rua", "numero", "bairro", "cidade", "estado"];
      const missing = required.some((k) => !shippingAddress || !String(shippingAddress[k] || "").trim());
      if (missing) {
        return NextResponse.json({ error: "Preencha o endereço completo para o envio." }, { status: 400 });
      }
    }
  }

  const accessToken = await getSetting("mp_access_token");
  if (!accessToken) {
    return NextResponse.json(
      { error: "Pagamentos ainda não foram configurados. Fale com o atelier." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Erro interno de configuração." }, { status: 500 });
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      product_id: product.id,
      status: "pending",
      amount_cents: product.price_cents,
      customer_name: customerName || null,
      phone: phone || null,
      delivery_method: deliveryMethod,
      shipping_address: shippingAddress,
      fulfillment_status: "aguardando_pagamento",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  // guarda nome/telefone no perfil também, pra próxima compra já vir preenchido
  if (customerName || phone) {
    await supabase
      .from("profiles")
      .update({
        ...(customerName ? { full_name: customerName } : {}),
        ...(phone ? { phone } : {}),
      })
      .eq("id", user.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  try {
    const { MercadoPagoConfig, Preference } = await import("mercadopago");
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: product.id,
            title: product.title,
            quantity: 1,
            unit_price: product.price_cents / 100,
            currency_id: "BRL",
          },
        ],
        external_reference: order.id,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${siteUrl}/conta?compra=sucesso`,
          pending: `${siteUrl}/conta?compra=pendente`,
          failure: `${siteUrl}/loja/${product.slug}?compra=falhou`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ initPoint: result.init_point });
  } catch (err) {
    console.error("Erro ao criar preferência no Mercado Pago:", err);
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: "Erro ao iniciar o pagamento. Tente novamente." }, { status: 500 });
  }
}
