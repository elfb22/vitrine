import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const vendas = await prisma.venda.findMany({
            include: {
                sabor: {
                    include: {
                        produto: {
                            include: {
                                categoria: true, // já traz a categoria do produto
                            },
                        },
                    },
                },
                recebedor: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        return NextResponse.json(vendas)
    } catch (error) {
        console.error('Erro ao buscar vendas:', error)
        return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
    }
}
