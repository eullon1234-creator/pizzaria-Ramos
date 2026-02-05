import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Notification() {
    const { notification } = useCart()

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-300 pointer-events-none"
                >
                    <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">{notification}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
