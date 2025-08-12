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
        const categoriaNome = formData.get('categoria') as string // Nome da categoria
        const precoOriginal = parseFloat(formData.get('precoOriginal') as string)
        const precoDesconto = formData.get('precoDesconto') as string
        const descricao = formData.get('descricao') as string
        const saboresString = formData.get('sabores') as string
        const imagem = formData.get('imagem') as File | null
        const imagemAtual = formData.get('imagemAtual') as string | null
        const status = formData.get('status') as string // Adicionar status

        // Validações básicas
        if (!nome || !categoriaNome || !precoOriginal || !descricao) {
            return NextResponse.json(
                { message: 'Campos obrigatórios não preenchidos' },
                { status: 400 }
            )
        }

        // Validar status
        if (status && !['ATIVO', 'DESATIVADO'].includes(status)) {
            return NextResponse.json(
                { message: 'Status inválido. Use ATIVO ou DESATIVADO' },
                { status: 400 }
            )
        }

        // Buscar a categoria pelo nome para obter o ID
        const categoria = await prisma.categoria.findFirst({
            where: { nome: categoriaNome }
        })

        if (!categoria) {
            return NextResponse.json(
                { message: 'Categoria não encontrada' },
                { status: 400 }
            )
        }

        // Buscar o produto atual para obter a imagem existente
        const produtoAtual = await prisma.produto.findUnique({
            where: { id: parseInt(id) }
        })

        if (!produtoAtual) {
            return NextResponse.json(
                { message: 'Produto não encontrado' },
                { status: 404 }
            )
        }

        // Processar sabores
        let sabores = []
        try {
            sabores = saboresString ? JSON.parse(saboresString) : []
        } catch (error) {
            console.error('Erro ao parsear sabores:', error)
            sabores = []
        }

        // Função para remover imagem antiga do Supabase
        async function removeOldImage(fileName: string | null) {
            if (!fileName) return;

            try {
                const { error } = await supabase.storage
                    .from('images')
                    .remove([`produtos/${fileName}`])

                if (error) {
                    console.error(`Erro ao remover imagem antiga ${fileName}:`, error)
                } else {
                    console.log(`Imagem removida do Supabase: ${fileName}`)
                }
            } catch (error) {
                console.error(`Erro ao remover imagem antiga ${fileName}:`, error)
            }
        }

        // Processar imagem
        let nomeImagem = imagemAtual // Manter imagem atual por padrão

        if (imagem && imagem.size > 0) {
            try {
                // Nova imagem foi enviada - remover imagem anterior se existir
                if (produtoAtual.imagem) {
                    await removeOldImage(produtoAtual.imagem)
                }

                // Converter File para Buffer
                const imagemBytes = await imagem.arrayBuffer()

                // Processar imagem com sharp
                const processedImageBuffer = await sharp(Buffer.from(imagemBytes))
                    .resize({ width: 1200, fit: 'contain' })
                    .webp({ quality: 95 })
                    .toBuffer()

                console.log(`Tamanho da imagem após compressão: ${processedImageBuffer.byteLength} bytes`)

                // Criar nome único para o arquivo
                const filename = `${uuid()}.webp`

                // Upload para Supabase
                const { data: imageData, error: imageError } = await supabase.storage
                    .from('images')
                    .upload(`produtos/${filename}`, processedImageBuffer, {
                        contentType: 'image/webp',
                    })

                if (imageError) {
                    console.error("Erro ao fazer upload da imagem:", imageError)
                    return NextResponse.json({
                        success: false,
                        message: "Erro ao fazer upload da imagem"
                    }, { status: 500 })
                }

                nomeImagem = filename
                console.log(`Imagem atualizada no Supabase: produtos/${filename}`)

            } catch (imageError) {
                console.error("Erro ao processar/salvar imagem:", imageError)
                return NextResponse.json({
                    success: false,
                    message: "Erro ao processar imagem"
                }, { status: 500 })
            }
        }

        // Primeiro, deletar sabores existentes
        await prisma.sabor.deleteMany({
            where: { produto_id: parseInt(id) }
        })

        // Preparar dados para atualização
        const dadosAtualizacao: any = {
            nome,
            categoria: {
                connect: { id: categoria.id } // Conectar usando o ID da categoria
            },
            preco_original: precoOriginal,
            descricao,
        }

        // Adicionar status se fornecido
        if (status) {
            dadosAtualizacao.status = status as 'ATIVO' | 'DESATIVADO'
        }

        // Adicionar preço com desconto se fornecido
        if (precoDesconto && precoDesconto.trim() !== '') {
            dadosAtualizacao.preco_desconto = parseFloat(precoDesconto)
        } else {
            dadosAtualizacao.preco_desconto = null
        }

        // Adicionar imagem se houver
        if (nomeImagem) {
            dadosAtualizacao.imagem = nomeImagem
        }

        // Adicionar sabores se houver
        if (sabores.length > 0) {
            dadosAtualizacao.sabores = {
                create: sabores.map((saborNome: string) => ({
                    nome: saborNome
                }))
            }
        }

        // Atualizar produto no banco de dados
        const produtoAtualizado = await prisma.produto.update({
            where: { id: parseInt(id) },
            data: dadosAtualizacao,
            include: {
                categoria: true,
                sabores: true
            }
        })

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