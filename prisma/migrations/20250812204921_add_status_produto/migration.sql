-- CreateEnum
CREATE TYPE "status" AS ENUM ('ATIVO', 'DESATIVADO');

-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "status" "status";
