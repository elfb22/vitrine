/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { X, Plus, Upload, DollarSign, Package, Tag, FileText, Palette, ToggleLeft, ToggleRight, RotateCcw, Loader2, Trash2, AlertTriangle } from "lucide-react"
import { showToast, ToastType } from "@/utils/toastUtils"

interface EditProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onProductUpdated?: () => void
    produto: any
}

type Categorias = {
    id: any
    nome: string
}

type Sabor = {
    id: number
    nome: string
    status: 'ATIVO' | 'DESATIVADO'
    isNew?: boolean // sabores criados na sessão atual, ainda não existem no banco
}

type ProductFormData = {
    nome: string
    categoria: string
    precoOriginal: string
    precoDesconto: string
    descricao: string
    imagem: File | null
    status: 'ATIVO' | 'DESATIVADO'
}

export default function EditProductDialog({
    open,
    onOpenChange,
    onProductUpdated,
    produto
}: EditProductDialogProps) {
    const [categorias, setCategorias] = useState<Categorias[]>([])
    const [sabores, setSabores] = useState<Sabor[]>([])
    const [loadingSabores, setLoadingSabores] = useState(false)
    const [currentSabor, setCurrentSabor] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null)
    const [imagemAtual, setImagemAtual] = useState<string | null>(null)
    const [saborParaExcluir, setSaborParaExcluir] = useState<Sabor | null>(null)
    const [isDeletingSabor, setIsDeletingSabor] = useState(false)
    const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm<ProductFormData>({
        defaultValues: {
            nome: "",
            categoria: "",
            precoOriginal: "",
            precoDesconto: "",
            descricao: "",
            imagem: null,
            status: "ATIVO"
        }
    })

    const currentStatus = watch('status')

    const fetchCategorias = async () => {
        try {
            const response = await fetch('/api/categorias/get')
            const data = await response.json()
            setCategorias(data)
        } catch (error) {
            console.error('Erro ao buscar categorias:', error)
        }
    }

    // Buscar todos os sabores do produto (ativos + desativados)
    const fetchSabores = async (produtoId: number) => {
        setLoadingSabores(true)
        try {
            const response = await fetch(`/api/produtos/get/${produtoId}/sabores`)
            const data = await response.json()
            setSabores(data.sabores || [])
        } catch (error) {
            console.error('Erro ao buscar sabores:', error)
            // Fallback: usar os sabores que já vieram no objeto produto
            if (produto?.sabores && Array.isArray(produto.sabores)) {
                setSabores(produto.sabores.map((s: any) => ({
                    id: s.id,
                    nome: s.nome || s,
                    status: 'ATIVO'
                })))
            }
        } finally {
            setLoadingSabores(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchCategorias()
        }
    }, [open])

    useEffect(() => {
        if (produto && open && categorias.length > 0) {
            setValue('nome', produto.nome || '')

            const categoriaExiste = categorias.find(cat =>
                cat.nome === produto.categoria ||
                cat.id === produto.categoria_id ||
                cat.id.toString() === produto.categoria
            )

            if (categoriaExiste) {
                setValue('categoria', categoriaExiste.nome)
            } else if (produto.categoria_id) {
                const categoriaPorId = categorias.find(cat => cat.id === produto.categoria_id)
                if (categoriaPorId) setValue('categoria', categoriaPorId.nome)
            }

            setValue('precoOriginal', produto.preco_original?.toString() || '')
            setValue('precoDesconto', produto.preco_desconto?.toString() || '')
            setValue('descricao', produto.descricao || '')
            setValue('status', produto.status || 'ATIVO')

            if (produto.imagem) {
                setImagemAtual(produto.imagem)
                setImagemSelecionada(`${produto.imagem}`)
            }

            // Buscar todos os sabores (ativos + desativados)
            fetchSabores(produto.id)
        }
    }, [produto, open, setValue, categorias])

    const handleImageChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setImagemArquivo(file)
            setValue('imagem', file)
            const imageUrl = URL.createObjectURL(file)
            setImagemSelecionada(imageUrl)
        }
    }

    // Toggle: ativar/desativar sabor existente
    const toggleSabor = (id: number) => {
        setSabores(prev => prev.map(s =>
            s.id === id
                ? { ...s, status: s.status === 'ATIVO' ? 'DESATIVADO' : 'ATIVO' }
                : s
        ))
    }

    // Adicionar sabor novo (só existe no frontend por enquanto)
    const addSabor = () => {
        const nome = currentSabor.trim()
        if (!nome) return

        const jaExiste = sabores.some(s => s.nome.toLowerCase() === nome.toLowerCase())
        if (jaExiste) {
            showToast('Esse sabor já existe na lista.', ToastType.ERROR)
            return
        }

        setSabores(prev => [...prev, {
            id: Date.now(), // id temporário
            nome,
            status: 'ATIVO',
            isNew: true
        }])
        setCurrentSabor("")
    }

    // Remover sabor novo (que ainda não foi salvo no banco)
    const removeNewSabor = (id: number) => {
        setSabores(prev => prev.filter(s => s.id !== id))
    }

    // Excluir sabor existente do banco via DELETE
    const confirmarExclusaoSabor = async () => {
        if (!saborParaExcluir) return
        setIsDeletingSabor(true)
        try {
            const response = await fetch(`/api/produtos/${produto.id}/sabores/${saborParaExcluir.id}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (!response.ok) {
                // Tem vendas associadas — não pode excluir, só desativar
                showToast(data.message || 'Não foi possível excluir o sabor.', ToastType.ERROR)
                // Marca como desativado na UI pra não perder a ação do admin
                setSabores(prev => prev.map(s =>
                    s.id === saborParaExcluir.id ? { ...s, status: 'DESATIVADO' } : s
                ))
            } else {
                // Excluído com sucesso — remove da lista local
                setSabores(prev => prev.filter(s => s.id !== saborParaExcluir.id))
                showToast(`Sabor "${saborParaExcluir.nome}" excluído.`, ToastType.SUCCESS)
            }
        } catch (error) {
            console.error('Erro ao excluir sabor:', error)
            showToast('Erro ao excluir sabor.', ToastType.ERROR)
        } finally {
            setIsDeletingSabor(false)
            setSaborParaExcluir(null)
        }
    }

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true)

        try {
            const formData = new FormData()

            formData.append('id', produto.id.toString())
            formData.append('nome', data.nome)
            formData.append('categoria', data.categoria)
            formData.append('precoOriginal', data.precoOriginal)
            formData.append('descricao', data.descricao)
            formData.append('status', data.status)

            if (data.precoDesconto) {
                formData.append('precoDesconto', data.precoDesconto)
            }

            // Enviar estado completo dos sabores para a API decidir o que fazer
            const saboresPayload = sabores.map(s => ({
                id: s.isNew ? null : s.id,
                nome: s.nome,
                status: s.status,
                isNew: s.isNew || false
            }))
            formData.append('sabores', JSON.stringify(saboresPayload))

            if (data.imagem) {
                formData.append('imagem', data.imagem)
            } else if (imagemAtual) {
                formData.append('imagemAtual', imagemAtual)
            }

            const response = await fetch(`/api/produtos/edit/${produto.id}`, {
                method: 'PUT',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erro ao atualizar produto')
            }

            onProductUpdated?.()
            onOpenChange(false)
            handleReset()
            showToast('Produto atualizado com sucesso!', ToastType.SUCCESS)

        } catch (error) {
            console.error('Erro ao atualizar produto:', error)
            showToast('Erro ao atualizar produto!', ToastType.ERROR)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        reset()
        setSabores([])
        setCurrentSabor("")
        setImagemSelecionada(null)
        setImagemArquivo(null)
        setImagemAtual(null)
    }

    const handleClose = () => {
        onOpenChange(false)
        handleReset()
    }

    const saboresAtivos = sabores.filter(s => s.status === 'ATIVO')
    const saboresDesativados = sabores.filter(s => s.status === 'DESATIVADO')

    if (!open || !produto) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800 scrollbar-hide">
                <style jsx>{`
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-900/30 rounded-xl">
                            <Package className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Editar Produto</h2>
                            <p className="text-sm text-gray-400">Atualize as informações do produto</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Nome */}
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
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.nome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                                />
                            )}
                        />
                        {errors.nome && <p className="text-sm text-red-400">{errors.nome.message}</p>}
                    </div>

                    {/* Categoria e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:ring-1 focus:outline-none transition-colors ${errors.categoria ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categorias.map(category => (
                                            <option key={category.id} value={category.nome}>{category.nome}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.categoria && <p className="text-sm text-red-400">{errors.categoria.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                {currentStatus === 'ATIVO'
                                    ? <ToggleRight size={16} className="text-green-400" />
                                    : <ToggleLeft size={16} className="text-red-400" />
                                }
                                Status do Produto
                            </label>
                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: "Status é obrigatório" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-1 focus:outline-none transition-colors focus:border-cyan-500 focus:ring-cyan-500"
                                    >
                                        <option value="ATIVO">🟢 Ativo</option>
                                        <option value="DESATIVADO">🔴 Desativado</option>
                                    </select>
                                )}
                            />
                        </div>
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
                                rules={{ required: "Preço original é obrigatório", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Digite um preço válido" } }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="99.90"
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.precoOriginal ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                                    />
                                )}
                            />
                            {errors.precoOriginal && <p className="text-sm text-red-400">{errors.precoOriginal.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <DollarSign size={16} />
                                Preço com Desconto
                            </label>
                            <Controller
                                name="precoDesconto"
                                control={control}
                                rules={{ pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Digite um preço válido" } }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="79.90"
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors ${errors.precoDesconto ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                                    />
                                )}
                            />
                            {errors.precoDesconto && <p className="text-sm text-red-400">{errors.precoDesconto.message}</p>}
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
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:outline-none transition-colors resize-none ${errors.descricao ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                                />
                            )}
                        />
                        {errors.descricao && <p className="text-sm text-red-400">{errors.descricao.message}</p>}
                    </div>

                    {/* Imagem */}
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
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        ) : (
                            <div className="relative">
                                <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                                    <img
                                        src={`${bucketUrl}/${imagemSelecionada}`}
                                        alt="Preview do produto"
                                        width={300}
                                        height={200}
                                        className="w-full h-auto object-contain"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-3">
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <Upload size={14} />
                                            Alterar
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => { setImagemSelecionada(null); setImagemArquivo(null); setValue('imagem', null) }}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <X size={14} />
                                        Remover
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                                    {imagemArquivo ? '✓ Nova imagem' : '✓ Imagem atual'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== SABORES - NOVA UI ===== */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Palette size={16} />
                            Sabores
                        </label>

                        {/* Input para adicionar novo sabor */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentSabor}
                                onChange={(e) => setCurrentSabor(e.target.value)}
                                placeholder="Adicionar novo sabor..."
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSabor())}
                            />
                            <button
                                type="button"
                                onClick={addSabor}
                                className="px-4 py-3 cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus size={16} />
                                <span className="hidden md:inline">Adicionar</span>
                            </button>
                        </div>

                        {loadingSabores ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                                <Loader2 size={14} className="animate-spin" />
                                Carregando sabores...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Sabores ATIVOS */}
                                {saboresAtivos.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                            Ativos ({saboresAtivos.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {saboresAtivos.map(sabor => (
                                                <div
                                                    key={sabor.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/50 rounded-full text-sm group"
                                                >
                                                    <span className="text-cyan-300">{sabor.nome}</span>
                                                    {sabor.isNew ? (
                                                        // Sabor novo: só remover da lista (não existe no banco)
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewSabor(sabor.id)}
                                                            className="text-cyan-400 hover:text-red-400 transition-colors"
                                                            title="Remover"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    ) : (
                                                        // Sabor existente: X desativa, lixeira abre modal de exclusão
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSabor(sabor.id)}
                                                                className="text-cyan-400 hover:text-yellow-400 transition-colors"
                                                                title="Desativar sabor"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSaborParaExcluir(sabor)}
                                                                className="text-cyan-800 hover:text-red-400 transition-colors"
                                                                title="Excluir sabor permanentemente"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sabores DESATIVADOS */}
                                {saboresDesativados.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                            Desativados ({saboresDesativados.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {saboresDesativados.map(sabor => (
                                                <div
                                                    key={sabor.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm group"
                                                >
                                                    <span className="text-gray-500 line-through">{sabor.nome}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSabor(sabor.id)}
                                                        className="text-gray-600 hover:text-cyan-400 transition-colors"
                                                        title="Reativar sabor"
                                                    >
                                                        <RotateCcw size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSaborParaExcluir(sabor)}
                                                        className="text-gray-600 hover:text-red-400 transition-colors"
                                                        title="Excluir sabor permanentemente"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sabores.length === 0 && (
                                    <p className="text-sm text-gray-500 py-1">
                                        Nenhum sabor cadastrado ainda.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 md:px-6 md:py-3 px-2 py-2 cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg md:rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 md:px-6 md:py-3 px-2 py-2 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-lg md:rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Atualizando...
                                </>
                            ) : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de confirmação de exclusão de sabor */}
            {saborParaExcluir && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="p-2 bg-red-900/30 rounded-xl shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Excluir sabor</h3>
                                <p className="text-gray-400 text-sm">
                                    Deseja mesmo excluir o sabor{' '}
                                    <span className="text-white font-medium">"{saborParaExcluir.nome}"</span>?
                                </p>
                                <p className="text-gray-500 text-xs mt-2">
                                    Se houver vendas vinculadas, ele será desativado ao invés de excluído.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSaborParaExcluir(null)}
                                disabled={isDeletingSabor}
                                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarExclusaoSabor}
                                disabled={isDeletingSabor}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeletingSabor ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        Excluir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}