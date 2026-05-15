import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const { data } = await supabase.auth.getSession()
            setAuthenticated(!!data?.session)
        } catch {
            setAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (!authenticated) {
        return <Navigate to="/admin" replace />
    }

    return children
}
