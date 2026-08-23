"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeaderShadow(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <header
      className="site-header"
      style={{ boxShadow: headerShadow ? "0 1px 24px rgba(61,43,31,0.08)" : "none" }}
    >
      <div className="container header-inner">
        <Link href="/" className="logo">
          Modas <span className="logo-amp">&</span> Fios
        </Link>

        <nav className={`nav${navOpen ? " open" : ""}`} aria-label="Navegação principal">
          <Link href="/loja" onClick={closeNav}>Loja</Link>
          <Link href="/#servicos" onClick={closeNav}>Serviços</Link>
          <Link href="/#colecao" onClick={closeNav}>Coleção</Link>
          <Link href="/#sobre" onClick={closeNav}>Sobre Nós</Link>
          <Link href="/#contato" onClick={closeNav}>Contato</Link>
        </nav>

        <div className="header-actions">
          <Link href="/#contato" className="btn btn-outline btn-sm">Agendar Consulta</Link>
          <button
            className={`nav-toggle${navOpen ? " open" : ""}`}
            aria-label="Abrir menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
