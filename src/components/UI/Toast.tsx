// src/components/UI/Toast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType } from '../../store/useToastStore';

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colorMap = {
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-error/30 bg-error/10 text-error',
    info: 'border-gold/30 bg-gold/10 text-gold',
    warning: 'border-gold/30 bg-gold/10 text-gold',
};

interface ToastProps {
    toast: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const Icon = iconMap[toast.type] || Info;
    const colorClass = colorMap[toast.type] || colorMap.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-card min-w-[300px] max-w-md ${colorClass}`}
        >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <div className="text-sm font-semibold">{toast.title}</div>
                )}
                <div className="text-sm break-words">{toast.message}</div>
            </div>
            <button
                onClick={onClose}
                className="transition-colors shrink-0 text-current/60 hover:text-current"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default Toast;
