import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'

export default function PixSettingsModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const [pixKey, setPixKey] = useState('')
    const [keyType, setKeyType] = useState('cpf') // cpf, cnpj, email, phone, random
    const [holderName, setHolderName] = useState('')
    const [bankName, setBankName] = useState('')
    const [city, setCity] = useState('Teresina')
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchPixSettings()
            setSaveSuccess(false)
            setError('')
        }
    }, [isOpen])

    const validateInputs = () => {
        if (!pixKey.trim()) {
            setError('Chave PIX é obrigatória')
            return false
        }
        if (!holderName.trim()) {
            setError('Nome do titular é obrigatório')
            return false
        }
        if (!bankName.trim()) {
            setError('Nome do banco é obrigatório')
            return false
        }
        if (!city.trim()) {
            setError('Cidade é obrigatória')
            return false
        }

        // Validate PIX key format based on type
        const trimmedKey = pixKey.trim()
        if (keyType === 'cpf') {
            if (!/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(trimmedKey)) {
                setError('CPF inválido. Use formato 12345678901 ou 123.456.789-01')
                return false
            }
        } else if (keyType === 'cnpj') {
            if (!/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(trimmedKey)) {
                setError('CNPJ inválido. Use formato 12345678000195 ou 12.345.678/0001-95')
                return false
            }
        } else if (keyType === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedKey)) {
                setError('Email inválido')
                return false
            }
        } else if (keyType === 'phone') {
            if (!/^\d{10,11}$|^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(trimmedKey)) {
                setError('Telefone inválido. Use formato 11912345678 ou (11) 91234-5678')
                return false
            }
        }

        setError('')
        return true
    }

    const fetchPixSettings = async () => {
        try {
            setLoading(true)
            const { data } = await supabase
                .from('store_settings')
                .select('*')
                .eq('key', 'pix_config')
                .single()

            if (data && data.value) {
                setPixKey(data.value.pix_key || '')
                setKeyType(data.value.key_type || 'cpf')
                setHolderName(data.value.holder_name || '')
                setBankName(data.value.bank_name || '')
                setCity(data.value.city || 'Teresina')
            }
        } catch (error) {
            console.error('Error fetching PIX settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        
        if (!validateInputs()) {
            return
        }

        setLoading(true)
        setSaveSuccess(false)

        const pixConfig = {
            pix_key: pixKey.trim(),
            key_type: keyType,
            holder_name: holderName.trim(),
            bank_name: bankName.trim(),
            city: city.trim()
        }

        try {
            // Check if settings exist first
            const { data: existing, error: fetchErr } = await supabase
                .from('store_settings')
                .select('id')
                .eq('key', 'pix_config')
                .single()

            if (fetchErr && fetchErr.code !== 'PGRST116') {
                throw fetchErr
            }

            if (existing) {
                const { error: updateErr } = await supabase
                    .from('store_settings')
                    .update({ value: pixConfig, updated_at: new Date() })
                    .eq('key', 'pix_config')
                
                if (updateErr) throw updateErr
            } else {
                const { error: insertErr } = await supabase
                    .from('store_settings')
                    .insert({
                        key: 'pix_config',
                        value: pixConfig
                    })
                
                if (insertErr) throw insertErr
            }

            setSaveSuccess(true)
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            console.error('Error saving PIX settings:', error)
            setError('Erro ao salvar as configurações. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
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
                        {saveSuccess ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black uppercase text-zinc-800">Sucesso!</h2>
                                <p className="text-sm text-zinc-600">Suas configurações de PIX foram salvas.</p>
                            </div>
                        ) : (
                            <>
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
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tipo de Chave PIX</label>
                                        <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                                            {['cpf', 'cnpj', 'email', 'phone'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setKeyType(type)
                                                        setPixKey('')
                                                        setError('')
                                                    }}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${keyType === type ? 'bg-white shadow text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                >
                                                    {type === 'phone' ? 'Cel' : type}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-2">
                                            {keyType === 'cpf' && 'CPF sem formatação (11 dígitos) ou formatado'}
                                            {keyType === 'cnpj' && 'CNPJ sem formatação (14 dígitos) ou formatado'}
                                            {keyType === 'email' && 'Email válido'}
                                            {keyType === 'phone' && 'Telefone (10 ou 11 dígitos) ou formatado'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                                            {keyType === 'cpf' && 'CPF'}
                                            {keyType === 'cnpj' && 'CNPJ'}
                                            {keyType === 'email' && 'Email'}
                                            {keyType === 'phone' && 'Telefone'}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={pixKey}
                                            onChange={e => {
                                                setPixKey(e.target.value)
                                                setError('')
                                            }}
                                            className={`w-full bg-zinc-50 border-2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium transition-all ${error ? 'border-red-200' : 'border-zinc-100'}`}
                                            placeholder={
                                                keyType === 'cpf' ? '123.456.789-01 ou 12345678901'
                                                : keyType === 'cnpj' ? '12.345.678/0001-95 ou 12345678000195'
                                                : keyType === 'email' ? 'seu@email.com'
                                                : '(11) 99999-9999 ou 11999999999'
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nome do Titular</label>
                                        <input
                                            required
                                            type="text"
                                            value={holderName}
                                            onChange={e => {
                                                setHolderName(e.target.value)
                                                setError('')
                                            }}
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
                                            onChange={e => {
                                                setBankName(e.target.value)
                                                setError('')
                                            }}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium"
                                            placeholder="Ex: Nubank, Banco do Brasil, Inter..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Cidade</label>
                                        <input
                                            required
                                            type="text"
                                            value={city}
                                            onChange={e => {
                                                setCity(e.target.value)
                                                setError('')
                                            }}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium"
                                            placeholder="Ex: Teresina, São Paulo, Rio de Janeiro..."
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2">📌 Dica</p>
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            Essas informações aparecerão na tela de sucesso do pedido para o cliente saber como pagar. Certifique-se de que estão corretas!
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 mt-2 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
