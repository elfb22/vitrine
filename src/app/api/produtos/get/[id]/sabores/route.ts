// app/api/produtos/[id]/sabores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params

        const sabores = await prisma.sabor.findMany({
            where: { produto_id: parseInt(id) },
            orderBy: [
                { status: 'asc' }, // ATIVO vem antes de DESATIVADO
                { nome: 'asc' }
            ]
        })

        return NextResponse.json({ sabores })
    } catch (error) {
        console.error('Erro ao buscar sabores:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}