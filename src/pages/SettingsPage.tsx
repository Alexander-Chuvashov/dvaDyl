// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Target, Trash2, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        userId,
        username,
        dailyGoal,
        setUsername,
        setDailyGoal,
        saveUserSettings,
        resetAll,
        xp,
        streak,
        completedLessonIds,
    } = useAppStore();

    const [localUsername, setLocalUsername] = useState(username);
    const [localDailyGoal, setLocalDailyGoal] = useState(dailyGoal);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        setLocalUsername(username);
        setLocalDailyGoal(dailyGoal);
    }, [username, dailyGoal]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            setUsername(localUsername);
            setDailyGoal(localDailyGoal);
            if (userId) {
                await saveUserSettings(userId);
                setMessage({
                    type: 'success',
                    text: '✅ Настройки сохранены!',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: '❌ Ошибка сохранения настроек',
            });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetProgress = async () => {
        if (
            !confirm(
                'Вы уверены, что хотите сбросить весь прогресс? Это действие необратимо.',
            )
        )
            return;
        try {
            if (userId) {
                await supabase
                    .from('user_progress')
                    .delete()
                    .eq('user_id', userId);
                await supabase
                    .from('user_answers')
                    .delete()
                    .eq('user_id', userId);
                await supabase
                    .from('user_words')
                    .delete()
                    .eq('user_id', userId);
                await supabase
                    .from('user_streaks')
                    .delete()
                    .eq('user_id', userId);
                await supabase
                    .from('user_achievements')
                    .delete()
                    .eq('user_id', userId);
            }
            resetAll();
            navigate('/');
        } catch (error) {
            console.error('Ошибка сброса прогресса:', error);
            alert('Не удалось сбросить прогресс. Попробуйте ещё раз.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <AnimatedWrapper animation="slideUp">
                <h1 className="text-3xl font-bold text-primary">
                    ⚙️ Настройки
                </h1>
                <p className="mt-1 text-secondary">
                    Управляй своим профилем и прогрессом
                </p>
            </AnimatedWrapper>

            <div className="space-y-6 card">
                <div>
                    <label className="flex items-center block gap-2 mb-1 text-sm font-medium text-primary">
                        <User className="w-4 h-4 text-gold" />
                        Имя пользователя
                    </label>
                    <input
                        type="text"
                        value={localUsername}
                        onChange={e => setLocalUsername(e.target.value)}
                        className="input-field"
                        placeholder="Введите имя"
                    />
                </div>

                <div>
                    <label className="flex items-center block gap-2 mb-1 text-sm font-medium text-primary">
                        <Target className="w-4 h-4 text-gold" />
                        Ежедневная цель (XP)
                    </label>
                    <input
                        type="number"
                        value={localDailyGoal}
                        onChange={e =>
                            setLocalDailyGoal(Number(e.target.value))
                        }
                        className="input-field"
                        min={5}
                        max={200}
                        step={5}
                    />
                    <p className="mt-1 text-xs text-secondary">
                        Рекомендуемое значение: 20–50 XP в день
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center w-full gap-2 btn-primary"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>

                {message && (
                    <div
                        className={`p-3 rounded-xl ${
                            message.type === 'success'
                                ? 'bg-success/10 border border-success/30 text-success'
                                : 'bg-error/10 border border-error/30 text-error'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>

            <div className="card">
                <h2 className="mb-4 text-xl font-bold text-primary">
                    📊 Ваша статистика
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 text-center bg-primary/10 rounded-xl">
                        <div className="text-2xl font-bold text-primary">
                            {xp}
                        </div>
                        <div className="text-sm text-secondary">Всего XP</div>
                    </div>
                    <div className="p-3 text-center bg-primary/10 rounded-xl">
                        <div className="text-2xl font-bold text-primary">
                            {completedLessonIds.length}
                        </div>
                        <div className="text-sm text-secondary">
                            Пройдено уроков
                        </div>
                    </div>
                    <div className="p-3 text-center bg-primary/10 rounded-xl">
                        <div className="text-2xl font-bold text-gold">
                            {streak}
                        </div>
                        <div className="text-sm text-secondary">
                            Дней подряд
                        </div>
                    </div>
                    <div className="p-3 text-center bg-primary/10 rounded-xl">
                        <div className="text-2xl font-bold text-gold">
                            {dailyGoal}
                        </div>
                        <div className="text-sm text-secondary">
                            Цель на день
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-error/20">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-error">
                    <Trash2 className="w-5 h-5" />
                    Опасная зона
                </h2>
                <button
                    onClick={handleResetProgress}
                    className="w-full py-3 font-bold transition-all duration-200 border bg-error/10 hover:bg-error/20 text-error rounded-xl border-error/30"
                >
                    Сбросить весь прогресс
                </button>
                <p className="mt-2 text-xs text-secondary">
                    Это действие удалит весь ваш прогресс, включая пройденные
                    уроки и достижения.
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
