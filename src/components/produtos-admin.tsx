/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Eye, Tag, Package, Coffee, AlertTriangle, X, Plus } from "lucide-react"
import Image from "next/image"
import EditProductDialog from './edit-produto'

import { showToast, ToastType } from '@/utils/toastUtils'
import Loading from '@/app/loading'
import AddProductDialog from './add-produto-form'

// Tipos corrigidos
interface Sabor {
    id: number
    nome: string
}

interface Produto {
    id: number
    nome: string
    categoria: string
    preco_original: number
    preco_desconto: number
    descricao: string
    sabores: Sabor[]
    imagem: string
    categoria_id: number
    created_at: string
    status: string // ⚠️ MUDANÇA: Definindo como string ao invés de any
}

interface Categoria {
    id: number
    nome: string
}

// Props do Dialog de Confirmação
interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    produtoNome: string
    isDeleting: boolean
}

// Componente do Dialog de Confirmação
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    produtoNome,
    isDeleting
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full transform animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/30 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-100">
                            Confirmar Exclusão
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-1 hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pt-4">
                    <p className="text-gray-300 mb-2">
                        Tem certeza que deseja excluir o produto:
                    </p>
                    <p className="font-semibold text-cyan-400 mb-4">
                        "{produtoNome}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 cursor-pointer bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 cursor-pointer bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Excluir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Componente principal
const ProdutosAdmin: React.FC = () => {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [categoriaAtiva, setCategoriaAtiva] = useState<number | "todas">("todas")
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(false)
    const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL

    const fetchCategorias = async (): Promise<void> => {
        try {
            const response = await fetch('/api/categorias/get')
            const data: Categoria[] = await response.json()
            setCategorias(data)
        } catch (error) {
            console.error('Erro ao buscar categorias:', error)
        }
    }

    const fetchProdutos = async (): Promise<void> => {
        try {
            const response = await fetch('/api/produtos/get')
            const data: Produto[] = await response.json()

            // ⚠️ DEBUG: Verificar se o status está vindo da API
            console.log('Dados brutos da API:', data)
            data.forEach((produto, index) => {
                console.log(`Produto ${index + 1}:`, {
                    id: produto.id,
                    nome: produto.nome,
                    status: produto.status,
                    statusType: typeof produto.status
                })
            })

            // Ordenar produtos por data de criação decrescente (mais recentes primeiro)
            const produtosOrdenados = data.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()
                return dateB - dateA // Decrescente: mais recente primeiro
            })
            setProdutos(produtosOrdenados)
        } catch (error) {
            console.error('Erro ao buscar produtos:', error)
        }
    }

    const handleEditar = (produto: Produto): void => {
        setProdutoParaEditar(produto)
        setEditDialogOpen(true)
    }

    // FUNÇÃO ATUALIZADA: Agora recebe o novo produto diretamente
    const handleProductAdded = (novoProduto: Produto): void => {
        console.log('Produto recebido para adicionar:', novoProduto) // Debug

        // Adiciona o novo produto no início da lista (mais recente primeiro)
        setProdutos(prevProdutos => {
            const novaLista = [novoProduto, ...prevProdutos]
            console.log('Nova lista de produtos:', novaLista) // Debug
            return novaLista
        })

        // Log para verificar se a função foi chamada
        console.log('handleProductAdded executado')
    }

    // Função chamada após editar produto - mantém a mesma lógica
    useEffect(() => {
        fetchProdutos()
    }, [])

    const handleProductUpdated = (): void => {
        // Atualizar a lista após edição
        fetchProdutos()
    }

    // Função para abrir o dialog de adicionar produto
    const handleAdicionarProduto = (): void => {
        setAddDialogOpen(true)
    }

    // Função para abrir o dialog de exclusão
    const handleExcluir = (produto: Produto): void => {
        setProdutoParaExcluir(produto)
        setDeleteDialogOpen(true)
    }

    // Função para confirmar a exclusão
    const confirmarExclusao = async (): Promise<void> => {
        if (!produtoParaExcluir) return

        setIsDeleting(true)

        try {
            const response = await fetch(`/api/produtos/delete/${produtoParaExcluir.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                // Remover produto da lista e manter ordenação
                const produtosAtualizados = produtos.filter(p => p.id !== produtoParaExcluir.id)
                setProdutos(produtosAtualizados)

                // Fechar dialog
                setDeleteDialogOpen(false)
                setProdutoParaExcluir(null)

                showToast('Produto excluído com sucesso!', ToastType.SUCCESS)
            } else {
                const errorData = await response.json()
                console.error('Erro ao excluir produto:', errorData.message)
                showToast('Erro ao excluir produto', ToastType.ERROR)
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error)
            showToast('Erro ao excluir produto. Tente novamente.', ToastType.ERROR)
        } finally {
            setIsDeleting(false)
        }
    }

    // Função para cancelar exclusão
    const cancelarExclusao = (): void => {
        setDeleteDialogOpen(false)
        setProdutoParaExcluir(null)
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([
                    fetchProdutos(),
                    fetchCategorias()
                ])
            } catch (error) {
                console.error('Erro ao carregar dados:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Filtrar produtos pela categoria ativa (já ordenados)
    const produtosFiltrados = categoriaAtiva === "todas"
        ? produtos
        : produtos.filter((produto) => produto.categoria_id === categoriaAtiva)

    // Função para obter o nome da categoria pelo ID
    const obterNomeCategoria = (categoriaId: number): string => {
        if (!categoriaId) return "Sem categoria"
        const categoria = categorias.find((cat) => cat.id === categoriaId)
        return categoria ? categoria.nome : "Categoria não encontrada"
    }

    // Função para obter o nome da categoria ativa
    const obterNomeCategoriaAtiva = (): string => {
        if (categoriaAtiva === "todas") return "Todas"
        const categoria = categorias.find((cat) => cat.id === categoriaAtiva)
        return categoria ? categoria.nome : "Categoria"
    }

    // ⚠️ FUNÇÃO PARA OBTER STATUS FORMATADO
    const obterStatusFormatado = (status: any): string => {


        if (!status) return 'Sem status'

        // Se for string, retorna diretamente
        if (typeof status === 'string') return status

        // Se for número, converte para string correspondente
        if (typeof status === 'number') {
            switch (status) {
                case 1: return 'Ativo'
                case 0: return 'Inativo'
                case 2: return 'Em estoque'
                case 3: return 'Fora de estoque'
                default: return `Status ${status}`
            }
        }

        // Se for objeto, tenta acessar alguma propriedade
        if (typeof status === 'object') {
            return status.nome || status.status || JSON.stringify(status)
        }

        return String(status)
    }

    // ⚠️ FUNÇÃO PARA OBTER COR DO STATUS
    const obterCorStatus = (status: any): string => {
        const statusFormatado = obterStatusFormatado(status).toLowerCase()

        if (statusFormatado.includes('ativo') || statusFormatado.includes('estoque')) {
            return 'text-green-400'
        } else if (statusFormatado.includes('inativo') || statusFormatado.includes('fora')) {
            return 'text-red-400'
        } else {
            return 'text-yellow-400'
        }
    }

    if (loading) {
        return <Loading />
    }

    if (produtos.length === 0) {
        return (
            <div className="p-16 text-center">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-cyan-900/30">
                    <Package className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-cyan-100 mb-3">Nenhum produto cadastrado</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Comece adicionando seu primeiro produto e construa sua loja!
                </p>
                <button
                    onClick={handleAdicionarProduto}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-900/30"
                >
                    <Plus size={18} />
                    Adicionar Primeiro Produto
                </button>
            </div>
        )
    }

    return (
        <>
            {loading && <Loading />}
            <div className="md:px-8 ">
                <div className="mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className='flex items-center gap-4'>
                                <h2 className="md:text-3xl text-2xl font-bold text-cyan-400 mb-2">Seus Produtos</h2>
                                <div className="bg-gray-800 px-4 py-1 rounded-full shadow-sm border border-gray-700">
                                    <span className="md:text-sm text-xs font-medium text-gray-300">{produtos.length} produtos</span>
                                </div>
                            </div>
                            <p className="text-gray-400">Gerencie todos os produtos da sua loja</p>
                        </div>

                    </div>
                </div>

                {/* Filtro de Categorias */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex ">
                        <button
                            onClick={() => setCategoriaAtiva("todas")}
                            className={`px-6 py-1 cursor-pointer rounded-full transition-all duration-300 ${categoriaAtiva === "todas"
                                ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900/30"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                }`}
                        >
                            Todas
                        </button>

                        {categorias.map((categoria) => (
                            <button
                                key={categoria.id}
                                onClick={() => setCategoriaAtiva(categoria.id)}

                                className={`px-6 py-1 mx-1 cursor-pointer rounded-full transition-all duration-300 ${categoriaAtiva === categoria.id
                                    ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900/30"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                {categoria.nome}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Verificação se há produtos filtrados */}
                {produtosFiltrados.length === 0 && categoriaAtiva !== "todas" ? (
                    <div className="md:p-16 text-center">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-cyan-900/30">
                            <Tag className="w-12 h-12 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-cyan-100 mb-3">Nenhum produto encontrado</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Não há produtos cadastrados na categoria "{obterNomeCategoriaAtiva()}".
                        </p>

                    </div>
                ) : (
                    /* Grid de Produtos */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {produtosFiltrados.map((produto) => {
                            // Calcular a porcentagem de desconto
                            const porcentagemDesconto = produto.preco_original
                                ? Math.round(((produto.preco_original - produto.preco_desconto) / produto.preco_original) * 100)
                                : 0

                            return (
                                <div
                                    key={produto.id}
                                    className="group bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-500 overflow-hidden border border-gray-700 hover:border-cyan-900/30 transform hover:-translate-y-2 flex flex-col"
                                >
                                    {/* Imagem do Produto - Altura maior para mostrar mais da imagem */}
                                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex items-center justify-center p-2">

                                        <img
                                            src={`${bucketUrl}/${produto.imagem}`}
                                            alt={produto.nome}
                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                                        />

                                        {/* Badge de Desconto */}
                                        {porcentagemDesconto > 0 && (
                                            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                                                -{porcentagemDesconto}%
                                            </div>
                                        )}

                                        {/* ⚠️ BADGE DE STATUS CORRIGIDO */}
                                        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold z-10">
                                            <p className={obterCorStatus(produto.status)}>
                                                {obterStatusFormatado(produto.status)}
                                            </p>
                                        </div>

                                        {/* Badge de Categoria */}
                                        <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <Tag size={12} />
                                            {obterNomeCategoria(produto.categoria_id)}
                                        </div>

                                    </div>

                                    {/* Informações do Produto - flex-1 para ocupar o espaço restante */}
                                    <div className="px-6 pt-2 pb-4 flex-1 flex flex-col">
                                        {/* Nome do Produto */}
                                        <h3 className="font-bold text-gray-100 mb-2 text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
                                            {produto.nome}
                                        </h3>

                                        {/* ⚠️ DEBUG: Mostrar status no corpo do card também */}
                                        {/* <div className="mb-2 text-xs text-gray-500">
                                            Status: {obterStatusFormatado(produto.status)} (Tipo: {typeof produto.status})
                                        </div> */}

                                        {/* Descrição */}
                                        {produto.descricao && (
                                            <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                {produto.descricao}
                                            </p>
                                        )}

                                        {/* Badge de Sabores */}
                                        {produto.sabores && produto.sabores.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {produto.sabores.slice(0, 3).map((sabor, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                                                        >
                                                            {sabor.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Espaçador flexível para empurrar preço e botões para baixo */}
                                        <div className="flex-1"></div>

                                        {/* Preço */}
                                        <div className="mb-4">
                                            {produto.preco_original && produto.preco_original > produto.preco_desconto ? (
                                                <>
                                                    <div className="text-sm text-gray-500 line-through">
                                                        R$ {produto.preco_original.toFixed(2).replace(".", ",")}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-cyan-400">
                                                            R$ {produto.preco_desconto.toFixed(2).replace(".", ",")}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-bold text-cyan-400">
                                                    R$ {produto.preco_desconto.toFixed(2).replace(".", ",")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditar(produto)}
                                                className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-cyan-100 rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium"
                                            >
                                                <Edit size={16} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(produto)}
                                                className="px-4 cursor-pointer py-2 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50 transition-all duration-300 font-medium"
                                                title="Excluir produto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Dialog de Adição de Produto - PROP ATUALIZADA */}
                <AddProductDialog
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    onProductAdded={handleProductAdded} // Agora recebe o produto diretamente
                />

                {/* Dialog de Edição */}
                <EditProductDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onProductUpdated={handleProductUpdated}
                    produto={produtoParaEditar}
                />

                {/* Dialog de Confirmação de Exclusão */}
                <DeleteConfirmDialog
                    isOpen={deleteDialogOpen}
                    onClose={cancelarExclusao}
                    onConfirm={confirmarExclusao}
                    produtoNome={produtoParaExcluir?.nome || ''}
                    isDeleting={isDeleting}
                />
            </div>
        </>
    )
}

export default ProdutosAdmin