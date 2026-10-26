import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import Agendamento from "@/components/Agendamento";
import Avaliacoes from "@/components/Avaliacoes";
import Cabecalho from "@/components/Cabecalho";
import Localizacao from "@/components/Localizacao";
import QuemSomos from "@/components/QuemSomos";
import Revelar from "@/components/Revelar";
import Rodape from "@/components/Rodape";
import Servicos from "@/components/Servicos";
import ServicosFemininos from "@/components/ServicosFemininos";
import {
  DIAS_DISPONIVEIS,
  buscarProfissional,
  diaDaSemana,
  diasDeTrabalho,
  hojeEmBrasilia,
  horarioDeFuncionamento,
  listarServicos,
} from "@/lib/agenda";
import { AVALIACOES, FOTO_AGENDAMENTO, FOTO_AGENDAMENTO_FEMININO, NOME_BARBEARIA } from "@/lib/conteudo";

function proximasDatas(diasQueTrabalha: number[]) {
  const hoje = new Date(`${hojeEmBrasilia()}T12:00:00Z`);
  const datas: string[] = [];
  for (let i = 0; i < DIAS_DISPONIVEIS; i++) {
    const data = new Date(hoje.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    if (diasQueTrabalha.includes(diaDaSemana(data))) datas.push(data);
  }
  return datas;
}

// Partes que leem o banco a cada visita: serviços, expediente e a data de hoje podem mudar.
async function ConteudoDoBanco() {
  await connection();
  const profissional = await buscarProfissional();
  const servicos = await listarServicos();

  const secoesDeServicos = (
    <>
      <Servicos id="servicos" categoria="masculino" servicos={servicos} />
      <ServicosFemininos servicos={servicos} />
    </>
  );

  if (!profissional) {
    return (
      <>
        {secoesDeServicos}
        <Avaliacoes avaliacoes={AVALIACOES} />
        <p className="py-24 text-center text-texto-suave">A agenda online ainda não está aberta.</p>
      </>
    );
  }

  const [dias, funcionamento] = await Promise.all([
    diasDeTrabalho(profissional.id),
    horarioDeFuncionamento(profissional.id),
  ]);

  return (
    <>
      {secoesDeServicos}
      <Avaliacoes avaliacoes={AVALIACOES} />
      <Localizacao funcionamento={funcionamento} />

      <section id="agendar" className="divisor fundo-linhas py-24">
        <span className="losango" aria-hidden />

        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-[1fr_1.3fr]">
          <Revelar efeito="esquerda" className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dourado-texto">Agendamento</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
              Reserve seu <span className="texto-ouro">horário</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-texto-suave">
              Escolha o serviço, o dia e o horário livre. Em menos de um minuto seu horário está garantido com{" "}
              {profissional.nome}.
            </p>

            {/* colagem de fotos para preencher a coluna ao lado do formulário (só no computador) */}
            <div className="relative mt-12 hidden h-[26rem] lg:block">
              <div className="group absolute left-0 top-0 h-80 w-[68%] overflow-hidden rounded-3xl border border-dourado/40 sombra">
                <Image
                  src={FOTO_AGENDAMENTO}
                  alt="Cadeira de barbeiro da Royal Cut"
                  fill
                  sizes="30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="group absolute bottom-0 right-0 h-64 w-[55%] overflow-hidden rounded-3xl border-4 border-fundo outline outline-1 outline-dourado/40 sombra">
                <Image
                  src={FOTO_AGENDAMENTO_FEMININO}
                  alt="Espaço feminino da Royal Cut"
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </Revelar>

          <Revelar efeito="direita" atraso={120}>
            <Agendamento profissional={profissional.nome} servicos={servicos} datas={proximasDatas(dias)} />
          </Revelar>
        </div>
      </section>
    </>
  );
}

function Carregando() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-24 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-3xl bg-superficie" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Cabecalho nome={NOME_BARBEARIA} />
      <main>
        <QuemSomos nome={NOME_BARBEARIA} />
        <Suspense fallback={<Carregando />}>
          <ConteudoDoBanco />
        </Suspense>
      </main>
      <Rodape nome={NOME_BARBEARIA} />
    </>
  );
}
