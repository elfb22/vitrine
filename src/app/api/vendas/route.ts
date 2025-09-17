/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/vendas/registrar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            produto_id,
            sabor_id,
            quantidade,
            nome_cliente,
            nome_recebedor,
            data,
            delivery,
            valor_total,
            forma_pagamento,
            fiado
        } = body

        // Validações básicas
        if (!sabor_id || !quantidade || !nome_cliente || !nome_recebedor || !valor_total) {
            return NextResponse.json(
                { error: 'Dados obrigatórios não fornecidos' },
                { status: 400 }
            )
        }

        if (quantidade <= 0) {
            return NextResponse.json(
                { error: 'Quantidade deve ser maior que zero' },
                { status: 400 }
            )
        }

        if (valor_total <= 0) {
            return NextResponse.json(
                { error: 'Valor total deve ser maior que zero' },
                { status: 400 }
            )
        }

        // Verificar se o sabor existe e tem estoque suficiente
        const sabor = await prisma.sabor.findUnique({
            where: { id: sabor_id },
            include: {
                produto: true
            }
        })

        if (!sabor) {
            return NextResponse.json(
                { error: 'Sabor não encontrado' },
                { status: 404 }
            )
        }

        if (sabor.estoque < quantidade) {
            return NextResponse.json(
                {
                    error: `Estoque insuficiente. Disponível: ${sabor.estoque}, Solicitado: ${quantidade}`
                },
                { status: 400 }
            )
        }

        // Buscar o usuário que recebeu a venda pelo nome
        const usuario = await prisma.user.findFirst({
            where: { nome: nome_recebedor }
        })

        if (!usuario) {
            return NextResponse.json(
                { error: 'Usuário recebedor não encontrado' },
                { status: 404 }
            )
        }

        // Converter data para DateTime
        const dataVenda = new Date(data)

        // Usar transação para garantir consistência dos dados
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Reduzir o estoque do sabor
            await tx.sabor.update({
                where: { id: sabor_id },
                data: {
                    estoque: {
                        decrement: quantidade
                    }
                }
            })

            // 2. Registrar a venda
            const novaVenda = await tx.venda.create({
                data: {
                    sabor_id: sabor_id,
                    cliente_nome: nome_cliente,
                    quantidade: quantidade,
                    valor: valor_total,
                    data_venda: dataVenda,
                    recebido_por: usuario.id,
                    taxa_entrega: delivery,
                    fiado: body.fiado || false,
                    forma_pagamento
                },
                include: {
                    sabor: {
                        include: {
                            produto: true
                        }
                    },
                    recebedor: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            })

            return novaVenda
        })

        return NextResponse.json({
            success: true,
            message: 'Venda registrada com sucesso!',
            data: {
                id: resultado.id,
                cliente: resultado.cliente_nome,
                produto: resultado.sabor.produto.nome,
                sabor: resultado.sabor.nome,
                quantidade: resultado.quantidade,
                valor_total: resultado.valor,
                data_venda: resultado.data_venda,
                recebedor: resultado.recebedor.nome,
                delivery: resultado.taxa_entrega,
                fiado: resultado.fiado
            }
        })

    } catch (error) {
        console.error('Erro ao registrar venda:', error)

        // Tratamento de erros específicos do Prisma
        if (error instanceof Error) {
            if (error.message.includes('Foreign key constraint')) {
                return NextResponse.json(
                    { error: 'Erro de relacionamento entre dados' },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}