import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { NOME_BARBEARIA, SLOGAN } from "@/lib/conteudo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${NOME_BARBEARIA} | Agende seu horário`,
  description: SLOGAN,
};

// Aplica o tema salvo antes de a página aparecer, para não piscar claro/escuro.
const scriptTema = `(function(){try{var t=localStorage.getItem('tema');document.documentElement.dataset.tema=t==='claro'?'claro':'escuro'}catch(e){document.documentElement.dataset.tema='escuro'}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-tema="escuro"
      suppressHydrationWarning
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
