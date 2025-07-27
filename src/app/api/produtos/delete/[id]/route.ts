import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Validar se o ID foi fornecido
        if (!id) {
            return NextResponse.json(
                { message: 'ID do produto é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar o produto para obter informações da imagem antes de deletar
        const produto = await prisma.produto.findUnique({
            where: { id: parseInt(id) },
            include: {
                sabores: true
            }
        })

        if (!produto) {
            return NextResponse.json(
                { message: 'Produto não encontrado' },
                { status: 404 }
            )
        }

        // Deletar sabores relacionados primeiro (se necessário, dependendo da sua configuração de cascade)
        await prisma.sabor.deleteMany({
            where: { produto_id: parseInt(id) }
        })

        // Deletar o produto do banco de dados
        await prisma.produto.delete({
            where: { id: parseInt(id) }
        })

        // Deletar a imagem do sistema de arquivos se existir
        if (produto.imagem) {
            const imagemPath = path.join(process.cwd(), 'public', 'images', 'produtos', produto.imagem)

            try {
                // Verificar se o arquivo existe antes de tentar deletar
                if (existsSync(imagemPath)) {
                    await unlink(imagemPath)
                    console.log(`Imagem deletada: ${produto.imagem}`)
                }
            } catch (deleteError) {
                console.error('Erro ao deletar imagem:', deleteError)
                // Não interrompe o processo se não conseguir deletar a imagem
                // O produto já foi deletado do banco com sucesso
            }
        }

        return NextResponse.json({
            message: 'Produto deletado com sucesso',
            produto: {
                id: produto.id,
                nome: produto.nome,
                imagem: produto.imagem
            }
        })

    } catch (error: unknown) {
        console.error('Erro ao deletar produto:', error)

        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    } finally {
        // Fechar conexão Prisma
        await prisma.$disconnect()
    }
}