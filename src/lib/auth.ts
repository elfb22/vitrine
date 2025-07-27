
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
    interface User {
        id: number;
        email: string;
    }

    interface Session {
        user: {
            id: number;
            email: string;
        }
    }
}

const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    secret,
    providers: [
        CredentialsProvider({
            name: 'Sign in',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'exemplo@email.com',
                },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                console.log('🔐 Iniciando autorização...');
                console.log('📧 Email recebido:', credentials?.email);

                // Verifica se as credenciais foram fornecidas
                if (!credentials?.email || !credentials.password) {
                    console.log('❌ Credenciais não fornecidas');
                    return null;
                }

                try {
                    // Busca o usuário pelo email
                    console.log('🔍 Buscando usuário no banco...');
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    // Se o usuário não existe, retorna null
                    if (!user) {
                        console.log('❌ Usuário não encontrado no banco');
                        return null;
                    }

                    console.log('✅ Usuário encontrado:', user.email);
                    console.log('🔒 Senha no banco:', user.senha ? 'Existe' : 'Não existe');

                    // Verifica se é o primeiro login (senha ainda não foi definida)
                    if (!user.senha || user.senha === '' || user.senha === null) {
                        console.log('🆕 Primeiro login - definindo senha...');

                        // Primeiro login - cadastra a senha
                        const hashedPassword = await hash(credentials.password, 12);
                        console.log('🔐 Senha hasheada criada');

                        const updatedUser = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                senha: hashedPassword,
                                updated_at: new Date()
                            },
                        });

                        console.log('✅ Senha definida com sucesso para:', updatedUser.email);

                        return {
                            id: updatedUser.id,
                            email: updatedUser.email,
                        };
                    }

                    // Usuário já tem senha definida - verifica se está correta
                    console.log('🔐 Verificando senha existente...');

                    try {
                        const isValidPassword = await compare(credentials.password, user.senha);
                        console.log('🔍 Resultado da comparação:', isValidPassword);

                        if (isValidPassword) {
                            console.log('✅ Login bem-sucedido para:', user.email);
                            return {
                                id: user.id,
                                email: user.email,
                            };
                        } else {
                            console.log('❌ Senha incorreta');
                        }
                    } catch (compareError) {
                        // Se der erro na comparação, pode ser que a senha no banco não seja um hash válido
                        console.log('⚠️ Erro na comparação - senha pode não ser um hash válido:', compareError);
                        console.log('🔄 Redefinindo senha...');

                        const hashedPassword = await hash(credentials.password, 12);

                        const updatedUser = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                senha: hashedPassword,
                                updated_at: new Date()
                            },
                        });

                        console.log('✅ Senha redefinida com sucesso para:', updatedUser.email);

                        return {
                            id: updatedUser.id,
                            email: updatedUser.email,
                        };
                    }

                    // Senha incorreta
                    console.log('❌ Credenciais inválidas');
                    return null;

                } catch (error) {
                    console.error('💥 Erro na autenticação:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            console.log('📋 Callback de sessão:', {
                sessionUser: session.user,
                tokenId: token.id
            });

            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as number,
                },
            };
        },
        jwt: ({ token, user }) => {
            console.log('🎫 Callback JWT:', {
                tokenId: token.id,
                userId: user?.id
            });

            if (user) {
                return {
                    ...token,
                    id: user.id,
                };
            }
            return token;
        },
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/login',
        error: '/auth/login'
    },
    debug: process.env.NODE_ENV === 'development',
};