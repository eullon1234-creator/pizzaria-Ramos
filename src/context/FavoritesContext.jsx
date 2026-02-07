import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFavorites()
    }, [])

    const loadFavorites = async () => {
        try {
            const userStr = localStorage.getItem('user')
            if (!userStr) {
                setLoading(false)
                return
            }

            const user = JSON.parse(userStr)

            const { data, error } = await supabase
                .from('favorites')
                .select('product_id')
                .eq('user_id', user.id)

            if (error) throw error

            setFavorites((data || []).map(f => f.product_id))
        } catch (error) {
            console.error('❌ Erro ao carregar favoritos:', error)
        } finally {
            setLoading(false)
        }
    }

    const isFavorite = (productId) => {
        return favorites.includes(productId)
    }

    const toggleFavorite = async (productId) => {
        try {
            const userStr = localStorage.getItem('user')
            if (!userStr) {
                alert('⚠️ Você precisa estar logado para favoritar produtos!')
                return false
            }

            const user = JSON.parse(userStr)

            if (isFavorite(productId)) {
                // Remover dos favoritos
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId)

                if (error) throw error

                setFavorites(prev => prev.filter(id => id !== productId))
                return false
            } else {
                // Adicionar aos favoritos
                const { error } = await supabase
                    .from('favorites')
                    .insert({
                        user_id: user.id,
                        product_id: productId
                    })

                if (error) throw error

                setFavorites(prev => [...prev, productId])
                return true
            }
        } catch (error) {
            console.error('❌ Erro ao alternar favorito:', error)
            if (error.message.includes('duplicate')) {
                // Já está favoritado, apenas atualizar estado local
                setFavorites(prev => prev.includes(productId) ? prev : [...prev, productId])
            } else {
                alert('Erro ao favoritar produto. Tente novamente.')
            }
            return null
        }
    }

    const getFavoritesCount = () => {
        return favorites.length
    }

    return (
        <FavoritesContext.Provider value={{
            favorites,
            loading,
            isFavorite,
            toggleFavorite,
            getFavoritesCount,
            reloadFavorites: loadFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export const useFavorites = () => {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}
