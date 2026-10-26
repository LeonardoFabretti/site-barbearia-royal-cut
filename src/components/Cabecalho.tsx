"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import BotaoTema from "@/components/BotaoTema";
import Logo from "@/components/Logo";
import { ENDERECO } from "@/lib/conteudo";

const LINKS = [
  { href: "#quem-somos", texto: "Quem somos" },
  { href: "#servicos", texto: "Barbearia" },
  { href: "#feminino", texto: "Feminino" },
  { href: "#avaliacoes", texto: "Avaliações" },
  { href: "#localizacao", texto: "Localização" },
];

// Destrava a rolagem da página (o menu aberto trava com overflow: hidden).
function liberarRolagem() {
  document.documentElement.style.overflow = "";
}

function assinarRolagem(avisar: () => void) {
  window.addEventListener("scroll", avisar, { passive: true });
  return () => window.removeEventListener("scroll", avisar);
}

export default function Cabecalho({ nome }: { nome: string }) {
  const rolou = useSyncExternalStore(assinarRolagem, () => window.scrollY > 24, () => false);
  const [menuAberto, setMenuAberto] = useState(false);

  // Com o menu aberto: a página de trás não rola e a tecla Esc fecha.
  useEffect(() => {
    if (!menuAberto) return;
    const raiz = document.documentElement;
    raiz.style.overflow = "hidden";
    const aoApertar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    window.addEventListener("keydown", aoApertar);
    return () => {
      liberarRolagem();
      window.removeEventListener("keydown", aoApertar);
    };
  }, [menuAberto]);

  const fechar = () => setMenuAberto(false);

  // Links do menu do celular: com o menu aberto a página está travada, então
  // primeiro libera a rolagem e só depois rola até a seção.
  function irPara(evento: React.MouseEvent<HTMLAnchorElement>, href: string) {
    evento.preventDefault();
    liberarRolagem();
    setMenuAberto(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          menuAberto
            ? "border-b border-transparent py-4"
            : rolou
              ? "border-b border-borda bg-fundo/95 py-2 shadow-lg shadow-black/10"
              : "border-b border-transparent py-4"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#quem-somos" className="flex items-center gap-3" onClick={fechar}>
            <Logo className="h-10 w-10 sm:h-11 sm:w-11" />
            <span className="font-display text-lg font-semibold leading-tight sm:text-xl">{nome}</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Seções">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative text-sm text-texto-suave transition-colors hover:text-texto after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-dourado after:transition-all hover:after:w-full"
              >
                {l.texto}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <BotaoTema />

            <a
              href="#agendar"
              className="hidden rounded-full bg-dourado px-5 py-2.5 text-sm font-semibold text-sobre-dourado transition-transform hover:scale-105 sm:inline-block"
            >
              Agendar
            </a>

            {/* sanduíche que vira X */}
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              aria-controls="menu-celular"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden ${
                menuAberto ? "border-dourado text-dourado-texto" : "border-borda"
              }`}
            >
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
                  menuAberto ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuAberto ? "scale-x-0 opacity-0" : ""
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
                  menuAberto ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Menu do celular em tela cheia: abre num círculo que cresce a partir do botão */}
      <div
        id="menu-celular"
        aria-hidden={!menuAberto}
        inert={!menuAberto}
        className={`fundo-brilho fixed inset-0 z-40 flex flex-col bg-fundo px-6 pb-10 pt-28 md:hidden ${
          menuAberto ? "visible" : "invisible"
        }`}
        style={{
          clipPath: menuAberto
            ? "circle(150% at calc(100% - 36px) 36px)"
            : "circle(0% at calc(100% - 36px) 36px)",
          // ao abrir, fica visível na hora; ao fechar, só some depois que o círculo encolhe
          transition: menuAberto
            ? "clip-path 700ms cubic-bezier(0.7,0,0.2,1)"
            : "clip-path 700ms cubic-bezier(0.7,0,0.2,1), visibility 0s linear 700ms",
        }}
      >
        {/* logo grande e apagado ao fundo */}
        <Logo className="pointer-events-none absolute -bottom-16 -right-20 h-80 w-80 opacity-[0.06]" />

        <nav aria-label="Seções" className="flex flex-1 flex-col justify-center">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l, i) => (
              <li
                key={l.href}
                className={`transition-all duration-500 ${menuAberto ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                style={{ transitionDelay: menuAberto ? `${200 + i * 70}ms` : "0ms" }}
              >
                <a
                  href={l.href}
                  onClick={(e) => irPara(e, l.href)}
                  className="group flex items-baseline gap-4 border-b border-borda/60 py-4"
                >
                  <span className="w-6 text-xs font-semibold tabular-nums text-dourado-texto">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-3xl font-semibold transition-colors group-hover:text-dourado-texto">
                    {l.texto}
                  </span>
                  <span aria-hidden className="ml-auto text-dourado-texto transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`transition-all duration-500 ${menuAberto ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          style={{ transitionDelay: menuAberto ? `${200 + LINKS.length * 70}ms` : "0ms" }}
        >
          <a
            href="#agendar"
            onClick={(e) => irPara(e, "#agendar")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-dourado text-lg font-semibold text-sobre-dourado shadow-lg shadow-dourado/20"
          >
            Agendar horário
          </a>
          <p className="mt-5 text-center text-sm text-texto-suave">
            {ENDERECO.linha1} · {ENDERECO.linha2}
          </p>
        </div>
      </div>
    </>
  );
}
