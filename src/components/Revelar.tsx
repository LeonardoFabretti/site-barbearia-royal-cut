"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  efeito?: "subir" | "esquerda" | "direita" | "zoom";
  atraso?: number; // em milissegundos
  className?: string;
};

// Mostra o conteúdo com uma animação quando ele entra na tela ao rolar a página.
export default function Revelar({ children, efeito = "subir", atraso = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          elemento.classList.add("visivel");
          observador.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-efeito={efeito}
      className={`revelar ${className}`}
      style={{ "--atraso": `${atraso}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
