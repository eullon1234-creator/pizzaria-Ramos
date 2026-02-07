import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, User, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function TestimonialFormModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    text: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (formData.name.length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (formData.text.length < 20) {
      setError('Depoimento deve ter pelo menos 20 caracteres');
      setLoading(false);
      return;
    }

    if (formData.text.length > 300) {
      setError('Depoimento deve ter no máximo 300 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Gerar avatar com iniciais
      const nameParts = formData.name.trim().split(' ');
      const avatar = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : formData.name.substring(0, 2).toUpperCase();

      // Inserir depoimento (is_active = false para aprovação)
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([{
          name: formData.name.trim(),
          avatar: avatar,
          rating: formData.rating,
          text: formData.text.trim(),
          location: formData.location.trim() || 'Novo Amarante',
          is_active: false // Aguardando aprovação
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', location: '', rating: 5, text: '' });
      }, 3000);

    } catch (err) {
      console.error('Erro ao enviar depoimento:', err);
      setError('Erro ao enviar depoimento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-red-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="fill-yellow-300 text-yellow-300" size={28} />
            Deixe seu Depoimento
          </h2>
          <p className="text-white/90 mt-2 text-sm">
            Conte-nos sobre sua experiência! Seu depoimento será analisado antes de ser publicado.
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 m-6 rounded"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <Send className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-green-800 font-semibold">Depoimento enviado com sucesso!</p>
                  <p className="text-green-600 text-sm">Aguarde nossa análise. Obrigado!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} />
                Seu Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Maria Silva"
                required
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} />
                Bairro / Cidade
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Centro, Novo Amarante"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleChange('rating', star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= formData.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu Depoimento * ({formData.text.length}/300)
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Conte-nos sobre sua experiência com a Pizzaria Ramos..."
                required
                maxLength={300}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 20 caracteres, máximo 300
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Depoimento
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Seu depoimento será analisado por nossa equipe antes de ser publicado
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
