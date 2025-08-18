/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Tag, LogOut, Settings, User, Bell, X, Hash, Sparkles } from "lucide-react"
import Image from "next/image"
import CategoryDialog from "@/components/add-categoria-form"
import AddProductDialog from "@/components/add-produto-form"
import ProdutosAdmin from "@/components/produtos-admin"
import { signOut } from "next-auth/react"

export default function AdminDashboard() {
    const router = useRouter()

    const [showForm, setShowForm] = useState(false)
    const [showCategoryManager, setShowCategoryManager] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    // Verificar autenticação
    // useEffect(() => {
    //     const auth = localStorage.getItem("elfpods_auth")
    //     if (auth === "authenticated") {
    //         setIsAuthenticated(true)
    //     } else {
    //         router.push("/login")
    //     }
    // }, [router])

    const handleLogoutClick = () => {
        setShowLogoutDialog(true)
    }

    const handleConfirmLogout = () => {
        signOut()
        setShowLogoutDialog(false)
        router.push("/")
    }

    const handleCancelLogout = () => {
        setShowLogoutDialog(false)
    }

    const handleEdit = (product: any) => {
        setEditingProduct(product)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingProduct(null)
    }

    const handleProductAdded = () => {
        console.log("Produto adicionado! Atualizando lista...")
        // Aqui você pode atualizar a lista de produtos
        // fetchProducts()
        handleCloseForm()
    }

    const handleCategoryCreated = () => {
        console.log("Categoria criada! Atualizando lista...")
        // Por exemplo, recarregar a lista de categorias:
        // fetchCategories()
    }

    // Mostrar loading enquanto verifica autenticação
    // if (!isAuthenticated) {
    //     return (
    //         <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
    //                 <p className="text-gray-400">Verificando autenticação...</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="min-h-screen">
            {/* Modern Header */}
            <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
                <div className="relative container mx-auto md:px-20 px-5 ">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between md:mb-8 ">
                        {/* Left Side - Logo and Title */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center">
                                <div className="relative w-32 h-32 ">
                                    <Image
                                        src="/images/gpt.png"
                                        alt="ELFPODS Logo"
                                        fill
                                        className="object-contain "
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleLogoutClick}
                                className="md:p-3 p-1 bg-red-900/30 backdrop-blur-md hover:bg-red-900/50 rounded-md md:rounded-xl transition-all duration-300 border border-red-700/30 text-red-400 hover:text-red-300"
                                title="Sair"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Header Content */}
                    <div className="text-center">
                        <div className="mb-6">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                                Gerencie sua <span className="text-cyan-400 text-glow">Loja</span>
                            </h2>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                                Controle total sobre produtos e categorias da sua loja ELFBPODS
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center cursor-pointer gap-3 px-8 py-4 bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-cyan-900/30 transform hover:-translate-y-1"
                            >
                                <Plus size={22} />
                                Novo Produto
                            </button>

                            <button
                                onClick={() => setShowCategoryManager(true)}
                                className="flex items-center cursor-pointer gap-3 px-8 py-4 bg-gray-800/60 backdrop-blur-md hover:bg-gray-700/60 text-cyan-100 font-bold rounded-2xl transition-all duration-300 border border-cyan-900/30 hover:border-cyan-700/50 transform hover:-translate-y-1"
                            >
                                <Tag size={22} />
                                Gerenciar Categorias
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Product Form Dialog */}
                <AddProductDialog
                    open={showForm}
                    onOpenChange={setShowForm}
                    onProductAdded={handleProductAdded}

                />

                <CategoryDialog
                    open={showCategoryManager}
                    onOpenChange={setShowCategoryManager}
                    onCategoryCreated={handleCategoryCreated}
                />

                {/* Logout Confirmation Dialog */}
                {showLogoutDialog && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 max-w-md mx-4">
                            <div className="text-center">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LogOut className="w-8 h-8 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Confirmar Logout
                                    </h3>
                                    <p className="text-gray-400">
                                        Tem certeza que deseja sair do painel administrativo?
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancelLogout}
                                        className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmLogout}
                                        className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Section */}
                <div className="bg-gray-900 rounded-3xl shadow-xl border border-gray-800 md:p-10 p-3">

                    <ProdutosAdmin />



                </div>
            </div>
        </div>
    )
}