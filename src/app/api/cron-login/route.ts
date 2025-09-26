/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function GET(req: Request) {
    // Segurança extra: checar se veio do Cron da Vercel
    if (req.headers.get("user-agent") !== "vercel-cron/1.0") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const email = process.env.CRON_EMAIL;
        const password = process.env.CRON_PASS;

        if (!email || !password) {
            throw new Error("⚠️ Variáveis CRON_EMAIL e CRON_PASS não configuradas.");
        }

        // Busca usuário no banco
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        // Verifica senha
        const isValid = await compare(password, user.senha || "");
        if (!isValid) {
            return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
        }

        // Se quiser gerar um "token simples" para controle interno
        const tokenPayload = {
            id: user.id,
            email: user.email,
            at: new Date().toISOString(),
        };

        console.log("✅ Login via cron bem-sucedido:", tokenPayload);

        return NextResponse.json({
            ok: true,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (err: any) {
        console.error("💥 Erro no cron-login:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
