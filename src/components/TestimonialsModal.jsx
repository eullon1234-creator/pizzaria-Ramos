import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Check, Trash2, Plus, Star, Eye, EyeOff, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TestimonialsModal({ isOpen, onClose }) {
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [newTestimonial, setNewTestimonial] = useState({
        name: '',
        avatar: '',
        rating: 5,
        text: '',
        location: '',
        is_active: false
    })

    useEffect(() => {
        if (isOpen) {
            fetchTestimonials()
        }
    }, [isOpen])

    async function fetchTestimonials() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTestimonials(data || [])
        } catch (error) {
            console.error('Erro ao buscar depoimentos:', error)
            alert('Erro ao buscar depoimentos')
        } finally {
            setLoading(false)
        }
    }

    async function toggleActive(id, currentStatus) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error
            
            setTestimonials(testimonials.map(t =>
                t.id === id ? { ...t, is_active: !currentStatus } : t
            ))
        } catch (error) {
            console.error('Erro ao atualizar:', error)
            alert('Erro ao atualizar depoimento')
        }
    }

    async function deleteTestimonial(id) {
        if (!confirm('Tem certeza que deseja deletar este depoimento?')) return

        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id)

            if (error) throw error
            
            setTestimonials(testimonials.filter(t => t.id !== id))
        } catch (error) {
            console.error('Erro ao deletar:', error)
            alert('Erro ao deletar depoimento')
        }
    }

    async function addTestimonial() {
        if (!newTestimonial.name || !newTestimonial.text || !newTestimonial.location) {
            alert('Preencha todos os campos obrigatórios')
            return
        }

        // Gerar avatar automaticamente (iniciais do nome)
        const initials = newTestimonial.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

        try {
            const { data, error } = await supabase
                .from('testimonials')
                .insert([{ ...newTestimonial, avatar: initials }])
                .select()

            if (error) throw error
            
            setTestimonials([data[0], ...testimonials])
            setNewTestimonial({
                name: '',
                avatar: '',
                rating: 5,
                text: '',
                location: '',
                is_active: false
            })
            setIsAddingNew(false)
        } catch (error) {
            console.error('Erro ao adicionar:', error)
            alert('Erro ao adicionar depoimento')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-red-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Gerenciar Depoimentos</h2>
                            <p className="text-white/80 mt-1">Ative/Desative ou adicione novos depoimentos</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Add New Button */}
                    <button
                        onClick={() => setIsAddingNew(!isAddingNew)}
                        className="w-full mb-6 flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Novo Depoimento
                    </button>

                    {/* Add New Form */}
                    <AnimatePresence>
                        {isAddingNew && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-zinc-50 p-6 rounded-xl border-2 border-primary/20">
                                    <h3 className="font-bold text-lg mb-4">Novo Depoimento</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Nome completo *"
                                            value={newTestimonial.name}
                                            onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                                            className="px-4 py-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Localização (ex: Centro) *"
                                            value={newTestimonial.location}
                                            onChange={(e) => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                                            className="px-4 py-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
                                        />
                                        <div className="md:col-span-2">
                                            <textarea
                                                placeholder="Depoimento *"
                                                value={newTestimonial.text}
                                                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none h-24 resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Avaliação</label>
                                            <select
                                                value={newTestimonial.rating}
                                                onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
                                            >
                                                {[5, 4, 3, 2, 1].map(n => (
                                                    <option key={n} value={n}>{n} ⭐</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newTestimonial.is_active}
                                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, is_active: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                                <span className="font-bold">Ativar imediatamente</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={addTestimonial}
                                            className="flex-1 bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                                        >
                                            Adicionar
                                        </button>
                                        <button
                                            onClick={() => setIsAddingNew(false)}
                                            className="px-6 bg-zinc-200 hover:bg-zinc-300 font-bold py-3 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Testimonials List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-zinc-600">Carregando...</p>
                        </div>
                    ) : testimonials.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <p className="text-xl font-bold">Nenhum depoimento encontrado</p>
                            <p className="text-sm mt-2">Adicione o primeiro depoimento usando o botão acima</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className={`p-5 rounded-xl border-2 transition-all ${
                                        testimonial.is_active
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-zinc-50 border-zinc-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-black text-sm">
                                                    {testimonial.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900">{testimonial.name}</h4>
                                                    <p className="text-sm text-zinc-500">{testimonial.location}</p>
                                                </div>
                                                <div className="flex gap-0.5 ml-auto">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-zinc-700 text-sm leading-relaxed">"{testimonial.text}"</p>
                                            <p className="text-xs text-zinc-400 mt-2">
                                                Adicionado em {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleActive(testimonial.id, testimonial.is_active)}
                                                className={`p-2 rounded-lg font-bold text-sm transition-colors ${
                                                    testimonial.is_active
                                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                                        : 'bg-zinc-300 hover:bg-zinc-400 text-zinc-700'
                                                }`}
                                                title={testimonial.is_active ? 'Desativar' : 'Ativar'}
                                            >
                                                {testimonial.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => deleteTestimonial(testimonial.id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
