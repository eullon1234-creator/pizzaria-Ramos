import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

export default function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Galeria de fotos das pizzas
  const photos = [
    {
      id: 1,
      title: 'Pizza Calabresa Artesanal',
      url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=600&fit=crop',
      description: 'Calabresa fatiada, cebola roxa e azeitonas'
    },
    {
      id: 2,
      title: 'Pizza Margherita Clássica',
      url: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=600&fit=crop',
      description: 'Molho especial, manjericão e mussarela'
    },
    {
      id: 3,
      title: 'Pizza Quatro Queijos',
      url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96b47?w=600&h=600&fit=crop',
      description: 'Mussarela, provolone, parmesão e catupiry'
    },
    {
      id: 4,
      title: 'Pizza Portuguesa Completa',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
      description: 'Presunto, ovos, cebola, azeitonas e ervilhas'
    },
    {
      id: 5,
      title: 'Pizza Frango com Catupiry',
      url: 'https://images.unsplash.com/photo-1590534047908-0c2e89fe85fd?w=600&h=600&fit=crop',
      description: 'Frango desfiado e muito catupiry'
    },
    {
      id: 6,
      title: 'Pizza Pepperoni Premium',
      url: 'https://images.unsplash.com/photo-1613564834-7ec5dba3f71e?w=600&h=600&fit=crop',
      description: 'Dupla de pepperoni e mussarela derretida'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider mb-4">
            Nossa Galeria
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-900 uppercase tracking-tight">
            Pizzas Que Fazem <span className="text-primary">Sucesso</span>
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Cada pizza é uma obra de arte feita com ingredientes selecionados e muito amor
          </p>
        </motion.div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              onClick={() => setSelectedImage(photo)}
            >
              {/* Image */}
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-black text-xl mb-2">{photo.title}</h3>
                  <p className="text-white/80 text-sm">{photo.description}</p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />

              {/* Info */}
              <div className="mt-6 text-center">
                <h3 className="text-white font-black text-3xl mb-2">{selectedImage.title}</h3>
                <p className="text-white/70 text-lg">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
