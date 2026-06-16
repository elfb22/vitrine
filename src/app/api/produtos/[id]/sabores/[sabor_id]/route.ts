/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/produtos/[id]/sabores/[saborId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: any
) {
    try {
        const { id, sabor_id } = await params
        const sabor = await prisma.sabor.findFirst({
            where: {
                id: parseInt(sabor_id),
                produto_id: parseInt(id)
            },
            include: {
                vendas: { take: 1 } // só precisamos saber se existe alguma
            }
        })

        if (!sabor) {
            return NextResponse.json(
                { message: 'Sabor não encontrado' },
                { status: 404 }
            )
        }

        if (sabor.vendas.length > 0) {
            // Tem vendas — não pode excluir, retorna erro para o frontend desativar
            return NextResponse.json(
                { message: `O sabor "${sabor.nome}" possui vendas associadas e não pode ser excluído. Ele foi desativado.` },
                { status: 409 } // Conflict
            )
        }

        // Sem vendas — pode excluir
        await prisma.sabor.delete({
            where: { id: parseInt(sabor_id) }
        })

        return NextResponse.json({ message: 'Sabor excluído com sucesso' })

    } catch (error) {
        console.error('Erro ao excluir sabor:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}