// Emblema da Royal Cut: anel dourado com coroa e tesoura cruzada. Desenhado em SVG para
// ficar nítido em qualquer tamanho e seguir as cores do tema.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Logo da barbearia">
      <defs>
        <linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--dourado-claro)" />
          <stop offset="55%" stopColor="var(--dourado)" />
          <stop offset="100%" stopColor="var(--dourado-texto)" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="57" fill="var(--superficie)" stroke="url(#ouro)" strokeWidth="3" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="url(#ouro)" strokeWidth="1" strokeDasharray="2 5" />

      {/* coroa */}
      <path d="M42 33 L48 23 L54 30 L60 19 L66 30 L72 23 L78 33 Z" fill="url(#ouro)" />
      <circle cx="48" cy="22" r="1.8" fill="url(#ouro)" />
      <circle cx="60" cy="18" r="1.8" fill="url(#ouro)" />
      <circle cx="72" cy="22" r="1.8" fill="url(#ouro)" />

      {/* tesoura */}
      <g stroke="url(#ouro)" strokeWidth="5" strokeLinecap="round" fill="none">
        <line x1="49" y1="74" x2="78" y2="40" />
        <line x1="71" y1="74" x2="42" y2="40" />
        <circle cx="44" cy="83" r="9" strokeWidth="4" />
        <circle cx="76" cy="83" r="9" strokeWidth="4" />
      </g>
      <circle cx="60" cy="61.1" r="3.2" fill="var(--superficie)" stroke="url(#ouro)" strokeWidth="2" />
    </svg>
  );
}
