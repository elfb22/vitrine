/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ShoppingCart, Package, User, Calendar, Truck, DollarSign, CircleX, CreditCard } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { showToast, ToastType } from '@/utils/toastUtils'

interface Sabor {
    id: number
    nome: string
}

interface Produto {
    id: number
    nome: string
    sabores: Sabor[]
    preco_original: number
    preco_desconto: number
}

interface Usuario {
    id: number
    email: string
    senha: string
    nome: string
    created_at: string
    updated_at: string
}

interface DialogVendasProps {
    aberto: boolean
    onAbertoChange: (aberto: boolean) => void
    produto: Produto | null
    user: any
    onVendaRealizada: (produtoId: number, saborId: number, quantidadeVendida: number) => void
}

interface VendaFormData {
    sabor_id: number
    quantidade: number
    nome_cliente: string
    nome_recebedor: string
    data: string
    delivery: boolean
    fiado: boolean
    valor_total: number
    forma_pagamento: string
}

export default function DialogVendas({ aberto, user, onAbertoChange, produto, onVendaRealizada }: DialogVendasProps) {
    const [valorFormatado, setValorFormatado] = useState('0,00')

    const precoUnitario = useMemo(() => {
        return produto ? (produto.preco_desconto || produto.preco_original) : 0
    }, [produto])

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<VendaFormData>({
        defaultValues: {
            sabor_id: 0,
            quantidade: 1,
            nome_cliente: '',
            nome_recebedor: '',
            data: new Date().toISOString().split('T')[0],
            delivery: false,
            valor_total: 0,
            fiado: false,
            forma_pagamento: ''
        }
    })

    const quantidade = watch('quantidade')
    const valorTotal = watch('valor_total')
    const delivery = watch('delivery')
    const fiado = watch('fiado')

    // Função para formatar valor em real
    const formatarValorReal = (valor: number): string => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    // Função melhorada para lidar com mudança no valor total
    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Remove tudo que não for dígito
        const digitsOnly = inputValue.replace(/\D/g, '')

        if (digitsOnly === '') {
            setValorFormatado('0,00')
            setValue('valor_total', 0)
            return
        }

        // Converte para número (centavos)
        const numero = parseInt(digitsOnly) / 100

        // Formata para exibição
        const formatado = numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

        setValorFormatado(formatado)
        setValue('valor_total', numero)
    }

    // Função para lidar com teclas especiais
    const handleValorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Permite: backspace, delete, tab, escape, enter, home, end, left, right
        if ([8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return
        }
        // Garante que é um número
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault()
        }
    }

    // Função para validar dados antes de submeter
    const validarDados = (data: VendaFormData): boolean => {
        let isValid = true
        clearErrors()

        if (data.sabor_id === 0) {
            setError('sabor_id', { type: 'manual', message: 'Por favor, selecione um sabor' })
            isValid = false
        }

        if (data.quantidade <= 0) {
            setError('quantidade', { type: 'manual', message: 'A quantidade deve ser maior que zero' })
            isValid = false
        }

        if (!data.nome_cliente.trim()) {
            setError('nome_cliente', { type: 'manual', message: 'Por favor, informe o nome do cliente' })
            isValid = false
        }

        if (!data.nome_recebedor.trim()) {
            setError('nome_recebedor', { type: 'manual', message: 'Por favor, selecione quem recebeu' })
            isValid = false
        }

        if (!data.data) {
            setError('data', { type: 'manual', message: 'Por favor, selecione a data' })
            isValid = false
        }

        if (data.valor_total <= 0) {
            setError('valor_total', { type: 'manual', message: 'O valor total deve ser maior que zero' })
            isValid = false
        }

        if (!data.forma_pagamento) {
            setError('forma_pagamento', { type: 'manual', message: 'Por favor, selecione a forma de pagamento' })
            isValid = false
        }

        return isValid
    }

    // Registrar venda
    const onSubmit = async (data: VendaFormData) => {
        if (!produto || !validarDados(data)) return

        try {
            const response = await fetch('/api/vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produto_id: produto.id,
                    sabor_id: data.sabor_id,
                    quantidade: data.quantidade,
                    nome_cliente: data.nome_cliente,
                    nome_recebedor: data.nome_recebedor,
                    data: data.data,
                    delivery: data.delivery,
                    valor_unitario: precoUnitario,
                    valor_total: data.valor_total,
                    forma_pagamento: data.forma_pagamento,
                    fiado: data.fiado
                })
            })

            if (response.ok) {
                console.log('Venda registrada com sucesso!')

                // Chama a função callback para atualizar o estoque
                onVendaRealizada(produto.id, data.sabor_id, data.quantidade)

                onAbertoChange(false)
                showToast('Venda registrada!', ToastType.SUCCESS)
            } else {
                console.error('Erro ao registrar venda')
                showToast('Erro ao registrar venda', ToastType.ERROR)
            }
        } catch (error) {
            console.error('Erro ao registrar venda:', error)
            showToast('Erro ao conectar com o servidor', ToastType.ERROR)
        }
    }

    // Effect para atualizar valor total baseado na quantidade
    useEffect(() => {
        if (produto && quantidade > 0) {
            const valorCalculado = precoUnitario * quantidade
            setValue('valor_total', valorCalculado)
            setValorFormatado(formatarValorReal(valorCalculado))
        }
    }, [quantidade, precoUnitario, produto, setValue])

    // Effect para inicializar formulário quando abrir
    useEffect(() => {
        if (aberto && produto) {
            const dataAtual = new Date().toISOString().split('T')[0]
            const primeiroSabor = produto.sabores.length > 0 ? produto.sabores[0].id : 0
            const valorInicial = precoUnitario

            reset({
                sabor_id: primeiroSabor,
                quantidade: 1,
                nome_cliente: '',
                nome_recebedor: '',
                data: dataAtual,
                delivery: false,
                valor_total: valorInicial,
                fiado: false,
                forma_pagamento: ''
            })

            setValorFormatado(formatarValorReal(valorInicial))
        }
    }, [aberto, produto, reset, precoUnitario])

    // Reset ao fechar dialog
    useEffect(() => {
        if (!aberto) {
            reset()
            setValorFormatado('0,00')
        }
    }, [aberto, reset])

    return (
        <Dialog open={aberto} onOpenChange={onAbertoChange}>
            <DialogContent className="bg-gray-800 border border-gray-700 text-white w-[95vw]  xl:w-[85vw] max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <div className="overflow-y-auto max-h-[calc(90vh-2rem)] p-4">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-cyan-400 text-xl flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Registrar Venda
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                            {produto?.nome && `Registre uma nova venda do produto: ${produto.nome}`}
                        </DialogDescription>
                    </DialogHeader>

                    {produto && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Produto Info */}
                            <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-cyan-400 font-medium">Produto</span>
                                </div>
                                <p className="text-gray-100 font-medium">{produto.nome}</p>
                                <p className="text-sm text-gray-400">
                                    Preço unitário: R$ {precoUnitario.toFixed(2)}
                                </p>
                            </div>

                            {/* Sabor e Quantidade - responsivo */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {/* Sabor */}
                                <div className="w-full">
                                    <Label className="text-gray-300 text-sm">Sabor *</Label>
                                    <select
                                        {...register('sabor_id', {
                                            setValueAs: (value) => parseInt(value)
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-1 text-base box-border"
                                    >
                                        <option value={0}>Selecione</option>
                                        {produto.sabores.map((sabor) => (
                                            <option key={sabor.id} value={sabor.id}>
                                                {sabor.nome}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sabor_id && (
                                        <p className="text-red-400 text-xs mt-1">{errors.sabor_id.message}</p>
                                    )}
                                </div>

                                {/* Quantidade */}
                                <div className="w-full">
                                    <Label className="text-gray-300 text-sm">Quantidade *</Label>
                                    <Input
                                        type="number"
                                        autoComplete="off"
                                        min="1"
                                        {...register('quantidade', {
                                            setValueAs: (value) => parseInt(value) || 1
                                        })}
                                        className="w-full bg-gray-700 border-gray-600 text-white focus:border-cyan-500 mt-1 text-base box-border"
                                    />
                                    {errors.quantidade && (
                                        <p className="text-red-400 text-xs mt-1">{errors.quantidade.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nome do Cliente */}
                            <div className="w-full">
                                <Label className="text-gray-300 flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    Nome do Cliente *
                                </Label>
                                <Input
                                    type="text"
                                    {...register('nome_cliente')}
                                    placeholder="Digite o nome do cliente"
                                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 mt-1 text-base box-border"
                                />
                                {errors.nome_cliente && (
                                    <p className="text-red-400 text-xs mt-1">{errors.nome_cliente.message}</p>
                                )}
                            </div>

                            {/* Quem Recebeu - Select com usuários */}
                            <div className="w-full">
                                <Label className="text-gray-300 text-sm">Quem Recebeu *</Label>
                                <select
                                    {...register('nome_recebedor')}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-1 text-base box-border"
                                >
                                    <option value="">Selecione quem recebeu</option>
                                    {user.map((usuario: any) => (
                                        <option key={usuario.id} value={usuario.nome}>
                                            {usuario.nome}
                                        </option>
                                    ))}
                                </select>
                                {errors.nome_recebedor && (
                                    <p className="text-red-400 text-xs mt-1">{errors.nome_recebedor.message}</p>
                                )}
                            </div>

                            {/* Data */}
                            <div className="w-full">
                                <Label className="text-gray-300 flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    Data da Venda *
                                </Label>
                                <Input
                                    type="date"
                                    {...register('data')}
                                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-cyan-500 mt-1 text-base box-border"
                                    style={{ WebkitAppearance: 'none' }}
                                />
                                {errors.data && (
                                    <p className="text-red-400 text-xs mt-1">{errors.data.message}</p>
                                )}
                            </div>

                            {/* Forma de Pagamento */}
                            <div className="w-full">
                                <Label className="text-gray-300 flex items-center gap-2 text-sm">
                                    <CreditCard className="w-4 h-4" />
                                    Forma de Pagamento *
                                </Label>
                                <select
                                    {...register('forma_pagamento')}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-1 text-base box-border"
                                >
                                    <option value="">Selecione a forma de pagamento</option>
                                    <option value="PIX">PIX</option>
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                    <option value="FIADO">Fiado</option>
                                </select>
                                {errors.forma_pagamento && (
                                    <p className="text-red-400 text-xs mt-1">{errors.forma_pagamento.message}</p>
                                )}
                            </div>

                            {/* Valor Total */}
                            <div className="w-full">
                                <Label className="text-gray-300 flex items-center gap-2 text-sm">
                                    <DollarSign className="w-4 h-4" />
                                    Valor Total da Venda *
                                </Label>
                                <div className="relative mt-1 w-full">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-medium text-sm">
                                        R$
                                    </span>
                                    <Input
                                        type="text"
                                        value={valorFormatado}
                                        onChange={handleValorChange}
                                        onKeyDown={handleValorKeyDown}
                                        placeholder="0,00"
                                        className="w-full pl-10 bg-cyan-900/20 border-cyan-800 text-cyan-400 placeholder-cyan-600 focus:border-cyan-500 font-medium text-base box-border"
                                    />
                                </div>
                                {errors.valor_total && (
                                    <p className="text-red-400 text-xs mt-1">{errors.valor_total.message}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Digite o valor final (ex: taxa de entrega, desconto, etc.)
                                </p>
                            </div>

                            {/* Checkboxes Delivery e Fiado - responsivo */}
                            <div className="grid grid-cols-2 gap-3 ">
                                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                                    <Checkbox
                                        id="delivery"
                                        checked={delivery}
                                        onCheckedChange={(checked) => setValue('delivery', !!checked)}
                                        className="border-gray-600 data-[state=checked]:bg-cyan-600 flex-shrink-0"
                                    />
                                    <Label htmlFor="delivery" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <Truck className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                        Entrega
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                                    <Checkbox
                                        id="fiado"
                                        checked={fiado}
                                        onCheckedChange={(checked) => setValue('fiado', !!checked)}
                                        className="border-gray-600 data-[state=checked]:bg-cyan-600 flex-shrink-0"
                                    />
                                    <Label htmlFor="fiado" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <CircleX className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        Fiado
                                    </Label>
                                </div>
                            </div>

                            {/* Botões - responsivo */}
                            <div className="flex flex-col lg:flex-row gap-3 pt-4 mb-3 border-t border-gray-700">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onAbertoChange(false)}
                                    className="w-full lg:flex-1 bg-gray-700 hover:bg-gray-600 text-gray-400 text-sm py-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full lg:flex-1 bg-green-600 hover:cursor-pointer hover:bg-green-700 disabled:opacity-50 text-sm py-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4 mr-2 flex-shrink-0" />
                                            Confirmar Venda
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}