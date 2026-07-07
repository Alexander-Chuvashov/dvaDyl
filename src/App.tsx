import './index.css';

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
const { setUserId, loadUserData, loadUserSettings } = useAppStore();
import AppLayout from './components/Layout/AppLayout';
import ChapterList from './components/Chapters/ChapterList';
import ChapterView from './components/Chapters/ChapterView';
import Login from './pages/Login';
import Register from './pages/Register';
import { supabase } from './lib/supabaseClient';
import ReviewPage from './pages/ReviewPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

// Компонент для защищённых маршрутов (вынесен за пределы App)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    const { isAuthenticated, userId, loadUserData, setUserId } = useAppStore();

    // Проверяем сессию при загрузке
    useEffect(() => {
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                await loadUserSettings(session.user.id);
                await loadUserData(session.user.id);
            }
        };
        getSession();

        // Подписка на изменения авторизации
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    setUserId(session.user.id);
                    loadUserData(session.user.id);
                } else {
                    setUserId(null);
                }
            },
        );

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

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
                                <ChapterList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chapter/:chapterId"
                        element={
                            <ProtectedRoute>
                                <ChapterView />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/review"
                        element={
                            <ProtectedRoute>
                                <ReviewPage />
                            </ProtectedRoute>
                        }
                    ></Route>
                    <Route
                        path="/achievements"
                        element={
                            <ProtectedRoute>
                                <AchievementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;
