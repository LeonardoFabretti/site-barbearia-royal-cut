"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Revelar from "@/components/Revelar";

type Avaliacao = { nome: string; nota: number; servico: string; texto: string };

const INTERVALO = 5000; // troca de página a cada 5 segundos

// Quantos cards cabem lado a lado: 3 no computador, 2 no tablet, 1 no celular.
function assinarTela(avisar: () => void) {
  window.addEventListener("resize", avisar);
  return () => window.removeEventListener("resize", avisar);
}
const cardsPorPagina = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);

function Estrelas({ nota }: { nota: number }) {
  return (
    <div className="flex gap-1" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className={`h-5 w-5 ${n <= nota ? "text-dourado" : "text-borda"}`} fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </div>
  );
}

export default function Avaliacoes({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  const porPagina = useSyncExternalStore(assinarTela, cardsPorPagina, () => 3);
  const totalPaginas = Math.max(1, Math.ceil(avaliacoes.length / porPagina));
  const [paginaEscolhida, setPagina] = useState(0);
  const [pausado, setPausado] = useState(false);
  const pagina = paginaEscolhida % totalPaginas; // ao mudar o tamanho da tela, continua válida

  // Passa sozinho; pausa enquanto o mouse está em cima.
  useEffect(() => {
    if (pausado || totalPaginas < 2) return;
    const id = setInterval(() => setPagina((p) => (p + 1) % totalPaginas), INTERVALO);
    return () => clearInterval(id);
  }, [pausado, totalPaginas]);

  const media = avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length;

  return (
    <section id="avaliacoes" className="divisor fundo-brilho py-24">
      <span className="losango" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">Avaliações</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
            Quem vem, <span className="texto-ouro">volta</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Estrelas nota={Math.round(media)} />
            <span className="text-sm text-texto-suave">
              {media.toFixed(1).replace(".", ",")} de 5 · {avaliacoes.length} avaliações
            </span>
          </div>
        </Revelar>

        <Revelar atraso={150} className="mt-14">
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            <ul
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `translateX(-${pagina * 100}%)` }}
            >
              {avaliacoes.map((a, i) => {
                const naPagina = Math.floor(i / porPagina) === pagina;
                return (
                  <li
                    key={a.nome + i}
                    className="shrink-0 px-3"
                    style={{ width: `${100 / porPagina}%` }}
                    aria-hidden={!naPagina}
                  >
                    <figure
                      className={`sombra flex h-full flex-col rounded-3xl border border-borda bg-superficie p-7 transition-all duration-700 ${
                        naPagina ? "scale-100 opacity-100" : "scale-95 opacity-40"
                      }`}
                    >
                      <span className="font-display text-6xl leading-none text-dourado/40">“</span>
                      <blockquote className="-mt-4 flex-1 leading-relaxed">{a.texto}</blockquote>
                      <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-borda pt-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dourado/15 font-semibold text-dourado-texto">
                            {a.nome[0]}
                          </span>
                          <div>
                            <p className="font-semibold">{a.nome}</p>
                            <p className="text-xs text-texto-suave">{a.servico}</p>
                          </div>
                        </div>
                        <Estrelas nota={a.nota} />
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Avaliações anteriores"
              onClick={() => setPagina((p) => (p - 1 + totalPaginas) % totalPaginas)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-borda transition-colors hover:border-dourado hover:text-dourado-texto"
            >
              ←
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPaginas }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir para a página ${i + 1}`}
                  aria-current={i === pagina}
                  onClick={() => setPagina(i)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    i === pagina ? "w-8 bg-dourado" : "w-2.5 bg-borda hover:bg-texto-suave"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Próximas avaliações"
              onClick={() => setPagina((p) => (p + 1) % totalPaginas)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-borda transition-colors hover:border-dourado hover:text-dourado-texto"
            >
              →
            </button>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
