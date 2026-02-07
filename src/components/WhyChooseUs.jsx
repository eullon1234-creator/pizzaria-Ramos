import { motion } from 'framer-motion';
import { Clock, Leaf, Award, Heart } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Clock,
      title: 'Entrega Rápida',
      description: '30-45 minutos direto na sua casa, quentinha e crocante',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Leaf,
      title: 'Ingredientes Frescos',
      description: 'Selecionamos os melhores ingredientes todos os dias',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: Award,
      title: '+5 Anos de Tradição',
      description: 'Referência em qualidade e sabor em Novo Amarante',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.3
    },
    {
      icon: Heart,
      title: 'Feito com Amor',
      description: 'Cada pizza é preparada com carinho e dedicação',
      gradient: 'from-pink-500 to-red-500',
      delay: 0.4
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-zinc-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider mb-4">
            Por Que Nos Escolher
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-900 uppercase tracking-tight">
            O Que Nos Torna <span className="text-primary">Especiais</span>
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Muito mais do que pizza: uma experiência completa de sabor e qualidade
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: feature.delay,
                  ease: "easeOut"
                }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-white rounded-2xl p-8 shadow-lg border border-zinc-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  {/* Icon with gradient background */}
                  <div className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-black mb-3 text-zinc-900 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover effect line */}
                  <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-b-2xl`} />
                </div>

                {/* Glow effect */}
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-700 font-semibold text-lg mb-4">
            Pronto para experimentar a melhor pizza da região? 🍕
          </p>
          <a
            href="#menu"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-primary text-white font-bold px-8 py-4 rounded-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Ver Cardápio Completo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
