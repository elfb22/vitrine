/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Filter, User, Truck, Calendar, CreditCard } from 'lucide-react';

interface FiltrosState {
    recebedor: string;
    tipoEntrega: string;
    dataInicio: string;
    dataFim: string;
    fiado: string; // Novo campo para filtro de fiado
}

interface FiltrosVendasProps {
    filtros: FiltrosState;
    setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
    recebedoresUnicos: string[];
}

const DateRangePicker = ({ filtros, setFiltros }: any) => {
    return (
        <div className="flex lg:gap-2 gap-1">
            <input
                type="date"
                value={filtros.dataInicio || ''}
                onChange={(e) => setFiltros((prev: any) => ({ ...prev, dataInicio: e.target.value }))}
                placeholder="Data início"
                className="bg-slate-700 border border-slate-600 rounded-md px-2 md:px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            <input
                type="date"
                value={filtros.dataFim || ''}
                onChange={(e) => setFiltros((prev: any) => ({ ...prev, dataFim: e.target.value }))}
                placeholder="Data fim"
                className="bg-slate-700 border border-slate-600 rounded-md px-2 md:px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
        </div>
    );
};

export default function FiltrosVendas({ filtros, setFiltros, recebedoresUnicos }: FiltrosVendasProps) {
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

    // Handler para mudanças nos filtros
    const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

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
    return (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Filter className="text-cyan-400 mr-2" size={20} />
                    <span className="text-cyan-400 font-semibold">Filtros</span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={limparFiltros}
                        className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md transition-colors"
                    >
                        Limpar Filtros
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por Período */}
                <div className="flex flex-col">
                    <label className="text-sm text-slate-300 mb-2 flex items-center">
                        <Calendar className="mr-1" size={14} />
                        Período
                    </label>
                    <DateRangePicker
                        filtros={filtros}
                        setFiltros={setFiltros}
                    />
                </div>

                {/* Filtro por Recebedor */}
                <div className="flex flex-col">
                    <label className="text-sm text-slate-300 mb-2 flex items-center">
                        <User className="mr-1" size={14} />
                        Quem Recebeu
                    </label>
                    <select
                        value={filtros.recebedor}
                        onChange={(e) => handleFiltroChange('recebedor', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                        <option value="todos">Todos</option>
                        {recebedoresUnicos.map(recebedor => (
                            <option key={recebedor} value={recebedor}>{recebedor}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Tipo de Entrega */}
                <div className="flex flex-col">
                    <label className="text-sm text-slate-300 mb-2 flex items-center">
                        <Truck className="mr-1" size={14} />
                        Tipo de Entrega
                    </label>
                    <select
                        value={filtros.tipoEntrega}
                        onChange={(e) => handleFiltroChange('tipoEntrega', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                        <option value="todos">Todos</option>
                        <option value="com_entrega">Com Entrega</option>
                        <option value="sem_entrega">Sem Entrega</option>
                    </select>
                </div>

                {/* Novo Filtro por Fiado */}
                <div className="flex flex-col">
                    <label className="text-sm text-slate-300 mb-2 flex items-center">
                        <CreditCard className="mr-1" size={14} />
                        Fiado
                    </label>
                    <select
                        value={filtros.fiado}
                        onChange={(e) => handleFiltroChange('fiado', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                        <option value="todos">Todos</option>
                        <option value="sim">Fiado</option>
                        <option value="nao">À Vista</option>
                    </select>
                </div>
            </div>

            {/* Indicador de Filtros Ativos */}
            {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {filtros.dataInicio && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                            De: {formatarData(filtros.dataInicio)}
                        </span>
                    )}
                    {filtros.dataFim && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                            Até: {formatarData(filtros.dataFim)}
                        </span>
                    )}
                    {filtros.recebedor !== 'todos' && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                            Recebedor: {filtros.recebedor}
                        </span>
                    )}
                    {filtros.tipoEntrega !== 'todos' && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                            Entrega: {filtros.tipoEntrega === 'com_entrega' ? 'Com entrega' : 'Sem entrega'}
                        </span>
                    )}
                    {filtros.fiado !== 'todos' && (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                            Pagamento: {filtros.fiado === 'sim' ? 'Fiado' : 'À Vista'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}