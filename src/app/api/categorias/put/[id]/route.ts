import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { name } = await request.json();
        const trimmedName = name?.trim();

        if (!id || !trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
            return NextResponse.json(
                { message: "Nome inválido. Deve ter entre 2 e 100 caracteres." },
                { status: 400 }
            );
        }

        const categoriaExistente = await prisma.categoria.findFirst({
            where: {
                nome: trimmedName,
                NOT: { id: parseInt(id) },
            },
        });

        if (categoriaExistente) {
            return NextResponse.json(
                { message: "Já existe outra categoria com este nome." },
                { status: 409 }
            );
        }

        const categoriaAtualizada = await prisma.categoria.update({
            where: { id: parseInt(id) },
            data: {
                nome: trimmedName,
                updated_at: new Date(),
            },
        });

        return NextResponse.json(
            {
                message: "Categoria atualizada com sucesso",
                categoria: categoriaAtualizada,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
