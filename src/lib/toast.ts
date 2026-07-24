// src/lib/toast.ts
import { useToastStore, type ToastType } from '../store/useToastStore';

export const toast = {
    success: (message: string, title?: string) => {
        useToastStore.getState().addToast({ type: 'success', message, title });
    },
    error: (message: string, title?: string) => {
        useToastStore.getState().addToast({ type: 'error', message, title });
    },
    info: (message: string, title?: string) => {
        useToastStore.getState().addToast({ type: 'info', message, title });
    },
    warning: (message: string, title?: string) => {
        useToastStore.getState().addToast({ type: 'warning', message, title });
    },
};
