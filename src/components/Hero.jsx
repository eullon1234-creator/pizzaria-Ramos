import React from 'react'

export default function Hero() {
    return (
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-white text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">
                    A Melhor Pizza <br />
                    <span className="text-secondary italic">de Amarante!</span>
                </h2>
                <p className="text-lg md:text-xl mb-8 max-w-xl text-zinc-200">
                    Ingredientes selecionados, massa artesanal e o sabor que você já conhece. Peça agora e receba em casa!
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                    <button className="btn-primary">Ver Cardápio</button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all">
                        Nossa História
                    </button>
                </div>
            </div>
        </section>
    )
}
