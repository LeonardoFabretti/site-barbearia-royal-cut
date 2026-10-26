import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuração do Prisma CLI (generate, db pull).
// O banco já existe no Supabase e foi criado por SQL: não usar `prisma migrate` nele.
// O `prisma generate` (rodado no npm install) não precisa do banco, então a URL pode
// faltar na instalação; só os comandos que falam com o banco (db pull) precisam dela.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
