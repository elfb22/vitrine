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

        const produto = await prisma.produto.findUnique({
            where: { id: produto_id },
            include: {
                sabores: {
                    select: { id: true, nome: true }
                }
            }
        })

        if (!produto) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            )
        }

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

        // Buscar status atual dos sabores para não desativar recém-criados
        const saboresAtuais = await prisma.sabor.findMany({
            where: { id: { in: saborIdsRecebidos } },
            select: { id: true, status: true, estoque: true }
        })
        const statusAtual = Object.fromEntries(saboresAtuais.map(s => [s.id, s]))

        // Atualizar estoque de cada sabor
        // Regra: se qty = 0 E o sabor já tinha estoque > 0 antes → desativa
        //        se qty > 0 → ativa
        //        se qty = 0 E o sabor era novo (estoque ainda 0) → mantém ATIVO
        const atualizacoes = Object.entries(estoque).map(([saborId, quantidade]) => {
            const id = parseInt(saborId)
            const qty = Math.max(0, parseInt(String(quantidade)) || 0)
            const anterior = statusAtual[id]

            let novoStatus: 'ATIVO' | 'DESATIVADO'
            if (qty > 0) {
                novoStatus = 'ATIVO'
            } else if (anterior?.estoque > 0) {
                // Tinha estoque e zerou → desativa
                novoStatus = 'DESATIVADO'
            } else {
                // Já estava em 0 (sabor novo ou nunca teve estoque) → mantém status atual
                novoStatus = anterior?.status ?? 'ATIVO'
            }

            return prisma.sabor.update({
                where: { id },
                data: { estoque: qty, status: novoStatus }
            })
        })

        await prisma.$transaction(atualizacoes)

        // Retornar dados atualizados
        const saboresAtualizados = await prisma.sabor.findMany({
            where: { produto_id },
            select: {
                id: true,
                nome: true,
                estoque: true,
                status: true
            }
        })

        const estoqueAtualizado: { [key: number]: number } = {}
        saboresAtualizados.forEach(sabor => {
            estoqueAtualizado[sabor.id] = sabor.estoque
        })

        // Informar quantos sabores foram desativados por falta de estoque
        const desativados = saboresAtualizados.filter(s => s.status === 'DESATIVADO' && s.estoque === 0)

        return NextResponse.json({
            message: 'Estoque atualizado com sucesso',
            produto: {
                id: produto.id,
                nome: produto.nome
            },
            estoque_atualizado: estoqueAtualizado,
            sabores_desativados: desativados.map(s => s.nome) // para o frontend exibir aviso se quiser
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

export async function GET() {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                sabores: {
                    select: {
                        id: true,
                        nome: true,
                        estoque: true,
                        status: true
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
                estoque: sabor.estoque,
                status: sabor.status
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