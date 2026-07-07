import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonView from './LessonView';
import { useAppStore } from '../../store/useAppStore';
import type { Lesson } from '../../types/content';

// Мокаем useAppStore
vi.mock('../../store/useAppStore', () => ({
    useAppStore: vi.fn(),
}));

describe('LessonView', () => {
    const mockLesson: Lesson = {
        id: 'test-lesson',
        type: 'lesson',
        chapterId: 'ch_test',
        title: 'Тестовый урок',
        titleTuvan: 'Тест',
        description: 'Описание',
        skill: 'test',
        order: 1,
        isPublished: true,
        difficulty: 1,
        estimatedTime: 5,
        exercises: [
            {
                id: 'ex1',
                type: 'translate',
                order: 0,
                question: 'Переведи',
                correct: 'Привет',
            },
            {
                id: 'ex2',
                type: 'choice',
                order: 1,
                question: 'Выбери',
                options: ['А', 'Б'],
                correct: 'А',
            },
        ],
    };

    const mockStore = {
        userId: 'user123',
        answerExercise: vi.fn(),
        syncAnswer: vi.fn().mockResolvedValue(undefined),
        syncStreak: vi.fn().mockResolvedValue(undefined),
        syncProgress: vi.fn().mockResolvedValue(undefined),
        completedLessonIds: [],
        checkAndUnlockAchievements: vi.fn().mockResolvedValue([]),
        xp: 0,
        streak: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppStore as any).mockReturnValue(mockStore);
    });

    it('должен завершить урок, когда все упражнения отвечены правильно', async () => {
        const onComplete = vi.fn();
        const user = userEvent.setup();
        render(<LessonView lesson={mockLesson} onComplete={onComplete} />);

        // Проходим первое упражнение (translate)
        const input = screen.getByPlaceholderText(/введи перевод/i);
        const submitButton = screen.getByText(/проверить/i);
        await user.type(input, 'Привет');
        fireEvent.click(submitButton);

        // Ждём, что появится "Правильно!"
        await screen.findByText(/✅ правильно/i);

        // Переходим ко второму упражнению
        const nextButton = screen.getByText(/следующее упражнение →/i);
        fireEvent.click(nextButton);

        // Второе упражнение (choice)
        const optionA = await screen.findByText('А');
        fireEvent.click(optionA);
        const checkButton = screen.getByText(/проверить/i);
        fireEvent.click(checkButton);

        // Должен появиться индикатор завершения, и onComplete вызван
        await waitFor(
            () => {
                expect(onComplete).toHaveBeenCalledTimes(1);
            },
            { timeout: 3000 },
        );

        // Проверяем вызовы sync
        expect(mockStore.syncAnswer).toHaveBeenCalledTimes(2);
        expect(mockStore.syncProgress).toHaveBeenCalledWith(
            'user123',
            'test-lesson',
            'completed',
            100,
            50,
        );
        expect(mockStore.syncStreak).toHaveBeenCalled();
        expect(mockStore.checkAndUnlockAchievements).toHaveBeenCalled();
    });

    it('не должен завершать урок, если есть неправильные ответы', async () => {
        const onComplete = vi.fn();
        const user = userEvent.setup();
        render(<LessonView lesson={mockLesson} onComplete={onComplete} />);

        // Первое упражнение отвечаем неправильно
        const input = screen.getByPlaceholderText(/введи перевод/i);
        const submitButton = screen.getByText(/проверить/i);
        await user.type(input, 'Неправильно');
        fireEvent.click(submitButton);

        // Увидим сообщение об ошибке, останемся на том же упражнении
        await screen.findByText(/неправильно/i);

        // onComplete не должен вызываться
        expect(onComplete).not.toHaveBeenCalled();
    });
});
