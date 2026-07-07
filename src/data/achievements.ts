import type { Achievement } from '../types/content';

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_lesson',
        name: 'Первый шаг',
        description: 'Пройдите первый урок',
        icon: '🌟',
        condition: { type: 'lessons_completed', target: 1 },
    },
    {
        id: 'five_lessons',
        name: 'Новичок',
        description: 'Пройдите 5 уроков',
        icon: '📚',
        condition: { type: 'lessons_completed', target: 5 },
    },
    {
        id: 'ten_lessons',
        name: 'Ученик',
        description: 'Пройдите 10 уроков',
        icon: '🎓',
        condition: { type: 'lessons_completed', target: 10 },
    },
    {
        id: 'twenty_lessons',
        name: 'Знаток',
        description: 'Пройдите 20 уроков',
        icon: '🏆',
        condition: { type: 'lessons_completed', target: 20 },
    },
    {
        id: 'streak_3',
        name: 'Три дня',
        description: 'Занимайтесь 3 дня подряд',
        icon: '🔥',
        condition: { type: 'streak', target: 3 },
    },
    {
        id: 'streak_7',
        name: 'Неделя',
        description: 'Занимайтесь 7 дней подряд',
        icon: '⭐',
        condition: { type: 'streak', target: 7 },
    },
    {
        id: 'streak_30',
        name: 'Месяц',
        description: 'Занимайтесь 30 дней подряд',
        icon: '👑',
        condition: { type: 'streak', target: 30 },
    },
    {
        id: 'xp_100',
        name: '100 XP',
        description: 'Наберите 100 очков опыта',
        icon: '💪',
        condition: { type: 'xp', target: 100 },
    },
    {
        id: 'xp_500',
        name: '500 XP',
        description: 'Наберите 500 очков опыта',
        icon: '🌟',
        condition: { type: 'xp', target: 500 },
    },
    {
        id: 'xp_1000',
        name: '1000 XP',
        description: 'Наберите 1000 очков опыта',
        icon: '👑',
        condition: { type: 'xp', target: 1000 },
    },
];
