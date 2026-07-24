// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, Target, Trash2, Save, Download, Upload } from 'lucide-react';
import { DatabaseService } from '../services/DatabaseService';

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
        loadUserData,
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
                await supabase
                    .from('user_xp_log')
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

    const handleExport = async () => {
        if (!userId) return;
        try {
            const data = await DatabaseService.exportUserData(userId);
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dva-dyl-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setMessage({
                type: 'success',
                text: '✅ Данные успешно экспортированы!',
            });
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            setMessage({ type: 'error', text: '❌ Ошибка экспорта данных' });
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (!confirm('Импорт заменит все текущие данные. Продолжить?'))
                    return;
                if (!userId) return;
                await DatabaseService.importUserData(userId, data);
                setMessage({
                    type: 'success',
                    text: '✅ Данные успешно импортированы!',
                });
                await loadUserData(userId);
                window.location.reload();
            } catch (error) {
                console.error('Ошибка импорта:', error);
                setMessage({
                    type: 'error',
                    text: '❌ Ошибка импорта данных. Проверьте файл.',
                });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="max-w-2xl p-4 mx-auto space-y-6 sm:p-6 sm:space-y-8">
            <AnimatedWrapper animation="slideUp">
                <h1 className="text-2xl font-bold sm:text-3xl text-primary">
                    ⚙️ Настройки
                </h1>
                <p className="mt-1 text-sm sm:text-base text-secondary">
                    Управляй своим профилем и прогрессом
                </p>
            </AnimatedWrapper>

            <div className="p-4 space-y-4 card sm:p-6 sm:space-y-6">
                <div>
                    <label className="flex items-center block gap-2 mb-1 text-sm font-medium text-primary">
                        <User className="w-4 h-4 text-gold" />
                        Имя пользователя
                    </label>
                    <input
                        type="text"
                        value={localUsername}
                        onChange={e => setLocalUsername(e.target.value)}
                        className="text-sm input-field sm:text-base"
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
                        className="text-sm input-field sm:text-base"
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
                    className="flex items-center justify-center w-full gap-2 text-sm btn-primary sm:text-base"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>

                {message && (
                    <div
                        className={`p-2 sm:p-3 rounded-xl text-sm sm:text-base ${
                            message.type === 'success'
                                ? 'bg-success/10 border border-success/30 text-success'
                                : 'bg-error/10 border border-error/30 text-error'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>

            <div className="p-4 card sm:p-6">
                <h2 className="mb-3 text-base font-bold sm:text-xl text-primary sm:mb-4">
                    📊 Ваша статистика
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-2 text-center bg-primary/30 sm:p-3 rounded-xl">
                        <div className="text-lg font-bold sm:text-2xl text-primary">
                            {xp}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary">
                            Всего XP
                        </div>
                    </div>
                    <div className="p-2 text-center bg-primary/30 sm:p-3 rounded-xl">
                        <div className="text-lg font-bold sm:text-2xl text-primary">
                            {completedLessonIds.length}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary">
                            Пройдено уроков
                        </div>
                    </div>
                    <div className="p-2 text-center bg-primary/30 sm:p-3 rounded-xl">
                        <div className="text-lg font-bold sm:text-2xl text-gold">
                            {streak}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary">
                            Дней подряд
                        </div>
                    </div>
                    <div className="p-2 text-center bg-primary/30 sm:p-3 rounded-xl">
                        <div className="text-lg font-bold sm:text-2xl text-gold">
                            {dailyGoal}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary">
                            Цель на день
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 card sm:p-6">
                <h2 className="flex items-center gap-2 mb-3 text-base font-bold sm:text-xl text-primary sm:mb-4">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                    Резервное копирование
                </h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                        <Download className="w-4 h-4" />
                        Экспорт данных
                    </button>
                    <label className="btn-secondary flex items-center gap-2 cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                        <Upload className="w-4 h-4" />
                        Импорт данных
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
                <p className="mt-2 text-xs text-secondary">
                    Экспорт создаёт JSON-файл со всем вашим прогрессом. Импорт
                    заменит текущие данные.
                </p>
            </div>

            <div className="p-4 card sm:p-6 border-error/20">
                <h2 className="flex items-center gap-2 mb-3 text-base font-bold sm:text-xl text-error sm:mb-4">
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Опасная зона
                </h2>
                <button
                    onClick={handleResetProgress}
                    className="w-full py-2 text-sm font-bold transition-all duration-200 border bg-error/10 hover:bg-error/20 text-error sm:py-3 rounded-xl border-error/30 sm:text-base"
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
