import React, { createContext, useState, useContext, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, TriangleAlert, X } from 'lucide-react';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    warning: <TriangleAlert className="w-6 h-6" />,
};

const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
};


function Notification({ message, type = 'info', id, onDismiss }) {
    const Icon = icons[type];
    const color = colors[type];

    return (
        <div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`relative flex items-center gap-4 p-4 mb-4 rounded-lg text-white shadow-lg ${color}`}
            onClick={() => onDismiss(id)}
        >
            {Icon}
            <p className="flex-1 font-semibold">{message}</p>
            <button onClick={() => onDismiss(id)} className="absolute top-2 right-2 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const dismissNotification = useCallback((id) => {
        setNotifications(currentNotifications =>
            currentNotifications.filter(n => n.id !== id)
        );
    }, []);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(currentNotifications => [...currentNotifications, { id, message, type }]);

        setTimeout(() => {
            dismissNotification(id);
        }, 5000);
    }, [dismissNotification]);

    return (
        <NotificationContext.Provider value={addNotification}>
            {children}
            <div className="fixed bottom-4 right-4 z-100">
                <AnimatePresence>
                    {notifications.map(n => (
                        <Notification key={n.id} {...n} onDismiss={dismissNotification} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}
