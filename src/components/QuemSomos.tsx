import Image from "next/image";
import Logo from "@/components/Logo";
import { FOTO_TOPO, QUEM_SOMOS } from "@/lib/conteudo";

export default function QuemSomos({ nome }: { nome: string }) {
  return (
    <section id="quem-somos" className="relative flex min-h-dvh items-center overflow-hidden pb-16 pt-28">
      {/* foto de fundo, bem escurecida (ou clareada no modo claro) para o texto ficar legível */}
      <div className="absolute inset-0 -z-10">
        <Image src={FOTO_TOPO} alt="" fill priority sizes="100vw" className="fundo-zoom object-cover" />
        <div className="veu-topo absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-b from-fundo/40 via-transparent to-fundo" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:grid-cols-[1.15fr_1fr]">
        {/* no celular o texto fica centralizado, embaixo do logo; no computador, à esquerda */}
        <div className="text-center md:text-left">
          <p className="entrar text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">
            Quem somos
          </p>
          <h1
            className="entrar mt-4 font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            {QUEM_SOMOS.titulo.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="texto-ouro">{QUEM_SOMOS.titulo.split(" ").slice(-2).join(" ")}</span>
          </h1>
          {QUEM_SOMOS.texto.map((paragrafo, i) => (
            <p
              key={i}
              className="entrar mx-auto mt-5 max-w-xl text-base leading-relaxed text-texto-suave sm:text-lg md:mx-0"
              style={{ animationDelay: `${260 + i * 120}ms` }}
            >
              {paragrafo}
            </p>
          ))}

          <div className="entrar mt-8 flex flex-wrap justify-center gap-3 md:justify-start" style={{ animationDelay: "520ms" }}>
            <a
              href="#agendar"
              className="rounded-full bg-dourado px-7 py-3.5 font-semibold text-sobre-dourado shadow-lg shadow-dourado/20 transition-transform hover:scale-105"
            >
              Agendar horário
            </a>
            <a
              href="#servicos"
              className="rounded-full border border-dourado/60 px-7 py-3.5 font-semibold text-dourado-texto transition-colors hover:bg-dourado/10"
            >
              Ver serviços
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
            {QUEM_SOMOS.destaques.map((d, i) => (
              <li
                key={d.titulo}
                className="entrar border-t border-dourado/50 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0"
                style={{ animationDelay: `${680 + i * 120}ms` }}
              >
                <p className="text-sm font-semibold sm:text-base">{d.titulo}</p>
                <p className="mt-0.5 text-xs text-texto-suave sm:text-sm">{d.texto}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* logo ao lado do texto */}
        <div className="entrar-logo order-first flex justify-center md:order-last">
          <div className="flutuar relative">
            {/* brilho em degradê (sem filtro de desfoque, que pesava ao flutuar) */}
            <div
              aria-hidden
              className="absolute -inset-16 rounded-full"
              style={{ background: "radial-gradient(circle, var(--brilho-logo) 0%, transparent 65%)" }}
            />
            <Logo className="relative h-44 w-44 sm:h-64 sm:w-64 lg:h-80 lg:w-80" />
            <p className="relative mt-5 text-center font-display text-xl tracking-wide sm:text-2xl">{nome}</p>
          </div>
        </div>
      </div>

      <a
        href="#servicos"
        aria-label="Rolar para os serviços"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-dourado-texto md:block"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
