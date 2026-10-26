import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Esconde a bolinha "N" de desenvolvimento (ela nunca aparece no site publicado).
  devIndicators: false,
  // Fotos dos serviços e do topo vêm do Unsplash (URLs em src/lib/conteudo.ts).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
