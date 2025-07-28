/* eslint-disable react/no-unescaped-entities */
"use client"

import React, { useState, useEffect } from "react"
import ProdutoCard from "./produto-card"

// Interfaces
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
}

interface Categoria {
    id: number
    nome: string
}

export default function Produtos() {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [activeCategory, setActiveCategory] = useState<number | "all">("all")
    const [loading, setLoading] = useState(true)

    // Buscar produtos da API
    const fetchProdutos = async (): Promise<void> => {
        try {
            const response = await fetch('/api/produtos/get')
            const data: Produto[] = await response.json()

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

    // Buscar categorias da API
    const fetchCategorias = async (): Promise<void> => {
        try {
            const response = await fetch('/api/categorias/get')
            const data: Categoria[] = await response.json()
            setCategorias(data)
        } catch (error) {
            console.error('Erro ao buscar categorias:', error)
        }
    }

    // Carregar dados na inicialização
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchProdutos(), fetchCategorias()])
            setLoading(false)
        }

        loadData()
    }, [])

    // Filtrar produtos pela categoria ativa
    const produtosFiltrados = activeCategory === "all"
        ? produtos
        : produtos.filter((produto) => produto.categoria_id === activeCategory)

    // Função para obter o nome da categoria ativa
    const obterNomeCategoriaAtiva = (): string => {
        if (activeCategory === "all") return "Todos"
        const categoria = categorias.find((cat) => cat.id === activeCategory)
        return categoria ? categoria.nome : "Categoria"
    }

    // Transformar produto para o formato esperado pelo ProdutoCard
    const transformarProduto = (produto: Produto) => ({
        id: produto.id.toString(),
        name: produto.nome,
        price: produto.preco_desconto,
        originalPrice: produto.preco_original,
        description: produto.descricao,
        image: `${produto.imagem}`,
        category: produto.categoria,
        sabores: produto.sabores?.map(sabor => sabor.nome) || []
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Carregando produtos...</p>
                </div>
            </div>
        )
    }

    if (produtos.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-cyan-900/30">
                    <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-100 mb-3">Nenhum produto encontrado</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    Não há produtos disponíveis no momento. Volte em breve para conferir novidades!
                </p>
            </div>
        )
    }

    return (
        <div className="">
            {/* Filtros por categoria */}
            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex space-x-2 min-w-max">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`px-6 py-3 rounded-full transition-all duration-300 ${activeCategory === "all"
                            ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900/30"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                    >
                        Todos
                    </button>

                    {categorias.map((categoria) => (
                        <button
                            key={categoria.id}
                            onClick={() => setActiveCategory(categoria.id)}
                            className={`md:px-6 md:py-3 px-3 py-1 rounded-full transition-all cursor-pointer duration-300 ${activeCategory === categoria.id
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
            {produtosFiltrados.length === 0 && activeCategory !== "all" ? (
                <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-cyan-900/30">
                        <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-cyan-100 mb-3">Nenhum produto encontrado</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Não há produtos cadastrados na categoria "{obterNomeCategoriaAtiva()}".
                    </p>
                </div>
            ) : (
                /* Grid de produtos */
                <div className="md:px-8">

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
                        {produtosFiltrados.map(produto => (
                            <ProdutoCard
                                key={produto.id}
                                product={transformarProduto(produto)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}