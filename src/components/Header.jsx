import React from 'react'
import { Pizza, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
    const { cartCount, setIsCartOpen } = useCart()
    const navigate = useNavigate()

    return (
        <header className="bg-primary text-secondary sticky top-0 z-50 shadow-xl border-b border-accent/20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Pizza className="w-8 h-8 text-accent animate-pulse" />
                    <h1 className="text-2xl font-black tracking-tighter uppercase font-serif italic">
                        Pizzaria <span className="text-white">Ramos</span>
                    </h1>
                </Link>

                <div className="flex items-center gap-4 text-white">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-primary">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                    >
                        <User className="w-4 h-4" />
                        <span>Área Admin</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
