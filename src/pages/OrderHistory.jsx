import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Package, Truck, CheckCircle, XCircle, RefreshCw, Calendar, MapPin, CreditCard, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'pending', 'delivered'
    const { addToCart } = useCart()
    const { user, isLoggedIn } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            if (!isLoggedIn || !user) {
                alert('Você precisa estar logado para ver seus pedidos')
                navigate('/')
                return
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setOrders(data || [])
        } catch (error) {
            console.error('❌ Erro ao buscar pedidos:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                label: 'Pendente',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200'
            },
            preparing: {
                icon: Package,
                label: 'Preparando',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200'
            },
            delivering: {
                icon: Truck,
                label: 'Em Entrega',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200'
            },
            delivered: {
                icon: CheckCircle,
                label: 'Entregue',
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200'
            },
            cancelled: {
                icon: XCircle,
                label: 'Cancelado',
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200'
            }
        }
        return configs[status] || configs.pending
    }

    const handleRepeatOrder = (order) => {
        try {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            
            // Adicionar todos os itens ao carrinho
            items.forEach(item => {
                const product = {
                    id: item.product_id || Math.random().toString(),
                    name: item.name,
                    product_prices: [{ 
                        id: Math.random().toString(), 
                        size: item.size, 
                        price: item.price 
                    }]
                }
                const variation = { 
                    id: Math.random().toString(), 
                    size: item.size, 
                    price: item.price 
                }
                
                for (let i = 0; i < item.quantity; i++) {
                    addToCart(product, variation)
                }
            })

            // Redirecionar para o carrinho
            navigate('/')
            window.scrollTo(0, 0)
        } catch (error) {
            console.error('❌ Erro ao repetir pedido:', error)
            alert('Erro ao adicionar itens ao carrinho')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(order => {
            if (filter === 'delivered') return order.status === 'delivered'
            if (filter === 'pending') return ['pending', 'preparing', 'delivering'].includes(order.status)
            return true
        })

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 pt-20 pb-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-zinc-900 mb-2">
                        📜 Meus Pedidos
                    </h1>
                    <p className="text-zinc-500">Acompanhe o status de todos os seus pedidos</p>
                </motion.div>

                {/* Filtros */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-3 mb-8 overflow-x-auto pb-2"
                >
                    {[
                        { value: 'all', label: 'Todos', count: orders.length },
                        { value: 'pending', label: 'Em Andamento', count: orders.filter(o => ['pending', 'preparing', 'delivering'].includes(o.status)).length },
                        { value: 'delivered', label: 'Entregues', count: orders.filter(o => o.status === 'delivered').length }
                    ].map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                                filter === btn.value
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                            {btn.label}
                            {btn.count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    filter === btn.value ? 'bg-white/20' : 'bg-zinc-200'
                                }`}>
                                    {btn.count}
                                </span>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Lista de Pedidos */}
                {filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <Package className="w-20 h-20 mx-auto text-zinc-300 mb-4" />
                        <h3 className="text-2xl font-bold text-zinc-400 mb-2">
                            Nenhum pedido encontrado
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            {filter === 'all' 
                                ? 'Você ainda não fez nenhum pedido' 
                                : 'Nenhum pedido nesta categoria'}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all"
                        >
                            Fazer Primeiro Pedido
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order, index) => {
                            const statusConfig = getStatusConfig(order.status)
                            const StatusIcon = statusConfig.icon
                            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-zinc-100 hover:border-zinc-200 transition-all"
                                >
                                    {/* Header do Card */}
                                    <div className="p-6 border-b border-zinc-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-zinc-900 mb-1">
                                                    {order.order_number}
                                                </h3>
                                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} border-2`}>
                                                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                                                <span className={`font-bold ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Informações de Entrega */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-zinc-700">Endereço:</p>
                                                    <p className="text-zinc-600">{order.customer_address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Phone className="w-4 h-4 text-primary mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-zinc-700">Contato:</p>
                                                    <p className="text-zinc-600">{order.customer_phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itens do Pedido */}
                                    <div className="p-6 bg-zinc-50">
                                        <h4 className="font-bold text-zinc-700 mb-3">Itens do Pedido:</h4>
                                        <div className="space-y-2">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl">
                                                    <div>
                                                        <span className="font-semibold text-zinc-900">{item.quantity}x</span>
                                                        <span className="ml-2 text-zinc-700">{item.name}</span>
                                                        <span className="ml-2 text-zinc-500 text-sm">({item.size})</span>
                                                    </div>
                                                    <span className="font-bold text-primary">
                                                        R$ {(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer do Card */}
                                    <div className="p-6 bg-white border-t border-zinc-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="capitalize">{order.payment_method}</span>
                                                    {order.payment_change && (
                                                        <span className="text-zinc-500">
                                                            • Troco: R$ {order.payment_change.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-black text-primary">
                                                    Total: R$ {order.total_amount.toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRepeatOrder(order)}
                                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Pedir Novamente
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
