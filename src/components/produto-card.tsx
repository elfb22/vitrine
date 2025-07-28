/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProductCardProps {
    product: {
        id: string
        name: string
        price: number
        originalPrice?: number
        description?: string
        image?: string
        category: string
        sabores: any
    }
}

interface FormData {
    nome: string
    endereco: string
    sabor: string
    formaPagamento: string
    observacoes?: string
}

export default function ProdutoCard({ product }: ProductCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    console.log("PRODUTCT========$", product)
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset
    } = useForm<FormData>()
    const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL
    // Calcular a porcentagem de desconto
    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    const onSubmit = (data: FormData) => {
        const mensagem = `*NOVO PEDIDO RECEBIDO*

*Nome:* ${data.nome}
*Produto:* ${product.name}
*Sabor:* ${data.sabor}
*Endereço:* ${data.endereco}
*Valor:* R$ ${product.price.toFixed(2).replace(".", ",")}
*Forma de Pagamento:* ${data.formaPagamento}
${data.observacoes ? `*Observações:* ${data.observacoes}` : ''}

Seu pedido está sendo preparado com cuidado.
Obrigado por escolher a ElfBPods.`

        const numeroWhatsApp = "5532999392474"
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`
        window.open(url, '_blank')

        setIsOpen(false)
        reset()
    }

    return (
        <div className="group bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-500 overflow-hidden border border-gray-700 hover:border-cyan-900/30 transform hover:-translate-y-2 flex flex-col">
            {/* Product Image */}
            <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img
                    src={`${bucketUrl}/${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />


                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                        -{discountPercentage}%
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="px-6 pt-2 pb-4">
                <h3 className="font-bold text-gray-100 text-lg group-hover:text-cyan-400 transition-colors duration-300">
                    {product.name}
                </h3>
                <div className="min-h-[30px]">
                    {product.description && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="min-h-[65px]">
                    {product.sabores && product.sabores.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                                {product.sabores.map((sabor: any, index: any) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                                    >
                                        {sabor}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                                <div className="text-sm text-gray-500 line-through">
                                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-cyan-400">
                                        R$ {product.price.toFixed(2).replace(".", ",")}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-cyan-400">R$ {product.price.toFixed(2).replace(".", ",")}</span>
                        )}
                    </div>
                </div>

                {/* WhatsApp Button with Dialog */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full bg-gradient-to-r cursor-pointer from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-900/50">
                            <MessageCircle size={18} />
                            Comprar no WhatsApp
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] md:max-w-[700px] bg-gray-900 border-gray-800 backdrop-blur-sm" >
                        <DialogHeader>
                            <DialogTitle className="text-gray-100">
                                Finalizar Pedido - {product.name}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="nome" className="text-gray-200">
                                    Nome completo
                                </Label>
                                <Input
                                    id="nome"
                                    {...register("nome", { required: "Nome é obrigatório" })}
                                    className="bg-gray-800 border-gray-700 text-gray-100"
                                    placeholder="Seu nome completo"
                                />
                                {errors.nome && (
                                    <p className="text-red-400 text-sm">{errors.nome.message}</p>
                                )}
                            </div>

                            {/* Endereço */}
                            <div className="space-y-2">
                                <Label htmlFor="endereco" className="text-gray-200">
                                    Endereço de entrega
                                </Label>
                                <Input
                                    id="endereco"
                                    {...register("endereco", { required: "Endereço é obrigatório" })}
                                    className="bg-gray-800 border-gray-700 text-gray-100"
                                    placeholder="Rua, número, bairro, cidade"
                                />
                                {errors.endereco && (
                                    <p className="text-red-400 text-sm">{errors.endereco.message}</p>
                                )}
                            </div>

                            {/* Sabor */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Sabor</Label>
                                    <Select onValueChange={(value) => setValue("sabor", value)}>
                                        <SelectTrigger className="bg-gray-800 w-full border-gray-700 text-gray-100">
                                            <SelectValue placeholder="Selecione o sabor" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {product.sabores.map((sabor: string, index: number) => (
                                                <SelectItem key={index} value={sabor} className="text-gray-100">
                                                    {sabor}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.sabor && (
                                        <p className="text-red-400 text-sm">Selecione um sabor</p>
                                    )}
                                </div>
                                {/* Forma de Pagamento */}
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Forma de Pagamento</Label>
                                    <Select onValueChange={(value) => setValue("formaPagamento", value)}>
                                        <SelectTrigger className="bg-gray-800 w-full border-gray-700 text-gray-100">
                                            <SelectValue placeholder="Selecione a forma de pagamento" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            <SelectItem value="pix" className="text-gray-100">PIX</SelectItem>
                                            <SelectItem value="dinheiro" className="text-gray-100">Dinheiro</SelectItem>
                                            <SelectItem value="credito" className="text-gray-100">Cartão de Crédito</SelectItem>
                                            <SelectItem value="debito" className="text-gray-100">Cartão de Débito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.formaPagamento && (
                                        <p className="text-red-400 text-sm">Selecione uma forma de pagamento</p>
                                    )}
                                </div>
                            </div>

                            {/* Observações */}
                            <div className="space-y-2">
                                <Label htmlFor="observacoes" className="text-gray-200">
                                    Observações (opcional)
                                </Label>
                                <Textarea
                                    id="observacoes"
                                    {...register("observacoes")}
                                    className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
                                    placeholder="Alguma observação especial para o seu pedido..."
                                    rows={3}
                                />
                            </div>

                            {/* Resumo do Pedido */}
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <h4 className="text-gray-200 font-semibold mb-2">Resumo do Pedido</h4>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <p><strong>Produto:</strong> {product.name}</p>
                                    <p><strong>Preço:</strong> R$ {product.price.toFixed(2).replace(".", ",")}</p>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-300 cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                >
                                    <MessageCircle size={16} className="mr-2" />
                                    Enviar para WhatsApp
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}