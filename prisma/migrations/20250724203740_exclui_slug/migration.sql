/*
  Warnings:

  - You are about to drop the column `slug` on the `categoria` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categoria_slug_key";

-- AlterTable
ALTER TABLE "categoria" DROP COLUMN "slug";

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nome_key" ON "categoria"("nome");
