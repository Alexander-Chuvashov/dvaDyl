import { supabase } from '../lib/supabaseClient';

interface QueuedRequest {
    id: string;
    endpoint: string;
    method: 'POST' | 'PATCH' | 'DELETE';
    data: any;
    timestamp: number;
}

class OfflineService {
    private queueKey = 'offline_queue';
    private isOnline = navigator.onLine;

    constructor() {
        // Слушаем события сети
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Проверка соединения
    checkOnline(): boolean {
        return this.isOnline;
    }

    // Добавление запроса в очередь
    enqueueRequest(
        endpoint: string,
        method: 'POST' | 'PATCH' | 'DELETE',
        data: any,
    ): void {
        const queue = this.getQueue();
        queue.push({
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            endpoint,
            method,
            data,
            timestamp: Date.now(),
        });
        localStorage.setItem(this.queueKey, JSON.stringify(queue));
    }

    // Получение очереди
    getQueue(): QueuedRequest[] {
        try {
            const data = localStorage.getItem(this.queueKey);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    // Очистка очереди
    clearQueue(): void {
        localStorage.removeItem(this.queueKey);
    }

    // Синхронизация очереди с сервером
    async syncQueue(): Promise<void> {
        if (!this.isOnline) return;

        const queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`🔄 Синхронизация ${queue.length} запросов...`);

        const failedRequests: QueuedRequest[] = [];

        for (const req of queue) {
            try {
                const { error } = await supabase
                    .from(req.endpoint)
                    .upsert(req.data);
                if (error) throw error;
                console.log(`✅ Синхронизирован запрос ${req.id}`);
            } catch (error) {
                console.error(`❌ Ошибка синхронизации ${req.id}:`, error);
                failedRequests.push(req);
            }
        }

        // Обновляем очередь (оставляем только упавшие запросы)
        localStorage.setItem(this.queueKey, JSON.stringify(failedRequests));

        if (failedRequests.length === 0) {
            console.log('✅ Все запросы синхронизированы!');
        } else {
            console.log(
                `⚠️ ${failedRequests.length} запросов не синхронизированы`,
            );
        }
    }

    // Метод для попытки выполнить запрос с синхронизацией
    async tryRequest<T>(
        endpoint: string,
        method: 'POST' | 'PATCH' | 'DELETE',
        data: any,
        operation: () => Promise<T>,
    ): Promise<T> {
        if (this.isOnline) {
            try {
                return await operation();
            } catch (error) {
                console.warn(
                    '⚠️ Ошибка при выполнении запроса, добавляем в очередь',
                    error,
                );
                this.enqueueRequest(endpoint, method, data);
                // Возвращаем локальные данные (если есть)
                return data as T;
            }
        } else {
            // Офлайн — добавляем в очередь и возвращаем локальные данные
            this.enqueueRequest(endpoint, method, data);
            return data as T;
        }
    }
}

export const offlineService = new OfflineService();
