/* eslint-disable react/no-unescaped-entities */
'use client'
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Tag, Hash, Trash2, Loader, Edit2, Check, X, AlertTriangle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { showToast, ToastType } from "@/utils/toastUtils"

interface CategoryFormData {
    name: string
}

interface Category {
    id: string
    nome: string
    slug: string
    // adicione outros campos conforme sua estrutura
}

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCategoryCreated?: () => void
}

export default function CategoryDialog({
    open,
    onOpenChange,
    onCategoryCreated
}: CategoryDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [categorias, setCategorias] = useState<Category[]>([])
    console.log("Categorias:", categorias)
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState<string>("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isValid }
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
        },
        mode: "onChange"
    })

    // Função para buscar categorias
    const fetchCategories = async () => {
        setIsLoadingCategories(true)
        try {
            const response = await fetch('/api/categorias/get')
            if (response.ok) {
                const data = await response.json()
                console.log("Categorias data:", data)
                setCategorias(data)
            } else {
                showToast('Erro ao carregar categorias', ToastType.ERROR)
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error)
            showToast('Erro ao carregar categorias', ToastType.ERROR)
        } finally {
            setIsLoadingCategories(false)
        }
    }

    // Buscar categorias quando o dialog abre
    useEffect(() => {
        if (open) {
            fetchCategories()
        }
    }, [open])

    // Função para iniciar edição
    const handleStartEdit = (category: Category) => {
        setEditingCategoryId(category.id)
        setEditingName(category.nome)
    }

    // Função para cancelar edição
    const handleCancelEdit = () => {
        setEditingCategoryId(null)
        setEditingName("")
    }

    // Função para salvar edição
    const handleSaveEdit = async (categoryId: string) => {
        if (!editingName.trim()) {
            showToast('Nome não pode estar vazio', ToastType.ERROR)
            return
        }

        setIsUpdating(true)
        try {
            const response = await fetch(`/api/categorias/put/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editingName.trim() }),
            })

            if (response.ok) {
                showToast('Categoria atualizada com sucesso!', ToastType.SUCCESS)
                // Atualiza a categoria na lista local
                setCategorias(categorias.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, nome: editingName.trim() }
                        : cat
                ))
                setEditingCategoryId(null)
                setEditingName("")
                onCategoryCreated?.()
            } else {
                const result = await response.json()
                if (response.status === 409) {
                    showToast('Já existe uma categoria com este nome!', ToastType.ERROR)
                } else {
                    showToast(result.message || 'Erro ao atualizar categoria', ToastType.ERROR)
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error)
            showToast('Erro ao atualizar categoria', ToastType.ERROR)
        } finally {
            setIsUpdating(false)
        }
    }

    // Função para deletar categoria
    const handleDeleteCategory = async (categoryId: string) => {
        setDeletingCategoryId(categoryId)
        try {
            const response = await fetch(`/api/categorias/delete/${categoryId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                showToast('Categoria removida com sucesso!', ToastType.SUCCESS)
                // Remove a categoria da lista local
                setCategorias(categorias.filter(cat => cat.id !== categoryId))
                onCategoryCreated?.() // Atualiza outras partes da aplicação se necessário
            } else {
                const result = await response.json()
                showToast(result.message || 'Erro ao remover categoria', ToastType.ERROR)
            }
        } catch (error) {
            console.error("Erro ao deletar categoria:", error)
            showToast('Erro ao remover categoria', ToastType.ERROR)
        } finally {
            setDeletingCategoryId(null)
            setShowDeleteDialog(false)
            setCategoryToDelete(null)
        }
    }

    // Função para abrir dialog de confirmação de exclusão
    const handleOpenDeleteDialog = (category: Category) => {
        setCategoryToDelete(category)
        setShowDeleteDialog(true)
    }

    // Função para cancelar exclusão
    const handleCancelDelete = () => {
        setShowDeleteDialog(false)
        setCategoryToDelete(null)
    }

    const onSubmit = async (data: CategoryFormData) => {
        setIsLoading(true)
        console.log("Data:", data)

        try {
            const response = await fetch('/api/categorias/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                // Verifica se é erro de categoria já existente (status 409)
                if (response.status === 409) {
                    showToast('Já existe uma categoria com este nome, tente outro!', ToastType.ERROR);
                } else {
                    // Para outros erros, usa a mensagem do servidor ou uma mensagem padrão
                    showToast(result.message || 'Erro ao criar categoria', ToastType.ERROR);
                }
                return; // Não prossegue com o sucesso
            }

            console.log('Categoria criada com sucesso:', result)
            showToast('Categoria criada com sucesso!', ToastType.SUCCESS);

            // Reset form
            reset()

            // Atualiza a lista de categorias
            fetchCategories()

            // Callback para atualizar lista de categorias se necessário
            onCategoryCreated?.()

        } catch (error) {
            console.error("Erro ao salvar categoria:", error)
            showToast("Erro ao criar categoria. Tente novamente.", ToastType.ERROR);
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        reset()
        setEditingCategoryId(null)
        setEditingName("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                        <Tag size={24} />
                        Gerenciar Categorias
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Visualize as categorias existentes e adicione novas categorias.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Seção de Categorias Existentes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                            <Tag size={18} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-gray-200">Categorias Existentes</h3>
                            {categorias.length > 0 && (
                                <span className="text-sm text-gray-500">({categorias.length})</span>
                            )}
                        </div>

                        {isLoadingCategories ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-cyan-400" />
                                <span className="ml-2 text-gray-400">Carregando categorias...</span>
                            </div>
                        ) : categorias.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Tag size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Nenhuma categoria cadastrada ainda.</p>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {categorias.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                        >
                                            {editingCategoryId === category.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="h-7 w-24 min-w-24 text-sm bg-gray-700 border-gray-600 text-white px-2"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSaveEdit(category.id)
                                                            } else if (e.key === 'Escape') {
                                                                handleCancelEdit()
                                                            }
                                                        }}
                                                        autoFocus
                                                        disabled={isUpdating}
                                                    />
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(category.id)}
                                                            disabled={isUpdating}
                                                            className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            {isUpdating ? (
                                                                <Loader className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Check size={12} />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                            disabled={isUpdating}
                                                            className="h-7 w-7 p-0 bg-gray-600 hover:bg-gray-700 text-white"
                                                        >
                                                            <X size={12} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Tag size={14} className="text-cyan-400 flex-shrink-0" />
                                                    <span className="text-sm font-medium text-gray-200 whitespace-nowrap">
                                                        {category.nome}
                                                    </span>
                                                    <div className="flex gap-1 ml-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStartEdit(category)}
                                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                                                        >
                                                            <Edit2 size={12} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenDeleteDialog(category)}
                                                            disabled={deletingCategoryId === category.id}
                                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-red-400"
                                                        >
                                                            {deletingCategoryId === category.id ? (
                                                                <Loader className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 size={12} />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seção de Adicionar Nova Categoria */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                            <Hash size={18} className="text-green-400" />
                            <h3 className="text-lg font-semibold text-gray-200">Adicionar Nova Categoria</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Campo Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryName" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Tag size={16} />
                                    Nome da Categoria
                                </Label>
                                <Input
                                    id="categoryName"
                                    autoComplete="off"
                                    placeholder="Ex: Pods Descartáveis"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
                                    disabled={isLoading}
                                    {...register("name", {
                                        required: "Nome é obrigatório",
                                        minLength: {
                                            value: 2,
                                            message: "Nome deve ter pelo menos 2 caracteres"
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "Nome deve ter no máximo 100 caracteres"
                                        },
                                    })}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-400">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isLoading || !isValid}
                                    className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Salvando...
                                        </div>
                                    ) : (
                                        "Criar Categoria"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <DialogFooter className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
                            <AlertTriangle size={24} />
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-gray-300">
                            Tem certeza que deseja excluir a categoria{" "}
                            <span className="font-semibold text-cyan-400">
                                "{categoryToDelete?.nome}"
                            </span>
                            ?
                        </p>
                    </div>

                    <DialogFooter className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelDelete}
                            disabled={deletingCategoryId !== null}
                            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}
                            disabled={deletingCategoryId !== null}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deletingCategoryId === categoryToDelete?.id ? (
                                <div className="flex items-center gap-2">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Excluindo...
                                </div>
                            ) : (
                                <>
                                    <Trash2 size={16} className="mr-2" />
                                    Excluir
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}