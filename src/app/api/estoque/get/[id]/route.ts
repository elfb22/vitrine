/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest,
    { params }: any) {


    const { id } = await params;
    console.log('id', id)

    try {
        const produtos = await prisma.produto.findMany({
            where: {
                id: parseInt(id)
            },
            include: {
                sabores: {
                    select: {
                        id: true,
                        nome: true,
                        estoque: true
                    }
                }
            }
        })

        const estoquePorProduto = produtos.map(produto => ({
            produto_id: produto.id,
            produto_nome: produto.nome,
            sabores: produto.sabores.map(sabor => ({
                id: sabor.id,
                nome: sabor.nome,
                estoque: sabor.estoque
            }))
        }))

        return NextResponse.json(estoquePorProduto)

    } catch (error) {
        console.error('Erro ao buscar estoque:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}