/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: any) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { message: "ID da venda é obrigatório" },
                { status: 400 }
            );
        }

        const venda = await prisma.venda.findUnique({
            where: { id: parseInt(id) },
        });

        if (!venda) {
            return NextResponse.json(
                { message: "Venda não encontrada" },
                { status: 404 }
            );
        }

        // 🔥 devolve a quantidade para o estoque do sabor
        await prisma.sabor.update({
            where: { id: venda.sabor_id },
            data: {
                estoque: {
                    increment: venda.quantidade, // devolve a quantidade no estoque
                },
            },
        });

        // Exclui a venda
        await prisma.venda.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(
            { message: "Venda excluída com sucesso e estoque atualizado" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao excluir venda:", error);
        return NextResponse.json(
            { message: "Erro ao excluir venda" },
            { status: 500 }
        );
    }
}
