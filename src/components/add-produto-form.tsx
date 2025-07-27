/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { X, Plus, Upload, DollarSign, Package, Tag, FileText, Palette } from "lucide-react"
import Image from "next/image"
import { showToast, ToastType } from "@/utils/toastUtils"

interface AddProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onProductAdded?: () => void
}

type Categorias = {
    id: any
    nome: string
}

type ProductFormData = {
    nome: string
    categoria: string
    precoOriginal: string
    precoDesconto: string
    descricao: string
    imagem: File | null
}

export default function AddProductDialog({
    open,
    onOpenChange,
    onProductAdded
}: AddProductDialogProps) {
    const [categorias, setCategorias] = useState<Categorias[]>([])
    const [sabores, setSabores] = useState<string[]>([])
    const [currentSabor, setCurrentSabor] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<ProductFormData>({
        defaultValues: {
            nome: "",
            categoria: "",
            precoOriginal: "",
            precoDesconto: "",
            descricao: "",
            imagem: null
        }
    })

    const fetchCategorias = async () => {
        try {
            const response = await fetch('/api/categorias/get')
            const data = await response.json()
            setCategorias(data)
        } catch (error) {
            console.error('Erro ao buscar categorias:', error)
        }
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    // const handleImageChange = (e: any) => {
    //     const file = e.target.files?.[0]
    //     if (file) {
    //         const imageUrl = URL.createObjectURL(file);
    //         setImagePreview(imageUrl)
    //     }
    // }
    const handleImageChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setImagemArquivo(file);
            setValue('imagem', file); // ← Adicione esta linha
            const imageUrl = URL.createObjectURL(file);
            setImagemSelecionada(imageUrl);
        }
    };
    const addSabor = () => {
        if (currentSabor.trim() && !sabores.includes(currentSabor.trim())) {
            setSabores(prev => [...prev, currentSabor.trim()])
            setCurrentSabor("")
        }
    }

    const removeSabor = (saborToRemove: string) => {
        setSabores(prev => prev.filter(sabor => sabor !== saborToRemove))
    }

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true)
        console.log("Data:", data)

        try {
            const formData = new FormData()

            formData.append('nome', data.nome)
            formData.append('categoria', data.categoria)
            formData.append('precoOriginal', data.precoOriginal)
            formData.append('descricao', data.descricao)

            if (data.precoDesconto) {
                formData.append('precoDesconto', data.precoDesconto)
            }

            // Adicionar sabores como JSON string
            formData.append('sabores', JSON.stringify(sabores))

            // Adicionar imagem se existir
            if (data.imagem) {
                formData.append('imagem', data.imagem)
                console.log("Imagem adicionada ao FormData:", data.imagem)
            }

            const response = await fetch('/api/produtos/add', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erro ao cadastrar produto')
            }

            const result = await response.json()
            console.log("Produto cadastrado com sucesso:", result)

            // Success callback
            onProductAdded?.()
            onOpenChange(false)

            // Reset form
            reset()
            setSabores([])
            setCurrentSabor("")
            setImagePreview(null)

            // Success notification
            showToast('Produto cadastrado com sucesso!', ToastType.SUCCESS);


        } catch (error) {
            console.error('Erro ao cadastrar produto:', error)
            showToast('Erro ao cadastrar produto!', ToastType.ERROR);
            console.log(`Erro ao cadastrar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800 scrollbar-hide">
                <style jsx>{`
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-900/30 rounded-xl">
                            <Package className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Novo Produto</h2>
                            <p className="text-sm text-gray-400">
                                Adicione um novo produto à sua loja
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Nome do Produto */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Package size={16} />
                            Nome do Produto
                        </label>
                        <Controller
                            name="nome"
                            control={control}
                            rules={{ required: "Nome do produto é obrigatório" }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Ex: Pod Descartável Premium"
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.nome
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'
                                        }`}
                                />
                            )}
                        />
                        {errors.nome && (
                            <p className="text-sm text-red-400">{errors.nome.message}</p>
                        )}
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Tag size={16} />
                            Categoria
                        </label>
                        <Controller
                            name="categoria"
                            control={control}
                            rules={{ required: "Categoria é obrigatória" }}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:ring-1 focus:outline-none transition-colors ${errors.categoria
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'
                                        }`}
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias.map(category => (
                                        <option key={category.id} value={category.nome}>
                                            {category.nome}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.categoria && (
                            <p className="text-sm text-red-400">{errors.categoria.message}</p>
                        )}
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <DollarSign size={16} />
                                Preço Original
                            </label>
                            <Controller
                                name="precoOriginal"
                                control={control}
                                rules={{
                                    required: "Preço original é obrigatório",
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: "Digite um preço válido"
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="99.90"
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.precoOriginal
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'
                                            }`}
                                    />
                                )}
                            />
                            {errors.precoOriginal && (
                                <p className="text-sm text-red-400">{errors.precoOriginal.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <DollarSign size={16} />
                                Preço com Desconto
                            </label>
                            <Controller
                                name="precoDesconto"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: "Digite um preço válido"
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="79.90"
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.precoDesconto
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'
                                            }`}
                                    />
                                )}
                            />
                            {errors.precoDesconto && (
                                <p className="text-sm text-red-400">{errors.precoDesconto.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <FileText size={16} />
                            Descrição
                        </label>
                        <Controller
                            name="descricao"
                            control={control}
                            rules={{ required: "Descrição é obrigatória" }}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    placeholder="Descreva as características do produto..."
                                    rows={4}
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors resize-none ${errors.descricao
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'
                                        }`}
                                />
                            )}
                        />
                        {errors.descricao && (
                            <p className="text-sm text-red-400">{errors.descricao.message}</p>
                        )}
                    </div>

                    {/* Upload de Imagem */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Upload size={16} />
                            Imagem do Produto
                        </label>

                        {!imagemSelecionada ? (
                            <label className="cursor-pointer block">
                                <div className="w-full px-6 py-8 bg-gray-800 border border-gray-700 border-dashed rounded-xl text-center hover:bg-gray-750 hover:border-gray-600 transition-all duration-200">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <span className="text-sm text-gray-400 block mb-1">Clique para fazer upload da imagem</span>
                                    <span className="text-xs text-gray-500">PNG, JPG, JPEG até 10MB</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                                    <Image
                                        src={imagemSelecionada}
                                        alt="Preview do produto"
                                        width={300}
                                        height={200}
                                        className="w-full h-auto object-contain"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>

                                {/* Overlay com botões */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-3">
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <Upload size={14} />
                                            Alterar
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagemSelecionada(null)
                                            setImagemArquivo(null)
                                            setValue('imagem', null)
                                        }}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <X size={14} />
                                        Remover
                                    </button>
                                </div>

                                {/* Badge indicando que há imagem */}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                                    ✓ Imagem selecionada
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sabores */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Palette size={16} />
                            Sabores
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentSabor}
                                onChange={(e) => setCurrentSabor(e.target.value)}
                                placeholder="Ex: Morango"
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-colors"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSabor())}
                            />
                            <button
                                type="button"
                                onClick={addSabor}
                                className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Adicionar
                            </button>
                        </div>

                        {/* Lista de Sabores */}
                        {sabores.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {sabores.map((sabor, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 border border-cyan-700/50 rounded-full text-sm"
                                    >
                                        <span className="text-cyan-300">{sabor}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSabor(sabor)}
                                            className="text-cyan-400 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Cadastrando..." : "Adicionar Produto"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}