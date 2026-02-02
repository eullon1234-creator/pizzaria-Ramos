import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Phone, User, Send, Clock, Info } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Checkout({ isOpen, onClose }) {
    const { cart, cartTotal, clearCart } = useCart()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        endereco: '',
        numero: '',
        bairro: '',
        pontoReferencia: '',
        tipoEntrega: 'imediata', // 'imediata' or 'agendada'
        horarioAgendado: ''
    })

    const PIZZARIA_WHATSAPP = "5586994471909"

    const checkBusinessHours = () => {
        const now = new Date()
        const day = now.getDay()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const currentTime = hours * 60 + minutes

        if (day === 1) return { open: false, reason: 'Estamos fechados hoje (Segunda-feira).' }

        const openTime = 18 * 60
        const closeTime = 23 * 60 + 30

        if (currentTime < openTime || currentTime > closeTime) {
            return { open: false, reason: 'Nosso horário de funcionamento é das 18:00 às 23:30.' }
        }

        return { open: true }
    }

    const generateOrderId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = 'RAMOS-'
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const handleSendOrder = async (e) => {
        e.preventDefault()

        const business = checkBusinessHours()
        if (!business.open && formData.tipoEntrega === 'imediata') {
            if (!window.confirm(`${business.reason}\n\nDeseja enviar o pedido assim mesmo?`)) {
                return
            }
        }

        setIsSaving(true)

        try {
            const orderId = generateOrderId()

            // 1. Save order to Supabase
            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    user_name: formData.nome,
                    user_phone: formData.whatsapp,
                    delivery_address: {
                        street: formData.endereco,
                        number: formData.numero,
                        neighborhood: formData.bairro,
                        reference: formData.pontoReferencia
                    },
                    delivery_type: formData.tipoEntrega,
                    scheduled_time: formData.horarioAgendado,
                    subtotal: cartTotal,
                    delivery_fee: 0,
                    total: cartTotal,
                    status: 'pendente'
                })

            if (orderError) throw orderError

            // 2. Save items to order_items
            const orderItems = cart.map(item => ({
                order_id: orderId,
                flavor_1_id: item.id.startsWith('half-') ? null : item.id, // Handle regular vs half/half
                item_type: item.id.startsWith('half-') ? 'meio-a-meio' : 'inteira',
                quantity: item.quantity,
                price: item.variation.price,
                size_label: item.variation.size,
                observations: item.name, // Store full name
                product_description: item.description // Store ingredients
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // 3. Prepare WhatsApp message
            let message = `*🍕 NOVO PEDIDO - PIZZARIA RAMOS*\n\n`
            message += `*PEDIDO:* #${orderId}\n`
            message += `*👤 CLIENTE:* ${formData.nome}\n`
            message += `*📱 WHATSAPP:* ${formData.whatsapp}\n\n`

            message += `*📍 ENDEREÇO DE ENTREGA:*\n`
            message += `${formData.endereco}, ${formData.numero}\n`
            message += `Bairro: ${formData.bairro}\n`
            if (formData.pontoReferencia) message += `Ref: ${formData.pontoReferencia}\n\n`

            message += `*🕒 ENTREGA:* ${formData.tipoEntrega === 'imediata' ? 'O mais rápido possível' : `Agendada para ${formData.horarioAgendado}`}\n\n`

            message += `*🛒 ITENS DO PEDIDO:*\n`
            message += cart.map(item => `• ${item.quantity}x ${item.name} (${item.variation.size}) - R$ ${(item.variation.price * item.quantity).toFixed(2)}`).join('\n')

            message += `\n\n*💵 RESUMO FINANCEIRO:*\n`
            message += `Subtotal: R$ ${cartTotal.toFixed(2)}\n`
            message += `Entrega: Grátis\n`
            message += `*TOTAL: R$ ${cartTotal.toFixed(2)}*`

            const encoded = encodeURIComponent(message)
            window.open(`https://wa.me/${PIZZARIA_WHATSAPP}?text=${encoded}`, '_blank')

            // 4. Cleanup
            clearCart()
            onClose()
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Ops! Tivemos um problema ao processar seu pedido. Por favor, tente novamente.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 bg-primary text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">Finalizar Pedido</h2>
                                <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Quase lá! Só precisamos do endereço.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSendOrder} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {/* Identificação */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <User className="w-5 h-5" />
                                    <h3 className="font-black uppercase italic text-sm tracking-wider">Identificação</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Seu Nome</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.nome}
                                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                            placeholder="Como podemos te chamar?"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">WhatsApp</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                            placeholder="(86) 9...."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex items-center gap-2 text-primary">
                                    <MapPin className="w-5 h-5" />
                                    <h3 className="font-black uppercase italic text-sm tracking-wider">Endereço de Entrega</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3 space-y-1">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Rua / Avenida</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.endereco}
                                                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                                placeholder="Nome da rua"
                                            />
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nº</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.numero}
                                                onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Bairro</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.bairro}
                                                onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                                placeholder="Ex: Centro"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Referência (Opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.pontoReferencia}
                                                onChange={e => setFormData({ ...formData, pontoReferencia: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                                placeholder="Perto de onde?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agendamento */}
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex items-center gap-2 text-primary">
                                    <Clock className="w-5 h-5" />
                                    <h3 className="font-black uppercase italic text-sm tracking-wider">Agendamento</h3>
                                </div>
                                <div className="flex gap-4">
                                    <label className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.tipoEntrega === 'imediata' ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50 opacity-60'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            value="imediata"
                                            checked={formData.tipoEntrega === 'imediata'}
                                            onChange={e => setFormData({ ...formData, tipoEntrega: e.target.value })}
                                        />
                                        <span className="block font-black text-xs uppercase tracking-tighter">Imediata</span>
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase mt-1 italic text-secondary">O mais rápido</span>
                                    </label>
                                    <label className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.tipoEntrega === 'agendada' ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50 opacity-60'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            value="agendada"
                                            checked={formData.tipoEntrega === 'agendada'}
                                            onChange={e => setFormData({ ...formData, tipoEntrega: e.target.value })}
                                        />
                                        <span className="block font-black text-xs uppercase tracking-tighter">Agendar</span>
                                        <input
                                            type="time"
                                            disabled={formData.tipoEntrega !== 'agendada'}
                                            value={formData.horarioAgendado}
                                            onChange={e => setFormData({ ...formData, horarioAgendado: e.target.value })}
                                            className="mt-1 bg-transparent w-full text-xs font-bold focus:outline-none"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Resumo */}
                            <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-2">
                                <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>R$ {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase tracking-widest">
                                    <span>Entrega</span>
                                    <span className="text-secondary">Grátis</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                                    <span className="font-black uppercase italic tracking-tighter text-lg">Total do Pedido</span>
                                    <span className="text-2xl font-black text-secondary italic">R$ {cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all shadow-green-600/20 active:scale-95 ${isSaving ? 'bg-zinc-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6" />
                                        Enviar Pedido ao WhatsApp
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
