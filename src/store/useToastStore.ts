// src/store/useToastStore.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number; // в миллисекундах, по умолчанию 4000
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}

export const useToastStore = create<ToastStore>(set => ({
    toasts: [],
    addToast: toast => {
        const id =
            Date.now().toString() + Math.random().toString(36).substring(2, 6);
        const newToast = { ...toast, id };
        set(state => ({
            toasts: [...state.toasts, newToast],
        }));
        // Автоматическое удаление через duration
        setTimeout(() => {
            set(state => ({
                toasts: state.toasts.filter(t => t.id !== id),
            }));
        }, toast.duration || 5000);
    },
    removeToast: id => {
        set(state => ({
            toasts: state.toasts.filter(t => t.id !== id),
        }));
    },
    clearToasts: () => set({ toasts: [] }),
}));
