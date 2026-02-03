import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Power, Pizza, LayoutDashboard, LogOut, ChevronRight, Clock, MapPin, User, CheckCircle2, Package, Truck, XCircle, Bell, QrCode, DollarSign, Save, Upload, TrendingUp, Search, MessageCircle, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import CategoryModal from '../components/CategoryModal'
import PixSettingsModal from '../components/PixSettingsModal'
import BusinessHoursModal from '../components/BusinessHoursModal'
import StatsDashboard from '../components/StatsDashboard'

export default function AdminDashboard() {
    const [view, setView] = useState('stats') // Ver estatísticas primeiro ao entrar na gerência
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [pixModalOpen, setPixModalOpen] = useState(false)
    const [businessHoursModalOpen, setBusinessHoursModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [flavors, setFlavors] = useState([])
    const [newFlavor, setNewFlavor] = useState('')
    const [pixSettings, setPixSettings] = useState(null)
    const [savingPix, setSavingPix] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [currentTime, setCurrentTime] = useState(new Date())

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

        // Update clock every minute for timers
        const timerInterval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(timerInterval)
        }
    }, [])

    useEffect(() => {
        if (view === 'flavors') {
            fetchFlavors()
        } else if (view === 'pix') {
            fetchPixSettings()
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

    async function fetchPixSettings() {
        const { data } = await supabase.from('pix_settings').select('*').limit(1).single()
        if (data) {
            setPixSettings(data)
        } else {
            // Create default if doesn't exist
            const { data: newData } = await supabase
                .from('pix_settings')
                .insert({
                    pix_key: '',
                    is_active: true,
                    holder_name: '',
                    bank_name: '',
                    key_type: 'cpf'
                })
                .select()
                .single()
            setPixSettings(newData)
        }
    }

    const updatePixSettings = async () => {
        if (!pixSettings) return
        setSavingPix(true)
        const { error } = await supabase
            .from('pix_settings')
            .update({
                pix_key: pixSettings.pix_key,
                qr_code_url: pixSettings.qr_code_url,
                is_active: pixSettings.is_active,
                holder_name: pixSettings.holder_name,
                bank_name: pixSettings.bank_name,
                key_type: pixSettings.key_type
            })
            .eq('id', pixSettings.id)

        if (!error) {
            alert('✅ Configurações PIX salvas com sucesso!')
        } else {
            alert('❌ Erro ao salvar configurações PIX')
        }
        setSavingPix(false)
    }

    const handleQrCodeUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `qr-code-${Date.now()}.${fileExt}`
            const filePath = `pix/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            setPixSettings({ ...pixSettings, qr_code_url: publicUrl })
        } catch (error) {
            console.error('Error uploading QR Code:', error)
            alert('Erro ao fazer upload do QR Code')
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

    const getTimeElapsed = (createdAt) => {
        const diff = currentTime - new Date(createdAt)
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Agora'
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const getTimerColor = (createdAt, status) => {
        if (status === 'entregue' || status === 'cancelado') return 'text-zinc-400'
        const diff = currentTime - new Date(createdAt)
        const minutes = Math.floor(diff / 60000)

        if (minutes > 50) return 'text-red-500 font-black animate-pulse'
        if (minutes > 30) return 'text-orange-500 font-bold'
        return 'text-green-600 font-bold'
    }

    const sendWhatsAppMessage = (phone, name, type) => {
        let message = ''
        const cleanPhone = phone.replace(/\D/g, '')

        if (type === 'saida') {
            message = `Olá ${name}! Seu pedido da Ramos Pizza acabou de sair para entrega! 🛵💨`
        } else if (type === 'pronto') {
            message = `Olá ${name}! Seu pedido já está pronto e aguardando para ser entregue/retirado! 🍕✅`
        }

        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user_phone?.includes(searchQuery) ||
            order.sequential_num?.toString().includes(searchQuery)

        const matchesStatus = statusFilter === 'todos' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    )

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
                        onClick={() => setView('stats')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        Estatísticas
                    </button>
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
                    <button
                        onClick={() => setView('pix')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'pix' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <QrCode className="w-5 h-5" />
                        Configurar PIX
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
                            {view === 'orders' ? 'Monitor de Pedidos' : view === 'products' ? 'Gestão do Cardápio' : view === 'flavors' ? 'Sabores de Bebidas' : view === 'pix' ? 'Configurações PIX' : view === 'stats' ? 'Dashboard Gerencial' : 'Gestão de Categorias'}
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
                                    onClick={() => setBusinessHoursModalOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Clock className="w-4 h-4" /> Horários de Funcionamento
                                </button>
                            </div>
                        )}
                    </div>
                    {view !== 'orders' && view !== 'flavors' && view !== 'pix' && (
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
                    {view === 'stats' ? (
                        <StatsDashboard />
                    ) : view === 'orders' ? (
                        <div className="space-y-6">
                            {/* Controls Row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
                                <div className="flex-1 min-w-[300px] relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente, pedido ou telefone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-700"
                                    />
                                </div>
                                <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar max-w-full">
                                    {[
                                        { id: 'todos', label: 'Todos' },
                                        { id: 'pendente', label: 'Pendentes' },
                                        { id: 'preparando', label: 'Cozinha' },
                                        { id: 'entrega', label: 'Entrega' },
                                        { id: 'entregue', label: 'Concluídos' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setStatusFilter(f.id)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === f.id ? 'bg-white shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {filteredOrders.length === 0 ? (
                                    <div className="col-span-full py-20 text-center space-y-4">
                                        <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                            <Package className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest italic">Nenhum pedido hoje</h3>
                                    </div>
                                ) : (
                                    filteredOrders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`bg-white rounded-3xl overflow-hidden shadow-md border-2 transition-all hover:shadow-xl ${order.status === 'pendente' ? 'border-primary ring-4 ring-primary/5 animate-pulse-subtle' : 'border-zinc-100'}`}
                                        >
                                            <style dangerouslySetInnerHTML={{
                                                __html: `
                                            @keyframes pulse-subtle {
                                                0%, 100% { opacity: 1; transform: scale(1); }
                                                50% { opacity: 0.98; transform: scale(0.995); }
                                            }
                                            .animate-pulse-subtle {
                                                animation: pulse-subtle 2s infinite ease-in-out;
                                            }
                                        ` }} />
                                            <div className={`px-6 py-4 flex justify-between items-center border-b ${getStatusStyles(order.status)}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-xs font-black uppercase tracking-[0.2em]">PEDIDO #{order.sequential_num || '...'} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className={`px-3 py-1 bg-white/50 rounded-full text-[10px] font-black uppercase tracking-widest ${getTimerColor(order.created_at, order.status)}`}>
                                                        ⏱️ {getTimeElapsed(order.created_at)}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{order.status}</span>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-zinc-400">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Cliente</span>
                                                        </div>
                                                        <p className="font-bold text-zinc-900 leading-tight">{order.user_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-secondary font-black">{order.user_phone}</p>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => sendWhatsAppMessage(order.user_phone, order.user_name, 'pronto')}
                                                                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                    title="Avisar que está pronto"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => sendWhatsAppMessage(order.user_phone, order.user_name, 'saida')}
                                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                    title="Avisar que saiu para entrega"
                                                                >
                                                                    <Truck className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
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
                    ) : view === 'pix' ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {pixSettings && (
                                <>
                                    {/* QR Code Section */}
                                    <div className="bg-white border border-zinc-100 rounded-3xl p-8 space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                                            <div className="bg-primary/10 p-3 rounded-xl">
                                                <QrCode className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">QR Code PIX</h3>
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Imagem que o cliente vai escanear</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-6">
                                            {pixSettings.qr_code_url ? (
                                                <div className="relative group">
                                                    <img
                                                        src={pixSettings.qr_code_url}
                                                        alt="QR Code PIX"
                                                        className="w-64 h-64 object-contain border-4 border-zinc-100 rounded-2xl bg-white shadow-lg"
                                                    />
                                                    <button
                                                        onClick={() => setPixSettings({ ...pixSettings, qr_code_url: '' })}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-64 h-64 border-4 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center bg-zinc-50">
                                                    <div className="text-center space-y-2">
                                                        <QrCode className="w-16 h-16 text-zinc-300 mx-auto" />
                                                        <p className="text-sm text-zinc-400 font-bold">Nenhum QR Code</p>
                                                    </div>
                                                </div>
                                            )}

                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleQrCodeUpload}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors shadow-sm">
                                                    <Upload className="w-5 h-5" />
                                                    {pixSettings.qr_code_url ? 'Trocar QR Code' : 'Fazer Upload do QR Code'}
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* PIX Details Section */}
                                    <div className="bg-white border border-zinc-100 rounded-3xl p-8 space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                                            <div className="bg-secondary/10 p-3 rounded-xl">
                                                <DollarSign className="w-6 h-6 text-secondary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Detalhes do PIX</h3>
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Informações para transferência</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tipo de Chave</label>
                                                <select
                                                    value={pixSettings.key_type}
                                                    onChange={(e) => setPixSettings({ ...pixSettings, key_type: e.target.value })}
                                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-zinc-700"
                                                >
                                                    <option value="cpf">CPF</option>
                                                    <option value="cnpj">CNPJ</option>
                                                    <option value="email">E-mail</option>
                                                    <option value="phone">Telefone</option>
                                                    <option value="random">Chave Aleatória</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Chave PIX</label>
                                                <input
                                                    type="text"
                                                    value={pixSettings.pix_key}
                                                    onChange={(e) => setPixSettings({ ...pixSettings, pix_key: e.target.value })}
                                                    placeholder="Sua chave..."
                                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-zinc-700"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nome do Titular</label>
                                                <input
                                                    type="text"
                                                    value={pixSettings.holder_name}
                                                    onChange={(e) => setPixSettings({ ...pixSettings, holder_name: e.target.value })}
                                                    placeholder="Nome completo..."
                                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-zinc-700"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Banco</label>
                                                <input
                                                    type="text"
                                                    value={pixSettings.bank_name}
                                                    onChange={(e) => setPixSettings({ ...pixSettings, bank_name: e.target.value })}
                                                    placeholder="Ex: Nubank, Inter..."
                                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-zinc-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${pixSettings.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-sm font-bold text-zinc-700">
                                                    PIX está {pixSettings.is_active ? 'ATIVO' : 'DESATIVADO'} no checkout
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setPixSettings({ ...pixSettings, is_active: !pixSettings.is_active })}
                                                className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors ${pixSettings.is_active
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {pixSettings.is_active ? 'Desativar' : 'Ativar'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={updatePixSettings}
                                        disabled={savingPix}
                                        className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${savingPix
                                            ? 'bg-zinc-400 cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-red-900 active:scale-95 shadow-primary/20'
                                            }`}
                                    >
                                        {savingPix ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-6 h-6" />
                                                Salvar Configurações PIX
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
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
                        onClick={() => setView('stats')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'stats' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Stats</span>
                    </button>
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
                        onClick={() => setView('pix')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'pix' ? 'text-secondary scale-110' : 'text-zinc-500'}`}
                    >
                        <QrCode className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">PIX</span>
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

                {/* redundant - removing pix modal usage for now as we have full page view 
                {pixModalOpen && (
                    <PixSettingsModal
                        isOpen={pixModalOpen}
                        onClose={() => setPixModalOpen(false)}
                    />
                )}
                */}

                {businessHoursModalOpen && (
                    <BusinessHoursModal
                        isOpen={businessHoursModalOpen}
                        onClose={() => setBusinessHoursModalOpen(false)}
                    />
                )}
            </main>
        </div>
    )
}
