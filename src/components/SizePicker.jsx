import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function SizePicker({ product, isOpen, onClose }) {
    const [selectedSize, setSelectedSize] = useState(null)
    const [selectedFlavor, setSelectedFlavor] = useState(null)
    const { addToCart } = useCart()

    const [flavors, setFlavors] = React.useState([])

    // Reset states when closed
    React.useEffect(() => {
        if (!isOpen) {
            setSelectedSize(null)
            setSelectedFlavor(null)
        } else {
            // Fetch active flavors
            if (product.name.toLowerCase().includes('refrigerante') || product.name.toLowerCase().includes('bebida')) {
                import('../lib/supabase').then(({ supabase }) => {
                    supabase
                        .from('beverage_flavors')
                        .select('name')
                        .eq('is_active', true)
                        .order('name')
                        .then(({ data }) => {
                            if (data) setFlavors(data.map(f => f.name))
                        })
                })
            }
        }
    }, [isOpen, product])

    // Auto-select size if only 1 option
    React.useEffect(() => {
        if (isOpen && product?.product_prices?.length === 1) {
            setSelectedSize(product.product_prices[0])
        }
    }, [isOpen, product])

    if (!isOpen) return null

    const isBeverage = product.name.toLowerCase().includes('refrigerante') ||
        product.name.toLowerCase().includes('bebida')

    const handleAdd = () => {
        if (selectedSize && (!isBeverage || selectedFlavor)) {
            // Create unique ID for beverage flavor to avoid merging different flavors in cart
            let finalProduct = { ...product }
            if (isBeverage && selectedFlavor) {
                // Create a stable unique ID based on product ID and flavor
                // We use a random suffix just to be safe or deterministic hash if possible
                // But simply appending flavor is good enough for this context
                const flavorSlug = selectedFlavor.toLowerCase().replace(/\s+/g, '-')
                finalProduct.id = `${product.id}-${flavorSlug}`
                finalProduct.name = `${product.name} ${selectedFlavor}` // "Refrigerante 2L Coca-Cola"
            }

            addToCart(finalProduct, selectedSize)
            onClose()
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
                    className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter">
                                {isBeverage ? 'Personalize sua Bebida' : 'Escolha o Tamanho'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-zinc-500 mb-6 font-medium">
                            Selecione as opções para <span className="text-primary font-bold">{product.name}</span>
                        </p>

                        <div className="space-y-6">
                            {/* Sizes */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Tamanho</h4>
                                {product.product_prices.map((variation) => (
                                    <button
                                        key={variation.id}
                                        onClick={() => setSelectedSize(variation)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${selectedSize?.id === variation.id
                                            ? 'border-primary bg-red-50 ring-2 ring-red-50'
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

                            {/* Flavors (Only for Beverages) */}
                            {isBeverage && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                    <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Sabor</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {flavors.map(flavor => (
                                            <button
                                                key={flavor}
                                                onClick={() => setSelectedFlavor(flavor)}
                                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedFlavor === flavor
                                                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                                                    : 'border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                                                    }`}
                                            >
                                                {flavor}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!selectedSize || (isBeverage && !selectedFlavor)}
                            onClick={handleAdd}
                            className={`w-full mt-8 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${selectedSize && (!isBeverage || selectedFlavor)
                                ? 'bg-primary text-white hover:bg-red-900 active:scale-95 shadow-primary/20'
                                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
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
