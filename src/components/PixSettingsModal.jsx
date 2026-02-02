import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Loader2, CreditCard } from 'lucide-react'

export default function PixSettingsModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const [pixKey, setPixKey] = useState('')
    const [keyType, setKeyType] = useState('cpf') // cpf, cnpj, email, phone, random
    const [holderName, setHolderName] = useState('')
    const [bankName, setBankName] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchPixSettings()
        }
    }, [isOpen])

    const fetchPixSettings = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .eq('key', 'pix_config')
                .single()

            if (data && data.value) {
                setPixKey(data.value.pix_key || '')
                setKeyType(data.value.key_type || 'cpf')
                setHolderName(data.value.holder_name || '')
                setBankName(data.value.bank_name || '')
            }
        } catch (error) {
            console.error('Error fetching PIX settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        const pixConfig = {
            pix_key: pixKey,
            key_type: keyType,
            holder_name: holderName,
            bank_name: bankName
        }

        try {
            // Check if settings exist first
            const { data: existing } = await supabase
                .from('store_settings')
                .select('id')
                .eq('key', 'pix_config')
                .single()

            if (existing) {
                await supabase
                    .from('store_settings')
                    .update({ value: pixConfig })
                    .eq('key', 'pix_config')
            } else {
                await supabase
                    .from('store_settings')
                    .insert({
                        key: 'pix_config',
                        value: pixConfig
                    })
            }
            onClose()
        } catch (error) {
            console.error('Error saving PIX settings:', error)
            alert('Erro ao salvar as configurações.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 bg-zinc-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-primary" />
                                <h2 className="text-lg font-black uppercase italic tracking-tighter">Configurar PIX</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tipo de Chave</label>
                                <div className="flex bg-zinc-100 p-1 rounded-xl">
                                    {['cpf', 'cnpj', 'email', 'phone', 'random'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setKeyType(type)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${keyType === type ? 'bg-white shadow text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        >
                                            {type === 'random' ? 'Aleatória' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Chave PIX</label>
                                <input
                                    required
                                    type="text"
                                    value={pixKey}
                                    onChange={e => setPixKey(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium"
                                    placeholder="Digite sua chave PIX"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nome do Titular</label>
                                <input
                                    required
                                    type="text"
                                    value={holderName}
                                    onChange={e => setHolderName(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium"
                                    placeholder="Nome completo do recebedor"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nome do Banco</label>
                                <input
                                    required
                                    type="text"
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium"
                                    placeholder="Ex: Nubank, Banco do Brasil..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Salvar Configurações
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
