import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";

/**
 * Webhook do Mercado Pago — é a ÚNICA via que libera acesso a um curso ou
 * confirma a compra de uma peça. O navegador nunca informa "já paguei";
 * quem confirma é o Mercado Pago, chamando esta rota diretamente.
 *
 * Segurança: valida a assinatura HMAC (x-signature), reconsulta o
 * pagamento na API do MP (nunca confia só no corpo da notificação),
 * confere o valor pago contra o preço salvo no banco, e é idempotente
 * (a mesma notificação processada duas vezes não duplica nada).
 */

function verifySignature(request, secret) {
  const xSignature = request.headers.get("x-signature") || "";
  const xRequestId = request.headers.get("x-request-id") || "";
  const dataId = request.nextUrl.searchParams.get("data.id") || "";

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true }); // sem Supabase, nada a fazer

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // só nos interessa notificação de pagamento
  if (body.type && body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const webhookSecret = await getSetting("mp_webhook_secret");
  const accessToken = await getSetting("mp_access_token");
  if (!webhookSecret || !accessToken) {
    console.warn("Webhook recebido mas Mercado Pago não está totalmente configurado.");
    return NextResponse.json({ ok: true });
  }

  if (!verifySignature(request, webhookSecret)) {
    console.warn("Webhook do Mercado Pago com assinatura inválida — ignorado.");
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const notificationId = String(body.id || request.nextUrl.searchParams.get("data.id") || "");
  if (!notificationId) return NextResponse.json({ ok: true });

  // idempotência: se já processamos esta notificação, não faz nada de novo
  const { data: already } = await admin
    .from("webhook_events")
    .select("id, processed_at")
    .eq("provider", "mercadopago")
    .eq("event_id", notificationId)
    .maybeSingle();

  if (already?.processed_at) {
    return NextResponse.json({ ok: true });
  }
  if (!already) {
    await admin
      .from("webhook_events")
      .insert({ provider: "mercadopago", event_id: notificationId, payload: body });
  }

  const paymentId = body.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  // nunca confia no corpo da notificação — reconsulta o pagamento de verdade
  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!paymentRes.ok) {
    console.error("Falha ao consultar pagamento no Mercado Pago:", paymentRes.status);
    return NextResponse.json({ ok: true });
  }
  const payment = await paymentRes.json();

  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return NextResponse.json({ ok: true });

  // confere se o valor pago bate com o preço salvo (evita pedido adulterado)
  const paidCents = Math.round((payment.transaction_amount || 0) * 100);
  const amountMatches = paidCents === order.amount_cents;

  const statusMap = {
    approved: "approved",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "refunded",
  };
  const newStatus = amountMatches ? statusMap[payment.status] || order.status : "rejected";

  await admin.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", order.id);

  await admin.from("payments").insert({
    order_id: order.id,
    provider: "mercadopago",
    provider_payment_id: String(payment.id),
    method: payment.payment_type_id,
    installments: payment.installments,
    raw: payment,
  });

  if (newStatus === "approved") {
    const { data: product } = await admin
      .from("products")
      .select("access_type, access_duration_days")
      .eq("id", order.product_id)
      .single();

    let expiresAt = null;
    if (product?.access_type === "periodo" && product.access_duration_days) {
      const d = new Date();
      d.setDate(d.getDate() + product.access_duration_days);
      expiresAt = d.toISOString();
    }

    await admin
      .from("enrollments")
      .upsert(
        { user_id: order.user_id, product_id: order.product_id, order_id: order.id, expires_at: expiresAt },
        { onConflict: "user_id,product_id" }
      );
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider", "mercadopago")
    .eq("event_id", notificationId);

  return NextResponse.json({ ok: true });
}
