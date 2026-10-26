import Image from "next/image";
import BotaoAgendarServico from "@/components/BotaoAgendarServico";
import Revelar from "@/components/Revelar";
import { duracaoTexto } from "@/components/Servicos";
import type { Servico } from "@/lib/agenda";
import { FOTO_OUTROS_FEMININOS, GRUPOS_FEMININOS, SECOES_DE_SERVICOS, normalizar } from "@/lib/conteudo";

const real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Espaço feminino em formato de cardápio: um cartão com foto para cada grupo,
// e cada serviço numa linha que leva direto para o agendamento.
export default function ServicosFemininos({ servicos }: { servicos: Servico[] }) {
  const femininos = servicos.filter((s) => s.categoria === "feminino");
  if (femininos.length === 0) return null;

  const usados = new Set<number>();
  const grupos = GRUPOS_FEMININOS.map((g) => {
    const lista = g.servicos
      .map((nome) => femininos.find((s) => normalizar(s.nome) === nome))
      .filter((s): s is Servico => !!s);
    lista.forEach((s) => usados.add(s.id));
    return { titulo: g.titulo, foto: g.foto, alto: "alto" in g && g.alto, lista };
  });
  const outros = femininos.filter((s) => !usados.has(s.id));
  if (outros.length) grupos.push({ titulo: "Outros", foto: FOTO_OUTROS_FEMININOS, alto: false, lista: outros });

  const secao = SECOES_DE_SERVICOS.feminino;

  return (
    <section id="feminino" className="divisor fundo-linhas py-24">
      <span className="losango" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">{secao.rotulo}</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
            {secao.titulo[0]} <span className="texto-ouro">{secao.titulo[1]}</span>
          </h2>
          <p className="mt-4 text-texto-suave">{secao.texto}</p>
        </Revelar>

        {/* Grade de 2 colunas: os cards de uma mesma linha ficam da mesma altura e a
            foto cresce para preencher, então não sobram buracos entre eles. */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {grupos
            .filter((g) => g.lista.length > 0)
            .map((g, i) => (
              <Revelar
                key={g.titulo}
                efeito={i % 2 ? "direita" : "esquerda"}
                atraso={(i % 2) * 120}
                className={`h-full ${g.alto ? "md:row-span-2" : ""}`}
              >
                <article className="group sombra flex h-full flex-col overflow-hidden rounded-3xl border border-borda bg-superficie transition-colors duration-500 hover:border-dourado/60">
                  <div className="relative min-h-36 flex-1 overflow-hidden sm:min-h-44">
                    <Image
                      src={g.foto}
                      alt={g.titulo}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    <h3 className="absolute bottom-4 left-6 font-display text-2xl font-semibold text-white">{g.titulo}</h3>
                  </div>

                  <ul className="divide-y divide-borda px-2 py-2">
                    {g.lista.map((s) => (
                      <li key={s.id}>
                        <BotaoAgendarServico
                          servicoId={s.id}
                          rotulo={`Agendar ${s.nome}`}
                          className="group/linha flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-dourado/10"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{s.nome}</span>
                            <span className="text-xs text-texto-suave">{duracaoTexto(s.duracaoMin)}</span>
                          </span>
                          <span className="font-semibold tabular-nums text-dourado-texto">{real.format(s.preco)}</span>
                          <span
                            aria-hidden
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-borda text-sm transition-all group-hover/linha:translate-x-1 group-hover/linha:border-dourado group-hover/linha:bg-dourado group-hover/linha:text-sobre-dourado"
                          >
                            →
                          </span>
                        </BotaoAgendarServico>
                      </li>
                    ))}
                  </ul>
                </article>
              </Revelar>
            ))}
        </div>
      </div>
    </section>
  );
}
