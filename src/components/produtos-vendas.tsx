/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import DialogEditarVenda from './editar-venda';


interface TabelaVendasProps {
    vendas: any[];
    loading: boolean;
    error: string | null;
    hasActiveFilters: boolean;
    onLimparFiltros: () => void;
    onEditarVenda: (venda: any) => void;
    onExcluirVenda: (id: string) => void;
    onVendaAtualizada?: (vendaAtualizada: any) => void;
}

export default function TabelaVendas({
    vendas,
    loading,
    error,
    hasActiveFilters,
    onLimparFiltros,
    onEditarVenda,
    onExcluirVenda,
    onVendaAtualizada
}: TabelaVendasProps) {
    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [user, setUser] = useState([]);

    // Estados para o dialog de edição
    const [vendaParaEditar, setVendaParaEditar] = useState<any | null>(null);
    const [dialogEdicaoAberto, setDialogEdicaoAberto] = useState(false);

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
            setUser(data)
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error)
            return ''
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    // Calcular paginação
    const totalPages = Math.ceil(vendas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVendas = vendas.slice(startIndex, endIndex);

    // Reset página quando vendas mudam
    useEffect(() => {
        setCurrentPage(1);
    }, [vendas]);

    // Função para formatar data
    const formatarData = (dataString: any) => {
        if (!dataString) return 'Data não informada';

        try {
            // Extrai a data no formato YYYY-MM-DD da string
            const dataMatch = dataString.toString().match(/(\d{4}-\d{2}-\d{2})/);

            if (dataMatch) {
                const [year, month, day] = dataMatch[1].split('-');
                return `${day}/${month}/${year}`;
            }

            return 'Data inválida';
        } catch (error) {
            return 'Data inválida';
        }
    };

    // Funções para navegação de páginas
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    // Função para gerar os números das páginas a serem exibidos
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Máximo de páginas visíveis ao mesmo tempo

        if (totalPages <= maxVisible + 2) {
            // Se houver poucas páginas, mostra todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Sempre mostra a primeira página
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Calcula o range de páginas ao redor da página atual
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Sempre mostra a última página
            pages.push(totalPages);
        }

        return pages;
    };

    // Função para confirmar exclusão
    const confirmarExclusao = (venda: any) => {
        onExcluirVenda(venda.id);
    };

    // Função para abrir dialog de edição
    const abrirDialogEdicao = (venda: any) => {
        setVendaParaEditar(venda);
        setDialogEdicaoAberto(true);
    };

    // Função para fechar dialog de edição
    const fecharDialogEdicao = () => {
        setDialogEdicaoAberto(false);
        setVendaParaEditar(null);
    };

    // Função para lidar com venda salva
    const handleVendaSalva = (vendaAtualizada: any) => {
        // Chama o callback de atualização se fornecido
        if (onVendaAtualizada) {
            onVendaAtualizada(vendaAtualizada);
        }

        // Também chama o callback original para compatibilidade
        onEditarVenda(vendaAtualizada);

        // Fecha o dialog
        fecharDialogEdicao();
    };

    return (
        <>
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-cyan-400">Lista de Vendas</h2>
                            <p className="text-slate-400">
                                {hasActiveFilters ?
                                    `${vendas.length} vendas (filtradas)` :
                                    `${vendas.length} vendas cadastradas`
                                }
                            </p>
                        </div>
                        <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                            Página {currentPage} de {totalPages || 1}
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                        <p className="text-slate-400">Carregando vendas...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="p-8 text-center">
                        <p className="text-red-400">Erro: {error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && (!vendas || vendas.length === 0) && !error && (
                    <div className="p-8 text-center">
                        <Package size={48} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">
                            {hasActiveFilters ? 'Nenhuma venda encontrada com os filtros aplicados' : 'Nenhuma venda cadastrada'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={onLimparFiltros}
                                className="mt-4 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-md text-white text-sm"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                )}

                {/* Tabela */}
                {!loading && currentVendas && currentVendas.length > 0 && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed min-w-[1200px]">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left p-4 text-slate-300 font-medium w-[100px]">Data</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[140px]">Produto</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[160px]">Sabor</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[140px]">Cliente</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[120px]">Quem Recebeu</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[100px]">Entrega</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[80px]">Fiado</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[120px]">Pagamento</th>
                                        <th className="text-left p-4 text-slate-300 font-medium w-[100px]">Total</th>
                                        <th className="text-center p-4 text-slate-300 font-medium w-[100px]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVendas.map((venda) => (
                                        <tr key={venda.id} className="border-b border-slate-700 hover:bg-slate-750">
                                            <td className="p-4">
                                                <div className="text-sm whitespace-nowrap">
                                                    {formatarData(venda.data_venda || venda.createdAt)}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">
                                                <div className="truncate" title={venda?.sabor?.produto?.nome || venda?.produto?.nome || venda?.produto || 'Produto não informado'}>
                                                    {venda?.sabor?.produto?.nome ||
                                                        venda?.produto?.nome ||
                                                        venda?.produto ||
                                                        'Produto não informado'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-cyan-500 px-2 py-1 rounded-full text-xs inline-block max-w-full truncate" title={venda?.sabor?.nome || venda?.sabor || 'Sabor não informado'}>
                                                    {venda?.sabor?.nome ||
                                                        venda?.sabor ||
                                                        'Sabor não informado'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="truncate" title={venda?.cliente_nome || venda?.cliente?.nome || venda?.cliente || 'Cliente não informado'}>
                                                    {venda?.cliente_nome ||
                                                        venda?.cliente?.nome ||
                                                        venda?.cliente ||
                                                        'Cliente não informado'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="truncate" title={venda?.recebedor?.nome || venda?.recebedor || venda?.quem_recebeu || '-'}>
                                                    {venda?.recebedor?.nome ||
                                                        venda?.recebedor ||
                                                        venda?.quem_recebeu ||
                                                        '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {(venda.taxa_entrega && venda.taxa_entrega > 0) ? (
                                                    <div className="flex items-center text-green-400">
                                                        <CheckCircle size={16} className="mr-1 flex-shrink-0" />
                                                        <span className="text-sm">Sim</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-400">
                                                        <XCircle size={16} className="mr-1 flex-shrink-0" />
                                                        <span className="text-sm">Não</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {venda.fiado ? (
                                                    <div className="flex items-center text-red-400">
                                                        <CheckCircle size={16} className="mr-1 flex-shrink-0" />
                                                        <span className="text-sm">Sim</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-green-400">
                                                        <XCircle size={16} className="mr-1 flex-shrink-0" />
                                                        <span className="text-sm">Não</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="truncate" title={venda.forma_pagamento || 'Pagamento não informado'}>
                                                    {venda.forma_pagamento || 'Pagamento não informado'}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-cyan-400 whitespace-nowrap">
                                                R$ {(venda.valor || 0).toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="p-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors hover:cursor-pointer"
                                                                title="Excluir venda"
                                                            >
                                                                <Trash2 size={14} className="text-white" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">
                                                                    Confirmar Exclusão
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
                                                                    <div className="mt-4 p-3 bg-slate-700 rounded-md">
                                                                        <p className="text-sm text-slate-300">
                                                                            <strong>Data:</strong> {formatarData(venda.data_venda || venda.createdAt)}
                                                                        </p>
                                                                        <p className="text-sm text-slate-300">
                                                                            <strong>Produto:</strong> {venda?.sabor?.produto?.nome || venda?.produto?.nome || venda?.produto || 'Produto não informado'}
                                                                        </p>
                                                                        <p className="text-sm text-slate-300">
                                                                            <strong>Cliente:</strong> {venda?.cliente_nome || venda?.cliente?.nome || venda?.cliente || 'Cliente não informado'}
                                                                        </p>
                                                                        <p className="text-sm text-slate-300">
                                                                            <strong>Valor:</strong> R$ {(venda.valor || 0).toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-slate-700 hover:cursor-pointer hover:bg-slate-600 text-white border-slate-600">
                                                                    Cancelar
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => confirmarExclusao(venda)}
                                                                    disabled={loading}
                                                                    className="bg-red-500 hover:bg-red-600 text-white hover:cursor-pointer"
                                                                >
                                                                    {loading ? 'Excluindo...' : 'Confirma exclusão'}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="p-6 border-t border-slate-700">
                                <div className="flex flex-col  lg:flex-row items-center justify-between">
                                    <div className="text-sm text-slate-400">
                                        Mostrando {startIndex + 1} a {Math.min(endIndex, vendas.length)} de {vendas.length} vendas
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className="flex items-center px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft size={16} className="mr-1" />
                                            Anterior
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => goToPage(page as number)}
                                                        className={`px-3 py-2 rounded-md transition-colors ${page === currentPage
                                                            ? 'bg-cyan-500 text-white'
                                                            : 'bg-slate-700 hover:bg-slate-600'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Próxima
                                            <ChevronRight size={16} className="ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Dialog de Edição */}
            <DialogEditarVenda
                venda={vendaParaEditar}
                isOpen={dialogEdicaoAberto}
                onClose={fecharDialogEdicao}
                onSalvar={handleVendaSalva}
                user={user}
            />
        </>
    );
}