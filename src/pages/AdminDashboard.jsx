import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Power, Pizza, LayoutDashboard, LogOut, ChevronRight, Clock, MapPin, User, CheckCircle2, Package, Truck, XCircle, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import CategoryModal from '../components/CategoryModal'
import PixSettingsModal from '../components/PixSettingsModal'

export default function AdminDashboard() {
    const [view, setView] = useState('orders') // default to orders
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [pixModalOpen, setPixModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [flavors, setFlavors] = useState([])
    const [newFlavor, setNewFlavor] = useState('')

    const AVAILABLE_SIZES = ['Lata 350ml', '1 Litro', '1.5 Litro', '2 Litros']
    const navigate = useNavigate()
    const audioRef = useRef(null)

    useEffect(() => {
        checkUser()
        fetchData()

        // Real-time subscription for orders
        const channel = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
                // Fetch items for the new order to have the complete object
                const { data: newOrderWithItems } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', payload.new.id)
                    .single()

                if (newOrderWithItems) {
                    setOrders(prev => [newOrderWithItems, ...prev])
                    playNotification()
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
                setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        if (view === 'flavors') {
            fetchFlavors()
        }
    }, [view])

    async function fetchFlavors() {
        const { data } = await supabase.from('beverage_flavors').select('*').order('name')
        if (data) setFlavors(data)
    }

    const toggleFlavorStatus = async (flavor) => {
        const { error } = await supabase
            .from('beverage_flavors')
            .update({ is_active: !flavor.is_active })
            .eq('id', flavor.id)

        if (!error) fetchFlavors()
    }

    const toggleFlavorSize = async (flavor, size) => {
        const currentSizes = flavor.available_sizes || []
        let newSizes

        if (currentSizes.includes(size)) {
            newSizes = currentSizes.filter(s => s !== size)
        } else {
            newSizes = [...currentSizes, size]
        }

        const { error } = await supabase
            .from('beverage_flavors')
            .update({ available_sizes: newSizes })
            .eq('id', flavor.id)

        if (!error) fetchFlavors()
    }

    const addFlavor = async () => {
        if (!newFlavor.trim()) return
        const { error } = await supabase.from('beverage_flavors').insert({
            name: newFlavor.trim(),
            available_sizes: AVAILABLE_SIZES // Default to all sizes available
        })
        if (!error) {
            setNewFlavor('')
            fetchFlavors()
        }
    }

    const deleteFlavor = async (id) => {
        if (window.confirm('Tem certeza? Isso fará com que este sabor deixe de aparecer.')) {
            const { error } = await supabase.from('beverage_flavors').delete().eq('id', id)
            if (!error) fetchFlavors()
        }
    }

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) navigate('/admin')
    }

    async function fetchData() {
        try {
            const { data: catData } = await supabase.from('categories').select('*').order('display_order')
            const { data: prodData } = await supabase.from('products').select('*, product_prices(*)').order('name')
            const { data: orderData } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('sequential_num', { ascending: false })

            setCategories(catData || [])
            setProducts(prodData || [])
            setOrders(orderData || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const playNotification = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
            audio.play()
        } catch (e) {
            console.log('Audio play failed', e)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/admin')
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) console.error('Error updating status:', error)
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
        } else if (view === 'categories') {
            setEditingCategory(null)
            setCategoryModalOpen(true)
        }
    }

    const handleEdit = (item) => {
        if (view === 'products') {
            setEditingProduct(item)
            setModalOpen(true)
        } else if (view === 'categories') {
            setEditingCategory(item)
            setCategoryModalOpen(true)
        }
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pendente': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'preparando': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'entrega': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'entregue': return 'bg-green-100 text-green-700 border-green-200'
            case 'cancelado': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    )

    // ... existing modal logic ...

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col border-r-4 border-secondary shrink-0">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Pizza className="text-secondary w-6 h-6" />
                        <h1 className="font-black italic uppercase tracking-tighter text-lg">Admin Ramos</h1>
                    </div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Painel de Controle</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setView('orders')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'orders' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Package className="w-5 h-5" />
                        Pedidos
                        {orders.filter(o => o.status === 'pendente').length > 0 && (
                            <span className="ml-auto bg-secondary text-primary text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                {orders.filter(o => o.status === 'pendente').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setView('products')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'products' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Cardápio
                    </button>
                    <button
                        onClick={() => setView('flavors')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'flavors' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Sabores Bebidas
                    </button>
                    <button
                        onClick={() => setView('categories')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'categories' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
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
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <header className="bg-white border-b border-zinc-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">
                            {view === 'orders' ? 'Monitor de Pedidos' : view === 'products' ? 'Gestão do Cardápio' : view === 'flavors' ? 'Sabores de Bebidas' : 'Gestão de Categorias'}
                        </h2>
                        {view === 'orders' && (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Recebendo pedidos em tempo real</span>
                                </div>
                                <button
                                    onClick={() => setPixModalOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                                >
                                    <span className="text-lg">💠</span> Configurar PIX
                                </button>
                            </div>
                        )}
                    </div>
                    {view !== 'orders' && view !== 'flavors' && (
                        <button
                            onClick={handleAdd}
                            className="btn-primary flex items-center gap-2 py-2 px-4 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">{view === 'products' ? 'Novo Item' : 'Nova Categoria'}</span>
                        </button>
                    )}
                </header>

                <div className="p-6 lg:p-10 space-y-8 no-scrollbar">
                    {view === 'orders' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {orders.length === 0 ? (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                        <Package className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest italic">Nenhum pedido hoje</h3>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div
                                        key={order.id}
                                        className={`bg-white rounded-3xl overflow-hidden shadow-md border-2 transition-all hover:shadow-xl ${order.status === 'pendente' ? 'border-primary ring-4 ring-primary/5' : 'border-zinc-100'}`}
                                    >
                                        {/* Status Header */}
                                        <div className={`px-6 py-4 flex justify-between items-center border-b ${getStatusStyles(order.status)}`}>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">PEDIDO #{order.sequential_num || '...'} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">{order.status}</span>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Client & Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-zinc-400">
                                                        <User className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Cliente</span>
                                                    </div>
                                                    <p className="font-bold text-zinc-900 leading-tight">{order.user_name}</p>
                                                    <p className="text-xs text-secondary font-black">{order.user_phone}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-zinc-400">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Endereço</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-zinc-600 leading-tight">
                                                        {order.delivery_address.street}, {order.delivery_address.number}<br />
                                                        {order.delivery_address.neighborhood}
                                                    </p>
                                                    {order.delivery_address.reference && (
                                                        <p className="text-[10px] text-zinc-400 italic font-medium">Ref: {order.delivery_address.reference}</p>
                                                    )}
                                                    {order.delivery_address.location_link && (
                                                        <a
                                                            href={order.delivery_address.location_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase mt-1 hover:underline"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            Ver no Mapa
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="bg-zinc-50 rounded-2xl p-4 space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2 flex justify-between">
                                                    Itens do Pedido
                                                    <span>{order.order_items?.length || 0} itens</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    {(order.order_items || []).map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                                                            <div className="flex-1">
                                                                <span className="font-black text-primary mr-2 uppercase tracking-tighter text-xs">{item.quantity}X</span>
                                                                <span className="font-bold text-zinc-800 block">{item.observations}</span>
                                                                {item.product_description && (
                                                                    <p className="text-[10px] text-zinc-500 font-medium italic mt-0.5 mb-1 leading-tight">{item.product_description}</p>
                                                                )}
                                                                <span className="text-[10px] font-black text-secondary px-1 bg-secondary/10 rounded uppercase">{item.size_label}</span>
                                                            </div>
                                                            <span className="font-bold text-zinc-500 whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-2 border-t border-zinc-100 space-y-2">
                                                    <div className="flex justify-between items-center bg-zinc-100 p-2 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-zinc-800 capitalize flex items-center gap-1">
                                                                {order.payment_method === 'pix' && '💠 PIX'}
                                                                {order.payment_method === 'cartao' && '💳 Cartão'}
                                                                {order.payment_method === 'dinheiro' && '💵 Dinheiro'}
                                                            </span>
                                                            {order.change_for && (
                                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                                    {order.change_for}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pagamento</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-zinc-900 pt-1">
                                                        <span className="text-xs font-black uppercase tracking-widest">Total Geral</span>
                                                        <span className="text-xl font-black italic text-primary tracking-tighter">R$ {order.total?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'preparando')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${order.status === 'preparando' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-zinc-50 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Preparo</span>
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'entrega')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${order.status === 'entrega' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-zinc-50 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                                >
                                                    <Truck className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Entrega</span>
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'entregue')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${order.status === 'entregue' ? 'border-green-500 bg-green-50 text-green-600' : 'border-zinc-50 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Finalizar</span>
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelado')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${order.status === 'cancelado' ? 'border-red-500 bg-red-50 text-red-600' : 'border-zinc-50 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Cancelar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : view === 'products' ? (
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
                    ) : view === 'flavors' ? (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <input
                                    value={newFlavor}
                                    onChange={e => setNewFlavor(e.target.value)}
                                    placeholder="Novo Sabor (ex: Fanta Uva)"
                                    className="flex-1 p-3 rounded-xl border-2 border-zinc-100"
                                />
                                <button onClick={addFlavor} className="btn-primary px-6 rounded-xl font-bold">Adicionar</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {flavors.map(flavor => (
                                    <div key={flavor.id} className="bg-white border border-zinc-100 rounded-2xl p-4 hover:shadow-lg transition-all space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${flavor.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="font-bold text-zinc-800">{flavor.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleFlavorStatus(flavor)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${flavor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {flavor.is_active ? 'Ativo' : 'Pausado'}
                                                </button>
                                                <button
                                                    onClick={() => deleteFlavor(flavor.id)}
                                                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-zinc-100">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Tamanhos Disponíveis</p>
                                            <div className="flex flex-wrap gap-2">
                                                {AVAILABLE_SIZES.map(size => (
                                                    <label key={size} className="flex items-center gap-2 cursor-pointer bg-zinc-50 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={flavor.available_sizes?.includes(size)}
                                                            onChange={() => toggleFlavorSize(flavor, size)}
                                                            className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4"
                                                        />
                                                        <span className="text-xs font-bold text-zinc-600">{size}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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

                {/* Mobile Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-secondary flex justify-around p-2 z-[100] safe-bottom">
                    <button
                        onClick={() => setView('orders')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'orders' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <div className="relative">
                            <Package className="w-6 h-6" />
                            {orders.filter(o => o.status === 'pendente').length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                    {orders.filter(o => o.status === 'pendente').length}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Pedidos</span>
                    </button>
                    <button
                        onClick={() => setView('products')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'products' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
                    </button>
                    <button
                        onClick={() => setView('flavors')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'flavors' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sabores</span>
                    </button>
                    <button
                        onClick={() => setView('categories')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'categories' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <Pizza className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Categorias</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 p-2 text-zinc-500"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                    </button>
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

                <PixSettingsModal
                    isOpen={pixModalOpen}
                    onClose={() => setPixModalOpen(false)}
                />
            </main>
        </div>
    )
}
