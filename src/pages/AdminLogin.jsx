import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, Lock, Mail, Pizza } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError
            navigate('/admin/dashboard')
        } catch (err) {
            setError('Credenciais inválidas ou erro de conexão.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>

            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-zinc-900 p-8 text-center border-b-4 border-secondary">
                    <Pizza className="w-12 h-12 text-secondary mx-auto mb-4 animate-bounce" />
                    <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter">
                        Gestão <span className="text-secondary">Pizzaria Ramos</span>
                    </h2>
                    <p className="text-zinc-400 text-sm mt-2">Área Administrativa Restrita</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                placeholder="admin@pizzariaramos.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-red-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Entrar no Sistema
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-zinc-400 text-sm font-bold hover:text-primary transition-colors"
                        >
                            Voltar para o Cardápio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
