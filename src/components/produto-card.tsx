/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { MessageCircle, X, Eye } from "lucide-react"
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
    referencia: string
}

export default function ProdutoCard({ product }: ProductCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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

    // Verificar se a descrição precisa ser truncada
    const shouldTruncateDescription = product.description && product.description.length > 80

    const onSubmit = (data: FormData) => {
        const mensagem = `*NOVO PEDIDO RECEBIDO*

*Nome:* ${data.nome}
*Produto:* ${product.name}
*Sabor:* ${data.sabor}
*Endereço:* ${data.endereco}
*Ponto de Referência:* ${data.referencia}
*Valor:* R$ ${product.price.toFixed(2).replace(".", ",")}
*Forma de Pagamento:* ${data.formaPagamento}
${data.observacoes ? `*Observações:* ${data.observacoes}` : ''}

Obrigado por escolher a ElfBPods.`

        const numeroWhatsApp = "5532999392474"
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`
        window.open(url, '_blank')

        setIsOpen(false)
        reset()
    }

    return (
        <>
            <div className="group bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-500 overflow-hidden border border-gray-700 hover:border-cyan-900/30 transform hover:-translate-y-2 flex flex-col h-full">
                {/* Product Image - VERSÃO PADRONIZADA */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center ">
                    <div
                        className="relative w-full h-full cursor-pointer group/image flex items-center justify-center"
                        onClick={() => setIsImageModalOpen(true)}
                    >
                        <img
                            src={`${bucketUrl}/${product.image}`}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                        />

                        {/* Overlay com ícone de visualização */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                            <Eye className="text-white w-8 h-8" />
                        </div>
                    </div>

                    {/* Discount Badge - Ajustado para a nova estrutura */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="px-6 pt-2 pb-4 flex flex-col flex-grow">
                    {/* Título do produto */}
                    <h3 className="font-bold text-gray-100 text-lg group-hover:text-cyan-400 transition-colors duration-300 mb-2">
                        {product.name}
                    </h3>

                    {/* Descrição com altura flexível */}
                    <div className="flex-grow mb-4">
                        {product.description && (
                            <div className="text-gray-400 text-sm leading-relaxed">
                                {shouldTruncateDescription && !isDescriptionExpanded ? (
                                    <>
                                        {product.description.substring(0, 80)}
                                        <button
                                            onClick={() => setIsDescriptionExpanded(true)}
                                            className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium"
                                        >
                                            ...ver mais
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {product.description}
                                        {shouldTruncateDescription && isDescriptionExpanded && (
                                            <button
                                                onClick={() => setIsDescriptionExpanded(false)}
                                                className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium"
                                            >
                                                {" "}ver menos
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tags de sabores */}
                    <div className="mb-4">
                        {product.sabores && product.sabores.length > 0 && (
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
                        )}
                    </div>

                    {/* Preço sempre na mesma posição */}
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

                    {/* Botão sempre no final do card */}
                    <div className="mt-auto">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="referencia" className="text-gray-200">
                                            Ponto de referência
                                        </Label>
                                        <Input
                                            id="referencia"
                                            {...register("referencia")}
                                            className="bg-gray-800 border-gray-700 text-gray-100"
                                            placeholder="Proximo ao hospital..."
                                        />

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
                                            <p><strong>Taxa de entrega:</strong> R$ 7,00</p>
                                            <p className="text-[10px] text-gray-500">Para retirada, desconsidere a taxa de entrega.</p>
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
            </div>

            {/* Modal para visualizar imagem */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-4xl bg-gray-900 border-gray-800 p-0">
                    <div className="relative">
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={`${bucketUrl}/${product.image}`}
                            alt={product.name}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="text-white text-xl font-bold">{product.name}</h3>
                            {product.description && (
                                <p className="text-gray-300 text-sm mt-2">{product.description}</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}