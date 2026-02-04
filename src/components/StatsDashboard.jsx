import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Clock,
    Pizza,
    CreditCard,
    ChevronRight,
    Filter
} from 'lucide-react'

export default function StatsDashboard() {
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30d') // 'today', '7d', '30d', 'all'
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        ticketMedio: 0,
        canceledOrders: 0,
        topProducts: [],
        salesByDay: [],
        salesByHour: [],
        paymentMethods: []
    })

    useEffect(() => {
        fetchStats()
    }, [period])

    const fetchStats = async () => {
        setLoading(true)
        try {
            let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: true })

            const now = new Date()
            if (period === 'today') {
                const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
                query = query.gte('created_at', startOfDay)
            } else if (period === '7d') {
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString()
                query = query.gte('created_at', sevenDaysAgo)
            } else if (period === '30d') {
                const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString()
                query = query.gte('created_at', thirtyDaysAgo)
            }

            const { data: orders, error } = await query

            if (error) throw error

            processStats(orders || [])
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const processStats = (orders) => {
        const completedOrders = orders.filter(o => o.status !== 'cancelado')
        const canceledOrders = orders.filter(o => o.status === 'cancelado').length

        const totalRevenue = completedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
        const totalOrders = completedOrders.length
        const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Process Top Products
        const productMap = {}
        completedOrders.forEach(order => {
            (order.order_items || []).forEach(item => {
                const name = item.observations || 'Produto sem nome'
                if (!productMap[name]) {
                    productMap[name] = { name, count: 0, revenue: 0 }
                }
                productMap[name].count += item.quantity || 0
                productMap[name].revenue += (parseFloat(item.price) * (item.quantity || 0)) || 0
            })
        })
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // Process Sales by Day of Week
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        const dayMap = days.map(day => ({ day, count: 0 }))
        completedOrders.forEach(order => {
            const dayIndex = new Date(order.created_at).getDay()
            dayMap[dayIndex].count++
        })

        // Process Sales by Hour
        const hourMap = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, count: 0 }))
        completedOrders.forEach(order => {
            const hour = new Date(order.created_at).getHours()
            hourMap[hour].count++
        })
        // Filter hours with 0 sales for a cleaner look if today, otherwise show evening peak
        const peakHours = hourMap.filter(h => parseInt(h.hour) >= 17 || h.count > 0)

        // Payment Methods
        const paymentMap = {}
        completedOrders.forEach(order => {
            const method = order.payment_method || 'Não inf.'
            paymentMap[method] = (paymentMap[method] || 0) + 1
        })
        const paymentMethods = Object.entries(paymentMap).map(([method, count]) => ({
            method: method === 'pix' ? 'PIX' : method === 'dinheiro' ? 'Dinheiro' : method === 'cartao' ? 'Cartão' : method,
            count,
            percentage: (count / totalOrders) * 100
        }))

        setStats({
            totalRevenue,
            totalOrders,
            ticketMedio,
            canceledOrders,
            topProducts,
            salesByDay: dayMap,
            salesByHour: peakHours,
            paymentMethods
        })
    }

    const StatCard = ({ title, value, icon: Icon, color, detail }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between"
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {detail && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        {detail}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{title}</p>
                <h3 className="text-2xl font-black italic tracking-tighter text-zinc-900">{value}</h3>
            </div>
        </motion.div>
    )

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-2xl text-zinc-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Período</span>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1">
                    {[
                        { id: 'today', label: 'Hoje' },
                        { id: '7d', label: '7 Dias' },
                        { id: '30d', label: '30 Dias' },
                        { id: 'all', label: 'Tudo' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Faturamento"
                    value={`R$ ${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-green-500"
                    detail="+12%"
                />
                <StatCard
                    title="Pedidos"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-primary"
                    detail="+5%"
                />
                <StatCard
                    title="Ticket Médio"
                    value={`R$ ${stats.ticketMedio.toFixed(2)}`}
                    icon={TrendingUp}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Cancelados"
                    value={stats.canceledOrders}
                    icon={XCircleIcon}
                    color="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-zinc-100 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                        <Pizza className="text-secondary w-6 h-6" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Mais Vendidos</h3>
                    </div>
                    <div className="space-y-6">
                        {stats.topProducts.map((prod, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-zinc-800">{prod.name}</span>
                                    <span className="font-black text-primary">{prod.count} un.</span>
                                </div>
                                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(prod.count / stats.topProducts[0].count) * 100}%` }}
                                        className="h-full bg-primary rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Receita: R$ {prod.revenue.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Sales by Hour */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-zinc-100 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                        <Clock className="text-blue-500 w-6 h-6" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Horário de Pico</h3>
                    </div>
                    <div className="h-64 flex items-end gap-2 px-2">
                        {stats.salesByHour.map((hour, idx) => {
                            const maxCount = Math.max(...stats.salesByHour.map(h => h.count), 1)
                            const height = (hour.count / maxCount) * 100
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={`w-full rounded-t-lg transition-all ${hour.count === maxCount ? 'bg-primary' : 'bg-zinc-100 group-hover:bg-zinc-200'}`}
                                        >
                                            {hour.count > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {hour.count} ped.
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-zinc-400 rotate-45 md:rotate-0 mt-2">{hour.hour}</span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales by Weekday */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-zinc-100 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                        <Calendar className="text-secondary w-6 h-6" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Dias Mais Pedidos</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.salesByDay.map((day, idx) => {
                            const maxCount = Math.max(...stats.salesByDay.map(d => d.count), 1)
                            const percentage = (day.count / maxCount) * 100
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="w-10 text-[10px] font-black uppercase text-zinc-400 tracking-widest">{day.day}</span>
                                    <div className="flex-1 h-8 bg-zinc-50 rounded-xl overflow-hidden p-1">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className={`h-full rounded-lg flex items-center justify-end px-3 ${day.count === maxCount ? 'bg-secondary text-primary' : 'bg-zinc-200 text-zinc-500'}`}
                                        >
                                            {day.count > 0 && <span className="text-[10px] font-black leading-none">{day.count}</span>}
                                        </motion.div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Payment methods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-zinc-100 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                        <CreditCard className="text-primary w-6 h-6" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Métodos de Pagamento</h3>
                    </div>
                    <div className="space-y-6">
                        {stats.paymentMethods.map((method, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{method.method === 'PIX' ? '💠' : method.method === 'Dinheiro' ? '💵' : '💳'}</span>
                                        <span className="font-bold text-zinc-800">{method.method}</span>
                                    </div>
                                    <span className="font-black text-zinc-900">{method.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${method.percentage}%` }}
                                        className={`h-full rounded-full ${method.method === 'PIX' ? 'bg-blue-500' : method.method === 'Dinheiro' ? 'bg-green-500' : 'bg-primary'}`}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-right">{method.count} pedidos</p>
                            </div>
                        ))}
                        {stats.paymentMethods.length === 0 && (
                            <div className="py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                                Sem dados de pagamento
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function XCircleIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    )
}
