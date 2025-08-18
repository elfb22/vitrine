/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @next/next/no-img-element */

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Sparkles, Shield, LogIn } from "lucide-react"
import { useForm } from "react-hook-form"
import { getSession, signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"

interface LoginFormData {
    email: string;
    password: string; // MUDOU: era 'senha', agora é 'password'
}

export default function LoginForm() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [generalError, setGeneralError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            setGeneralError(null);

            // CORREÇÃO: Agora passa 'password' em vez de 'senha'
            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password, // MUDOU: era 'senha'
            });

            console.log('RESULT', result)

            if (result?.error) {
                setGeneralError(`Credenciais inválidas. Verifique se o email e a senha estão corretos.`);
                return;
            }

            // CORREÇÃO: Busca a sessão corretamente
            const session = await getSession();
            if (session?.user?.id) {
                localStorage.setItem('userId', session.user.id.toString());
            }

            router.push('/admin');
        } catch (error) {
            console.error('Erro no login:', error);
            setGeneralError('Ocorreu um erro ao fazer login. Tente novamente.');
        }
    };

    return (
        <div
            className="min-h-screen flex relative"
            style={{
                backgroundImage: `url('/images/logo2.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Background Overlay - múltiplas camadas para um efeito premium */}
            <div className="absolute inset-0 bg-gray-900/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-cyan-900/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60"></div>

            {/* Animated particles effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-purple-400/30 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-blue-400/25 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-300/20 rounded-full animate-ping delay-500"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Glassmorphism Container */}
                    <div className="backdrop-blur-xl bg-gray-900/40 border border-gray-700/50 rounded-3xl p-8 shadow-2xl">

                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center ">
                                <img
                                    src={
                                        '/images/gpt.png'
                                    }
                                    height={200}
                                    width={250}
                                    alt="Logo"
                                />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent mb-2">
                                Bem-vindo
                            </h1>
                            <p className="text-gray-300/80">Faça login para acessar o painel administrativo</p>
                        </div>

                        {/* Login Form */}
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* Email Field */}
                            <div className="relative items-center">
                                <div className='flex items-center '>
                                    <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        autoComplete="off"
                                        {...register('email', {
                                            required: 'Email é obrigatório',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: `Formato de email inválido`,
                                            },
                                        })}
                                        placeholder="Digite seu email"
                                        className="pl-10 bg-gray-800/60 border-gray-600/50 text-gray-100 placeholder:text-gray-400 h-12 rounded-md focus:border-cyan-500 focus:bg-gray-800/80 transition-all duration-200"
                                    />
                                </div>
                                {errors.email && (
                                    <span className="text-red-400 text-xs mt-1 block">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', { // MUDOU: era 'senha'
                                        required: `Senha obrigatória`,
                                        minLength: {
                                            value: 6,
                                            message: `Mínimo de 6 caracteres`,
                                        },
                                    })}
                                    placeholder="Digite sua senha"
                                    className="pl-10 pr-10 bg-gray-800/60 border-gray-600/50 text-gray-100 placeholder:text-gray-400 h-12 rounded-md focus:border-cyan-500 focus:bg-gray-800/80 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                {errors.password && ( // MUDOU: era 'errors.senha'
                                    <span className="text-red-400 text-xs mt-1 block">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>

                            {/* Error Message */}
                            {generalError && (
                                <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                    {generalError}
                                </div>
                            )}

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">

                                <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r cursor-pointer from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Entrando...
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center w-full">
                                        <div className="w-1"></div>
                                        Entrar no Painel
                                        <LogIn size={18} />
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center mt-6 text-gray-400/70 text-sm">
                        <p>© 2025 ELFPODS. Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}