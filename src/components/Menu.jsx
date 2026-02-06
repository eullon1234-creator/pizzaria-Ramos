import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Info, Pizza, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import SizePicker from './SizePicker'
import HalfAndHalfModal from './HalfAndHalfModal'
import { useCart } from '../context/CartContext'

import MenuSkeleton from './MenuSkeleton'

export default function Menu() {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isHalfModalOpen, setIsHalfModalOpen] = useState(false)
    const [pizzaCategoryIds, setPizzaCategoryIds] = useState([])

    const { addToCart } = useCart()

    useEffect(() => {
        fetchMenu()
    }, [])

    async function fetchMenu() {
        try {
            const { data: cats, error: catErr } = await supabase
                .from('categories')
                .select('*')
                .order('display_order')

            if (catErr) throw catErr
            
            // Pegar IDs das categorias de pizza para agrupar numa única aba
            const pizzaCatIds = cats
                .filter(cat => cat.name.toLowerCase().includes('pizza'))
                .map(cat => cat.id)
            
            // Remover categorias individuais de pizza e adicionar uma única "Pizzas"
            const nonPizzaCats = cats.filter(cat => !cat.name.toLowerCase().includes('pizza'))
            const pizzaTab = pizzaCatIds.length > 0 
                ? [{ id: 'all-pizzas', name: 'Pizzas', display_order: 0 }] 
                : []
            
            setCategories([...pizzaTab, ...nonPizzaCats])
            // Não setar categoria inicial - mostrar tudo
            // Guardar IDs de pizza para filtrar depois
            setPizzaCategoryIds(pizzaCatIds)

            const { data: prods, error: prodErr } = await supabase
                .from('products')
                .select(`
          *,
          product_prices (*)
        `)
                .eq('is_active', true)

            if (prodErr) throw prodErr

            // Optimize image URLs
            const optimizedProds = prods.map(p => {
                if (p.image_url) {
                    // Assuming the URL doesn't already have query params.
                    // A more robust solution would check for existing '?'
                    p.image_url = `${p.image_url}?width=400&quality=75`
                }
                return p
            })
            setProducts(optimizedProds)
        } catch (error) {
            console.error('Error fetching menu details:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const handleOrderClick = (product) => {
        const isBeverage = product.name.toLowerCase().includes('refrigerante') ||
            product.name.toLowerCase().includes('bebida') ||
            product.category_id === 'bebidas' // Adjust if you know the ID, but name check is safer for now

        if (product.product_prices.length > 1 || isBeverage) {
            setSelectedProduct(product)
        } else {
            addToCart(product, product.product_prices[0])
        }
    }

    // Se tiver categoria ativa, filtrar por ela, senão mostrar TODOS os produtos
    const filteredProducts = activeCategory === 'all-pizzas'
        ? products.filter(p => pizzaCategoryIds.includes(p.category_id))
        : activeCategory 
            ? products.filter(p => p.category_id === activeCategory)
            : products
    const isPizzaCategory = activeCategory === 'all-pizzas' || !activeCategory

    if (loading) return <MenuSkeleton />

    return (
        <section className="py-12 bg-white" id="menu">
            <div className="container mx-auto px-4">
                {/* Category Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-10 pb-2 no-scrollbar">
                    {/* Botão "Todos" para mostrar tudo */}
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border-2 ${!activeCategory
                            ? 'bg-primary border-primary text-white shadow-lg scale-105'
                            : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200'
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`wSempre mostrar */}
                            : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Meio a Meio Banner - Sempre mostrar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => setIsHalfModalOpen(true)}
                        className="w-full bg-linear-to-r from-primary to-red-600 p-6 rounded-3xl text-white flex items-center justify-between group overflow-hidden relative shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        <div className="relative z-10 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Novidade</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Montar Meio a Meio</h3>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mt-1">Escolha 2 sabores em uma única pizza!</p>
                        </div>
                        <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                            <Pizza className="w-10 h-10 text-white" />
                        </div>

                        {/* Decorative background elements */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    </button>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => {
                        const prices = product.product_prices.map(p => p.price)
                        const minPrice = prices.length > 0 ? Math.min(...prices) : 0

                        return (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white rounded-2xl overflow-hidden shadow-md border border-zinc-100 hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className="relative h-48 overflow-hidden bg-zinc-100">
                                    {product.image_url ? (
                                        <img 
                                            src={product.image_url} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            loading="lazy"
                                            width="256"
                                            height="192"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                            <Pizza className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {product.product_prices.length > 1 ? 'A partir de ' : ''} R$ {minPrice.toFixed(2)}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-zinc-600 text-sm mb-6 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                           <button 
                                            onClick={() => {
                                                alert(`${product.name}\n\n${product.description}\n\nPreço: R$ ${minPrice.toFixed(2)}${product.product_prices.length > 1 ? ' ou mais' : ''}`)
                                            }}
                                            className="text-zinc-400 hover:text-primary transition-colors"
                                            aria-label={`Ver informações de ${product.name}`}
                                        >
                                            <Info className="w-5 h-5" />
                                        </button>
                                <button
                                            onClick={() => handleOrderClick(product)}
                                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors shadow-md active:scale-95"
                                            aria-label={`Adicionar ${product.name} ao carrinho`}
                                        >
                                            <Plus className="w-5 h-5" />
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <SizePicker
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />

            <HalfAndHalfModal
                isOpen={isHalfModalOpen}
                onClose={() => setIsHalfModalOpen(false)}
                products={products}
            />
        </section>
    )
}
