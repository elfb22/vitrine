import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const users = await prisma.user.findMany()
        console.log('Usuários encontrados:', users)
        return NextResponse.json(users)
    } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }
}