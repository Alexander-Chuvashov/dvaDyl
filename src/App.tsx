// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabaseClient';
import AppLayout from './components/Layout/AppLayout';
import ChapterList from './components/Chapters/ChapterList';
import ChapterView from './components/Chapters/ChapterView';
import Login from './pages/Login';
import Register from './pages/Register';
import ReviewPage from './pages/ReviewPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';
import LessonPage from './pages/LessonPage';
import PageTransition from './components/UI/PageTransiton';
import RepeatErrorsPage from './pages/RepeatErrorPage';
import { TranslationService } from './services/TranslationService';

// Компонент для защищённых маршрутов (вынесен за пределы App, чтобы не создавать компонент внутри рендера)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAppStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    const { setUserId, loadUserData, loadUserSettings } = useAppStore();

    // Проверяем сессию при загрузке
    useEffect(() => {
        TranslationService.loadVocabulary().catch(console.error);
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                await loadUserData(session.user.id);
                await loadUserSettings(session.user.id);
            }
        };
        getSession();

        // Подписка на изменения авторизации
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                await loadUserData(session.user.id);
                await loadUserSettings(session.user.id);
            } else {
                setUserId(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [setUserId, loadUserData, loadUserSettings]);

    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <ChapterList />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chapter/:chapterId"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <ChapterView />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/review"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <ReviewPage />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/achievements"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <AchievementsPage />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <SettingsPage />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <StatsPage />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chapter/:chapterId/lesson/:lessonId"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <LessonPage />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/repeat-errors"
                        element={
                            <ProtectedRoute>
                                <RepeatErrorsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;
