'use client'
import React, { useState, useEffect } from 'react'
import { Archive, Plus, Minus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { showToast, ToastType } from '@/utils/toastUtils'

interface Sabor {
    id: number
    nome: string
}

interface Produto {
    id: number
    nome: string
    sabores: Sabor[]
}

interface EstoqueData {
    [saborId: number]: number
}

// Interface para o formato de resposta da API
interface EstoqueSabor {
    estoque: number
    id: number
    nome: string
}

interface DialogEstoqueProps {
    aberto: boolean
    onAbertoChange: (aberto: boolean) => void
    produto: Produto | null
}

export default function DialogEstoque({ aberto, onAbertoChange, produto }: DialogEstoqueProps) {
    const [estoqueData, setEstoqueData] = useState<EstoqueData>({})
    const [salvandoEstoque, setSalvandoEstoque] = useState(false)

    // Função para buscar estoque atual do produto
    const fetchEstoqueProduto = async (produtoId: number): Promise<EstoqueData> => {
        try {
            const response = await fetch(`/api/estoque/get/${produtoId}`)
            if (response.ok) {
                const data = await response.json()
                console.log('DATA ESTOQUE PRODUTO ', data)

                // Formatar os dados do estoque para o formato esperado
                const estoqueFormatado: EstoqueData = {}

                // Assumindo que data é um array e cada item tem sabores
                if (data && data.length > 0 && data[0].sabores) {
                    data[0].sabores.forEach((sabor: EstoqueSabor) => {
                        estoqueFormatado[sabor.id] = sabor.estoque
                    })
                }

                console.log('Estoque formatado:', estoqueFormatado)
                return estoqueFormatado
            }

            return {}
        } catch (error) {
            console.error('Erro ao buscar estoque:', error)
            return {}
        }
    }

    // Função para salvar estoque
    const salvarEstoque = async (): Promise<void> => {
        if (!produto) return

        setSalvandoEstoque(true)
        try {
            const response = await fetch('/api/estoque', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produto_id: produto.id,
                    estoque: estoqueData
                })
            })

            if (response.ok) {
                console.log('Estoque salvo com sucesso!')
                onAbertoChange(false)
                // Aqui você pode adicionar uma notificação de sucesso
                showToast('Estoque atualizado!', ToastType.SUCCESS);
            } else {
                console.error('Erro ao salvar estoque')
                // Aqui você pode adicionar uma notificação de erro
                // toast.error('Erro ao salvar estoque')
            }
        } catch (error) {
            console.error('Erro ao salvar estoque:', error)
            // toast.error('Erro ao conectar com o servidor')
        } finally {
            setSalvandoEstoque(false)
        }
    }

    // Funções para controlar quantidade no estoque
    const incrementarQuantidade = (saborId: number) => {
        setEstoqueData(prev => ({
            ...prev,
            [saborId]: (prev[saborId] || 0) + 1
        }))
    }

    const decrementarQuantidade = (saborId: number) => {
        setEstoqueData(prev => ({
            ...prev,
            [saborId]: Math.max((prev[saborId] || 0) - 1, 0)
        }))
    }

    const alterarQuantidadeDireta = (saborId: number, quantidade: string) => {
        const valor = parseInt(quantidade) || 0
        setEstoqueData(prev => ({
            ...prev,
            [saborId]: Math.max(valor, 0)
        }))
    }

    // Effect para carregar estoque quando o produto mudar
    useEffect(() => {
        const carregarEstoque = async () => {
            if (produto && aberto) {
                console.log('Carregando estoque para produto:', produto.nome)

                // Buscar estoque atual do produto
                const estoqueAtual = await fetchEstoqueProduto(produto.id)

                // Inicializar estoque com dados da API ou 0 para sabores sem estoque
                const estoqueInicial: EstoqueData = {}
                produto.sabores.forEach(sabor => {
                    estoqueInicial[sabor.id] = estoqueAtual[sabor.id] !== undefined ? estoqueAtual[sabor.id] : 0
                })

                console.log('Estoque inicial formatado:', estoqueInicial)
                setEstoqueData(estoqueInicial)
            }
        }

        carregarEstoque()
    }, [produto, aberto])

    // Resetar dados ao fechar o dialog
    useEffect(() => {
        if (!aberto) {
            setEstoqueData({})
            setSalvandoEstoque(false)
        }
    }, [aberto])

    return (
        <Dialog open={aberto} onOpenChange={onAbertoChange}>
            <DialogContent className="bg-gray-800 border border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-cyan-400 text-xl flex items-center gap-2">
                        <Archive className="w-5 h-5" />
                        Gerenciar Estoque
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        {produto?.nome && `Controle o estoque de cada sabor do produto: ${produto.nome}`}
                    </DialogDescription>
                </DialogHeader>

                {produto && (
                    <>
                        <div className="space-y-4 mt-6">
                            {produto.sabores.map((sabor) => (
                                <div key={sabor.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-600">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-100">{sabor.nome}</h4>

                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => decrementarQuantidade(sabor.id)}
                                            className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            value={estoqueData[sabor.id] || 0}
                                            onChange={(e) => alterarQuantidadeDireta(sabor.id, e.target.value)}
                                            className="w-16 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                        />

                                        <button
                                            onClick={() => incrementarQuantidade(sabor.id)}
                                            className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors duration-200"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => onAbertoChange(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarEstoque}
                                disabled={salvandoEstoque}
                                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {salvandoEstoque ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Estoque'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}