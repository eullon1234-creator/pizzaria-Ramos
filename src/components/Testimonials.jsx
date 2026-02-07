import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TestimonialFormModal from './TestimonialFormModal';

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true);
    const [formModalOpen, setFormModalOpen] = useState(false);
    
    useEffect(() => {
        fetchTestimonials()
    }, [])

    async function fetchTestimonials() {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(6)

            if (error) throw error
            setTestimonials(data || [])
        } catch (error) {
            console.error('Erro ao buscar depoimentos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Se não houver depoimentos, não mostrar a seção
    if (!loading && testimonials.length === 0) {
        return null
    }

    // Calcular média de avaliações
    const averageRating = testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : '5.0'

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-4 py-2 bg-secondary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider mb-4">
                        Depoimentos
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-900 uppercase tracking-tight">
                        O Que Nossos <span className="text-primary">Clientes</span> Dizem
                    </h2>
                    <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                        Mais de 500 clientes satisfeitos todo mês! Veja o que eles têm a dizer sobre nossas pizzas.
                    </p>
                    
                    {/* Rating Summary */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="flex items-center justify-center gap-3 mt-6"
                    >
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-2xl font-black text-zinc-900">{averageRating}</span>
                        <span className="text-zinc-500 font-medium">/ 5.0</span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-600 font-semibold">+{testimonials.length} avaliações</span>
                    </motion.div>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                delay: index * 0.1,
                                duration: 0.6,
                                ease: "easeOut"
                            }}
                            className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-zinc-100 hover:border-primary/20 hover:-translate-y-2"
                        >
                            {/* Quote Icon */}
                            <div className="absolute -top-3 -right-3 bg-primary p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <Quote className="w-5 h-5 text-white" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-zinc-700 mb-6 leading-relaxed text-sm md:text-base">
                                "{testimonial.text}"
                            </p>

                            {/* Customer Info */}
                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-black text-lg shadow-md">
                                    {testimonial.avatar}
                                </div>
                                
                                <div className="flex-1">
                                    <h4 className="font-bold text-zinc-900">{testimonial.name}</h4>
                                    <p className="text-sm text-zinc-500">{testimonial.location}</p>
                                </div>

                                {/* Verified Badge */}
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                                        ✓ Verificado
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Botão Deixe seu Depoimento */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-center mt-12"
                >
                    <button
                        onClick={() => setFormModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary font-bold px-8 py-4 rounded-xl border-2 border-primary uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                        <Edit3 size={20} />
                        Deixe seu Depoimento
                    </button>
                </motion.div>

                {/* CTA Below Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-center mt-12"
                >
                    <p className="text-zinc-600 mb-6 text-lg">
                        Junte-se a centenas de clientes satisfeitos! 🍕
                    </p>
                    <a 
                        href="#menu"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                        Fazer Meu Pedido Agora
                    </a>
                </motion.div>
            </div>

            {/* Modal de Formulário */}
            <TestimonialFormModal 
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
            />
        </section>
    )
}
