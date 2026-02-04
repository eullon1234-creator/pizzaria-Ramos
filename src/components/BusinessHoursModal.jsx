import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Loader2, Clock } from 'lucide-react'

const DAYS_OF_WEEK = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Segunda-feira', short: 'Seg' },
    { id: 2, name: 'Terça-feira', short: 'Ter' },
    { id: 3, name: 'Quarta-feira', short: 'Qua' },
    { id: 4, name: 'Quinta-feira', short: 'Qui' },
    { id: 5, name: 'Sexta-feira', short: 'Sex' },
    { id: 6, name: 'Sábado', short: 'Sáb' }
]

export default function BusinessHoursModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const [schedule, setSchedule] = useState({
        0: { open: true, openTime: '18:00', closeTime: '23:30' },
        1: { open: false, openTime: '18:00', closeTime: '23:30' },
        2: { open: true, openTime: '18:00', closeTime: '23:30' },
        3: { open: true, openTime: '18:00', closeTime: '23:30' },
        4: { open: true, openTime: '18:00', closeTime: '23:30' },
        5: { open: true, openTime: '18:00', closeTime: '23:30' },
        6: { open: true, openTime: '18:00', closeTime: '23:30' }
    })

    useEffect(() => {
        if (isOpen) {
            fetchBusinessHours()
        }
    }, [isOpen])

    const fetchBusinessHours = async () => {
        try {
            setLoading(true)
            const { data } = await supabase
                .from('store_settings')
                .select('*')
                .eq('key', 'business_hours')
                .single()

            if (data && data.value) {
                setSchedule(data.value)
            }
        } catch (error) {
            console.error('Error fetching business hours:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Check if settings exist first
            const { data: existing } = await supabase
                .from('store_settings')
                .select('id')
                .eq('key', 'business_hours')
                .single()

            if (existing) {
                await supabase
                    .from('store_settings')
                    .update({ value: schedule })
                    .eq('key', 'business_hours')
            } else {
                await supabase
                    .from('store_settings')
                    .insert({
                        key: 'business_hours',
                        value: schedule
                    })
            }
            alert('✅ Horários salvos com sucesso!')
            onClose()
        } catch (error) {
            console.error('Error saving business hours:', error)
            alert('Erro ao salvar os horários.')
        } finally {
            setLoading(false)
        }
    }

    const toggleDay = (dayId) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                open: !prev[dayId].open
            }
        }))
    }

    const updateTime = (dayId, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }))
    }

    const applyToAll = () => {
        const reference = schedule[0]
        const newSchedule = {}
        DAYS_OF_WEEK.forEach(day => {
            newSchedule[day.id] = { ...reference }
        })
        setSchedule(newSchedule)
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
                        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 bg-zinc-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Clock className="w-6 h-6 text-secondary" />
                                <h2 className="text-lg font-black uppercase italic tracking-tighter">Horário de Funcionamento</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-blue-800 font-bold">
                                    💡 Configure os dias e horários que sua pizzaria está aberta. Os clientes verão um aviso se tentarem fazer pedidos fora do horário.
                                </p>
                            </div>

                            <div className="flex justify-end mb-4">
                                <button
                                    type="button"
                                    onClick={applyToAll}
                                    className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                                >
                                    Aplicar horário do Domingo para todos os dias
                                </button>
                            </div>

                            <div className="space-y-3">
                                {DAYS_OF_WEEK.map(day => (
                                    <div
                                        key={day.id}
                                        className={`border-2 rounded-xl p-4 transition-all ${schedule[day.id]?.open
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-zinc-200 bg-zinc-50 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-30">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule[day.id]?.open || false}
                                                    onChange={() => toggleDay(day.id)}
                                                    className="w-5 h-5 rounded border-2 border-zinc-300 text-green-600 focus:ring-2 focus:ring-green-500"
                                                />
                                                <div>
                                                    <span className="font-black text-sm text-zinc-900 uppercase tracking-wide">
                                                        {day.name}
                                                    </span>
                                                    {!schedule[day.id]?.open && (
                                                        <span className="block text-xs text-red-600 font-bold uppercase mt-0.5">
                                                            Fechado
                                                        </span>
                                                    )}
                                                </div>
                                            </label>

                                            {schedule[day.id]?.open && (
                                                <div className="flex items-center gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                                            Abre
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={schedule[day.id]?.openTime || '18:00'}
                                                            onChange={(e) => updateTime(day.id, 'openTime', e.target.value)}
                                                            className="w-28 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                                        />
                                                    </div>
                                                    <span className="text-zinc-400 font-bold mt-5">até</span>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                                            Fecha
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={schedule[day.id]?.closeTime || '23:30'}
                                                            onChange={(e) => updateTime(day.id, 'closeTime', e.target.value)}
                                                            className="w-28 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Salvar Horários
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
