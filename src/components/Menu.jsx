import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Info, Pizza } from 'lucide-react'
import SizePicker from './SizePicker'
import { useCart } from '../context/CartContext'

export default function Menu() {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)

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
            setCategories(cats)
            if (cats.length > 0) setActiveCategory(cats[0].id)

            const { data: prods, error: prodErr } = await supabase
                .from('products')
                .select(`
          *,
          product_prices (*)
        `)
                .eq('is_active', true)

            if (prodErr) throw prodErr
            setProducts(prods)
        } catch (error) {
            console.error('Error fetching menu details:', error.message || error)
            if (error.details) console.error('Error details:', error.details)
            if (error.hint) console.error('Error hint:', error.hint)
        } finally {
            setLoading(false)
        }
    }

    const handleOrderClick = (product) => {
        // If it's a pizza or has multiple sizes, open picker
        if (product.product_prices.length > 1) {
            setSelectedProduct(product)
        } else {
            // Direct add for single price items (e.g., snacks)
            addToCart(product, product.product_prices[0])
        }
    }

    const filteredProducts = products.filter(p => p.category_id === activeCategory)

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    )

    return (
        <section className="py-12 bg-white" id="menu">
            <div className="container mx-auto px-4">
                {/* Category Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-10 pb-2 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border-2 ${activeCategory === cat.id
                                ? 'bg-primary border-primary text-white shadow-lg scale-105'
                                : 'bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => {
                        const prices = product.product_prices.map(p => p.price)
                        const minPrice = prices.length > 0 ? Math.min(...prices) : 0

                        return (
                            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-md border border-zinc-100 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="relative h-48 overflow-hidden bg-zinc-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                                        <button className="text-zinc-400 hover:text-primary transition-colors">
                                            <Info className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleOrderClick(product)}
                                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors shadow-md active:scale-95"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <SizePicker
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </section>
    )
}
