import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Phone, User, Send, Clock, LocateFixed, Copy, Check, CreditCard, Save, Info, DollarSign, RefreshCw, Timer, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { generateDynamicPixQRCode } from '../lib/pixQRCode'

export default function Checkout({ isOpen, onClose }) {
    const { cart, cartTotal, clearCart } = useCart()
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [showPaymentPending, setShowPaymentPending] = useState(false)
    const [paymentConfirmed, setPaymentConfirmed] = useState(false)
    const [currentOrderId, setCurrentOrderId] = useState(null)
    const [pixSettings, setPixSettings] = useState(null)
    const [pixQRCode, setPixQRCode] = useState(null)
    const [pixPayload, setPixPayload] = useState(null)
    const [copied, setCopied] = useState(false)
    const [copiedPayload, setCopiedPayload] = useState(false)
    const [businessHours, setBusinessHours] = useState(null)
    const [saveData, setSaveData] = useState(false)
    const [hasStoredData, setHasStoredData] = useState(false)
    const [pixTimeLeft, setPixTimeLeft] = useState(0)
    const [pixExpired, setPixExpired] = useState(false)
    const pixTimerRef = useRef(null)
    const PIX_EXPIRATION_SECONDS = 15 * 60 // 15 minutos
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        endereco: '',
        numero: '',
        bairro: '',
        pontoReferencia: '',
        locationLink: '',
        tipoEntrega: 'imediata', // 'imediata' or 'agendada'
        horarioAgendado: '',
        paymentMethod: 'pix', // 'pix', 'dinheiro', 'cartao'
        needChange: false,
        changeFor: ''
    })
    const [errors, setErrors] = useState({})

    const PIZZARIA_WHATSAPP = "5586994471909"
    const STORAGE_KEY = 'pizzaria_ramos_customer_data'

    // Validation logic
    const validateField = (name, value) => {
        let error = ''
        switch (name) {
            case 'nome':
                if (!value) error = 'O nome é obrigatório.'
                break
            case 'whatsapp':
                if (!value) error = 'O WhatsApp é obrigatório.'
                else if (!/^\d{10,11}$/.test(value.replace(/\D/g, ''))) error = 'Número de WhatsApp inválido.'
                break
            case 'endereco':
                if (!value) error = 'O endereço é obrigatório.'
                break
            case 'numero':
                if (!value) error = 'O número é obrigatório.'
                break
            case 'bairro':
                if (!value) error = 'O bairro é obrigatório.'
                break
            case 'horarioAgendado':
                if (formData.tipoEntrega === 'agendada' && !value) {
                    error = 'A hora do agendamento é obrigatória.'
                }
                break
            case 'changeFor':
                if (formData.needChange && (!value || parseFloat(value) <= cartTotal)) {
                    error = `O valor deve ser maior que o total (R$ ${cartTotal.toFixed(2)}).`
                }
                break
            default:
                break
        }
        return error
    }

    const validateForm = () => {
        const newErrors = {}
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key])
            if (error) {
                newErrors[key] = error
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const fieldValue = type === 'checkbox' ? checked : value

        setFormData(prev => ({ ...prev, [name]: fieldValue }))

        const error = validateField(name, fieldValue)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    // Timer de expiração do PIX
    useEffect(() => {
        if (showPaymentPending && pixTimeLeft > 0 && !pixExpired) {
            pixTimerRef.current = setInterval(() => {
                setPixTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(pixTimerRef.current)
                        setPixExpired(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (pixTimerRef.current) clearInterval(pixTimerRef.current)
        }
    }, [showPaymentPending, pixExpired])

    const formatTimer = (seconds) => {
        const min = Math.floor(seconds / 60).toString().padStart(2, '0')
        const sec = (seconds % 60).toString().padStart(2, '0')
        return `${min}:${sec}`
    }

    const startPixTimer = () => {
        if (pixTimerRef.current) clearInterval(pixTimerRef.current)
        setPixExpired(false)
        setPixTimeLeft(PIX_EXPIRATION_SECONDS)
    }

    const handleRegeneratePixCode = useCallback(async () => {
        if (!pixSettings?.pix_key || !currentOrderId) return
        try {
            const { payload, qrCodeDataUrl } = await generateDynamicPixQRCode({
                pixKey: pixSettings.pix_key,
                keyType: pixSettings.key_type || 'random',
                holderName: pixSettings.holder_name || 'PIZZARIA RAMOS',
                city: pixSettings.city || 'Teresina',
                amount: cartTotal,
                transactionId: currentOrderId
            })
            setPixPayload(payload)
            setPixQRCode(qrCodeDataUrl)
            startPixTimer()
        } catch (error) {
            console.error('Erro ao regenerar QR Code PIX:', error)
        }
    }, [pixSettings, currentOrderId, cartTotal])

    useEffect(() => {
        if (isOpen) {
            // Reset all states when opening
            setOrderSuccess(false)
            setShowPaymentPending(false)
            setPaymentConfirmed(false)
            setCurrentOrderId(null)
            setCopied(false)
            setCopiedPayload(false)
            setPixQRCode(null)
            setPixPayload(null)
            setPixExpired(false)
            setPixTimeLeft(0)
            setErrors({})
            if (pixTimerRef.current) clearInterval(pixTimerRef.current)
            
            // Fetch settings
            fetchPixSettings()
            fetchBusinessHours()
            loadSavedData()
        }
    }, [isOpen])

    const loadSavedData = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsedData = JSON.parse(saved)
                setFormData(prev => ({
                    ...prev,
                    nome: parsedData.nome || '',
                    whatsapp: parsedData.whatsapp || '',
                    endereco: parsedData.endereco || '',
                    numero: parsedData.numero || '',
                    bairro: parsedData.bairro || '',
                    pontoReferencia: parsedData.pontoReferencia || '',
                }))
                setHasStoredData(true)
                setSaveData(true)
            }
        } catch (error) {
            console.error('Error loading saved data:', error)
        }
    }

    const saveCustomerData = () => {
        try {
            const dataToSave = {
                nome: formData.nome,
                whatsapp: formData.whatsapp,
                endereco: formData.endereco,
                numero: formData.numero,
                bairro: formData.bairro,
                pontoReferencia: formData.pontoReferencia,
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
        } catch (error) {
            console.error('Error saving data:', error)
        }
    }

    const clearSavedData = () => {
        try {
            localStorage.removeItem(STORAGE_KEY)
            setHasStoredData(false)
        } catch (error) {
            console.error('Error clearing data:', error)
        }
    }

    const fetchPixSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .eq('key', 'pix_config')
                .single()
            
            if (error) {
                console.error('Erro ao buscar PIX config:', error.message)
                return
            }
            
            if (data && data.value) {
                setPixSettings(data.value)
            }
        } catch (error) {
            console.error('❌ Exceção ao buscar PIX settings:', error)
        }
    }

    const fetchBusinessHours = async () => {
        try {
            const { data } = await supabase
                .from('store_settings')
                .select('*')
                .eq('key', 'business_hours')
                .single()

            if (data && data.value) {
                setBusinessHours(data.value)
            }
        } catch (error) {
            console.error('Error fetching business hours:', error)
        }
    }

    const copyPixKey = () => {
        if (pixSettings?.pix_key) {
            navigator.clipboard.writeText(pixSettings.pix_key)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const copyPixPayload = () => {
        if (pixPayload) {
            navigator.clipboard.writeText(pixPayload)
            setCopiedPayload(true)
            setTimeout(() => setCopiedPayload(false), 2000)
        }
    }

    const checkBusinessHours = () => {
        const now = new Date()
        const day = now.getDay()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const currentTime = hours * 60 + minutes

        // If no business hours configured, use default
        if (!businessHours || !businessHours[day]) {
            // Default: Monday closed, others 18:00-23:30
            if (day === 1) return { open: false, reason: 'Estamos fechados hoje (Segunda-feira).' }

            const openTime = 18 * 60
            const closeTime = 23 * 60 + 30

            if (currentTime < openTime || currentTime > closeTime) {
                return { open: false, reason: 'Nosso horário de funcionamento é das 18:00 às 23:30.' }
            }

            return { open: true }
        }

        const daySchedule = businessHours[day]

        // Check if the day is marked as closed
        if (!daySchedule.open) {
            const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
            return { open: false, reason: `Estamos fechados hoje (${dayNames[day]}).` }
        }

        // Parse open and close times
        const [openHour, openMin] = daySchedule.openTime.split(':').map(Number)
        const [closeHour, closeMin] = daySchedule.closeTime.split(':').map(Number)

        const openTime = openHour * 60 + openMin
        const closeTime = closeHour * 60 + closeMin

        if (currentTime < openTime || currentTime > closeTime) {
            return {
                open: false,
                reason: `Nosso horário de funcionamento hoje é das ${daySchedule.openTime} às ${daySchedule.closeTime}.`
            }
        }

        return { open: true }
    }

    const generateOrderId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = 'RAMOS-'
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Seu navegador não suporta geolocalização.')
            return
        }

        setIsLoadingLocation(true)

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`

            try {
                // Reverse geocoding with OpenStreetMap
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await response.json()

                if (data && data.address) {
                    const address = data.address

                    // Improved mapping for Brazilian addresses
                    const street = address.road || address.street || address.pedestrian || address.footway || address.path || ''
                    const neighborhood = address.suburb || address.neighbourhood || address.residential || address.city_district || address.village || ''
                    const number = address.house_number || ''

                    setFormData(prev => ({
                        ...prev,
                        endereco: street,
                        bairro: neighborhood,
                        numero: number,
                        locationLink: googleMapsLink
                    }))
                } else {
                    setFormData(prev => ({
                        ...prev,
                        locationLink: googleMapsLink
                    }))
                }
            } catch (error) {
                console.error('Error fetching address:', error)
                // Fallback to just the link if geocoding fails
                setFormData(prev => ({
                    ...prev,
                    locationLink: googleMapsLink
                }))
            } finally {
                setIsLoadingLocation(false)
            }
        }, (error) => {
            console.error('Geolocation error:', error)
            alert('Não foi possível obter sua localização. Verifique se o GPS está ativado.')
            setIsLoadingLocation(false)
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        })
    }

    const calculateDeliveryTime = () => {
        if (formData.tipoEntrega === 'agendada') {
            return `Agendado para ${formData.horarioAgendado}`
        }
        // Entrega imediata: 45 min a 1h30min
        return 'Entrega em 45 minutos a 1 hora e meia'
    }

    const handleSendOrder = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault()
        }

        if (!validateForm()) {
            return
        }

        // Ask user if they want to save their data (only if not already saved and checkbox is checked)
        if (saveData && !hasStoredData) {
            const confirmSave = window.confirm(
                '💾 Deseja salvar seus dados?\n\n' +
                'Ao salvar, seus dados pessoais e endereço ficarão preenchidos automaticamente nas próximas compras, tornando o processo muito mais rápido!\n\n' +
                'Clique em "OK" para salvar ou "Cancelar" para não salvar.'
            )

            if (confirmSave) {
                saveCustomerData()
            }
        } else if (saveData && hasStoredData) {
            // Update existing saved data
            saveCustomerData()
        } else if (!saveData && hasStoredData) {
            // User unchecked the box, clear saved data
            clearSavedData()
        }

        const business = checkBusinessHours()
        if (!business.open && formData.tipoEntrega === 'imediata') {
            if (!window.confirm(`${business.reason}\n\nDeseja enviar o pedido assim mesmo?`)) {
                return
            }
        }

        setIsSaving(true)

        try {
            // Pegar usuário logado
            const userStr = localStorage.getItem('user')
            if (!userStr) {
                alert('⚠️ Você precisa estar logado para fazer um pedido!')
                setIsSaving(false)
                return
            }
            const user = JSON.parse(userStr)

            // Preparar items no formato JSON
            const orderItems = cart.map(item => ({
                product_id: item.id,
                name: item.name,
                size: item.variation.size,
                price: item.variation.price,
                quantity: item.quantity
            }))

            // Salvar pedido no banco
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    customer_name: formData.nome,
                    customer_phone: formData.whatsapp,
                    customer_address: `${formData.endereco}, ${formData.numero} - ${formData.bairro}${formData.pontoReferencia ? ` (Ref: ${formData.pontoReferencia})` : ''}${formData.locationLink ? ` - ${formData.locationLink}` : ''}`,
                    items: orderItems,
                    total_amount: cartTotal,
                    payment_method: formData.paymentMethod,
                    payment_change: formData.needChange ? parseFloat(formData.changeFor) : null,
                    scheduled_delivery: formData.tipoEntrega === 'agendada',
                    delivery_date: formData.tipoEntrega === 'agendada' ? formData.horarioAgendado.split('T')[0] : null,
                    delivery_time: formData.tipoEntrega === 'agendada' ? formData.horarioAgendado.split('T')[1] : null,
                    status: 'pending',
                    notes: null
                })
                .select()
                .single()

            if (orderError) {
                console.error('❌ Erro ao salvar pedido:', orderError)
                throw orderError
            }

            const orderId = orderData.order_number
            setCurrentOrderId(orderId)

            // 3. Se for PIX, gerar QR Code e aguardar pagamento
            
            if (formData.paymentMethod === 'pix') {
                if (!pixSettings || !pixSettings.pix_key) {
                    alert('⚠️ PIX NÃO CONFIGURADO!\n\n' +
                          'As configurações de PIX não foram encontradas no banco de dados.\n\n' +
                          '📋 SOLUÇÃO:\n' +
                          '1. Vá em /admin/dashboard\n' +
                          '2. Clique em "💠 Configurar PIX"\n' +
                          '3. Preencha todos os campos\n' +
                          '4. Clique em "Salvar Configurações"\n\n' +
                          'Ou execute o arquivo supabase_setup.sql no Supabase SQL Editor.')
                    setIsSaving(false)
                    return
                }
                
                try {
                    const { payload, qrCodeDataUrl } = await generateDynamicPixQRCode({
                        pixKey: pixSettings.pix_key,
                        keyType: pixSettings.key_type || 'random',
                        holderName: pixSettings.holder_name || 'PIZZARIA RAMOS',
                        city: pixSettings.city || 'Teresina',
                        amount: cartTotal,
                        transactionId: orderId
                    })
                    
                    setPixPayload(payload)
                    setPixQRCode(qrCodeDataUrl)
                    setShowPaymentPending(true)
                    startPixTimer()
                    
                    setIsSaving(false)
                    return // Importante: parar aqui para mostrar tela de pagamento
                } catch (error) {
                    console.error('Erro ao gerar QR Code PIX:', error)
                    alert('Erro ao gerar QR Code. Tente novamente.')
                    setIsSaving(false)
                    return
                }
            } else {
                // 4. Se for dinheiro/cartão, enviar direto para WhatsApp
                handleSendToWhatsApp(orderId)
            }
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Ops! Tivemos um problema ao processar seu pedido. Por favor, tente novamente.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSendToWhatsApp = (orderId) => {
        const orderIdToUse = orderId || currentOrderId

        // Preparar mensagem do WhatsApp
        let message = `*🍕 NOVO PEDIDO - PIZZARIA RAMOS*\n\n`
        message += `*PEDIDO:* #${orderIdToUse}\n`
        message += `*👤 CLIENTE:* ${formData.nome}\n`
        message += `*📱 WHATSAPP:* ${formData.whatsapp}\n\n`

        message += `*📍 ENDEREÇO DE ENTREGA:*\n`
        message += `${formData.endereco}, ${formData.numero}\n`
        message += `Bairro: ${formData.bairro}\n`
        if (formData.pontoReferencia) message += `Ref: ${formData.pontoReferencia}\n`
        if (formData.locationLink) message += `🗺️ *Localização:* ${formData.locationLink}\n`
        message += `\n`

        message += `*🕒 ENTREGA:* ${formData.tipoEntrega === 'imediata' ? 'Imediata (45min - 1h30min)' : `Agendada para ${formData.horarioAgendado}`}\n\n`

        message += `*🛒 ITENS DO PEDIDO:*\n`
        message += cart.map(item => `• ${item.quantity}x ${item.name} (${item.variation.size}) - R$ ${(item.variation.price * item.quantity).toFixed(2)}`).join('\n')

        message += `\n\n*💵 PAGAMENTO:*\n`
        message += `Forma: ${formData.paymentMethod === 'pix' ? 'PIX ✅ PAGO' : formData.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}\n`
        if (formData.paymentMethod === 'dinheiro') {
            message += `Troco: ${formData.needChange ? `Para R$ ${formData.changeFor}` : 'Não precisa'}\n`
        }

        message += `\n*RESUMO FINANCEIRO:*\n`
        message += `Subtotal: R$ ${cartTotal.toFixed(2)}\n`
        message += `Entrega: Grátis\n`
        message += `*TOTAL: R$ ${cartTotal.toFixed(2)}*`

        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/${PIZZARIA_WHATSAPP}?text=${encoded}`, '_blank')

        // Mostrar tela de sucesso
        setShowPaymentPending(false)
        setOrderSuccess(true)
    }

    const handleFinish = () => {
        setOrderSuccess(false)
        clearCart()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            // Só fecha se não for pagamento pendente
                            if (!showPaymentPending) {
                                onClose()
                            }
                        }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="checkout-title"
                    >
                        {(() => {
                            if (showPaymentPending) {
                                return (
                            <div className="p-6 flex flex-col items-center justify-center text-center h-full space-y-5 scrollbar-hide overflow-y-auto">
                                {/* Header com Timer */}
                                <div className="w-full">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-3 animate-pulse">
                                        <CreditCard className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-800">Aguardando Pagamento</h2>
                                    <p className="text-zinc-600 font-medium text-sm mt-1">Pedido <span className="font-black text-primary">#{currentOrderId}</span></p>
                                    
                                    {/* Timer de Expiração */}
                                    {!pixExpired ? (
                                        <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black ${
                                            pixTimeLeft <= 120 
                                                ? 'bg-red-100 text-red-700 animate-pulse' 
                                                : pixTimeLeft <= 300 
                                                    ? 'bg-yellow-100 text-yellow-700' 
                                                    : 'bg-green-100 text-green-700'
                                        }`}>
                                            <Timer className="w-4 h-4" />
                                            <span>Expira em {formatTimer(pixTimeLeft)}</span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 space-y-3">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-red-100 text-red-700">
                                                <Timer className="w-4 h-4" />
                                                <span>QR Code expirado!</span>
                                            </div>
                                            <button
                                                onClick={handleRegeneratePixCode}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-red-700 transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Gerar Novo QR Code
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code PIX */}
                                {!pixExpired && (
                                <div className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-wider text-sm">
                                        <CreditCard className="w-5 h-5" />
                                        <span>Pagamento via PIX</span>
                                    </div>

                                    <div className="text-center space-y-4">
                                        {/* Valor do Pedido */}
                                        <div className="bg-gradient-to-r from-primary to-red-700 text-white p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Valor a Pagar</p>
                                            <p className="text-3xl font-black">R$ {cartTotal.toFixed(2)}</p>
                                        </div>

                                        {/* QR Code Dinâmico */}
                                        {pixQRCode ? (
                                            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border-2 border-zinc-100">
                                                <img
                                                    src={pixQRCode}
                                                    alt="QR Code PIX"
                                                    className="w-56 h-56 object-contain mx-auto"
                                                />
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">
                                                    📱 Escaneie com seu app de banco
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-white p-8 rounded-2xl inline-block shadow-sm border-2 border-zinc-100">
                                                <div className="w-56 h-56 flex items-center justify-center">
                                                    <div className="text-zinc-400 text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
                                                        <p className="text-xs font-bold">Gerando QR Code...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* PIX Copia e Cola */}
                                        {pixPayload && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">💰 Ou use o PIX Copia e Cola</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 font-mono text-[10px] text-zinc-800 font-bold break-all max-h-20 overflow-y-auto">
                                                        {pixPayload}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={copyPixPayload}
                                                        className={`p-3 rounded-xl font-bold transition-all ${copiedPayload
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-primary text-white hover:bg-red-900'
                                                            }`}
                                                    >
                                                        {copiedPayload ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                {copiedPayload && (
                                                    <p className="text-xs text-green-600 font-bold animate-in fade-in">✓ Código copiado!</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Informações adicionais */}
                                        {pixSettings && (
                                            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-left text-xs space-y-1">
                                                <p className="font-bold text-zinc-700">
                                                    <span className="text-zinc-500">Recebedor:</span> {pixSettings.holder_name}
                                                </p>
                                                <p className="font-bold text-zinc-700">
                                                    <span className="text-zinc-500">Banco:</span> {pixSettings.bank_name}
                                                </p>
                                                <p className="font-bold text-zinc-700">
                                                    <span className="text-zinc-500">Cidade:</span> {pixSettings.city || 'Teresina'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )}

                                {/* Resumo do Pedido */}
                                <div className="w-full bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                                        <ShoppingBag className="w-4 h-4 text-zinc-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resumo do Pedido</span>
                                    </div>
                                    <div className="p-3 space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-700 font-medium truncate mr-2">
                                                    {item.quantity}x {item.name} <span className="text-zinc-400">({item.variation.size})</span>
                                                </span>
                                                <span className="font-bold text-zinc-800 whitespace-nowrap">
                                                    R$ {(item.variation.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                                        <span className="text-xs font-black uppercase text-zinc-600">Total</span>
                                        <span className="text-sm font-black text-primary">R$ {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Mensagem de Instrução */}
                                <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3 text-left">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-black text-blue-900 mb-1 text-xs uppercase">Importante</h3>
                                            <p className="text-xs text-blue-800 leading-relaxed">
                                                Após efetuar o pagamento via PIX, confirme abaixo para enviar seu pedido à nossa equipe no WhatsApp.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkbox de Confirmação */}
                                <div className="w-full bg-white border-2 border-zinc-200 rounded-xl p-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={paymentConfirmed}
                                            onChange={(e) => setPaymentConfirmed(e.target.checked)}
                                            className="w-5 h-5 text-primary border-2 border-zinc-300 rounded focus:ring-2 focus:ring-primary mt-0.5 cursor-pointer"
                                        />
                                        <span className="text-sm text-zinc-700 font-medium group-hover:text-zinc-900 transition-colors">
                                            ✅ Confirmo que realizei o pagamento via PIX
                                        </span>
                                    </label>
                                </div>

                                {/* Botão para Enviar ao WhatsApp */}
                                <button
                                    onClick={() => handleSendToWhatsApp()}
                                    disabled={!paymentConfirmed}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        paymentConfirmed 
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send className="w-5 h-5" />
                                    {paymentConfirmed ? 'Enviar Pedido à Equipe' : 'Confirme o Pagamento Primeiro'}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-zinc-500 hover:text-zinc-700 text-sm font-bold underline transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )
                    } else if (orderSuccess) {
                        return (
                            <div className="p-8 flex flex-col items-center justify-center text-center h-full space-y-6 scrollbar-hide overflow-y-auto">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h2 id="checkout-title-success" className="text-2xl font-black uppercase italic tracking-tighter text-zinc-800">Pedido Enviado!</h2>
                                <p className="text-zinc-500 font-medium">Seu pedido foi registrado e enviado para nosso WhatsApp.</p>

                                {/* Tempo de Entrega */}
                                <div className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                                    <div className="flex items-center justify-center gap-2 text-blue-600 font-black uppercase tracking-wider text-sm mb-2">
                                        <Clock className="w-5 h-5" />
                                        <span>Tempo de Entrega</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-900">{calculateDeliveryTime()}</p>
                                </div>

                                {/* Informação de Pagamento */}
                                <div className="w-full bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                                    <div className="flex items-center justify-center gap-2 text-green-700 font-black uppercase tracking-wider text-sm mb-3">
                                        <Check className="w-5 h-5" />
                                        <span>Pagamento</span>
                                    </div>
                                    <p className="text-sm text-green-800 leading-relaxed">
                                        {formData.paymentMethod === 'pix' 
                                            ? '✅ PIX confirmado! Nossa equipe já recebeu seu pedido.' 
                                            : formData.paymentMethod === 'dinheiro'
                                            ? `💵 Pagamento em dinheiro na entrega${formData.needChange ? ` - Troco para R$ ${formData.changeFor}` : ''}`
                                            : '💳 Pagamento com cartão na entrega'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleFinish}
                                    className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                                >
                                    Fechar e Voltar ao Início
                                </button>
                            </div>
                        )
                    } else {
                        return (
                            <>
                                {/* Header */}
                                <div className="p-6 bg-primary text-white flex justify-between items-center shrink-0">
                                    <div>
                                        <h2 id="checkout-title" className="text-xl font-black uppercase italic tracking-tighter">Finalizar Pedido</h2>
                                        <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Quase lá! Só precisamos do endereço.</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Fechar checkout">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSendOrder} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                    {/* Identificação */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <User className="w-5 h-5" />
                                            <h3 className="font-black uppercase italic text-sm tracking-wider">Identificação</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Seu Nome</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="nome"
                                                    value={formData.nome}
                                                    onChange={handleChange}
                                                    className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium ${errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                    placeholder="Como podemos te chamar?"
                                                />
                                                {errors.nome && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.nome}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">WhatsApp</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium ${errors.whatsapp ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                    placeholder="(86) 9...."
                                                />
                                                {errors.whatsapp && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.whatsapp}</p>}
                                            </div>
                                        </div>

                                        {/* Save Data Checkbox */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={saveData}
                                                    onChange={(e) => setSaveData(e.target.checked)}
                                                    className="mt-0.5 w-5 h-5 rounded border-2 border-blue-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Save className="w-4 h-4 text-blue-600" />
                                                        <span className="font-black text-sm text-blue-900 uppercase tracking-wide">
                                                            {hasStoredData ? 'Manter dados salvos' : 'Salvar meus dados'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                                        {hasStoredData
                                                            ? 'Seus dados já estão salvos. Desmarque para apagar.'
                                                            : 'Salve seus dados para preencher automaticamente nas próximas compras e economizar tempo!'
                                                        }
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Endereço */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary">
                                                <MapPin className="w-5 h-5" />
                                                <h3 className="font-black uppercase italic text-sm tracking-wider">Endereço de Entrega</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGetLocation}
                                                disabled={isLoadingLocation}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                                            >
                                                {isLoadingLocation ? (
                                                    <span className="block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                                                ) : (
                                                    <LocateFixed className="w-3 h-3" />
                                                )}
                                                {isLoadingLocation ? 'Buscando...' : 'Usar Localização Atual'}
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="col-span-3 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Rua / Avenida</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="endereco"
                                                        value={formData.endereco}
                                                        onChange={handleChange}
                                                        className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium ${errors.endereco ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                        placeholder="Nome da rua"
                                                    />
                                                    {errors.endereco && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.endereco}</p>}
                                                </div>
                                                <div className="col-span-1 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Nº</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="numero"
                                                        value={formData.numero}
                                                        onChange={handleChange}
                                                        className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium ${errors.numero ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                        placeholder="123"
                                                    />
                                                    {errors.numero && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.numero}</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Bairro</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="bairro"
                                                        value={formData.bairro}
                                                        onChange={handleChange}
                                                        className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium ${errors.bairro ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                        placeholder="Seu bairro"
                                                    />
                                                    {errors.bairro && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.bairro}</p>}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Ponto de Referência</label>
                                                    <input
                                                        type="text"
                                                        name="pontoReferencia"
                                                        value={formData.pontoReferencia}
                                                        onChange={handleChange}
                                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                                        placeholder="Próximo a..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pagamento */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                                        <div className="flex items-center gap-2 text-primary">
                                            <CreditCard className="w-5 h-5" />
                                            <h3 className="font-black uppercase italic text-sm tracking-wider">Forma de Pagamento</h3>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'pix', label: 'PIX', icon: '💠' },
                                                { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
                                                { id: 'cartao', label: 'Cartão', icon: '💳' }
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.paymentMethod === method.id ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 text-zinc-400'}`}
                                                >
                                                    <span className="text-xl">{method.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {formData.paymentMethod === 'dinheiro' && (
                                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-orange-500 p-1 rounded-lg">
                                                            <DollarSign className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase text-orange-900 tracking-wider">Precisa de troco?</span>
                                                    </div>
                                                    <div className="flex bg-white rounded-lg p-1 border border-orange-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, needChange: false })}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${!formData.needChange ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
                                                        >
                                                            Não
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, needChange: true })}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${formData.needChange ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
                                                        >
                                                            Sim
                                                        </button>
                                                    </div>
                                                </div>

                                                {formData.needChange && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest ml-1">Troco para quanto?</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">R$</span>
                                                            <input
                                                                type="number"
                                                                name="changeFor"
                                                                value={formData.changeFor}
                                                                onChange={handleChange}
                                                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 font-bold ${errors.changeFor ? 'border-red-500 focus:ring-red-500' : 'border-orange-100 focus:ring-orange-200'}`}
                                                                placeholder="0.00"
                                                            />
                                                            {errors.changeFor && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.changeFor}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* PIX Details */}
                                        {formData.paymentMethod === 'pix' && pixSettings && (
                                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="text-center space-y-4">
                                                    <h4 className="text-sm font-black uppercase text-blue-900 tracking-wider">Pague com PIX</h4>

                                                    {/* QR Code */}
                                                    {pixSettings.qr_code_url && (
                                                        <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                                                            <img
                                                                src={pixSettings.qr_code_url}
                                                                alt="QR Code PIX"
                                                                className="w-48 h-48 object-contain mx-auto"
                                                            />
                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Escaneie o QR Code</p>
                                                        </div>
                                                    )}

                                                    {/* PIX Key */}
                                                    {pixSettings.pix_key && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Ou copie a chave PIX</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-3 font-mono text-sm text-blue-900 font-bold break-all">
                                                                    {pixSettings.pix_key}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={copyPixKey}
                                                                    className={`p-3 rounded-xl font-bold transition-all ${copied
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                        }`}
                                                                >
                                                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                                </button>
                                                            </div>
                                                            {copied && (
                                                                <p className="text-xs text-green-600 font-bold animate-in fade-in">✓ Chave copiada!</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="bg-blue-100 p-3 rounded-xl">
                                                        <p className="text-xs text-blue-800 font-bold">
                                                            💡 Após realizar o pagamento, envie o comprovante pelo WhatsApp
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agendamento */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Clock className="w-5 h-5" />
                                            <h3 className="font-black uppercase italic text-sm tracking-wider">Tempo de Entrega</h3>
                                        </div>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.tipoEntrega === 'imediata' ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50 opacity-60'}`}>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    value="imediata"
                                                    checked={formData.tipoEntrega === 'imediata'}
                                                    onChange={e => setFormData({ ...formData, tipoEntrega: e.target.value })}
                                                />
                                                <span className="block font-black text-xs uppercase tracking-tighter">Imediata</span>
                                                <span className="block text-[10px] text-secondary font-bold uppercase mt-1 italic">O mais rápido</span>
                                                <span className="block text-[10px] text-zinc-400 font-bold mt-0.5">Previsão: 45min - 1h30min</span>
                                            </label>
                                            <label className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.tipoEntrega === 'agendada' ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50 opacity-60'}`}>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    value="agendada"
                                                    checked={formData.tipoEntrega === 'agendada'}
                                                    onChange={e => setFormData({ ...formData, tipoEntrega: e.target.value })}
                                                />
                                                <span className="block font-black text-xs uppercase tracking-tighter">Agendar</span>
                                                <span className="block text-[10px] text-zinc-400 font-bold mt-1">Escolha o horário</span>
                                            </label>
                                        </div>

                                        {formData.tipoEntrega === 'agendada' && (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Horário desejado</label>
                                                <input
                                                    required
                                                    type="time"
                                                    name="horarioAgendado"
                                                    value={formData.horarioAgendado}
                                                    onChange={handleChange}
                                                    min="18:00"
                                                    max="23:30"
                                                    className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-bold ${errors.horarioAgendado ? 'border-red-500 focus:ring-red-500' : 'border-zinc-100 focus:ring-primary'}`}
                                                />
                                                {errors.horarioAgendado && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.horarioAgendado}</p>}
                                                <p className="text-[10px] text-zinc-400 font-medium px-1">Horário de funcionamento: 18:00 às 23:30</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Adicional */}
                                    <div className="bg-primary/5 p-4 rounded-3xl border-2 border-primary/10 flex items-start gap-3">
                                        <div className="bg-primary text-white p-2 rounded-xl">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-primary mb-1">Dica Importante</p>
                                            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                                                Ao clicar em "Finalizar Pedido", você será redirecionado para o WhatsApp para enviar o pedido oficial.
                                            </p>
                                        </div>
                                    </div>
                                </form>

                                {/* Footer */}
                                <div className="p-6 bg-white border-t border-zinc-100 flex items-center justify-between gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total à Pagar</span>
                                        <span className="text-2xl font-black italic tracking-tighter text-primary">R$ {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOrder}
                                        disabled={isSaving}
                                        className={`flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-900 group'}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                                <span>Enviando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Finalizar Pedido</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )
                    }
                })()}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
