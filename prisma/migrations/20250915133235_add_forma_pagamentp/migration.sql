-- CreateEnum
CREATE TYPE "forma_pagamento" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'FIADO');

-- AlterTable
ALTER TABLE "venda" ADD COLUMN     "forma_pagamento" "forma_pagamento";
