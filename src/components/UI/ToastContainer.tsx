// src/components/UI/ToastContainer.tsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed z-50 flex flex-col max-w-md gap-2 bottom-4 right-4">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
