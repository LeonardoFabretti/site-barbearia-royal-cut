"use client";

import { useSyncExternalStore } from "react";

type Tema = "escuro" | "claro";

// O tema fica no atributo data-tema do <html> (o script do layout aplica o salvo).
function assinarTema(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  return () => observador.disconnect();
}
const temaAtual = (): Tema => (document.documentElement.dataset.tema === "claro" ? "claro" : "escuro");

export default function BotaoTema() {
  const tema = useSyncExternalStore(assinarTema, temaAtual, () => "escuro" as Tema);

  function trocarTema() {
    const novo: Tema = tema === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // navegação anônima pode bloquear o localStorage: o tema só não fica salvo
    }
  }

  return (
    <button
      type="button"
      onClick={trocarTema}
      aria-label={tema === "escuro" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-borda text-dourado-texto transition-all hover:rotate-45 hover:border-dourado"
    >
      {tema === "escuro" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
