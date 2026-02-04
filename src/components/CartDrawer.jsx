import React, { useState } from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import Checkout from './Checkout'

export default function CartDrawer() {
    const { cart, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart()
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-150"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-160 shadow-2xl flex flex-col"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cart-title"
                        >
                            <div className="p-6 bg-primary text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="w-6 h-6 text-secondary" />
                                    <h2 id="cart-title" className="text-xl font-black uppercase tracking-tighter">Seu Carrinho</h2>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Fechar carrinho">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
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
                                            <div className="w-20 h-20 bg-zinc-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag className="w-8 h-8 text-zinc-200" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-zinc-900">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.variation.id)}
                                                        className="text-zinc-300 hover:text-red-500 transition-colors"
                                                        aria-label={`Remover ${item.name} do carrinho`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-zinc-400 font-black uppercase mb-4 tracking-widest">{item.variation.size}</p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center border border-zinc-200 rounded-lg gap-4 px-2 py-1">
                                                        <button onClick={() => updateQuantity(item.id, item.variation.id, -1)} className="text-zinc-500 hover:text-primary transition-colors" aria-label="Diminuir quantidade"><Minus className="w-4 h-4" /></button>
                                                        <span className="font-bold min-w-5 text-center" aria-live="polite">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.variation.id, 1)} className="text-zinc-500 hover:text-primary transition-colors" aria-label="Aumentar quantidade"><Plus className="w-4 h-4" /></button>
                                                    </div>
                                                    <span className="font-black text-primary italic">R$ {(item.variation.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 border-t border-zinc-100 space-y-4 bg-zinc-50">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Subtotal</span>
                                        <span className="text-2xl font-black text-primary italic">R$ {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsCheckoutOpen(true)}
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all group"
                                    >
                                        Continuar
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
        </>
    )
}
