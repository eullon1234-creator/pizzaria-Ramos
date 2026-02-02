import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    const addToCart = (product, variation, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id && item.variation.id === variation.id
            )

            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.variation.id === variation.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [...prev, { ...product, variation, quantity }]
        })
        setIsCartOpen(true)
    }

    const removeFromCart = (productId, variationId) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.variation.id === variationId)))
    }

    const updateQuantity = (productId, variationId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.variation.id === variationId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const cartTotal = cart.reduce((acc, item) => acc + (item.variation.price * item.quantity), 0)
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
