import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Info, Pizza, Sparkles, Flame, Star, Eye, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SizePicker from './SizePicker'
import HalfAndHalfModal from './HalfAndHalfModal'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useFavorites } from '../context/FavoritesContext'

import MenuSkeleton from './MenuSkeleton'

export default function Menu() {
    const { addToCart } = useCart()
    const { isFavorite, toggleFavorite } = useFavorites()
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [promotions, setPromotions] = useState([])
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

            // Buscar promoções ativas
            const { data: promos } = await supabase
                .from('promotions')
                .select('*')
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString())
            
            setPromotions(promos || [])

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

        // 🔥 Verificar se produto está em promoção e aplicar desconto
        const promotion = getProductPromotion(product.id)
        let productToAdd = product

        if (promotion) {
            // Criar cópia do produto com preços promocionais
            productToAdd = {
                ...product,
                product_prices: product.product_prices.map(variation => ({
                    ...variation,
                    originalPrice: variation.price, // Guardar preço original
                    price: calculateDiscountPrice(variation.price, promotion.discount_percentage) // Aplicar desconto
                }))
            }
        }

        if (product.product_prices.length > 1 || isBeverage) {
            setSelectedProduct(productToAdd)
        } else {
            addToCart(productToAdd, productToAdd.product_prices[0])
        }
    }

    // Função para verificar se produto tem promoção ativa
    const getProductPromotion = (productId) => {
        return promotions.find(promo => 
            promo.product_id === productId && 
            promo.is_active && 
            new Date(promo.end_date) > new Date()
        )
    }

    // Função para calcular preço com desconto
    const calculateDiscountPrice = (originalPrice, discountPercentage) => {
        return originalPrice * (1 - discountPercentage / 100)
    }

    // Se tiver categoria ativa, filtrar por ela, senão mostrar TODOS os produtos
    const filteredProducts = activeCategory === 'all-pizzas'
        ? products.filter(p => pizzaCategoryIds.includes(p.category_id))
        : activeCategory === 'promocao'
            ? products.filter(p => getProductPromotion(p.id) !== undefined)
            : activeCategory 
                ? products.filter(p => p.category_id === activeCategory)
                : products
    
    // Contar produtos em promoção (baseado em promoções ativas do banco)
    const promoCount = products.filter(p => getProductPromotion(p.id) !== undefined).length
    
    const isPizzaCategory = activeCategory === 'all-pizzas' || !activeCategory

    if (loading) return <MenuSkeleton />

    return (
        <section className="py-12 bg-white" id="menu">
            <div className="container mx-auto px-4">
                {/* Category Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-8 pb-4 pt-2 no-scrollbar">
                    {/* Botão "Todos" para mostrar tudo */}
                    <motion.button
                        onClick={() => setActiveCategory(null)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border-2 ${!activeCategory
                            ? 'bg-primary border-primary text-white shadow-lg'
                            : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200'
                            }`}
                    >
                        Todos
                    </motion.button>
                    
                    {/* ABA DE PROMOÇÕES - Destaque especial */}
                    <motion.button
                        onClick={() => setActiveCategory('promocao')}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className={`relative whitespace-nowrap px-6 py-2 rounded-full font-black transition-all ${activeCategory === 'promocao'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-primary shadow-xl shadow-yellow-400/50 scale-110'
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-primary hover:shadow-lg hover:shadow-yellow-400/30'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            🔥 PROMOÇÕES
                            {promoCount > 0 && (
                                <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">
                                    {promoCount}
                                </span>
                            )}
                        </span>
                        {/* Ping animation - bolinha piscando */}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </motion.button>
                    {categories.map((cat) => (
                        <motion.button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border-2 ${activeCategory === cat.id
                                ? 'bg-primary border-primary text-white shadow-lg'
                                : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200'
                                }`}
                        >
                            {cat.name}
                        </motion.button>
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
                <motion.div 
                    key={activeCategory || 'all'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredProducts.map((product, index) => {
                        const prices = product.product_prices.map(p => p.price)
                        const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                        
                        // Verificar se produto tem promoção ativa
                        const activePromotion = getProductPromotion(product.id)
                        const isPromo = activePromotion !== undefined
                        const discountedPrice = isPromo ? calculateDiscountPrice(minPrice, activePromotion.discount_percentage) : minPrice
                        
                        // Lógica simples: produtos mais baratos ou com nome específico são "mais vendidos"
                        const isBestSeller = product.name.toLowerCase().includes('calabresa') || 
                                            product.name.toLowerCase().includes('mussarela') ||
                                            product.name.toLowerCase().includes('frango')
                        
                        // Produtos criados nos últimos 30 dias são "novos"
                        const isNew = product.created_at && 
                                     (new Date() - new Date(product.created_at)) < 30 * 24 * 60 * 60 * 1000

                        return (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    duration: 0.4,
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                }}
                                className="group bg-gradient-to-br from-white to-zinc-50 rounded-2xl overflow-hidden shadow-md border border-zinc-100 hover:shadow-2xl hover:border-primary/20 transition-all hover:-translate-y-2 relative"
                            >
                                {/* Botão de Favorito */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFavorite(product.id)
                                    }}
                                    className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95"
                                    aria-label="Favoritar produto"
                                >
                                    <Heart 
                                        className={`w-5 h-5 transition-all ${
                                            isFavorite(product.id) 
                                                ? 'fill-red-500 text-red-500' 
                                                : 'text-zinc-400 hover:text-red-500'
                                        }`}
                                    />
                                </button>

                                {/* Badges */}
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    {activeCategory === 'promocao' && isPromo && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                                            className="flex items-center gap-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl animate-pulse uppercase"
                                        >
                                            ⚡ PROMOÇÃO
                                        </motion.div>
                                    )}
                                    {isBestSeller && activeCategory !== 'promocao' && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                                            className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase"
                                        >
                                            <Flame className="w-3.5 h-3.5" />
                                            Mais Vendido
                                        </motion.div>
                                    )}
                                    {isNew && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: 45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
                                            className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Novo
                                        </motion.div>
                                    )}
                                </div>

                                <div className="relative h-48 overflow-hidden bg-zinc-100">
                                    {product.image_url ? (
                                        <img 
                                            src={product.image_url} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            loading="lazy"
                                            width="256"
                                            height="192"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-gradient-to-br from-zinc-100 to-zinc-200">
                                            <Pizza className="w-12 h-12" />
                                        </div>
                                    )}
                                    
                                    {/* Overlay escuro no hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                    
                                    {/* Preço badge com desconto */}
                                    <div className="absolute bottom-4 right-4 z-10">
                                        {isPromo ? (
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-xl shadow-2xl group-hover:scale-110 transition-transform">
                                                {/* Preço original cortado */}
                                                <div className="text-xs font-bold line-through opacity-90">
                                                    {product.product_prices.length > 1 ? 'De ' : ''}R$ {minPrice.toFixed(2)}
                                                </div>
                                                {/* Preço promocional em destaque */}
                                                <div className="text-lg font-black flex items-baseline gap-1">
                                                    <span className="text-xs">R$</span>
                                                    <span>{discountedPrice.toFixed(2)}</span>
                                                </div>
                                                {/* Percentual de desconto */}
                                                <div className="text-[10px] font-black uppercase tracking-wider mt-0.5">
                                                    {activePromotion.discount_percentage}% OFF
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-primary text-white text-sm font-black px-4 py-2 rounded-xl shadow-xl group-hover:scale-110 transition-transform">
                                                {product.product_prices.length > 1 ? 'A partir de ' : ''} R$ {minPrice.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                    <p className="text-zinc-600 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => {
                                                alert(`${product.name}\n\n${product.description}\n\nPreço: R$ ${minPrice.toFixed(2)}${product.product_prices.length > 1 ? ' ou mais' : ''}`)
                                            }}
                                            className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
                                            aria-label={`Ver informações de ${product.name}`}
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm font-medium">Detalhes</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleOrderClick(product)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                            aria-label={`Adicionar ${product.name} ao carrinho`}
                                        >
                                            <Plus className="w-5 h-5" />
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Shine effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 pointer-events-none" />
                            </motion.div>
                        )
                    })}
                </motion.div>
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
