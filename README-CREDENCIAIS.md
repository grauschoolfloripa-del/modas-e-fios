# Credenciais — o que falta para o site ficar 100% no ar

O código de todas as fases está pronto. Faltam só as chaves reais, que
você mesma cria e cola nos lugares certos. Nenhuma delas eu consigo
gerar — são vinculadas às suas contas.

## 1. Supabase (obrigatório — sem isso, nada de login/loja gerenciada/pagamento funciona)

1. Crie uma conta grátis em https://supabase.com e um novo projeto.
2. Abra o **SQL Editor** do projeto, cole o conteúdo de `supabase/schema.sql`
   inteiro, e rode. Isso cria todas as tabelas, as regras de segurança
   e já cadastra os 4 itens de exemplo da loja.
3. Em **Project Settings → Data API**, copie a **Project URL**.
4. Em **Project Settings → API Keys**, copie a chave **anon public** e a
   chave **service_role** (essa é secreta — nunca compartilhe).
5. Copie `.env.local.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
6. Reinicie o site (`npm run dev` ou redeploy na Vercel).
7. Crie sua conta pelo próprio site, em `/cadastro`.
8. Volte ao **SQL Editor** do Supabase e rode (trocando pelo seu e-mail):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'voce@exemplo.com');
   ```
   Esse é o único jeito de virar admin — por segurança, não existe botão
   para isso na interface.
9. Acesse `/admin` — o painel deve abrir.

## 2. Mercado Pago (pelo painel — não precisa mexer em arquivo nenhum)

1. Entre em https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação (ou use uma existente) → **Credenciais de produção**.
3. Copie o **Access Token** e a **Public Key**.
4. No mesmo painel, configure a notificação de **Webhooks** apontando para:
   `https://SEU-DOMINIO/api/webhooks/mercadopago`
   — o Mercado Pago mostra uma **chave secreta** nesse momento, copie também.
5. No site, acesse `/admin/configuracoes` e cole os 3 valores. Pronto —
   o botão "Comprar" substitui automaticamente a lista de espera assim
   que o Access Token estiver salvo.

## 3. Vercel (para o site ficar no ar de verdade, com domínio próprio)

1. Conecte o repositório GitHub `modas-e-fios` na Vercel.
2. Em **Environment Variables**, adicione as mesmas 3 variáveis do
   Supabase (passo 1) — a Vercel não lê o `.env.local`, que é só local.
3. Adicione também `NEXT_PUBLIC_SITE_URL` com o domínio real
   (ex: `https://modaesfios.com.br`) — é usado nos links de e-mail e
   no retorno do Mercado Pago.

## O que NÃO precisa de credencial nenhuma (já funciona hoje)

- Landing page, transição 3D, catálogo (com dados de exemplo)
- Lista de espera (grava num arquivo local até o Supabase estar conectado)
- PWA: instalar na tela inicial, ícones, offline do "casco" do site
