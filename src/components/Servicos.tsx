import Image from "next/image";
import BotaoAgendarServico from "@/components/BotaoAgendarServico";
import Revelar from "@/components/Revelar";
import type { Categoria, Servico } from "@/lib/agenda";
import { SECOES_DE_SERVICOS, detalhesDoServico } from "@/lib/conteudo";

const real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function duracaoTexto(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h${String(resto).padStart(2, "0")}` : `${h}h`;
}

type Props = {
  id: string;
  categoria: Categoria;
  servicos: Servico[];
};

// Uma seção de serviços (barbearia ou espaço feminino), com os cards da categoria.
export default function Servicos({ id, categoria, servicos }: Props) {
  const secao = SECOES_DE_SERVICOS[categoria];
  const lista = servicos.filter((s) => s.categoria === categoria);
  if (lista.length === 0) return null;

  return (
    <section id={id} className="divisor fundo-pontos py-24">
      <span className="losango" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">{secao.rotulo}</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
            {secao.titulo[0]} <span className="texto-ouro">{secao.titulo[1]}</span>
          </h2>
          <p className="mt-4 text-texto-suave">{secao.texto}</p>
        </Revelar>

        <div
          className={`mt-14 grid gap-6 sm:grid-cols-2 ${
            lista.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {lista.map((s, i) => {
            const detalhes = detalhesDoServico(s.nome);
            return (
              <Revelar key={s.id} efeito="zoom" atraso={i * 120}>
                <article className="group sombra flex h-full flex-col overflow-hidden rounded-3xl border border-borda bg-superficie transition-all duration-500 hover:-translate-y-2 hover:border-dourado/60">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={detalhes.foto}
                      alt={s.nome}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute right-4 top-4 rounded-full bg-dourado px-4 py-1.5 text-sm font-bold text-sobre-dourado shadow-lg">
                      {real.format(s.preco)}
                    </span>
                    <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {duracaoTexto(s.duracaoMin)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-semibold">{s.nome}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-texto-suave">{detalhes.descricao}</p>
                    <BotaoAgendarServico servicoId={s.id} />
                  </div>
                </article>
              </Revelar>
            );
          })}
        </div>
      </div>
    </section>
  );
}
