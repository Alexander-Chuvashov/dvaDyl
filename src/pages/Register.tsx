import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setUserId, loadUserData } = useAppStore();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Регистрация через Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                },
            });
            if (error) throw error;

            if (data.user) {
                // Создаём запись в таблице users (триггер автоматически создаст, если настроен)
                // Или вручную:
                // await supabase.from('users').insert({
                //     id: data.user.id,
                //     email,
                //     username,
                // });

                if (data.user) {
                    setUserId(data.user.id);
                    await loadUserData(data.user.id);
                    navigate('/');
                }

                setUserId(data.user.id);
                await loadUserData(data.user.id);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md p-6 mx-auto mt-20 card">
            <h1 className="mb-6 text-2xl font-bold text-dark">Регистрация</h1>
            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input-field"
                    required
                />
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
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
            <p className="mt-4 text-sm text-dark/60">
                Уже есть аккаунт?{' '}
                <a href="/login" className="text-terracotta hover:underline">
                    Войти
                </a>
            </p>
        </div>
    );
};

export default Register;
