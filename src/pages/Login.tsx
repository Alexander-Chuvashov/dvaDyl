import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setUserId, loadUserData } = useAppStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Валидация
        if (!email.trim() || !password.trim()) {
            setError('Заполните все поля');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });
            if (error) throw error;

            if (data.user) {
                setUserId(data.user.id);
                await loadUserData(data.user.id);
                navigate('/');
            }
        } catch (err: any) {
            // Расшифровываем ошибки Supabase
            let message = err.message;
            if (err.message.includes('Invalid login credentials')) {
                message = 'Неверный email или пароль';
            } else if (err.message.includes('Email not confirmed')) {
                message = 'Подтвердите email, перейдя по ссылке в письме';
            } else {
                message = 'Ошибка входа. Попробуйте позже.';
            }
            setError(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md p-6 mx-auto mt-20 card">
            <h1 className="mb-6 text-2xl font-bold text-dark">Вход</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field"
                    required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
            <p className="mt-4 text-sm text-dark/60">
                Нет аккаунта?{' '}
                <a href="/register" className="text-terracotta hover:underline">
                    Зарегистрироваться
                </a>
            </p>
        </div>
    );
};

export default Login;
