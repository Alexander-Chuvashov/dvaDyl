// src/components/TestSupabase.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const TestSupabase = () => {
    const [status, setStatus] = useState('Проверка...');

    useEffect(() => {
        const testConnection = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('count');
                if (error) throw error;
                setStatus('✅ Подключение успешно!');
            } catch (e) {
                setStatus('❌ Ошибка: ' + (e as Error).message);
            }
        };
        testConnection();
    }, []);

    return <div>{status}</div>;
};
