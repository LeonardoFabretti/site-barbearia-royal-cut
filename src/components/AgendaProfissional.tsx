"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import BotaoTema from "@/components/BotaoTema";
import Logo from "@/components/Logo";
import type { AgendamentoDoDia, ResultadoDaBusca } from "@/lib/agenda";

const FUSO = "America/Sao_Paulo";
const ATUALIZAR_A_CADA = 60_000; // busca de novo a cada 1 minuto, para pegar agendamentos novos
// Faixa de dias em "páginas" de 6 (no celular aparece uma página por vez):
// a 1ª página são os 6 dias anteriores, a 2ª começa hoje, e assim até ~2 meses à frente.
const DIAS_POR_PAGINA = 6;
const DIAS_ATRAS = 6;
const DIAS_A_FRENTE = 65;

const real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function hojeEmBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());
}

// "Hoje" só é calculado no navegador (no servidor a página é montada uma vez só, sem data).
const semAssinatura = () => () => {};

// Datas como "AAAA-MM-DD"; meio-dia em UTC evita que o fuso troque o dia.
function somarDias(data: string, dias: number) {
  return new Date(new Date(`${data}T12:00:00Z`).getTime() + dias * 86_400_000).toISOString().slice(0, 10);
}

function formatar(data: string, opcoes: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...opcoes })
    .format(new Date(`${data}T12:00:00Z`))
    .replace(".", "");
}

function celularBonito(c: string) {
  return c.length === 11 ? `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}` : `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
}

const ETIQUETA_STATUS = {
  confirmado: { texto: "Confirmado", classe: "bg-dourado/15 text-dourado-texto" },
  concluido: { texto: "Concluído", classe: "bg-emerald-500/15 text-emerald-600 [[data-tema=escuro]_&]:text-emerald-400" },
  cancelado: { texto: "Cancelado", classe: "bg-red-500/10 text-red-500" },
};

type Resultado =
  | { chave: string; tipo: "ok"; agendamentos: AgendamentoDoDia[] }
  | { chave: string; tipo: "bloqueado"; situacao: "pedir-senha" | "sem-senha"; mensagem: string }
  | { chave: string; tipo: "erro"; mensagem: string };

export default function AgendaProfissional({ nome }: { nome: string }) {
  const hoje = useSyncExternalStore(semAssinatura, hojeEmBrasilia, () => null);
  const [dataEscolhida, setDataEscolhida] = useState<string | null>(null);
  const data = dataEscolhida ?? hoje;
  const [recarregar, setRecarregar] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cancelando, setCancelando] = useState<AgendamentoDoDia | null>(null);
  const [salvando, setSalvando] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState<{ termo: string; resultados: ResultadoDaBusca[] } | null>(null);
  const faixa = useRef<HTMLDivElement>(null);

  // Busca por nome ou celular: espera a pessoa parar de digitar (300 ms) antes de buscar.
  const termo = busca.trim();
  const buscando = termo.length >= 2;
  const resultados = buscando && resultadoBusca?.termo === termo ? resultadoBusca.resultados : null;

  useEffect(() => {
    if (termo.length < 2) return;
    let cancelado = false;
    const espera = setTimeout(() => {
      fetch(`/api/agenda/busca?q=${encodeURIComponent(termo)}`)
        .then((r) => r.json())
        .then((json) => {
          if (!cancelado) setResultadoBusca({ termo, resultados: json.resultados ?? [] });
        })
        .catch(() => {
          if (!cancelado) setResultadoBusca({ termo, resultados: [] });
        });
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo]);

  // Se o dia escolhido não está à vista na faixa, pula para a "página" de 6 dias que o contém.
  useEffect(() => {
    const caixa = faixa.current;
    const botoes = caixa ? [...caixa.children] as HTMLElement[] : [];
    const indice = botoes.findIndex((b) => b.getAttribute("aria-pressed") === "true");
    if (!caixa || indice < 0) return;
    const rb = botoes[indice].getBoundingClientRect();
    const rc = caixa.getBoundingClientRect();
    if (rb.left >= rc.left && rb.right <= rc.right) return;
    const inicioDaPagina = botoes[Math.floor(indice / DIAS_POR_PAGINA) * DIAS_POR_PAGINA];
    caixa.scrollTo({ left: inicioDaPagina.offsetLeft - parseFloat(getComputedStyle(caixa).paddingLeft), behavior: "instant" });
  }, [data, buscando]);

  // No computador, a rodinha do mouse rola a faixa de dias para o lado.
  useEffect(() => {
    const caixa = faixa.current;
    if (!caixa) return;
    const aoRolar = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      caixa.scrollLeft += e.deltaY;
    };
    caixa.addEventListener("wheel", aoRolar, { passive: false });
    return () => caixa.removeEventListener("wheel", aoRolar);
  }, [hoje, buscando, resultado?.tipo]);

  // A lista só vale para a "chave" que a pediu; enquanto não chega, está carregando.
  const chave = data ? `${data}|${recarregar}` : null;
  const atual = resultado?.chave === chave ? resultado : null;

  useEffect(() => {
    if (!chave) return;
    let cancelado = false;
    const dia = chave.split("|")[0];
    fetch(`/api/agenda?data=${dia}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (cancelado) return;
        if (r.status === 401) {
          setResultado({ chave, tipo: "bloqueado", situacao: json.situacao, mensagem: json.erro });
        } else if (!r.ok) {
          setResultado({ chave, tipo: "erro", mensagem: json.erro ?? "Não foi possível carregar a agenda." });
        } else {
          setResultado({ chave, tipo: "ok", agendamentos: json.agendamentos ?? [] });
        }
      })
      .catch(() => {
        if (!cancelado) setResultado({ chave, tipo: "erro", mensagem: "Sem conexão. Tente de novo." });
      });
    return () => {
      cancelado = true;
    };
  }, [chave]);

  // Atualiza sozinha, para aparecer quem acabou de agendar pelo site.
  useEffect(() => {
    const id = setInterval(() => setRecarregar((n) => n + 1), ATUALIZAR_A_CADA);
    return () => clearInterval(id);
  }, []);

  // A última lista que chegou continua na tela enquanto a nova carrega (sem piscar).
  const lista = atual?.tipo === "ok" ? atual.agendamentos : resultado?.tipo === "ok" && resultado.chave.startsWith(`${data}|`) ? resultado.agendamentos : null;
  const ativos = lista?.filter((a) => a.status !== "cancelado") ?? [];
  const faturamento = ativos.reduce((soma, a) => soma + a.preco, 0);

  async function mudarStatus(a: AgendamentoDoDia, status: AgendamentoDoDia["status"]) {
    setSalvando(a.id);
    setAviso(null);
    try {
      const r = await fetch(`/api/agenda/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) {
        const json = await r.json().catch(() => ({}));
        setAviso(json.erro ?? "Não foi possível atualizar.");
      }
    } catch {
      setAviso("Sem conexão. Tente de novo.");
    } finally {
      setSalvando(null);
      setCancelando(null);
      setRecarregar((n) => n + 1);
    }
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/agenda/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (r.ok) {
      setSenha("");
      setAviso(null);
      setRecarregar((n) => n + 1);
    } else {
      setAviso("Senha incorreta.");
    }
  }

  // Antes de o navegador saber a data de hoje, mostra só o esqueleto da página.
  if (!hoje || !data) return <div className="fundo-brilho min-h-dvh" />;

  const dias = Array.from({ length: DIAS_ATRAS + DIAS_A_FRENTE + 1 }, (_, i) => somarDias(hoje, i - DIAS_ATRAS));
  const setData = (proxima: string | ((atual: string) => string)) =>
    setDataEscolhida(typeof proxima === "function" ? proxima(data) : proxima);
  const rolarFaixa = (sentido: 1 | -1) =>
    faixa.current?.scrollBy({ left: sentido * faixa.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="fundo-brilho min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-borda bg-fundo/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 shrink-0" />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">{nome}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-dourado-texto">Agenda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-full border border-borda px-4 py-2 text-sm text-texto-suave transition-colors hover:border-dourado hover:text-texto sm:inline-block"
            >
              ← Ver o site
            </Link>
            <BotaoTema />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">
        {resultado?.tipo === "bloqueado" ? (
          <section className="sombra mx-auto mt-10 max-w-sm rounded-3xl border border-borda bg-superficie p-6 text-center">
            <h1 className="font-display text-2xl font-semibold">Agenda do profissional</h1>
            {resultado.situacao === "sem-senha" ? (
              <p className="mt-3 text-sm text-texto-suave">{resultado.mensagem}</p>
            ) : (
              <form onSubmit={entrar} className="mt-5 flex flex-col gap-3">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha da agenda"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border border-borda bg-superficie-2/60 px-4 outline-none focus:border-dourado"
                />
                {aviso && <p className="text-sm text-red-500">{aviso}</p>}
                <button type="submit" className="h-12 rounded-full bg-dourado font-semibold text-sobre-dourado">
                  Entrar
                </button>
              </form>
            )}
          </section>
        ) : (
          <>
            {/* busca por nome ou celular */}
            <div className="relative mb-6">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-suave"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente pelo nome ou celular"
                aria-label="Buscar cliente pelo nome ou celular"
                className="h-12 w-full rounded-full border border-borda bg-superficie pl-12 pr-12 outline-none transition-colors placeholder:text-texto-suave/70 focus:border-dourado [&::-webkit-search-cancel-button]:hidden"
              />
              {busca && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-texto-suave hover:bg-superficie-2 hover:text-texto"
                >
                  ✕
                </button>
              )}
            </div>

            {buscando ? (
              <section aria-live="polite">
                <p className="text-xs uppercase tracking-[0.25em] text-texto-suave">Resultados para “{termo}”</p>
                {!resultados && (
                  <div className="mt-4 flex flex-col gap-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-2xl bg-superficie" />
                    ))}
                  </div>
                )}
                {resultados?.length === 0 && (
                  <div className="mt-4 rounded-3xl border border-dashed border-borda px-6 py-12 text-center">
                    <p className="font-display text-xl">Nenhum agendamento encontrado</p>
                    <p className="mt-2 text-sm text-texto-suave">Confira o nome ou tente pelo celular.</p>
                  </div>
                )}
                {!!resultados?.length && (
                  <ul className="mt-4 flex flex-col gap-3">
                    {resultados.map((r) => {
                      const etiqueta = ETIQUETA_STATUS[r.status];
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setData(r.data);
                              setBusca("");
                            }}
                            className={`sombra flex w-full items-center gap-4 rounded-2xl border border-borda bg-superficie p-4 text-left transition-colors hover:border-dourado/60 ${
                              r.status === "cancelado" ? "opacity-60" : ""
                            }`}
                          >
                            <div className="w-16 shrink-0 border-r border-borda pr-3 text-center">
                              <p className="text-[11px] uppercase text-texto-suave">{formatar(r.data, { weekday: "short" })}</p>
                              <p className="text-xl font-bold leading-tight">{formatar(r.data, { day: "2-digit" })}</p>
                              <p className="text-[11px] uppercase text-texto-suave">{formatar(r.data, { month: "short" })}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{r.cliente}</p>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${etiqueta.classe}`}>{etiqueta.texto}</span>
                              </div>
                              <p className="mt-0.5 text-sm text-texto-suave">
                                {r.hora} · {r.servico} · <span className="text-dourado-texto">{real.format(r.preco)}</span>
                              </p>
                            </div>
                            <span aria-hidden className="text-dourado-texto">→</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : (
            <>
            {/* dia escolhido */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-texto-suave">
                  {data === hoje ? "Hoje" : data === somarDias(hoje, 1) ? "Amanhã" : data === somarDias(hoje, -1) ? "Ontem" : "Dia"}
                </p>
                <h1 className="capitalize-first font-display text-2xl font-bold sm:text-3xl">
                  {formatar(data, { weekday: "long", day: "numeric", month: "long" })}
                </h1>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  aria-label="Dia anterior"
                  onClick={() => setData((d) => somarDias(d, -1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borda hover:border-dourado"
                >
                  ←
                </button>
                {data !== hoje && (
                  <button
                    type="button"
                    onClick={() => setData(hoje)}
                    className="rounded-full border border-dourado/60 px-4 text-sm font-semibold text-dourado-texto hover:bg-dourado/10"
                  >
                    Hoje
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Próximo dia"
                  onClick={() => setData((d) => somarDias(d, 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borda hover:border-dourado"
                >
                  →
                </button>
              </div>
            </div>

            {/* faixa de dias: rola com o dedo, com a rodinha do mouse ou pelas setas das pontas */}
            <div className="relative mt-5">
              <button
                type="button"
                aria-label="Ver dias anteriores"
                onClick={() => rolarFaixa(-1)}
                className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-borda bg-fundo shadow-md hover:border-dourado sm:flex"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Ver próximos dias"
                onClick={() => rolarFaixa(1)}
                className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-borda bg-fundo shadow-md hover:border-dourado sm:flex"
              >
                ›
              </button>
            <div
              ref={faixa}
              className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-3 sm:scroll-px-1 sm:px-1 [&::-webkit-scrollbar]:hidden"
            >
              {dias.map((d, i) => {
                const ativo = d === data;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setData(d)}
                    aria-pressed={ativo}
                    // no celular, cada dia ocupa 1/6 da largura (6 dias = 5 espaços de 0,5rem entre eles)
                    className={`flex w-[calc((100%-2.5rem)/6)] shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors sm:w-14 ${
                      i % DIAS_POR_PAGINA === 0 ? "snap-start snap-always" : ""
                    } ${
                      ativo
                        ? "border-dourado bg-dourado text-sobre-dourado"
                        : "border-borda bg-superficie hover:border-dourado/60"
                    }`}
                  >
                    <span className={`text-[11px] uppercase ${ativo ? "" : "text-texto-suave"}`}>
                      {formatar(d, { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-tight">{formatar(d, { day: "2-digit" })}</span>
                    {d === hoje && <span className={`h-1 w-1 rounded-full ${ativo ? "bg-sobre-dourado" : "bg-dourado"}`} />}
                  </button>
                );
              })}
            </div>
            </div>

            {/* resumo do dia */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Agendados", String(ativos.length)],
                ["Concluídos", String(ativos.filter((a) => a.status === "concluido").length)],
                ["Previsto", real.format(faturamento)],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="sombra rounded-2xl border border-borda bg-superficie px-3 py-3 sm:px-4">
                  <p className="text-xs text-texto-suave">{rotulo}</p>
                  <p className="mt-1 whitespace-nowrap text-[15px] font-bold tracking-tight tabular-nums sm:text-xl">{lista ? valor : "–"}</p>
                </div>
              ))}
            </div>

            {aviso && (
              <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {aviso}
              </p>
            )}

            {/* lista */}
            <section className="mt-6">
              {!lista && atual?.tipo !== "erro" && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-superficie" />
                  ))}
                </div>
              )}
              {atual?.tipo === "erro" && <p className="text-center text-sm text-red-500">{atual.mensagem}</p>}
              {lista?.length === 0 && (
                <div className="rounded-3xl border border-dashed border-borda px-6 py-14 text-center">
                  <p className="font-display text-xl">Nenhum agendamento neste dia</p>
                  <p className="mt-2 text-sm text-texto-suave">Quando alguém agendar pelo site, aparece aqui.</p>
                </div>
              )}
              {!!lista?.length && (
                <ol className="flex flex-col gap-3">
                  {lista.map((a) => {
                    const etiqueta = ETIQUETA_STATUS[a.status];
                    const mensagem = `Olá, ${a.cliente.split(" ")[0]}! Aqui é da ${nome}, sobre seu horário de ${a.servico} ${formatar(data, { weekday: "long" })} às ${a.hora}.`;
                    return (
                      <li
                        key={a.id}
                        className={`sombra flex gap-4 rounded-2xl border border-borda bg-superficie p-4 transition-opacity ${
                          a.status === "cancelado" ? "opacity-60" : ""
                        }`}
                      >
                        <div className="w-14 shrink-0 border-r border-borda pr-3 text-right">
                          <p className="text-lg font-bold tabular-nums">{a.hora}</p>
                          <p className="text-xs tabular-nums text-texto-suave">{a.horaFim}</p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-semibold ${a.status === "cancelado" ? "line-through" : ""}`}>{a.cliente}</p>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${etiqueta.classe}`}>{etiqueta.texto}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-texto-suave">
                            {a.servico} · {a.categoria === "feminino" ? "Feminino" : "Barbearia"} ·{" "}
                            <span className="font-medium text-dourado-texto">{real.format(a.preco)}</span>
                          </p>
                          <p className="mt-0.5 text-sm tabular-nums text-texto-suave">{celularBonito(a.celular)}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href={`https://wa.me/55${a.celular}?text=${encodeURIComponent(mensagem)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-borda px-3.5 py-1.5 text-sm transition-colors hover:border-dourado"
                            >
                              WhatsApp
                            </a>
                            {a.status === "confirmado" && (
                              <>
                                <button
                                  type="button"
                                  disabled={salvando === a.id}
                                  onClick={() => mudarStatus(a, "concluido")}
                                  className="rounded-full bg-dourado px-3.5 py-1.5 text-sm font-semibold text-sobre-dourado disabled:opacity-50"
                                >
                                  Concluir
                                </button>
                                <button
                                  type="button"
                                  disabled={salvando === a.id}
                                  onClick={() => setCancelando(a)}
                                  className="rounded-full border border-borda px-3.5 py-1.5 text-sm text-texto-suave transition-colors hover:border-red-500/60 hover:text-red-500"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {a.status !== "confirmado" && (
                              <button
                                type="button"
                                disabled={salvando === a.id}
                                onClick={() => mudarStatus(a, "confirmado")}
                                className="rounded-full border border-borda px-3.5 py-1.5 text-sm text-texto-suave transition-colors hover:border-dourado hover:text-texto"
                              >
                                {a.status === "cancelado" ? "Reabrir" : "Desfazer"}
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
            </>
            )}
          </>
        )}
      </main>

      {/* confirmação antes de cancelar */}
      {cancelando && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cancelar"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setCancelando(null)}
        >
          <div
            className="entrar w-full max-w-sm rounded-3xl border border-borda bg-superficie p-6"
            style={{ animationDuration: "0.35s" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-cancelar" className="font-display text-xl font-semibold">
              Cancelar agendamento?
            </h2>
            <p className="mt-2 text-sm text-texto-suave">
              {cancelando.cliente} · {cancelando.servico} às {cancelando.hora}. O horário volta a ficar livre no site.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelando(null)}
                className="h-11 flex-1 rounded-full border border-borda text-sm font-medium hover:border-dourado"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={salvando === cancelando.id}
                onClick={() => mudarStatus(cancelando, "cancelado")}
                className="h-11 flex-1 rounded-full bg-red-500 text-sm font-semibold text-white disabled:opacity-50"
              >
                Cancelar horário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
