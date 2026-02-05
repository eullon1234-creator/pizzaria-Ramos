import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [notification, setNotification] = useState(null)

    const showNotification = (message) => {
        setNotification(message)
        setTimeout(() => setNotification(null), 2500)
    }

    const addToCart = (product, variation, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id && item.variation.id === variation.id
            )

            if (existing) {
                showNotification(`${product.name} atualizado no carrinho! 🎉`)
                return prev.map(item =>
                    item.id === product.id && item.variation.id === variation.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            showNotification(`${product.name} adicionado ao carrinho! 🍕`)
            return [...prev, { ...product, variation, quantity }]
        })
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

    const clearCart = () => {
        setCart([])
        setIsCartOpen(false)
    }

    const cartTotal = cart.reduce((acc, item) => acc + (item.variation.price * item.quantity), 0)
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen,
            notification
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
