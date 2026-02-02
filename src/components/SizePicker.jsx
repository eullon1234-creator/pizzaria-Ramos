import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function SizePicker({ product, isOpen, onClose }) {
    const [selectedSize, setSelectedSize] = useState(null)
    const { addToCart } = useCart()

    if (!isOpen) return null

    const handleAdd = () => {
        if (selectedSize) {
            addToCart(product, selectedSize)
            onClose()
            setSelectedSize(null)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter">Escolha o Tamanho</h3>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-zinc-500 mb-8 font-medium">Selecione o tamanho ideal para a sua <span className="text-primary font-bold">{product.name}</span></p>

                        <div className="space-y-3">
                            {product.product_prices.map((variation) => (
                                <button
                                    key={variation.id}
                                    onClick={() => setSelectedSize(variation)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${selectedSize?.id === variation.id
                                            ? 'border-primary bg-red-50 ring-4 ring-red-50'
                                            : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize?.id === variation.id ? 'border-primary bg-primary' : 'border-zinc-300'
                                            }`}>
                                            {selectedSize?.id === variation.id && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg text-zinc-900">{variation.size}</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-primary text-xl tracking-tighter">R$ {variation.price.toFixed(2)}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={!selectedSize}
                            onClick={handleAdd}
                            className={`w-full mt-8 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 ${selectedSize
                                    ? 'bg-primary text-white hover:bg-red-900 active:scale-95'
                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                }`}
                        >
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
