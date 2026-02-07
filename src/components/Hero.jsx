import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Clock, Award, TrendingUp, ArrowRight, MessageCircle } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-fixed">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/50"></div>
                {/* Animated Overlay Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white text-center md:text-left"
                    >
                        {/* Floating Badges */}
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="flex flex-wrap gap-3 justify-center md:justify-start mb-6"
                        >
                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                                <Award className="w-4 h-4 text-yellow-300" />
                                Melhor Pizza da Região
                            </span>
                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                                <Clock className="w-4 h-4 text-green-300" />
                                Entrega em 30-45min
                            </span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter leading-none"
                        >
                            A Melhor Pizza{' '}
                            <span className="block text-secondary italic mt-2 drop-shadow-lg">
                                de Amarante!
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-xl md:text-2xl mb-8 text-zinc-100 font-medium max-w-xl mx-auto md:mx-0"
                        >
                            🍕 Ingredientes frescos, massa artesanal e o sabor que você já conhece. Peça agora e receba quentinha em casa!
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                        >
                            <a 
                                href="#menu" 
                                className="group inline-flex items-center justify-center gap-3 bg-secondary hover:bg-yellow-500 text-zinc-900 font-black px-8 py-4 rounded-2xl uppercase tracking-wider text-lg shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105 active:scale-95"
                            >
                                Ver Cardápio
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                            
                            <a 
                                href="https://wa.me/5586994471909" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl border-2 border-white/40 hover:border-white/60 transition-all hover:scale-105 active:scale-95"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp
                            </a>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="flex flex-wrap gap-6 justify-center md:justify-start mt-8 text-white/90"
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-300" />
                                <span className="text-sm font-semibold">500+ Pedidos/mês</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⭐</span>
                                <span className="text-sm font-semibold">4.9/5.0 Avaliação</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-blue-300" />
                                <span className="text-sm font-semibold">+5 Anos de Tradição</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Decorative Elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="hidden md:block relative"
                    >
                        {/* Floating Pizza Emoji/Icon */}
                        <motion.div
                            animate={{ 
                                y: [0, -20, 0],
                                rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-9xl filter drop-shadow-2xl"
                        >
                            🍕
                        </motion.div>
                        
                        {/* Decorative Circles */}
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
                        />
                        <motion.div 
                            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Bottom Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-12 md:h-20" preserveAspectRatio="none">
                    <path fill="#fafafa" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                </svg>
            </div>
        </section>
    )
}

