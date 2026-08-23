import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar · Modas e Fios" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/conta";

  return (
    <section className="contact auth-page">
      <div className="container auth-page-inner">
        <div className="contact-intro">
          <p className="eyebrow">Bem-vinda de volta</p>
          <h1 className="contact-title">Entrar</h1>
          <p className="contact-text">
            Acesse sua conta para ver seus pedidos e seus cursos.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </section>
  );
}
