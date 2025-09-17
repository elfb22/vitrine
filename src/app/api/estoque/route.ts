// app/api/estoque/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EstoqueRequest {
    produto_id: number
    estoque: { [saborId: number]: number }
}

export async function POST(request: NextRequest) {
    try {
        const body: EstoqueRequest = await request.json()
        const { produto_id, estoque } = body
        console.log('BODY======', body)

        // Validações básicas
        if (!produto_id || typeof produto_id !== 'number') {
            return NextResponse.json(
                { error: 'produto_id é obrigatório e deve ser um número' },
                { status: 400 }
            )
        }

        if (!estoque || typeof estoque !== 'object') {
            return NextResponse.json(
                { error: 'estoque é obrigatório e deve ser um objeto' },
                { status: 400 }
            )
        }

        // Verificar se o produto existe
        const produto = await prisma.produto.findUnique({
            where: { id: produto_id },
            include: {
                sabores: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        if (!produto) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            )
        }

        // Validar se todos os sabores pertencem ao produto
        const saborIdsValidos = produto.sabores.map(s => s.id)
        const saborIdsRecebidos = Object.keys(estoque).map(id => parseInt(id))

        const saboresInvalidos = saborIdsRecebidos.filter(id => !saborIdsValidos.includes(id))
        if (saboresInvalidos.length > 0) {
            return NextResponse.json(
                {
                    error: 'Alguns sabores não pertencem ao produto informado',
                    sabores_invalidos: saboresInvalidos
                },
                { status: 400 }
            )
        }

        // Atualizar estoque de cada sabor
        const atualizacoes = Object.entries(estoque).map(([saborId, quantidade]) => {
            const id = parseInt(saborId)
            const qty = Math.max(0, parseInt(String(quantidade)) || 0) // Garantir que seja >= 0

            return prisma.sabor.update({
                where: { id },
                data: { estoque: qty }
            })
        })

        // Executar todas as atualizações em uma transação
        await prisma.$transaction(atualizacoes)

        // Buscar dados atualizados para retornar
        const saboresAtualizados = await prisma.sabor.findMany({
            where: {
                produto_id: produto_id
            },
            select: {
                id: true,
                nome: true,
                estoque: true
            }
        })

        const estoqueAtualizado: { [key: number]: number } = {}
        saboresAtualizados.forEach(sabor => {
            estoqueAtualizado[sabor.id] = sabor.estoque
        })

        return NextResponse.json({
            message: 'Estoque atualizado com sucesso',
            produto: {
                id: produto.id,
                nome: produto.nome
            },
            estoque_atualizado: estoqueAtualizado
        })

    } catch (error) {
        console.error('Erro ao atualizar estoque:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Método GET para buscar estoque de todos os produtos (opcional)
export async function GET() {
    try {
        const produtos = await prisma.produto.findMany({

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