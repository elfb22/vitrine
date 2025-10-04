/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from 'react'
import { Package, Tag, Archive, ShoppingCart, ArrowLeft, FileText } from "lucide-react"
import Loading from '@/app/loading'

import DialogVendas from '@/components/dialog-vendas'
import DialogEstoque from '@/components/dialog-estoque'
import { useRouter } from 'next/navigation'

interface Sabor {
    id: number
    nome: string
    estoque: any
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
    status: string
}

interface Categoria {
    id: number
    nome: string
}

interface EstoqueData {
    [saborId: number]: number
}

export default function Vendas() {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [categoriaAtiva, setCategoriaAtiva] = useState<number | "todas">("todas")
    const [loading, setLoading] = useState(false)
    const [user, setUSer] = useState()
    const router = useRouter()
    // Estados para o dialog de estoque
    const [dialogEstoqueAberto, setDialogEstoqueAberto] = useState(false)
    const [dialogVendasAberto, setDialogVendasAberto] = useState(false)
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)

    const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json()
            console.log('Dados do usuário:', data)
            setUSer(data)
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error)
            return ''
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

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

    // Nova função para atualizar estoque após salvar no dialog
    const atualizarEstoqueLocal = (produtoId: number, novoEstoque: EstoqueData) => {
        setProdutos(produtosAtuais =>
            produtosAtuais.map(produto => {
                if (produto.id === produtoId) {
                    return {
                        ...produto,
                        sabores: produto.sabores.map(sabor => ({
                            ...sabor,
                            estoque: novoEstoque[sabor.id] || 0
                        }))
                    }
                }
                return produto
            })
        )

        // Também atualizar o produto selecionado se for o mesmo
        if (produtoSelecionado && produtoSelecionado.id === produtoId) {
            setProdutoSelecionado(produtoAtual => {
                if (!produtoAtual) return null

                return {
                    ...produtoAtual,
                    sabores: produtoAtual.sabores.map(sabor => ({
                        ...sabor,
                        estoque: novoEstoque[sabor.id] || 0
                    }))
                }
            })
        }

        console.log('Estoque local atualizado para produto:', produtoId, novoEstoque)
    }

    // Função para atualizar estoque após venda
    const atualizarEstoqueAposVenda = (produtoId: number, saborId: number, quantidadeVendida: number) => {
        setProdutos(produtosAtuais =>
            produtosAtuais.map(produto => {
                if (produto.id === produtoId) {
                    return {
                        ...produto,
                        sabores: produto.sabores.map(sabor => {
                            if (sabor.id === saborId) {
                                // Converter estoque para número se for string
                                const estoqueAtual = typeof sabor.estoque === 'string'
                                    ? parseInt(sabor.estoque) || 0
                                    : sabor.estoque || 0

                                const novoEstoque = Math.max(0, estoqueAtual - quantidadeVendida)

                                return {
                                    ...sabor,
                                    estoque: novoEstoque
                                }
                            }
                            return sabor
                        })
                    }
                }
                return produto
            })
        )

        // Também atualizar o produto selecionado se for o mesmo
        if (produtoSelecionado && produtoSelecionado.id === produtoId) {
            setProdutoSelecionado(produtoAtual => {
                if (!produtoAtual) return null

                return {
                    ...produtoAtual,
                    sabores: produtoAtual.sabores.map(sabor => {
                        if (sabor.id === saborId) {
                            const estoqueAtual = typeof sabor.estoque === 'string'
                                ? parseInt(sabor.estoque) || 0
                                : sabor.estoque || 0

                            const novoEstoque = Math.max(0, estoqueAtual - quantidadeVendida)

                            return {
                                ...sabor,
                                estoque: novoEstoque
                            }
                        }
                        return sabor
                    })
                }
            })
        }
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

    // Filtrar produtos pela categoria ativa
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

    // Função para obter status formatado
    const obterStatusFormatado = (status: any): string => {
        if (!status) return 'Sem status'

        if (typeof status === 'string') return status

        if (typeof status === 'number') {
            switch (status) {
                case 1: return 'Ativo'
                case 0: return 'Inativo'
                case 2: return 'Em estoque'
                case 3: return 'Fora de estoque'
                default: return `Status ${status}`
            }
        }

        if (typeof status === 'object') {
            return status.nome || status.status || JSON.stringify(status)
        }

        return String(status)
    }

    // Função para obter cor do status
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

    // Função para abrir dialog de estoque
    const handleEstoque = (produto: Produto) => {
        console.log('Gerenciar estoque do produto:', produto.nome)
        setProdutoSelecionado(produto)
        setDialogEstoqueAberto(true)
    }

    const handleVendas = (produto: Produto) => {
        setProdutoSelecionado(produto)
        setDialogVendasAberto(true)
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
                <h3 className="text-2xl font-bold text-cyan-100 mb-3">Nenhum produto encontrado</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Não há produtos disponíveis para gerenciar vendas.
                </p>
            </div>
        )
    }

    return (
        <>
            {loading && <Loading />}
            <div className="md:px-8 px-3 pt-5">
                <div className="mb-5">

                    <div className="flex flex-col  sm:items-center sm:justify-center items-center gap-4">
                        <div>
                            <div className='flex items-center justify-center gap-4'>
                                <h2 className="md:text-3xl text-2xl text-center font-bold text-cyan-400 mb-2">Vendas</h2>
                                <div className="bg-gray-800 px-4 py-1 rounded-full shadow-sm border border-gray-700">
                                    <span className="md:text-sm text-xs font-medium text-gray-300">{produtos.length} produtos</span>
                                </div>
                            </div>

                            <p className="text-gray-400">Gerencie vendas e estoque dos seus produtos</p>
                        </div>
                        <div className='gap-3 flex'>
                            <button onClick={() => router.push('/admin')} className="bg-cyan-700 gap-2 flex-row items-center flex text-white shadow-lg shadow-cyan-900/30 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-cyan-600">
                                <ArrowLeft color='white' size={20} />

                                Voltar
                            </button>

                        </div>
                    </div>
                </div>

                {/* Filtro de Categorias */}
                <div className="mb-8 overflow-x-auto pb-2 px-4">
                    <div className="flex items-center gap-2 min-w-max">
                        <button
                            onClick={() => setCategoriaAtiva("todas")}
                            className={`px-6 py-2 cursor-pointer rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 ${categoriaAtiva === "todas"
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
                                className={`px-6 py-2 cursor-pointer rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 ${categoriaAtiva === categoria.id
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
                            return (
                                <div
                                    key={produto.id}
                                    className="group bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-500 overflow-hidden border border-gray-700 hover:border-cyan-900/30 transform hover:-translate-y-2 flex flex-col"
                                >
                                    {/* Imagem do Produto */}
                                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex items-center justify-center p-2">
                                        <img
                                            src={`${bucketUrl}/${produto.imagem}`}
                                            alt={produto.nome}
                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                                        />

                                        {/* Badge de Status */}
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

                                    {/* Informações do Produto */}
                                    <div className="px-6 pt-2 pb-4 flex-1 flex flex-col">
                                        {/* Nome do Produto */}
                                        <h3 className="font-bold text-gray-100 mb-2 text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
                                            {produto.nome}
                                        </h3>

                                        {/* Badge de Sabores */}
                                        {produto.sabores && produto.sabores.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {produto.sabores.map((sabor, index) => (
                                                        <div key={index} className='gap-2'>
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                                                            >
                                                                {sabor.nome}
                                                                <span className="text-cyan-400">= {sabor.estoque}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Espaçador flexível */}
                                        <div className="flex-1"></div>

                                        {/* Botões de Ação - Estoque e Vendas */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEstoque(produto)}
                                                className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-cyan-100 rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium text-sm border border-gray-700"
                                            >
                                                <Archive size={16} />
                                                Estoque
                                            </button>
                                            <button
                                                onClick={() => handleVendas(produto)}
                                                className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all duration-300 font-medium text-sm"
                                            >
                                                <ShoppingCart size={16} />
                                                Vender
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Dialogs - Componentes separados */}
                <DialogEstoque
                    aberto={dialogEstoqueAberto}
                    onAbertoChange={setDialogEstoqueAberto}
                    produto={produtoSelecionado}
                    onEstoqueAtualizado={atualizarEstoqueLocal}
                />

                <DialogVendas
                    aberto={dialogVendasAberto}
                    onAbertoChange={setDialogVendasAberto}
                    produto={produtoSelecionado}
                    user={user}
                    onVendaRealizada={atualizarEstoqueAposVenda}
                />
            </div>
        </>
    )
}