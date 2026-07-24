// src/components/UI/NotificationManager.tsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const NotificationManager: React.FC = () => {
    const { xp, dailyGoal, userId } = useAppStore();

    useEffect(() => {
        // Проверяем, поддерживаются ли уведомления
        if (!('Notification' in window)) return;

        // Запрашиваем разрешение
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Периодическая проверка (каждые 30 минут)
        const interval = setInterval(
            () => {
                checkAndNotify();
            },
            30 * 60 * 1000,
        );

        // Проверяем сразу при загрузке
        checkAndNotify();

        return () => clearInterval(interval);
    }, [xp, dailyGoal]);

    const checkAndNotify = () => {
        // Если пользователь не авторизован — не отправляем
        if (!userId) return;

        // Если разрешение не дано — выходим
        if (Notification.permission !== 'granted') return;

        // 1. Напоминание о ежедневной цели
        if (xp < dailyGoal) {
            const remaining = dailyGoal - xp;
            new Notification('📚 DVA-DYL: Ежедневная цель', {
                body: `Осталось ${remaining} XP до выполнения дневной цели! Продолжай учиться!`,
                icon: '/pwa-192x192.png',
                tag: 'daily-goal',
                requireInteraction: true,
            });
        }

        // 2. Напоминание о повторении слов (если есть слова для повторения)
        // Для этого нужно добавить логику проверки слов из БД (можно позже)
    };

    return null;
};

export default NotificationManager;
