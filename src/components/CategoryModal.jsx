import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save } from 'lucide-react'

export default function CategoryModal({ category, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [displayOrder, setDisplayOrder] = useState(0)

    useEffect(() => {
        if (category) {
            setName(category.name)
            setDisplayOrder(category.display_order)
        }
    }, [category])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (category) {
                const { error } = await supabase
                    .from('categories')
                    .update({ name, display_order: displayOrder })
                    .eq('id', category.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([{ name, display_order: displayOrder }])
                if (error) throw error
            }

            onSave()
            onClose()
        } catch (error) {
            alert('Erro ao salvar categoria: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 rounded-t-3xl">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">
                        {category ? 'Editar Categoria' : 'Nova Categoria'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1 ml-1">Nome da Categoria</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                            placeholder="Ex: Pizzas Tradicionais"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1 ml-1">Ordem de Exibição (0 = Primeiro)</label>
                        <input
                            type="number"
                            required
                            value={displayOrder}
                            onChange={e => setDisplayOrder(parseInt(e.target.value))}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save className={`${loading ? 'animate-spin' : ''} w-5 h-5`} />
                            {loading ? 'Salvando...' : 'Salvar Categoria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
