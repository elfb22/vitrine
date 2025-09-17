/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    request: NextRequest,
    { params }: any
) {
    try {
        const id = parseInt(params.id)
        console.log('id----------------', id)
        if (!id) {
            return NextResponse.json(
                { error: "ID da venda é obrigatório" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const {
            data_venda,
            cliente_nome,
            delivery,
            quem_recebeu,
            quantidade,
            valor,
            sabor_id,
            forma_pagamento,
            taxa_entrega,
            fiado
        } = body

        // Confere se a venda existe
        const vendaExistente = await prisma.venda.findUnique({
            where: { id },
            include: { sabor: true },
        })

        if (!vendaExistente) {
            return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
        }
        const sabor = await prisma.sabor.findUnique({ where: { id: sabor_id } });
        if (!sabor) return NextResponse.json({ message: "Sabor não encontrado" }, { status: 404 });

        // Validar estoque
        const estoqueDisponivel = sabor.estoque + (vendaExistente.sabor_id === sabor_id ? vendaExistente.quantidade : 0)
        if (quantidade > estoqueDisponivel) {
            return NextResponse.json({ message: `Quantidade inválida. Apenas ${estoqueDisponivel} em estoque.` }, { status: 400 });
        }

        // Controle de estoque
        if (vendaExistente.sabor_id === sabor_id) {
            // Mesmo sabor → ajusta diferença
            const diferenca = quantidade - vendaExistente.quantidade;

            if (diferenca > 0) {
                // Aumentou a quantidade → diminui estoque
                await prisma.sabor.update({
                    where: { id: parseInt(sabor_id) },
                    data: { estoque: { decrement: diferenca } }
                });
            } else if (diferenca < 0) {
                // Diminuiu a quantidade → devolve ao estoque
                await prisma.sabor.update({
                    where: { id: parseInt(sabor_id) },
                    data: { estoque: { increment: Math.abs(diferenca) } }
                });
            }
            // Se diferenca === 0, não faz nada
        }
        else {
            // Sabor diferente → devolve estoque antigo e desconta novo
            await prisma.sabor.update({
                where: { id: vendaExistente.sabor_id },
                data: {
                    estoque:
                    {
                        increment: Number(vendaExistente.quantidade)
                    }
                },
            })

            await prisma.sabor.update({
                where: { id: sabor_id },
                data: {
                    estoque: {
                        decrement: parseInt(quantidade)  // NÃO coloque objeto extra
                    }
                }
            });

        }

        // Atualiza a venda
        const vendaAtualizada = await prisma.venda.update({
            where: { id },
            data: {
                cliente_nome,
                quantidade,
                valor,
                forma_pagamento,
                taxa_entrega,
                fiado,
                data_venda: new Date(data_venda),
                recebido_por: parseInt(quem_recebeu), // certifique-se que vem número

                // Atualiza a relação do sabor
                sabor: {
                    connect: { id: parseInt(sabor_id) }
                }
            },
            include: {
                sabor: { include: { produto: true } },
                recebedor: true,
            },
        });

        return NextResponse.json(vendaAtualizada, { status: 200 })
    } catch (error) {
        console.error("Erro ao atualizar venda:", error)
        return NextResponse.json(
            { error: "Erro ao atualizar venda" },
            { status: 500 }
        )
    }
}
