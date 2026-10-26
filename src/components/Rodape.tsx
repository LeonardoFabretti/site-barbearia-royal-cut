import Logo from "@/components/Logo";
import { ENDERECO } from "@/lib/conteudo";

export default function Rodape({ nome }: { nome: string }) {
  return (
    <footer className="border-t border-borda bg-superficie py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          {/* logo e nome sempre lado a lado */}
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 shrink-0" />
            <p className="font-display text-lg font-semibold">{nome}</p>
          </div>
          <p className="text-sm text-texto-suave">
            {ENDERECO.linha1} · {ENDERECO.linha2}
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-texto-suave">
          <a href="/agenda" className="transition-colors hover:text-dourado-texto">
            Área do profissional
          </a>
          <a href="#quem-somos" className="transition-colors hover:text-dourado-texto">
            Voltar ao topo ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
