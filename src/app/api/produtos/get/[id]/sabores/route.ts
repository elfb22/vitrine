/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: any) {
    console.log('params', params)
    const id = params.id
    console.log('id=======', id)
    try {
        const sabores = await prisma.produto.findMany({
            where: {
                id: parseInt(id),
                status: 'ATIVO'
            },
            select: {
                sabores: true
            }
        })
        console.log('Sabores encontrados:', sabores)
        return NextResponse.json(sabores)
    } catch (error) {
        console.error('Erro ao buscar sabores:', error)
        return NextResponse.json({ error: 'Erro ao buscar sabores' }, { status: 500 })
    }
}