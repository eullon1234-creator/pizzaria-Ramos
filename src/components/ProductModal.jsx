import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Upload, Link as LinkIcon, Plus, Trash2, Camera } from 'lucide-react'

export default function ProductModal({ product, categories, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        image_url: '',
        is_active: true
    })
    const [prices, setPrices] = useState([{ size: '', price: '' }])
    const [imageType, setImageType] = useState('url') // 'url' or 'upload'
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                category_id: product.category_id,
                image_url: product.image_url || '',
                is_active: product.is_active
            })
            if (product.product_prices && product.product_prices.length > 0) {
                setPrices(product.product_prices.map(p => ({ size: p.size, price: p.price })))
            }
        }
    }, [product, categories])

    const handleFileUpload = async (e) => {
        try {
            setUploading(true)
            const file = e.target.files[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
        } catch (error) {
            alert('Erro ao enviar imagem: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const addPriceField = () => setPrices([...prices, { size: '', price: '' }])

    const removePriceField = (index) => {
        if (prices.length > 1) {
            setPrices(prices.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Save/Update Product
            let productId = product?.id

            if (product) {
                const { error } = await supabase
                    .from('products')
                    .update(formData)
                    .eq('id', product.id)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert([formData])
                    .select()
                if (error) throw error
                productId = data[0].id
            }

            // 2. Save Prices
            // Delete old prices if editing
            if (product) {
                await supabase.from('product_prices').delete().eq('product_id', product.id)
            }

            const pricesToSave = prices
                .filter(p => p.size && p.price)
                .map(p => ({
                    product_id: productId,
                    size: p.size,
                    price: parseFloat(p.price)
                }))

            if (pricesToSave.length > 0) {
                const { error: priceError } = await supabase
                    .from('product_prices')
                    .insert(pricesToSave)
                if (priceError) throw priceError
            }

            onSave()
            onClose()
        } catch (error) {
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 rounded-t-3xl">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">
                        {product ? 'Editar Item' : 'Novo Item do Cardápio'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dados Básicos */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Ex: Pizza Calabresa"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Categoria</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Descrição</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                                    placeholder="Descreva os ingredientes..."
                                />
                            </div>
                        </div>

                        {/* Imagem */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Foto do Produto</label>

                            <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setImageType('url')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${imageType === 'url' ? 'bg-white shadow-sm text-primary' : 'text-zinc-500'}`}
                                >
                                    <LinkIcon className="w-4 h-4" /> Link URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageType('upload')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${imageType === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-zinc-500'}`}
                                >
                                    <Upload className="w-4 h-4" /> Upload
                                </button>
                            </div>

                            {imageType === 'url' ? (
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="https://..."
                                />
                            ) : (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-primary transition-all">
                                        {uploading ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                                        ) : (
                                            <>
                                                <Camera className="w-8 h-8 text-zinc-300" />
                                                <span className="text-xs font-bold text-zinc-500">Clique para subir foto</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.image_url && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-zinc-100 aspect-video bg-zinc-50 flex items-center justify-center">
                                    <img src={formData.image_url} alt="Preview" className="max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preços e Tamanhos */}
                    <div className="pt-6 border-t border-zinc-100">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Preços e Variações</label>
                            <button
                                type="button"
                                onClick={addPriceField}
                                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                            >
                                <Plus className="w-4 h-4" /> Add Tamanho
                            </button>
                        </div>

                        <div className="space-y-3">
                            {prices.map((priceObj, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tam (Ex: P, G, 1L)"
                                        value={priceObj.size}
                                        onChange={e => {
                                            const newPrices = [...prices]
                                            newPrices[index].size = e.target.value
                                            setPrices(newPrices)
                                        }}
                                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 outline-none"
                                    />
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0,00"
                                            value={priceObj.price}
                                            onChange={e => {
                                                const newPrices = [...prices]
                                                newPrices[index].price = e.target.value
                                                setPrices(newPrices)
                                            }}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePriceField(index)}
                                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-[2] py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
