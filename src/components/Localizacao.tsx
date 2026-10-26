import Revelar from "@/components/Revelar";
import { ENDERECO } from "@/lib/conteudo";

type Props = {
  funcionamento: { dia: string; periodos: string }[];
};

export default function Localizacao({ funcionamento }: Props) {
  const endereco = `${ENDERECO.linha1}, ${ENDERECO.linha2}`;
  const busca = encodeURIComponent(endereco);

  return (
    <section id="localizacao" className="divisor fundo-pontos py-24">
      <span className="losango" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">Localização</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
            Venha nos <span className="texto-ouro">visitar</span>
          </h2>
        </Revelar>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Revelar efeito="esquerda" className="flex flex-col gap-6">
            <div className="sombra rounded-3xl border border-borda bg-superficie p-7">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-dourado" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.1-7-12a7 7 0 0 1 14 0c0 5.9-7 12-7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Endereço
              </h3>
              <p className="mt-3">{ENDERECO.linha1}</p>
              <p className="text-texto-suave">{ENDERECO.linha2}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${busca}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-dourado px-5 py-2.5 text-sm font-semibold text-sobre-dourado transition-transform hover:scale-105"
              >
                Como chegar →
              </a>
            </div>

            <div className="sombra rounded-3xl border border-borda bg-superficie p-7">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-dourado" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Horário de funcionamento
              </h3>
              <dl className="mt-4 divide-y divide-borda text-sm">
                {funcionamento.map((f) => (
                  <div key={f.dia} className="flex justify-between gap-4 py-2">
                    <dt className="text-texto-suave">{f.dia}</dt>
                    <dd className={`text-right tabular-nums ${f.periodos === "Fechado" ? "text-texto-suave" : "font-medium"}`}>
                      {f.periodos}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Revelar>

          <Revelar efeito="direita" atraso={150} className="min-h-80">
            <div className="sombra h-full min-h-80 overflow-hidden rounded-3xl border border-borda">
              <iframe
                title={`Mapa: ${endereco}`}
                src={`https://maps.google.com/maps?q=${busca}&z=16&output=embed`}
                className="mapa h-full min-h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
