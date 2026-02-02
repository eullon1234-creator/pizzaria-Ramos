import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, User, Send, Clock, LocateFixed } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Checkout({ isOpen, onClose }) {
    const { cart, cartTotal, clearCart } = useCart()
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        endereco: '',
        numero: '',
        bairro: '',
        pontoReferencia: '',
        locationLink: '',
        tipoEntrega: 'imediata', // 'imediata' or 'agendada'
        horarioAgendado: '',
        paymentMethod: 'pix', // 'pix', 'dinheiro', 'cartao'
        needChange: false,
        changeFor: ''
    })

    const PIZZARIA_WHATSAPP = "5586994471909"

    const checkBusinessHours = () => {
        const now = new Date()
        const day = now.getDay()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const currentTime = hours * 60 + minutes

        // Sunday = 0, Monday = 1, ...
        // If today is Monday, closed
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

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Seu navegador não suporta geolocalização.')
            return
        }

        setIsLoadingLocation(true)

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`

            try {
                // Reverse geocoding with OpenStreetMap
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await response.json()

                if (data && data.address) {
                    const address = data.address
                    const street = address.road || ''
                    const neighborhood = address.suburb || address.neighbourhood || address.residential || ''
                    const number = address.house_number || ''

                    setFormData(prev => ({
                        ...prev,
                        endereco: street,
                        bairro: neighborhood,
                        numero: number,
                        locationLink: googleMapsLink
                    }))
                } else {
                    setFormData(prev => ({
                        ...prev,
                        locationLink: googleMapsLink
                    }))
                }
            } catch (error) {
                console.error('Error fetching address:', error)
                setFormData(prev => ({
                    ...prev,
                    locationLink: googleMapsLink
                }))
            } finally {
                setIsLoadingLocation(false)
            }
        }, (error) => {
            console.error('Geolocation error:', error)
            alert('Não foi possível obter sua localização. Verifique se o GPS está ativado.')
            setIsLoadingLocation(false)
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        })
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
                        reference: formData.pontoReferencia,
                        location_link: formData.locationLink
                    },
                    delivery_type: formData.tipoEntrega,
                    scheduled_time: formData.horarioAgendado,
                    subtotal: cartTotal,
                    delivery_fee: 0,
                    total: cartTotal,
                    status: 'pendente',
                    payment_method: formData.paymentMethod,
                    change_for: formData.needChange ? `Troco para R$ ${formData.changeFor}` : null
                })

            if (orderError) throw orderError

            // 2. Save items to order_items
            const orderItems = cart.map(item => {
                let productId = item.id
                if (!item.id.startsWith('half-') && item.id.length > 36) {
                    productId = item.id.substring(0, 36)
                }

                return {
                    order_id: orderId,
                    flavor_1_id: item.id.startsWith('half-') ? null : productId,
                    item_type: item.id.startsWith('half-') ? 'meio-a-meio' : 'inteira',
                    quantity: item.quantity,
                    price: item.variation.price,
                    size_label: item.variation.size,
                    observations: item.name,
                    product_description: item.description
                }
            })

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
            if (formData.pontoReferencia) message += `Ref: ${formData.pontoReferencia}\n`
            if (formData.locationLink) message += `🗺️ *Localização:* ${formData.locationLink}\n`
            message += `\n`

            message += `*🕒 ENTREGA:* ${formData.tipoEntrega === 'imediata' ? 'Imediata (45min - 1h30min)' : `Agendada para ${formData.horarioAgendado}`}\n\n`

            message += `*🛒 ITENS DO PEDIDO:*\n`
            message += cart.map(item => `• ${item.quantity}x ${item.name} (${item.variation.size}) - R$ ${(item.variation.price * item.quantity).toFixed(2)}`).join('\n')

            message += `\n\n*💵 PAGAMENTO:*\n`
            message += `Forma: ${formData.paymentMethod === 'pix' ? 'PIX' : formData.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}\n`
            if (formData.paymentMethod === 'dinheiro') {
                message += `Troco: ${formData.needChange ? `Para R$ ${formData.changeFor}` : 'Não precisa'}\n`
            }

            message += `\n*RESUMO FINANCEIRO:*\n`
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary">
                                        <MapPin className="w-5 h-5" />
                                        <h3 className="font-black uppercase italic text-sm tracking-wider">Endereço de Entrega</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={isLoadingLocation}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        {isLoadingLocation ? (
                                            <span className="block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                                        ) : (
                                            <LocateFixed className="w-3 h-3" />
                                        )}
                                        {isLoadingLocation ? 'Buscando...' : 'Usar Localização Atual'}
                                    </button>
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

                                    {formData.locationLink && (
                                        <div className="bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-green-700 animate-in fade-in slide-in-from-top-1">
                                            <LocateFixed className="w-3 h-3" />
                                            <span className="font-bold">Localização anexada ao pedido! ({formData.locationLink})</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, locationLink: '' })}
                                                className="ml-auto text-green-600 hover:text-green-800"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagamento */}
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex items-center gap-2 text-primary">
                                    <div className="text-xl font-black">$</div>
                                    <h3 className="font-black uppercase italic text-sm tracking-wider">Forma de Pagamento</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['pix', 'dinheiro', 'cartao'].map(method => (
                                        <label
                                            key={method}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formData.paymentMethod === method
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                                                : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={formData.paymentMethod === method}
                                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="hidden"
                                            />
                                            <span className="text-lg">
                                                {method === 'pix' && '💠'}
                                                {method === 'dinheiro' && '💵'}
                                                {method === 'cartao' && '💳'}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                {method === 'cartao' ? 'Cartão' : method}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {formData.paymentMethod === 'dinheiro' && (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-orange-900 uppercase">Precisa de troco?</span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, needChange: false })}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${!formData.needChange ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
                                                >
                                                    Não
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, needChange: true })}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${formData.needChange ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
                                                >
                                                    Sim
                                                </button>
                                            </div>
                                        </div>

                                        {formData.needChange && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest ml-1">Troco para quanto?</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        value={formData.changeFor}
                                                        onChange={e => setFormData({ ...formData, changeFor: e.target.value })}
                                                        className="w-full bg-white border border-orange-100 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-orange-200 text-orange-900 font-bold"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                        <span className="block text-[10px] text-zinc-400 font-bold mt-0.5">Previsão: 45min - 1h30min</span>
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
