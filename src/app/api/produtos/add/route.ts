// app/api/produtos/add/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        const nome = formData.get('nome') as string
        const categoria = formData.get('categoria') as string
        const precoOriginal = formData.get('precoOriginal') as string
        const precoDesconto = formData.get('precoDesconto') as string
        const descricao = formData.get('descricao') as string
        const saboresString = formData.get('sabores') as string
        const sabores = saboresString ? JSON.parse(saboresString) : []

        // Validações básicas
        if (!nome || !categoria || !precoOriginal) {
            return NextResponse.json(
                { message: 'Campos obrigatórios: nome, categoria, preço original' },
                { status: 400 }
            )
        }

        // Buscar o ID da categoria pelo nome
        const categoriaExistente = await prisma.categoria.findUnique({
            where: { nome: categoria }
        })

        if (!categoriaExistente) {
            return NextResponse.json(
                { message: 'Categoria não encontrada' },
                { status: 400 }
            )
        }

        // Processar imagem
        const imagemFile = formData.get('imagem') as File | null
        console.log("IMAGEM FILE API:", imagemFile)
        let imagemPath: string | null = null

        if (imagemFile && imagemFile.size > 0) {
            try {
                // Converter File para Buffer
                const imagemBytes = await imagemFile.arrayBuffer()

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

                imagemPath = filename
                console.log(`Imagem salva no Supabase: produtos/${filename}`)

            } catch (imageError) {
                console.error("Erro ao processar/salvar imagem:", imageError)
                return NextResponse.json({
                    success: false,
                    message: "Erro ao processar imagem"
                }, { status: 500 })
            }
        }

        // Criar o produto com transação para garantir consistência
        const produto = await prisma.$transaction(async (tx) => {
            // Criar o produto
            const novoProduto = await tx.produto.create({
                data: {
                    nome,
                    preco_original: parseFloat(precoOriginal),
                    preco_desconto: parseFloat(precoDesconto),
                    descricao,
                    imagem: imagemPath || '',
                    categoria_id: categoriaExistente.id,
                }
            })

            // Criar os sabores se existirem
            if (sabores.length > 0) {
                await tx.sabor.createMany({
                    data: sabores.map((saborNome: string) => ({
                        nome: saborNome,
                        produto_id: novoProduto.id
                    }))
                })
            }

            // Retornar o produto com sabores incluídos
            return await tx.produto.findUnique({
                where: { id: novoProduto.id },
                include: {
                    categoria: true,
                    sabores: true
                }
            })
        })

        return NextResponse.json({
            message: 'Produto criado com sucesso',
            produto
        }, { status: 201 })

    } catch (error) {
        console.error('Erro ao criar produto:', error)

        return NextResponse.json(
            {
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}