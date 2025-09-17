/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Save, Package, User, Calendar, Truck, DollarSign, CircleX, CreditCard } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { showToast, ToastType } from '@/utils/toastUtils';

interface Sabor {
    id: number;
    nome: string;
    estoque: any;
}

interface Produto {
    id: number;
    nome: string;
    sabores: Sabor[];
}

interface DialogEditarVendaProps {
    venda: any | null;
    isOpen: boolean;
    onClose: () => void;
    onSalvar: (vendaEditada: any) => void;
    user: any[];
}

export default function DialogEditarVenda({
    venda,
    isOpen,
    onClose,
    onSalvar,
    user = []
}: DialogEditarVendaProps) {
    const [formData, setFormData] = useState({
        data_venda: '',
        sabor_id: 0,
        cliente_nome: '',
        quem_recebeu: venda?.recebedor?.id || venda?.quem_recebeu || 0,

        taxa_entrega: 0,
        delivery: false,
        fiado: false,
        valor: 0,
        forma_pagamento: '',
        quantidade: 0
    });
    console.log('FORM DATA', formData)

    const [valorFormatado, setValorFormatado] = useState('0,00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [saboresDisponiveis, setSaboresDisponiveis] = useState<Sabor[]>([]);
    console.log('saboresDisponiveis', saboresDisponiveis)

    // Função para formatar valor em real
    const formatarValorReal = (valor: number): string => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Função para carregar sabores do produto
    const carregarSaboresProduto = async (produtoId: number) => {
        console.log('produtoId', produtoId)
        try {
            console.log('Carregando sabores para produto ID:', produtoId);
            const response = await fetch(`/api/produtos/get/${produtoId}/sabores`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                const listaSabores = data[0]?.sabores || [];
                setSaboresDisponiveis(listaSabores);
            } else {
                console.error('Erro ao carregar sabores');
                setSaboresDisponiveis([]);
            }
        } catch (error) {
            console.error('Erro ao carregar sabores:', error);
            setSaboresDisponiveis([]);
        }
    };

    // Preencher formulário quando a venda muda
    useEffect(() => {
        if (venda && isOpen) {
            console.log('Venda recebida para edição:', venda);

            // Processar data
            const dataVenda = venda.data_venda || venda.createdAt;
            let formattedDate = '';

            if (dataVenda) {
                try {
                    const date = new Date(dataVenda);
                    formattedDate = date.toISOString().split('T')[0];
                } catch (error) {
                    console.error('Erro ao formatar data:', error);
                }
            }

            // Extrair ID do produto e sabor atual
            const produtoId = venda?.sabor?.produto?.id ||
                venda?.produto?.id ||
                venda?.produto_id;

            const saborAtualId = venda?.sabor?.id || venda?.sabor_id || 0;



            // Preencher dados do formulário
            const novoFormData = {
                data_venda: formattedDate,
                sabor_id: saborAtualId, // Certifica que o sabor atual está sendo setado
                cliente_nome: venda?.cliente_nome || venda?.cliente?.nome || venda?.cliente || '',
                quem_recebeu: venda?.recebedor?.nome || venda?.recebedor || venda?.quem_recebeu || '',
                taxa_entrega: venda?.taxa_entrega || 0,
                delivery: Boolean(venda?.delivery),
                fiado: Boolean(venda?.fiado),
                valor: venda?.valor || venda?.valor_total || 0,
                forma_pagamento: venda?.forma_pagamento || '',
                quantidade: venda?.quantidade || 0
            };

            console.log('Dados do formulário preenchidos:', novoFormData);

            setFormData(novoFormData);
            setValorFormatado(formatarValorReal(novoFormData.valor));
            setError(null);
            setErrors({});

            // Carregar sabores se tiver produto ID
            if (produtoId) {
                carregarSaboresProduto(produtoId);
            } else {
                // Se não tiver produto ID, tenta usar sabores da venda
                const saboresVenda = venda?.sabor?.produto?.sabores || venda?.produto?.sabores || [];
                console.log('Sabores da venda:', saboresVenda);
                setSaboresDisponiveis(saboresVenda);
            }
        }
    }, [venda, isOpen]);

    // Função melhorada para lidar com mudança no valor total
    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Remove tudo que não for dígito
        const digitsOnly = inputValue.replace(/\D/g, '');

        if (digitsOnly === '') {
            setValorFormatado('0,00');
            setFormData(prev => ({ ...prev, valor: 0 }));
            return;
        }

        // Converte para número (centavos)
        const numero = parseInt(digitsOnly) / 100;

        // Formata para exibição
        const formatado = numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        setValorFormatado(formatado);
        setFormData(prev => ({ ...prev, valor: numero }));
    };

    // Função para lidar com teclas especiais
    const handleValorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Permite: backspace, delete, tab, escape, enter, home, end, left, right
        if ([8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        // Garante que é um número
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    };

    // Função para lidar com mudanças nos campos
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? checked
                : name === 'sabor_id' || name === 'quem_recebeu'
                    ? parseInt(value) || 0
                    : type === 'number'
                        ? parseFloat(value) || 0
                        : value
        }));


        // Limpar erro do campo quando alterado
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Função para validar dados antes de submeter
    const validarDados = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (formData.sabor_id === 0) {
            newErrors.sabor_id = 'Por favor, selecione um sabor';
        }
        const saborSelecionado = saboresDisponiveis.find(s => s.id === formData.sabor_id);

        if (!saborSelecionado) {
            newErrors.sabor_id = 'Sabor inválido';
        } else if (formData.quantidade > saborSelecionado.estoque) {
            newErrors.quantidade = `Quantidade inválida. Apenas ${saborSelecionado.estoque} em estoque.`;
        }
        if (!formData.cliente_nome.trim()) {
            newErrors.cliente_nome = 'Por favor, informe o nome do cliente';
        }
        if (formData.quantidade <= 0) {
            newErrors.quantidade = 'A quantidade deve ser maior que zero';
        }


        if (!formData.data_venda) {
            newErrors.data_venda = 'Por favor, selecione a data';
        }

        if (formData.valor <= 0) {
            newErrors.valor = 'O valor total deve ser maior que zero';
        }

        if (!formData.forma_pagamento) {
            newErrors.forma_pagamento = 'Por favor, selecione a forma de pagamento';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Função para salvar as alterações
    const handleSalvar = async () => {
        if (!venda?.id) {
            setError('ID da venda não encontrado');
            return;
        }

        if (!validarDados()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/vendas/${venda.id}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data_venda: formData.data_venda,
                    sabor_id: formData.sabor_id,
                    cliente_nome: formData.cliente_nome,
                    quem_recebeu: formData.quem_recebeu,
                    taxa_entrega: formData.taxa_entrega,
                    delivery: formData.delivery,
                    fiado: formData.fiado,
                    valor: formData.valor,
                    forma_pagamento: formData.forma_pagamento,
                    quantidade: formData.quantidade
                })
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar venda');
            }

            const vendaAtualizada = await response.json();
            onSalvar(vendaAtualizada);
            onClose();
            showToast('Venda salva com sucesso!', ToastType.SUCCESS);
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            showToast('Erro ao salvar venda!', ToastType.ERROR);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    if (!venda) return null;

    // Obter produto da venda
    const produto = venda?.sabor?.produto || venda?.produto;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-gray-800 border border-gray-700 text-white max-w-md max-h-[90vh]" style={{ overflow: 'hidden' }}>
                <div className="overflow-y-auto max-h-[80vh] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-between">
                            <AlertDialogTitle className="text-cyan-400 text-xl flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                Editar Venda #{venda.id}
                            </AlertDialogTitle>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-md transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                    </AlertDialogHeader>

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500 rounded-md mt-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 mt-6">
                        {/* Produto Info - Apenas leitura */}
                        {produto && (
                            <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-cyan-400 font-medium">Produto</span>
                                </div>
                                <p className="text-gray-100 font-medium">{produto.nome}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Para alterar o produto, exclua e cadastre uma nova venda
                                </p>
                            </div>
                        )}

                        {/* Sabor */}
                        <div>
                            <Label className="text-gray-300">Sabor *</Label>
                            <select
                                name="sabor_id"
                                value={formData.sabor_id}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-2"
                            >
                                <option value={0}>Selecione um sabor</option>
                                {saboresDisponiveis && saboresDisponiveis.length > 0 ? (
                                    saboresDisponiveis.map((sabor) => (
                                        <option key={sabor.id} value={sabor.id}>
                                            {sabor.nome}
                                        </option>
                                    ))
                                ) : (
                                    <option value={0} disabled>Nenhum sabor disponível</option>
                                )}
                            </select>
                            {errors.sabor_id && (
                                <p className="text-red-400 text-xs mt-1">{errors.sabor_id}</p>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                                {saboresDisponiveis?.length || 0} sabores disponíveis
                            </p>
                        </div>
                        {/* Quantidade */}
                        <div>
                            <Label className="text-gray-300 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Quantidade *
                            </Label>
                            <Input
                                type="number"
                                name="quantidade"
                                value={formData.quantidade}
                                onChange={handleInputChange}
                                min={1}
                                placeholder="Digite a quantidade"
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 mt-2"
                            />
                            {errors.quantidade && (
                                <p className="text-red-400 text-xs mt-1">{errors.quantidade}</p>
                            )}
                        </div>

                        {/* Nome do Cliente */}
                        <div>
                            <Label className="text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nome do Cliente *
                            </Label>
                            <Input
                                type="text"
                                name="cliente_nome"
                                value={formData.cliente_nome}
                                onChange={handleInputChange}
                                placeholder="Digite o nome do cliente"
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 mt-2"
                            />
                            {errors.cliente_nome && (
                                <p className="text-red-400 text-xs mt-1">{errors.cliente_nome}</p>
                            )}
                        </div>

                        {/* Quem Recebeu */}
                        <div>
                            <Label className="text-gray-300">Quem Recebeu *</Label>
                            <select
                                name="quem_recebeu"
                                value={formData.quem_recebeu}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-2"
                            >
                                <option value="">Selecione quem recebeu</option>
                                {user.map((usuario: any) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nome}
                                    </option>
                                ))}
                            </select>
                            {errors.quem_recebeu && (
                                <p className="text-red-400 text-xs mt-1">{errors.quem_recebeu}</p>
                            )}
                        </div>

                        {/* Data */}
                        <div>
                            <Label className="text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Data da Venda *
                            </Label>
                            <Input
                                type="date"
                                name="data_venda"
                                value={formData.data_venda}
                                onChange={handleInputChange}
                                className="bg-gray-700 border-gray-600 text-white focus:border-cyan-500 mt-2"
                            />
                            {errors.data_venda && (
                                <p className="text-red-400 text-xs mt-1">{errors.data_venda}</p>
                            )}
                        </div>

                        {/* Forma de Pagamento */}
                        <div>
                            <Label className="text-gray-300 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Forma de Pagamento *
                            </Label>
                            <select
                                name="forma_pagamento"
                                value={formData.forma_pagamento}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 mt-2"
                            >
                                <option value="">Selecione a forma de pagamento</option>
                                <option value="PIX">PIX</option>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="CREDITO">Cartão de Crédito</option>
                                <option value="DEBITO">Cartão de Débito</option>
                            </select>
                            {errors.forma_pagamento && (
                                <p className="text-red-400 text-xs mt-1">{errors.forma_pagamento}</p>
                            )}
                        </div>

                        {/* Valor Total */}
                        <div>
                            <Label className="text-gray-300 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Valor Total da Venda *
                            </Label>
                            <div className="relative mt-2">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-medium">
                                    R$
                                </span>
                                <Input
                                    type="text"
                                    value={valorFormatado}
                                    onChange={handleValorChange}
                                    onKeyDown={handleValorKeyDown}
                                    placeholder="0,00"
                                    className="pl-10 bg-cyan-900/20 border-cyan-800 text-cyan-400 placeholder-cyan-600 focus:border-cyan-500 font-medium text-lg"
                                />
                            </div>
                            {errors.valor && (
                                <p className="text-red-400 text-xs mt-1">{errors.valor}</p>
                            )}
                        </div>

                        {/* Checkboxes Delivery e Fiado */}
                        <div className='flex flex-row gap-3'>
                            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                                <Checkbox
                                    id="delivery"
                                    checked={formData.delivery}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, delivery: !!checked }))}
                                    className="border-gray-600 data-[state=checked]:bg-cyan-600"
                                />
                                <Label htmlFor="delivery" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                    <Truck className="w-4 h-4 text-orange-400" />
                                    Entrega
                                </Label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                                <Checkbox
                                    id="fiado"
                                    checked={formData.fiado}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fiado: !!checked }))}
                                    className="border-gray-600 data-[state=checked]:bg-cyan-600"
                                />
                                <Label htmlFor="fiado" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                    <CircleX className="w-4 h-4 text-red-400" />
                                    Fiado
                                </Label>
                            </div>
                        </div>



                        {/* Botões de ação */}
                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                variant="secondary"
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-400"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSalvar}
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}