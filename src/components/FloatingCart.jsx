import React from 'react'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
    const { cart, cartTotal, setIsCartOpen } = useCart()
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:bottom-8 md:w-96"
                >
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-zinc-800 group hover:border-secondary transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="bg-secondary p-2 rounded-xl text-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <span className="absolute -top-2 -right-2 bg-white text-zinc-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900">
                                    {itemCount}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total do Pedido</p>
                                <p className="text-lg font-black text-white">R$ {cartTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-secondary font-black uppercase text-xs tracking-widest group-hover:translate-x-1 transition-transform">
                            Ver Carrinho
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Helper Tooltip for first item */}
                    {itemCount === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-primary px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg arrow-down"
                        >
                            Seu item foi adicionado! 👇
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
