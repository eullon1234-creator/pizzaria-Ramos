import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Gift, Star } from 'lucide-react';

export default function PromoSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Define o fim da promoção para 23:59:59 de hoje
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <section className="py-16 bg-gradient-to-br from-primary via-red-700 to-red-900 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-yellow-400 text-primary font-black px-4 py-2 rounded-full mb-4 shadow-xl"
            >
              <Zap size={20} className="animate-bounce" />
              PROMOÇÃO ESPECIAL
            </motion.div>

            {/* Título */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight drop-shadow-lg">
              2 Pizzas Grandes
              <br />
              <span className="text-yellow-300">Por Apenas R$ 79,90</span>
            </h2>

            <div className="flex items-center justify-center gap-2 text-white/90 text-lg mb-8">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">+ Refrigerante 2L Grátis!</span>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-bold uppercase tracking-wider mb-4">
              <Clock className="w-4 h-4 animate-pulse" />
              Promoção termina em:
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-md mx-auto">
              {/* Hours */}
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl mb-2">
                  <div className="text-3xl md:text-5xl font-black text-primary tabular-nums">
                    {formatNumber(timeLeft.hours)}
                  </div>
                </div>
                <div className="text-white/90 text-xs md:text-sm font-bold uppercase">Horas</div>
              </div>

              {/* Minutes */}
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl mb-2">
                  <div className="text-3xl md:text-5xl font-black text-primary tabular-nums">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                </div>
                <div className="text-white/90 text-xs md:text-sm font-bold uppercase">Minutos</div>
              </div>

              {/* Seconds */}
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl mb-2 animate-pulse">
                  <div className="text-3xl md:text-5xl font-black text-primary tabular-nums">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                </div>
                <div className="text-white/90 text-xs md:text-sm font-bold uppercase">Segundos</div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <a
              href="#menu"
              className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-primary font-black px-10 py-5 rounded-2xl text-xl uppercase tracking-wider shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105 active:scale-95"
            >
              <Star className="w-6 h-6" />
              Aproveitar Agora
              <Star className="w-6 h-6" />
            </a>

            <p className="text-white/80 text-sm mt-4">
              *Válido apenas para pedidos pelo site • Promoção renova todo dia às 00:00
            </p>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 0L60 8.3C120 16.7 240 33.3 360 41.7C480 50 600 50 720 45C840 40 960 30 1080 26.7C1200 23.3 1320 26.7 1380 28.3L1440 30V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
