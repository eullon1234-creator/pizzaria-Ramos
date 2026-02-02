import React, { useState, useEffect } from 'react'
import { X, Check, Pizza, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function HalfAndHalfModal({ isOpen, onClose, products }) {
    const [step, setStep] = useState(1) // 1: Size, 2: Flavor 1, 3: Flavor 2
    const [selectedSize, setSelectedSize] = useState(null)
    const [flavor1, setFlavor1] = useState(null)
    const [flavor2, setFlavor2] = useState(null)
    const { addToCart } = useCart()

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1)
            setSelectedSize(null)
            setFlavor1(null)
            setFlavor2(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    // Get unique sizes from all pizzas
    const allSizes = []
    products.forEach(p => {
        p.product_prices.forEach(v => {
            if (!allSizes.find(s => s.size === v.size)) {
                allSizes.push({ size: v.size })
            }
        })
    })

    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const handleConfirm = () => {
        if (selectedSize && flavor1 && flavor2) {
            // Find price for each flavor in selected size
            const p1 = flavor1.product_prices.find(v => v.size === selectedSize.size)?.price || 0
            const p2 = flavor2.product_prices.find(v => v.size === selectedSize.size)?.price || 0
            const finalPrice = Math.max(p1, p2)

            const halfAndHalfItem = {
                id: `half-${flavor1.id}-${flavor2.id}-${Date.now()}`,
                name: `Meio a Meio: ${flavor1.name} / ${flavor2.name}`,
                description: `1/2 ${flavor1.name} (${flavor1.description}) + 1/2 ${flavor2.name} (${flavor2.description})`,
                category_id: flavor1.category_id,
                image_url: flavor1.image_url // Use first flavor image
            }

            const variation = {
                id: `var-${Date.now()}`,
                size: selectedSize.size,
                price: finalPrice
            }

            addToCart(halfAndHalfItem, variation)
            onClose()
        }
    }

    // Filter products that have the selected size
    const availableFlavors = selectedSize
        ? products.filter(p => p.product_prices.some(v => v.size === selectedSize.size))
        : []

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                    className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 bg-primary text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Pizza className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">Montar Meio a Meio</h2>
                                <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mt-0.5">
                                    Passo {step} de 3: {step === 1 ? 'Tamanho' : step === 2 ? 'Primeiro Sabor' : 'Segundo Sabor'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-zinc-100 flex">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            className="h-full bg-secondary"
                        />
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <h3 className="text-lg font-bold text-zinc-800 mb-2">Qual o tamanho da pizza?</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {allSizes.map((s) => (
                                        <button
                                            key={s.size}
                                            onClick={() => {
                                                setSelectedSize(s)
                                                handleNext()
                                            }}
                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all group ${selectedSize?.size === s.size
                                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                                : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'
                                                }`}
                                        >
                                            <span className={`text-2xl font-black italic tracking-tighter ${selectedSize?.size === s.size ? 'text-primary' : 'text-zinc-900 shadow-white drop-shadow-sm'}`}>{s.size}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">Selecionar</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(step === 2 || step === 3) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-bold text-zinc-800 mb-2">
                                    {step === 2 ? 'Escolha o 1º Sabor' : 'Escolha o 2º Sabor'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableFlavors.map((p) => {
                                        const isSelected = (step === 2 && flavor1?.id === p.id) || (step === 3 && flavor2?.id === p.id)
                                        const priceForSize = p.product_prices.find(v => v.size === selectedSize.size)?.price || 0

                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    if (step === 2) {
                                                        setFlavor1(p)
                                                        handleNext()
                                                    } else {
                                                        setFlavor2(p)
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                                    : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'
                                                    }`}
                                            >
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-200 flex-shrink-0">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Pizza className="w-full h-full p-3 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-zinc-900 truncate">{p.name}</p>
                                                    <p className="text-[10px] text-primary font-black uppercase italic">R$ {priceForSize.toFixed(2)}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="bg-primary p-1.5 rounded-full">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-zinc-500 font-black uppercase text-xs tracking-widest hover:text-primary transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Voltar
                            </button>
                        ) : (
                            <div />
                        )}

                        {step === 3 ? (
                            <button
                                disabled={!flavor2}
                                onClick={handleConfirm}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-2 ${flavor2
                                    ? 'bg-primary text-white hover:bg-red-900 active:scale-95 shadow-primary/20'
                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                Confirmar Pizza
                                <Check className="w-4 h-4" />
                            </button>
                        ) : (
                            step < 3 && selectedSize && (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest transition-transform hover:translate-x-1"
                                >
                                    Pular
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
