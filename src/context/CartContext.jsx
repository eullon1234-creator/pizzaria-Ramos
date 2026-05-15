import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [notification, setNotification] = useState(null)

    const showNotification = useCallback((message) => {
        setNotification(message)
        setTimeout(() => setNotification(null), 2500)
    }, [])

    const addToCart = useCallback((product, variation, quantity = 1) => {
        let found = false
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id && item.variation.id === variation.id
            )

            if (existing) {
                found = true
                return prev.map(item =>
                    item.id === product.id && item.variation.id === variation.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [...prev, { ...product, variation, quantity }]
        })

        if (found) {
            showNotification(`${product.name} atualizado no carrinho!`)
        } else {
            showNotification(`${product.name} adicionado ao carrinho!`)
        }
    }, [showNotification])

    const removeFromCart = useCallback((productId, variationId) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.variation.id === variationId)))
    }, [])

    const updateQuantity = useCallback((productId, variationId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.variation.id === variationId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }, [])

    const clearCart = useCallback(() => {
        setCart([])
        setIsCartOpen(false)
    }, [])

    const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.variation.price * item.quantity), 0), [cart])
    const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart])

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

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
