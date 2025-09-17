-- AlterTable
ALTER TABLE "sabor" ADD COLUMN     "estoque" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "nome" TEXT;

-- CreateTable
CREATE TABLE "venda" (
    "id" SERIAL NOT NULL,
    "sabor_id" INTEGER NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data_venda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recebido_por" INTEGER NOT NULL,
    "taxa_entrega" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "venda_sabor_id_fkey" FOREIGN KEY ("sabor_id") REFERENCES "sabor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "venda_recebido_por_fkey" FOREIGN KEY ("recebido_por") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
