/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, DollarSign, Package, Truck } from 'lucide-react';
import FiltrosVendas from '@/components/filtro-vendas';
import TabelaVendas from '@/components/produtos-vendas';
import { showToast, ToastType } from '@/utils/toastUtils';
import { useRouter } from 'next/navigation';


interface FiltrosState {
    recebedor: string;
    tipoEntrega: string;
    dataInicio: string;
    dataFim: string;
    fiado: string; // Novo campo para filtro de fiado
}

export default function Relatorios() {
    const [filtros, setFiltros] = useState<FiltrosState>({
        recebedor: 'todos',
        tipoEntrega: 'todos',
        dataInicio: '',
        dataFim: '',
        fiado: 'todos' // Inicializar o novo filtro
    });

    const [vendas, setVendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVendas = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/vendas/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Dados recebidos da API:', data);

            const vendasArray = Array.isArray(data) ? data : (data.vendas || data.data || []);
            setVendas(vendasArray);

        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    // Função para filtrar vendas baseado nos critérios selecionados
    const vendasFiltradas = useMemo(() => {
        if (!vendas || vendas.length === 0) return [];

        return vendas.filter(venda => {
            // Filtro por recebedor - só aplica se não for "todos"
            const passaRecebedor = filtros.recebedor === 'todos' ||
                (venda?.recebedor?.nome || venda?.recebedor || venda?.quem_recebeu || '') === filtros.recebedor;

            // Filtro por tipo de entrega - só aplica se não for "todos"
            let passaEntrega = true;
            if (filtros.tipoEntrega === 'com_entrega') {
                passaEntrega = venda.taxa_entrega && venda.taxa_entrega > 0;
            } else if (filtros.tipoEntrega === 'sem_entrega') {
                passaEntrega = !venda.taxa_entrega || venda.taxa_entrega <= 0;
            }

            // Novo filtro por fiado
            let passaFiado = true;
            if (filtros.fiado === 'sim') {
                // Venda é fiado (assumindo que existe um campo fiado, eh_fiado, ou similar)
                passaFiado = venda.fiado === true || venda.eh_fiado === true || venda.is_fiado === true ||
                    venda.fiado === 'sim' || venda.tipo_pagamento === 'fiado';
            } else if (filtros.fiado === 'nao') {
                // Venda não é fiado (à vista)
                passaFiado = venda.fiado === false || venda.eh_fiado === false || venda.is_fiado === false ||
                    venda.fiado === 'nao' || venda.fiado === null || venda.fiado === undefined ||
                    venda.tipo_pagamento === 'a_vista' || venda.tipo_pagamento === 'avista';
            }

            // Filtro por período de datas
            let passaPeriodo = true;
            if (filtros.dataInicio && filtros.dataFim) {
                const dataVenda = new Date(venda.data_venda || venda.createdAt);
                const dataInicio = new Date(filtros.dataInicio);
                const dataFim = new Date(filtros.dataFim);

                // Adicionar 23:59:59 ao final do dia para incluir todo o dia final
                dataFim.setHours(23, 59, 59, 999);

                passaPeriodo = dataVenda >= dataInicio && dataVenda <= dataFim;
            } else if (filtros.dataInicio) {
                // Só data inicial
                const dataVenda = new Date(venda.data_venda || venda.createdAt);
                const dataInicio = new Date(filtros.dataInicio);
                passaPeriodo = dataVenda >= dataInicio;
            } else if (filtros.dataFim) {
                // Só data final
                const dataVenda = new Date(venda.data_venda || venda.createdAt);
                const dataFim = new Date(filtros.dataFim);
                dataFim.setHours(23, 59, 59, 999);
                passaPeriodo = dataVenda <= dataFim;
            }

            return passaRecebedor && passaEntrega && passaFiado && passaPeriodo;
        });
    }, [vendas, filtros]);

    // Obter lista única de recebedores para o filtro
    const recebedoresUnicos = useMemo(() => {
        const recebedores = new Set<string>();
        vendas.forEach(venda => {
            const recebedor = venda?.recebedor?.nome || venda?.recebedor || venda?.quem_recebeu;
            if (recebedor && recebedor.trim()) {
                recebedores.add(recebedor.trim());
            }
        });
        return Array.from(recebedores).sort();
    }, [vendas]);

    // Calcular estatísticas baseadas nas vendas filtradas
    const calcularEstatisticas = () => {
        if (!vendasFiltradas || vendasFiltradas.length === 0) {
            return {
                totalVendas: 0,
                faturamento: 0,
                entregas: 0
            };
        }

        const totalVendas = vendasFiltradas.length;
        const faturamento = vendasFiltradas.reduce((total, venda) => total + (venda.valor || 0), 0);
        const entregas = vendasFiltradas.filter(venda => venda.taxa_entrega > 0).length;

        return {
            totalVendas,
            faturamento,
            entregas
        };
    };

    const estatisticas = calcularEstatisticas();

    // Verificar se há filtros ativos
    const hasActiveFilters = filtros.recebedor !== 'todos' ||
        filtros.tipoEntrega !== 'todos' ||
        filtros.fiado !== 'todos' ||
        filtros.dataInicio !== '' ||
        filtros.dataFim !== '';

    // Função para limpar todos os filtros
    const limparFiltros = () => {
        setFiltros({
            recebedor: 'todos',
            tipoEntrega: 'todos',
            fiado: 'todos',
            dataInicio: '',
            dataFim: ''
        });
    };

    // Handlers para ações da tabela
    const handleEditarVenda = (venda: any) => {
        // Implementar lógica para editar venda
        console.log('Editando venda:', venda);
        // Aqui você pode abrir um modal de edição ou navegar para uma página de edição
        alert(`Funcionalidade de edição será implementada para a venda ID: ${venda.id}`);
    };

    const handleExcluirVenda = async (id: string) => {


        try {
            const response = await fetch(`/api/vendas/${id}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir venda');
            }

            // Recarregar vendas após exclusão
            await fetchVendas();
            showToast('Venda excluida com sucesso!', ToastType.SUCCESS)
        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            showToast('Erro ao excluir venda!', ToastType.ERROR)

        }
    };
    const router = useRouter()
    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Relatórios de <span className="text-cyan-400">Vendas</span>
                </h1>
                <p className="text-slate-400">Acompanhe o desempenho das suas vendas e analise os dados</p>
                <div className='flex justify-center mt-2'>
                    <button onClick={() => router.push('/admin/vendas')} className="bg-cyan-700 gap-2 flex-row items-center flex text-white shadow-lg shadow-cyan-900/30 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-cyan-600">
                        <ArrowLeft color='white' size={20} />
                        Voltar
                    </button>
                </div>
            </div>


            {/* Error Message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                    <p className="text-red-400">Erro ao carregar vendas: {error}</p>
                    <button
                        onClick={fetchVendas}
                        className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white text-sm"
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* Componente de Filtros */}
            <FiltrosVendas
                filtros={filtros}
                setFiltros={setFiltros}
                recebedoresUnicos={recebedoresUnicos}
            />

            {/* Cards com Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total de Vendas */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300">Total de Vendas</span>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold">{estatisticas.totalVendas}</div>
                    <div className="text-sm text-slate-400 mt-2">
                        {vendas.length > 0 && hasActiveFilters && `${((estatisticas.totalVendas / vendas.length) * 100).toFixed(1)}% do total`}
                        {vendas.length > 0 && !hasActiveFilters && `${vendas.length} vendas cadastradas`}
                    </div>
                </div>

                {/* Faturamento */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300">Faturamento</span>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign size={16} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold">R$ {estatisticas.faturamento.toFixed(2)}</div>
                    <div className="text-sm text-slate-400 mt-2">
                        {estatisticas.totalVendas > 0 && `Média: R$ ${(estatisticas.faturamento / estatisticas.totalVendas).toFixed(2)}`}
                    </div>
                </div>

                {/* Entregas */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300">Entregas</span>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Truck size={16} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold">{estatisticas.entregas}</div>
                    <div className="text-sm text-slate-400 mt-2">
                        {estatisticas.totalVendas > 0 && `${((estatisticas.entregas / estatisticas.totalVendas) * 100).toFixed(1)}% das vendas`}
                    </div>
                </div>
            </div>

            {/* Componente da Tabela */}
            <TabelaVendas
                vendas={vendasFiltradas}
                loading={loading}
                error={error}
                hasActiveFilters={hasActiveFilters}
                onLimparFiltros={limparFiltros}
                onEditarVenda={handleEditarVenda}
                onExcluirVenda={handleExcluirVenda}

            />
        </div>
    );
}