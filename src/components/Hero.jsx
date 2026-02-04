import React from 'react'

export default function Hero() {
    return (
        <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background com imagem profissional */}
            <div className="absolute inset-0">
                <picture>
                    {/* Imagem mobile (portrait) */}
                    <source 
                        media="(max-width: 768px)" 
                        srcSet="/hero-bg-mobile.jpg" 
                    />
                    {/* Imagem desktop (landscape) */}
                    <img 
                        src="/hero-bg.jpg" 
                        alt="Pizzaria Ramos - A melhor pizza da região"
                        className="w-full h-full object-cover"
                    />
                </picture>
                {/* Overlay sutil para melhorar legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-white text-center">
                {/* Conteúdo adicional opcional (pode remover se quiser só a imagem) */}
                <div className="mt-[320px] md:mt-[400px]">
                    <p className="text-lg md:text-2xl font-semibold text-white drop-shadow-lg mb-6">
                        🍕 Ingredientes selecionados • Massa artesanal • Entrega rápida
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a 
                            href="#menu" 
                            className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-50 transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                        >
                            Ver Cardápio Completo
                            <span className="text-2xl">👉</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
