import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                sabores: true
            }
        })
        return NextResponse.json(produtos)
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }
}