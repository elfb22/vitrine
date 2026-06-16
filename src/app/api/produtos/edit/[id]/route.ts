/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function PUT(
    request: NextRequest,
    { params }: any
) {
    try {
        const { id } = await params
        const formData = await request.formData()

        const nome = formData.get('nome') as string
        const categoriaNome = formData.get('categoria') as string
        const precoOriginal = parseFloat(formData.get('precoOriginal') as string)
        const precoDesconto = formData.get('precoDesconto') as string
        const descricao = formData.get('descricao') as string
        const saboresString = formData.get('sabores') as string
        const imagem = formData.get('imagem') as File | null
        const imagemAtual = formData.get('imagemAtual') as string | null
        const status = formData.get('status') as string

        // Validações básicas
        if (!nome || !categoriaNome || !precoOriginal || !descricao) {
            return NextResponse.json(
                { message: 'Campos obrigatórios não preenchidos' },
                { status: 400 }
            )
        }

        if (status && !['ATIVO', 'DESATIVADO'].includes(status)) {
            return NextResponse.json(
                { message: 'Status inválido. Use ATIVO ou DESATIVADO' },
                { status: 400 }
            )
        }

        const categoria = await prisma.categoria.findFirst({
            where: { nome: categoriaNome }
        })

        if (!categoria) {
            return NextResponse.json(
                { message: 'Categoria não encontrada' },
                { status: 400 }
            )
        }

        const produtoAtual = await prisma.produto.findUnique({
            where: { id: parseInt(id) },
            include: { sabores: true }
        })

        if (!produtoAtual) {
            return NextResponse.json(
                { message: 'Produto não encontrado' },
                { status: 404 }
            )
        }

        // Parse do novo payload de sabores
        // Formato: [{ id: number|null, nome: string, status: 'ATIVO'|'DESATIVADO', isNew: boolean }]
        type SaborPayload = {
            id: number | null
            nome: string
            status: 'ATIVO' | 'DESATIVADO'
            isNew: boolean
        }

        let saboresPayload: SaborPayload[] = []
        try {
            saboresPayload = saboresString ? JSON.parse(saboresString) : []
        } catch (error) {
            console.error('Erro ao parsear sabores:', error)
        }

        // Processar imagem
        async function removeOldImage(fileName: string | null) {
            if (!fileName) return
            try {
                const { error } = await supabase.storage
                    .from('images')
                    .remove([`produtos/${fileName}`])
                if (error) console.error(`Erro ao remover imagem antiga ${fileName}:`, error)
            } catch (error) {
                console.error(`Erro ao remover imagem antiga ${fileName}:`, error)
            }
        }

        let nomeImagem = imagemAtual

        if (imagem && imagem.size > 0) {
            try {
                if (produtoAtual.imagem) {
                    await removeOldImage(produtoAtual.imagem)
                }

                const imagemBytes = await imagem.arrayBuffer()
                const processedImageBuffer = await sharp(Buffer.from(imagemBytes))
                    .resize({ width: 1200, fit: 'contain' })
                    .webp({ quality: 95 })
                    .toBuffer()

                const filename = `${uuid()}.webp`

                const { error: imageError } = await supabase.storage
                    .from('images')
                    .upload(`produtos/${filename}`, processedImageBuffer, {
                        contentType: 'image/webp',
                    })

                if (imageError) {
                    console.error("Erro ao fazer upload da imagem:", imageError)
                    return NextResponse.json({ success: false, message: "Erro ao fazer upload da imagem" }, { status: 500 })
                }

                nomeImagem = filename
            } catch (imageError) {
                console.error("Erro ao processar/salvar imagem:", imageError)
                return NextResponse.json({ success: false, message: "Erro ao processar imagem" }, { status: 500 })
            }
        }

        // ===== NOVA LÓGICA DE SABORES =====

        // 1. Sabores novos (isNew: true) → criar no banco
        const saboresParaCriar = saboresPayload.filter(s => s.isNew && s.status === 'ATIVO')

        // 2. Sabores existentes com mudança de status → atualizar
        const saboresParaAtualizar = saboresPayload.filter(s => !s.isNew && s.id !== null)

        // Verificar quais sabores desativados têm vendas (não pode deletar, só desativar)
        const idsParaAtualizar = saboresParaAtualizar.map(s => s.id as number)

        // Atualizar status dos sabores existentes
        if (saboresParaAtualizar.length > 0) {
            for (const sabor of saboresParaAtualizar) {
                if (!sabor.id) continue

                const saborAtual = produtoAtual.sabores.find(s => s.id === sabor.id)
                if (!saborAtual) continue

                // Se o status mudou, atualizar
                if (saborAtual.status !== sabor.status) {
                    // Se está sendo desativado, verificar vendas
                    if (sabor.status === 'DESATIVADO') {
                        const temVendas = await prisma.sabor.findFirst({
                            where: { id: sabor.id, vendas: { some: {} } }
                        })

                        if (temVendas) {
                            // Tem vendas: só pode desativar, não deletar — desativar
                            await prisma.sabor.update({
                                where: { id: sabor.id },
                                data: { status: 'DESATIVADO' }
                            })
                        } else {
                            // Sem vendas: deletar do banco
                            await prisma.sabor.delete({ where: { id: sabor.id } })
                        }
                    } else {
                        // Reativando sabor
                        await prisma.sabor.update({
                            where: { id: sabor.id },
                            data: { status: 'ATIVO' }
                        })
                    }
                }
            }
        }

        // Preparar dados para atualização do produto
        const dadosAtualizacao: any = {
            nome,
            categoria: { connect: { id: categoria.id } },
            preco_original: precoOriginal,
            descricao,
        }

        if (status) {
            dadosAtualizacao.status = status as 'ATIVO' | 'DESATIVADO'
        }

        if (precoDesconto && precoDesconto.trim() !== '') {
            dadosAtualizacao.preco_desconto = parseFloat(precoDesconto)
        } else {
            dadosAtualizacao.preco_desconto = null
        }

        if (nomeImagem) {
            dadosAtualizacao.imagem = nomeImagem
        }

        // Criar sabores novos junto com a atualização do produto
        if (saboresParaCriar.length > 0) {
            dadosAtualizacao.sabores = {
                create: saboresParaCriar.map((s: SaborPayload) => ({
                    nome: s.nome,
                    status: 'ATIVO'
                }))
            }
        }

        const produtoAtualizado = await prisma.produto.update({
            where: { id: parseInt(id) },
            data: dadosAtualizacao,
            include: {
                categoria: true,
                sabores: {
                    where: { status: 'ATIVO' }
                }
            }
        })

        console.log('Sabores criados:', saboresParaCriar.map(s => s.nome))
        console.log('Sabores atualizados:', saboresParaAtualizar.length)

        return NextResponse.json({
            message: 'Produto atualizado com sucesso',
            produto: produtoAtualizado
        })

    } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}