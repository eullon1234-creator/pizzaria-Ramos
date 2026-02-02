import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Power, Pizza, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'

export default function AdminDashboard() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        checkUser()
        fetchData()
    }, [])

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) navigate('/admin')
    }

    async function fetchData() {
        try {
            const { data: catData } = await supabase.from('categories').select('*').order('display_order')
            const { data: prodData } = await supabase.from('products').select('*, product_prices(*)').order('name')

            setCategories(catData || [])
            setProducts(prodData || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/admin')
    }

    const toggleStatus = async (product) => {
        const { error } = await supabase
            .from('products')
            .update({ is_active: !product.is_active })
            .eq('id', product.id)

        if (!error) fetchData()
    }

    const deleteProduct = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (!error) fetchData()
        }
    }

    const handleAdd = () => {
        setEditingProduct(null)
        setModalOpen(true)
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setModalOpen(true)
    }

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col border-r-4 border-secondary">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Pizza className="text-secondary w-6 h-6" />
                        <h1 className="font-black italic uppercase tracking-tighter text-lg">Admin Ramos</h1>
                    </div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Painel de Controle</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary text-white font-bold transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        Cardápio
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-zinc-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">Gestão do Cardápio</h2>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center gap-2 py-2 px-4 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Item
                    </button>
                </header>

                <div className="p-6 lg:p-10 space-y-8">
                    {categories.map(category => (
                        <section key={category.id} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ChevronRight className="text-primary w-5 h-5" />
                                <h3 className="text-lg font-black uppercase text-zinc-400 tracking-widest">{category.name}</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {products.filter(p => p.category_id === category.id).map(product => (
                                    <div key={product.id} className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-100">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Pizza className="w-8 h-8 text-zinc-200" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-zinc-900 truncate">{product.name}</h4>
                                            <p className="text-xs text-zinc-500 truncate">{product.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                title={product.is_active ? 'Desativar' : 'Ativar'}
                                                className={`p-2 rounded-lg transition-colors ${product.is_active ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'
                                                    }`}
                                            >
                                                <Power className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    )
}
