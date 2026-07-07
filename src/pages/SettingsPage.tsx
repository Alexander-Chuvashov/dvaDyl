import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

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
            // Сброс в БД
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
            // Сброс локального состояния
            resetAll();
            // Перенаправление на главную
            navigate('/');
        } catch (error) {
            console.error('Ошибка сброса прогресса:', error);
            alert('Не удалось сбросить прогресс. Попробуйте ещё раз.');
        }
    };

    return (
        <div className="max-w-2xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h1 className="mb-6 text-3xl font-bold text-dark">
                    ⚙️ Настройки
                </h1>
            </AnimatedWrapper>

            <div className="space-y-6 card">
                {/* Имя пользователя */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-dark/70">
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

                {/* Ежедневная цель */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-dark/70">
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
                    <p className="mt-1 text-xs text-dark/50">
                        Рекомендуемое значение: 20–50 XP в день
                    </p>
                </div>

                {/* Кнопка сохранения */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full btn-primary disabled:opacity-50"
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>

                {message && (
                    <div
                        className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-olive/10 text-olive' : 'bg-terracotta/10 text-terracotta'}`}
                    >
                        {message.text}
                    </div>
                )}
            </div>

            {/* Статистика */}
            <div className="mt-6 card">
                <h2 className="mb-4 text-xl font-semibold text-dark">
                    📊 Ваша статистика
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 text-center rounded-lg bg-cream/50">
                        <div className="text-2xl font-bold text-dark">{xp}</div>
                        <div className="text-sm text-dark/60">Всего XP</div>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-cream/50">
                        <div className="text-2xl font-bold text-dark">
                            {completedLessonIds.length}
                        </div>
                        <div className="text-sm text-dark/60">
                            Пройдено уроков
                        </div>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-cream/50">
                        <div className="text-2xl font-bold text-terracotta">
                            {streak}
                        </div>
                        <div className="text-sm text-dark/60">Дней подряд</div>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-cream/50">
                        <div className="text-2xl font-bold text-gold">
                            {dailyGoal}
                        </div>
                        <div className="text-sm text-dark/60">Цель на день</div>
                    </div>
                </div>
            </div>

            {/* Сброс прогресса */}
            <div className="mt-6 card border-terracotta/20">
                <h2 className="mb-4 text-xl font-semibold text-terracotta">
                    ⚠️ Опасная зона
                </h2>
                <button
                    onClick={handleResetProgress}
                    className="w-full bg-red-500 btn-primary hover:bg-red-600"
                >
                    Сбросить весь прогресс
                </button>
                <p className="mt-2 text-xs text-dark/50">
                    Это действие удалит весь ваш прогресс, включая пройденные
                    уроки и достижения.
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
