"use client";

import { useEffect, useState } from "react";
import { EVENTO_AGENDAR } from "@/components/BotaoAgendarServico";
import type { Categoria, Horario, Servico } from "@/lib/agenda";

type Props = {
  profissional: string;
  servicos: Servico[];
  datas: string[]; // "AAAA-MM-DD", só os dias em que o profissional trabalha
};

type Etapa = "servico" | "data" | "horario" | "dados" | "confirmar" | "pronto";

const ETAPAS: { id: Etapa; titulo: string }[] = [
  { id: "servico", titulo: "Escolha o serviço" },
  { id: "data", titulo: "Escolha o dia" },
  { id: "horario", titulo: "Escolha o horário" },
  { id: "dados", titulo: "Seus dados" },
  { id: "confirmar", titulo: "Confira e confirme" },
];

const GRUPOS = [
  { categoria: "masculino", titulo: "Barbearia" },
  { categoria: "feminino", titulo: "Feminino" },
] as const;

const real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// As datas chegam como "AAAA-MM-DD"; meio-dia em UTC evita que o fuso troque o dia.
function partesDaData(data: string) {
  const d = new Date(`${data}T12:00:00Z`);
  const fmt = (opcoes: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...opcoes }).format(d);
  return {
    semana: fmt({ weekday: "short" }).replace(".", ""),
    dia: fmt({ day: "2-digit" }),
    mes: fmt({ month: "short" }).replace(".", ""),
    longa: fmt({ weekday: "long", day: "numeric", month: "long" }),
  };
}

function duracao(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h${String(resto).padStart(2, "0")}` : `${h}h`;
}

function mascaraCelular(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const cartao = "rounded-2xl border transition-all duration-300";
const cartaoNormal = "border-borda bg-superficie-2/60 hover:border-dourado/60 hover:-translate-y-0.5";
const cartaoAtivo = "border-dourado bg-dourado text-sobre-dourado shadow-lg shadow-dourado/25";
const botaoPrincipal =
  "h-12 w-full rounded-full bg-dourado font-semibold text-sobre-dourado transition-all hover:brightness-110 disabled:opacity-40";
const campo =
  "h-12 rounded-xl border border-borda bg-superficie-2/60 px-4 text-texto outline-none transition-colors placeholder:text-texto-suave/60 focus:border-dourado";

export default function Agendamento({ profissional, servicos, datas }: Props) {
  const [etapa, setEtapa] = useState<Etapa>("servico");
  const [aba, setAba] = useState<Categoria>("masculino");
  const [servico, setServico] = useState<Servico | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [horario, setHorario] = useState<Horario | null>(null);
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");

  const [recarregar, setRecarregar] = useState(0);
  const [resultado, setResultado] = useState<{ chave: string; horarios: Horario[] } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Busca os horários livres sempre que muda o serviço ou o dia (ou após um conflito).
  // A lista só vale para a "chave" que a pediu; enquanto não chega, está carregando.
  const chave = servico && data ? `${servico.id}|${data}|${recarregar}` : null;
  const horarios = resultado && resultado.chave === chave ? resultado.horarios : null;
  const carregandoHorarios = chave !== null && horarios === null;

  useEffect(() => {
    if (!chave) return;
    const [servicoId, dia] = chave.split("|");
    let cancelado = false;
    fetch(`/api/horarios?servico=${servicoId}&data=${dia}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelado) setResultado({ chave, horarios: json.horarios ?? [] });
      })
      .catch(() => {
        if (!cancelado) setResultado({ chave, horarios: [] });
      });
    return () => {
      cancelado = true;
    };
  }, [chave]);

  // Botão "Agendar este serviço" nos cards de serviços: já entra com o serviço escolhido.
  useEffect(() => {
    function aoEscolher(evento: Event) {
      const escolhido = servicos.find((s) => s.id === (evento as CustomEvent<number>).detail);
      if (!escolhido) return;
      setServico(escolhido);
      setAba(escolhido.categoria);
      setHorario(null);
      setErro(null);
      setEtapa("data");
    }
    window.addEventListener(EVENTO_AGENDAR, aoEscolher);
    return () => window.removeEventListener(EVENTO_AGENDAR, aoEscolher);
  }, [servicos]);

  const indice = ETAPAS.findIndex((e) => e.id === etapa);
  const celularValido = [10, 11].includes(celular.replace(/\D/g, "").length);
  const dadosValidos = nome.trim().length >= 2 && celularValido;

  function voltar() {
    setErro(null);
    if (indice > 0) setEtapa(ETAPAS[indice - 1].id);
  }

  async function confirmar() {
    if (!servico || !horario) return;
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicoId: servico.id, inicio: horario.inicio, nome, celular }),
      });
      const json = await resposta.json().catch(() => ({}));
      if (resposta.ok) {
        setEtapa("pronto");
        return;
      }
      setErro(json.erro ?? "Não foi possível agendar agora. Tente de novo.");
      if (resposta.status === 409) {
        // Alguém pegou o horário: volta para a lista, já atualizada.
        setHorario(null);
        setRecarregar((n) => n + 1);
        setEtapa("horario");
      }
    } catch {
      setErro("Sem conexão. Confira a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  function novoAgendamento() {
    setServico(null);
    setData(null);
    setHorario(null);
    setErro(null);
    setEtapa("servico");
  }

  return (
    <div className="sombra rounded-3xl border border-borda bg-superficie p-5 sm:p-8">
      {etapa !== "pronto" && (
        <div className="mb-6">
          <ol className="flex gap-1.5" aria-label="Etapas">
            {ETAPAS.map((e, i) => (
              <li key={e.id} className="h-1 flex-1 overflow-hidden rounded-full bg-borda">
                <div
                  className="h-full bg-dourado transition-all duration-500"
                  style={{ width: i <= indice ? "100%" : "0%" }}
                />
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-texto-suave">
                Etapa {indice + 1} de {ETAPAS.length}
              </p>
              <h3 className="font-display text-2xl font-semibold">{ETAPAS[indice].titulo}</h3>
            </div>
            {indice > 0 && (
              <button
                type="button"
                onClick={voltar}
                className="shrink-0 rounded-full border border-borda px-4 py-1.5 text-sm text-texto-suave transition-colors hover:border-dourado hover:text-texto"
              >
                ← Voltar
              </button>
            )}
          </div>
        </div>
      )}

      {erro && (
        <p role="alert" className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {erro}
        </p>
      )}

      {/* a key reinicia a animação de entrada a cada etapa */}
      <div key={etapa} className="entrar" style={{ animationDuration: "0.5s" }}>
        {etapa === "servico" && (
          <div>
            <div role="tablist" className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-borda bg-superficie-2/60 p-1">
              {GRUPOS.map((g) => (
                <button
                  key={g.categoria}
                  type="button"
                  role="tab"
                  aria-selected={aba === g.categoria}
                  onClick={() => setAba(g.categoria)}
                  className={`rounded-full py-2 text-sm font-semibold transition-all ${
                    aba === g.categoria ? "bg-dourado text-sobre-dourado shadow" : "text-texto-suave hover:text-texto"
                  }`}
                >
                  {g.titulo}
                </button>
              ))}
            </div>
            {GRUPOS.filter((g) => g.categoria === aba).map((grupo) => {
              const lista = servicos.filter((s) => s.categoria === grupo.categoria);
              return (
                <div key={grupo.categoria} className="max-h-[26rem] overflow-y-auto pr-1">
                  <ul className="flex flex-col gap-2.5">
                    {lista.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setServico(s);
                            setHorario(null);
                            setEtapa("data");
                          }}
                          className={`flex w-full items-center justify-between px-5 py-4 text-left ${cartao} ${
                            servico?.id === s.id ? "border-dourado bg-dourado/10" : cartaoNormal
                          }`}
                        >
                          <span>
                            <span className="block font-medium">{s.nome}</span>
                            <span className="text-sm text-texto-suave">{duracao(s.duracaoMin)}</span>
                          </span>
                          <span className="font-semibold text-dourado-texto">{real.format(s.preco)}</span>
                        </button>
                      </li>
                    ))}
                    {lista.length === 0 && <li className="text-sm text-texto-suave">Nenhum serviço disponível no momento.</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {etapa === "data" && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {datas.map((d) => {
              const p = partesDaData(d);
              const ativo = data === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={ativo}
                  aria-label={p.longa}
                  onClick={() => {
                    setData(d);
                    setHorario(null);
                    setEtapa("horario");
                  }}
                  className={`flex flex-col items-center py-3 ${cartao} ${ativo ? cartaoAtivo : cartaoNormal}`}
                >
                  <span className={`text-xs uppercase ${ativo ? "" : "text-texto-suave"}`}>{p.semana}</span>
                  <span className="text-xl font-bold leading-tight">{p.dia}</span>
                  <span className={`text-xs ${ativo ? "" : "text-texto-suave"}`}>{p.mes}</span>
                </button>
              );
            })}
          </div>
        )}

        {etapa === "horario" && data && (
          <div>
            <p className="capitalize-first mb-4 text-sm text-texto-suave">
              {partesDaData(data).longa} · {servico?.nome}
            </p>
            {carregandoHorarios && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-superficie-2" />
                ))}
              </div>
            )}
            {!carregandoHorarios && horarios?.length === 0 && (
              <div className="rounded-2xl border border-borda bg-superficie-2/60 px-4 py-8 text-center">
                <p>Não há horários livres neste dia.</p>
                <button
                  type="button"
                  onClick={() => setEtapa("data")}
                  className="mt-3 text-sm font-medium text-dourado-texto hover:underline"
                >
                  Escolher outro dia
                </button>
              </div>
            )}
            {!carregandoHorarios && !!horarios?.length && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {horarios.map((h) => {
                  const ativo = horario?.inicio === h.inicio;
                  return (
                    <button
                      key={h.inicio}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => {
                        setHorario(h);
                        setErro(null);
                        setEtapa("dados");
                      }}
                      className={`h-12 text-sm font-semibold tabular-nums ${cartao} ${ativo ? cartaoAtivo : cartaoNormal}`}
                    >
                      {h.hora}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {etapa === "dados" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (dadosValidos) setEtapa("confirmar");
            }}
          >
            <p className="text-sm text-texto-suave">
              Para o profissional saber quem você é e poder falar com você, se precisar.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                placeholder="Seu nome"
                className={campo}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Celular (WhatsApp)</span>
              <input
                value={celular}
                onChange={(e) => setCelular(mascaraCelular(e.target.value))}
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 91234-5678"
                className={`${campo} tabular-nums`}
              />
            </label>
            <button type="submit" disabled={!dadosValidos} className={`mt-2 ${botaoPrincipal}`}>
              Continuar
            </button>
          </form>
        )}

        {etapa === "confirmar" && servico && data && horario && (
          <div>
            <dl className="divide-y divide-borda rounded-2xl border border-borda bg-superficie-2/60">
              {[
                ["Serviço", servico.nome],
                ["Dia", partesDaData(data).longa],
                ["Horário", `${horario.hora} (${duracao(servico.duracaoMin)})`],
                ["Profissional", profissional],
                ["Nome", nome.trim()],
                ["Celular", celular],
                ["Valor", real.format(servico.preco)],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-texto-suave">{rotulo}</dt>
                  <dd className="capitalize-first text-right font-medium">{valor}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={confirmar} disabled={enviando} className={`mt-5 ${botaoPrincipal}`}>
              {enviando ? "Confirmando…" : "Confirmar agendamento"}
            </button>
          </div>
        )}

        {etapa === "pronto" && servico && data && horario && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="entrar-logo flex h-20 w-20 items-center justify-center rounded-full bg-dourado text-4xl text-sobre-dourado shadow-lg shadow-dourado/30">
              ✓
            </div>
            <h3 className="mt-6 font-display text-3xl font-bold">Horário marcado!</h3>
            <p className="mt-3 text-texto-suave">
              {servico.nome} com {profissional}
            </p>
            <p className="mt-1 font-medium">
              <span className="capitalize-first inline-block">{partesDaData(data).longa}</span>, às {horario.hora}
            </p>
            <button
              type="button"
              onClick={novoAgendamento}
              className="mt-8 rounded-full border border-borda px-6 py-2.5 text-sm font-medium transition-colors hover:border-dourado"
            >
              Fazer outro agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
