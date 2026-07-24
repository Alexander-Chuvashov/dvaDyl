// src/App.tsx
import './index.css';

import React, { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import LearnedWordsPage from './pages/LearnedWordsPage';
import LessonPage from './pages/LessonPage';
import { TranslationService } from './services/TranslationService';
import ToastContainer from './components/UI/ToastContainer';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAppStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Компонент-обёртка для анимации страниц
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    const { setUserId, loadUserData, loadUserSettings } = useAppStore();

    useEffect(() => {
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
        TranslationService.loadVocabulary()
            .then(() => console.log('✅ Словарь загружен'))
            .catch(err => console.error('❌ Ошибка загрузки словаря:', err));
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
                <PageWrapper>
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
                            path="/chapter/:chapterId/lesson/:lessonId"
                            element={
                                <ProtectedRoute>
                                    <LessonPage />
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
                        />
                        <Route
                            path="/achievements"
                            element={
                                <ProtectedRoute>
                                    <AchievementsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/stats"
                            element={
                                <ProtectedRoute>
                                    <StatsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/learned-words"
                            element={
                                <ProtectedRoute>
                                    <LearnedWordsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <ToastContainer />
                </PageWrapper>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;
