import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Power, Pizza, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import CategoryModal from '../components/CategoryModal'

export default function AdminDashboard() {
    const [view, setView] = useState('products') // 'products' or 'categories'
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
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
            console.error('Error fetching dashboard data:', error.message || error)
            if (error.details) console.error('Error details:', error.details)
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

    const deleteCategory = async (id) => {
        if (window.confirm('Ao excluir a categoria, todos os produtos vinculados poderão ficar inacessíveis. Deseja continuar?')) {
            const { error } = await supabase.from('categories').delete().eq('id', id)
            if (!error) fetchData()
        }
    }

    const handleAdd = () => {
        if (view === 'products') {
            setEditingProduct(null)
            setModalOpen(true)
        } else {
            setEditingCategory(null)
            setCategoryModalOpen(true)
        }
    }

    const handleEdit = (item) => {
        if (view === 'products') {
            setEditingProduct(item)
            setModalOpen(true)
        } else {
            setEditingCategory(item)
            setCategoryModalOpen(true)
        }
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
                    <button
                        onClick={() => setView('products')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'products' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Cardápio
                    </button>
                    <button
                        onClick={() => setView('categories')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'categories' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Pizza className="w-5 h-5" />
                        Categorias
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
                    <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">
                        {view === 'products' ? 'Gestão do Cardápio' : 'Gestão de Categorias'}
                    </h2>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center gap-2 py-2 px-4 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        {view === 'products' ? 'Novo Item' : 'Nova Categoria'}
                    </button>
                </header>

                <div className="p-6 lg:p-10 space-y-8 no-scrollbar">
                    {view === 'products' ? (
                        categories.map(category => (
                            <section key={category.id} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <ChevronRight className="text-secondary w-5 h-5" />
                                    <h3 className="text-lg font-black uppercase text-zinc-900 tracking-widest">{category.name}</h3>
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
                                                    className={`p-2 rounded-lg transition-colors ${product.is_active ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}
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
                        ))
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map(category => (
                                <div key={category.id} className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Ordem: {category.display_order}</p>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900 group-hover:text-primary transition-colors">{category.name}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 font-bold uppercase">{products.filter(p => p.category_id === category.id).length} Produtos</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {modalOpen && (
                    <ProductModal
                        product={editingProduct}
                        categories={categories}
                        onClose={() => setModalOpen(false)}
                        onSave={fetchData}
                    />
                )}

                {categoryModalOpen && (
                    <CategoryModal
                        category={editingCategory}
                        onClose={() => setCategoryModalOpen(false)}
                        onSave={fetchData}
                    />
                )}
            </main>
        </div>
    )
}
