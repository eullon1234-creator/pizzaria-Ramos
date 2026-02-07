import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, Calendar, Tag, Clock, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PromotionModal({ isOpen, onClose }) {
    const [products, setProducts] = useState([]);
    const [activePromotions, setActivePromotions] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(20);
    const [durationDays, setDurationDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingPromo, setEditingPromo] = useState(null);

    // Buscar produtos e promoções ao abrir modal
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            fetchActivePromotions();
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, category_id')
                .eq('is_active', true)
                .order('name');
            
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            setError('Erro ao carregar produtos');
        }
    };

    const fetchActivePromotions = async () => {
        try {
            // Primeiro desativar promoções expiradas
            await supabase.rpc('deactivate_expired_promotions').catch(() => {});
            
            const { data, error } = await supabase
                .from('promotions')
                .select(`
                    id,
                    product_id,
                    discount_percentage,
                    start_date,
                    end_date,
                    is_active,
                    products (name)
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setActivePromotions(data || []);
        } catch (err) {
            console.error('Erro ao buscar promoções:', err);
        }
    };

    const handleCreatePromotion = async (e) => {
        e.preventDefault();
        
        if (!selectedProduct) {
            setError('Selecione um produto');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);

            const promotionData = {
                product_id: selectedProduct, // UUID string, não precisa parseInt
                discount_percentage: discountPercentage,
                end_date: endDate.toISOString(),
                is_active: true,
                created_by: 'Admin'
            };

            if (editingPromo) {
                // Atualizar promoção existente
                const { error } = await supabase
                    .from('promotions')
                    .update(promotionData)
                    .eq('id', editingPromo.id);

                if (error) throw error;
                setSuccess('Promoção atualizada com sucesso!');
            } else {
                // Criar nova promoção
                const { error } = await supabase
                    .from('promotions')
                    .insert([promotionData]);

                if (error) throw error;
                setSuccess('Promoção criada com sucesso!');
            }

            // Resetar formulário
            setSelectedProduct('');
            setDiscountPercentage(20);
            setDurationDays(7);
            setEditingPromo(null);
            
            // Atualizar lista
            await fetchActivePromotions();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Erro ao criar promoção:', err);
            setError(err.message || 'Erro ao criar promoção');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePromotion = async (promoId) => {
        if (!confirm('Deseja realmente remover esta promoção?')) return;

        try {
            const { error } = await supabase
                .from('promotions')
                .update({ is_active: false })
                .eq('id', promoId);

            if (error) throw error;
            
            setSuccess('Promoção removida!');
            await fetchActivePromotions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Erro ao deletar promoção:', err);
            setError('Erro ao remover promoção');
        }
    };

    const handleEditPromotion = (promo) => {
        setEditingPromo(promo);
        setSelectedProduct(promo.product_id.toString());
        setDiscountPercentage(promo.discount_percentage);
        
        // Calcular dias restantes
        const daysLeft = Math.ceil((new Date(promo.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        setDurationDays(Math.max(1, daysLeft));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysRemaining = (endDate) => {
        const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Tag className="w-8 h-8 text-white" />
                            <h2 className="text-2xl font-black text-white">
                                🔥 Gerenciar Promoções
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
                        {/* Mensagens */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Formulário de Criação */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-primary" />
                                {editingPromo ? 'Editar Promoção' : 'Criar Nova Promoção'}
                            </h3>
                            
                            <form onSubmit={handleCreatePromotion} className="space-y-4">
                                {/* Selecionar Produto */}
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                                        Produto
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
                                        required
                                    >
                                        <option value="">Selecione um produto...</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Percentual de Desconto */}
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                                        Desconto (%)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="5"
                                            max="90"
                                            step="5"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <div className="bg-primary text-white text-2xl font-black px-6 py-3 rounded-lg min-w-[100px] text-center">
                                            {discountPercentage}%
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Arraste para definir o desconto
                                    </p>
                                </div>

                                {/* Duração */}
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                                        Duração (dias)
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 3, 7, 15, 30].map((days) => (
                                            <button
                                                key={days}
                                                type="button"
                                                onClick={() => setDurationDays(days)}
                                                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                                    durationDays === days
                                                        ? 'bg-primary text-white'
                                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                                }`}
                                            >
                                                {days} {days === 1 ? 'dia' : 'dias'}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(parseInt(e.target.value))}
                                        className="w-full mt-2 px-4 py-2 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
                                        placeholder="Ou digite a quantidade de dias"
                                    />
                                </div>

                                {/* Botões */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Salvando...' : editingPromo ? '✏️ Atualizar Promoção' : '🔥 Criar Promoção'}
                                    </button>
                                    {editingPromo && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPromo(null);
                                                setSelectedProduct('');
                                                setDiscountPercentage(20);
                                                setDurationDays(7);
                                            }}
                                            className="px-6 bg-zinc-200 text-zinc-700 font-bold py-3 rounded-lg hover:bg-zinc-300 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Lista de Promoções Ativas */}
                        <div className="p-6 bg-zinc-50 border-t-2 border-zinc-200">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Promoções Ativas ({activePromotions.length})
                            </h3>

                            {activePromotions.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">
                                    Nenhuma promoção ativa no momento
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {activePromotions.map((promo) => (
                                        <motion.div
                                            key={promo.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-zinc-800">
                                                    {promo.products.name}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600">
                                                    <span className="flex items-center gap-1">
                                                        <Percent className="w-4 h-4 text-primary" />
                                                        <strong className="text-primary">{promo.discount_percentage}% OFF</strong>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Até {formatDate(promo.end_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {getDaysRemaining(promo.end_date)} dias restantes
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditPromotion(promo)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePromotion(promo.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
