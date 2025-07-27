/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/categorias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE - Excluir categoria
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: any } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { message: 'ID da categoria é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se a categoria existe
        const existingCategory = await prisma.categoria.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { message: 'Categoria não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se a categoria está sendo usada por algum produto
        const productsUsingCategory = await prisma.produto.findMany({
            where: { categoria_id: parseInt(id) },
            select: { id: true, nome: true }
        });

        if (productsUsingCategory.length > 0) {
            return NextResponse.json(
                {
                    message: `Não é possível excluir esta categoria pois ela está sendo usada por ${productsUsingCategory.length} produto(s)`,
                    productsUsing: productsUsingCategory
                },
                { status: 409 }
            );
        }

        // Excluir a categoria
        await prisma.categoria.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json(
            { message: 'Categoria excluída com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

