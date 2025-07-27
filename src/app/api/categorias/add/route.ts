// app/api/categorias/add/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json()

        const trimmedName = name?.trim()
        if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
            return NextResponse.json({
                error: true,
                message: 'Nome deve ter entre 2 e 100 caracteres',
            }, { status: 400 })
        }

        const exists = await prisma.categoria.findUnique({ where: { nome: trimmedName } })
        if (exists) {
            return NextResponse.json({
                error: true,
                message: 'Já existe uma categoria com este nome',
            }, { status: 409 })
        }

        const categoria = await prisma.categoria.create({ data: { nome: trimmedName } })

        return NextResponse.json({
            success: true,
            message: 'Categoria criada com sucesso',
            data: categoria,
        }, { status: 201 })

    } catch (error) {
        console.error('Erro ao criar categoria:', error)
        return NextResponse.json({
            error: true,
            message: 'Erro interno do servidor. Tente novamente.',
        }, { status: 500 })
    }
}
