import React from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
    const { cart, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart()

    const PIZZARIA_WHATSAPP = "558699958948"

    const handleCheckout = () => {
        let message = `*🍕 NOVO PEDIDO - PIZZARIA RAMOS*\n\n`
        message += cart.map(item => `• ${item.quantity}x ${item.name} (${item.variation.size}) - R$ ${(item.variation.price * item.quantity).toFixed(2)}`).join('\n')
        message += `\n\n*💰 TOTAL: R$ ${cartTotal.toFixed(2)}*`
        message += `\n\n_Por favor, informe seu endereço de entrega abaixo:_`

        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/${PIZZARIA_WHATSAPP}?text=${encoded}`, '_blank')
    }

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[160] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 bg-primary text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-secondary" />
                                <h2 className="text-xl font-black uppercase tracking-tighter">Seu Carrinho</h2>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
                                    <ShoppingBag className="w-16 h-16 stroke-1 italic" />
                                    <p className="font-medium">Seu carrinho está vazio</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Ver cardápio
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={`${item.id}-${item.variation.id}`} className="flex gap-4 border-b border-zinc-100 pb-6">
                                        <div className="w-20 h-20 bg-zinc-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                                            <Pizza className="w-8 h-8 text-zinc-300" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-zinc-900">{item.name}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.variation.id)}
                                                    className="text-zinc-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase mb-4">{item.variation.size}</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center border border-zinc-200 rounded-lg gap-4 px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.id, item.variation.id, -1)} className="text-zinc-500 hover:text-primary"><Minus className="w-4 h-4" /></button>
                                                    <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.variation.id, 1)} className="text-zinc-500 hover:text-primary"><Plus className="w-4 h-4" /></button>
                                                </div>
                                                <span className="font-black text-primary">R$ {(item.variation.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-zinc-100 space-y-4 bg-zinc-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Subtotal</span>
                                    <span className="text-2xl font-black text-primary">R$ {cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                    Finalizar no WhatsApp
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
