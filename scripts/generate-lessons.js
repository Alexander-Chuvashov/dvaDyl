import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список тем для уровня A2
const topics = [
    {
        id: '09-daily-routine',
        title: 'Повседневные дела',
        titleTuvan: 'Хүн бүргү ажылдар',
        description: 'Научись говорить о повседневных делах и распорядке дня',
        skill: 'daily_routine',
        level: 'A2',
        order: 9,
    },
    {
        id: '10-description',
        title: 'Описание людей и вещей',
        titleTuvan: 'Кижилерниң база чүүлдерниң тайылбыры',
        description: 'Научись описывать внешность, характер и предметы',
        skill: 'description',
        level: 'A2',
        order: 10,
    },
    {
        id: '11-weather',
        title: 'Погода и времена года',
        titleTuvan: 'Айыс-дүүн база чылдың үелери',
        description: 'Научись говорить о погоде и временах года',
        skill: 'weather',
        level: 'A2',
        order: 11,
    },
    {
        id: '12-travel',
        title: 'Путешествия и транспорт',
        titleTuvan: 'Аян-чорук база транспорт',
        description: 'Научись говорить о путешествиях и транспорте',
        skill: 'travel',
        level: 'A2',
        order: 12,
    },
    {
        id: '13-shopping',
        title: 'Магазины и покупки',
        titleTuvan: 'Садыглар база садып алыр',
        description: 'Научись говорить о покупках и магазинах',
        skill: 'shopping',
        level: 'A2',
        order: 13,
    },
    {
        id: '14-health',
        title: 'Здоровье и тело',
        titleTuvan: 'Күш-ажыл база бодун',
        description: 'Научись говорить о здоровье и частях тела',
        skill: 'health',
        level: 'A2',
        order: 14,
    },
    {
        id: '15-hobbies',
        title: 'Хобби и свободное время',
        titleTuvan: 'Амыдыралдың аайы-чүдү',
        description: 'Научись говорить о хобби и свободном времени',
        skill: 'hobbies',
        level: 'A2',
        order: 15,
    },
];

const baseDir = path.join(__dirname, '../content/chapters');

// Генерация chapter.json
function generateChapter(topic) {
    return {
        id: `ch_${topic.id}`,
        title: topic.title,
        titleTuvan: topic.titleTuvan,
        description: topic.description,
        level: topic.level,
        order: topic.order,
        coverImage: '',
    };
}

// Генерация теории
function generateTheory(topic) {
    return {
        type: 'theory',
        id: `theory_${topic.id}`,
        chapterId: `ch_${topic.id}`,
        title: topic.title,
        titleTuvan: topic.titleTuvan,
        content: `<p>Это теория по теме "${topic.title}". Здесь будут объяснения, таблицы и примеры.</p><p>Пока это заготовка, заполни её позже.</p>`,
        order: 1,
    };
}

// Генерация урока
function generateLesson(topic, lessonNumber) {
    const lessonId = `${topic.id.replace('09-', '').replace('10-', '').replace('11-', '').replace('12-', '').replace('13-', '').replace('14-', '').replace('15-', '')}`;
    return {
        type: 'lesson',
        id: `lesson_${lessonNumber}_${lessonId}`,
        chapterId: `ch_${topic.id}`,
        title: `${topic.title} (урок ${lessonNumber})`,
        titleTuvan: `${topic.titleTuvan} (кичээл ${lessonNumber})`,
        description: `Практика по теме "${topic.title}"`,
        skill: topic.skill,
        order: lessonNumber + 1, // 2, 3, 4
        isPublished: true,
        difficulty: 2,
        estimatedTime: 10,
        exercises: [
            {
                id: `${lessonId}_ex1`,
                type: 'translate',
                order: 0,
                question: 'Введи перевод на тувинский (пока заглушка)',
                correct: 'заглушка',
                hint: 'Заполни позже',
            },
            {
                id: `${lessonId}_ex2`,
                type: 'choice',
                order: 1,
                question: 'Выбери правильный вариант (пока заглушка)',
                options: ['вариант 1', 'вариант 2', 'вариант 3'],
                correct: 'вариант 1',
            },
        ],
    };
}

// Создание папок и файлов
topics.forEach(topic => {
    const folderPath = path.join(baseDir, topic.id);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Создана папка: ${topic.id}`);
    }

    // chapter.json
    const chapterData = generateChapter(topic);
    fs.writeFileSync(
        path.join(folderPath, 'chapter.json'),
        JSON.stringify(chapterData, null, 2),
        'utf8',
    );
    console.log(`  → chapter.json создан`);

    // theory-01
    const theoryData = generateTheory(topic);
    fs.writeFileSync(
        path.join(folderPath, `theory-01-${topic.skill}.json`),
        JSON.stringify(theoryData, null, 2),
        'utf8',
    );
    console.log(`  → theory-01-${topic.skill}.json создан`);

    // Уроки 1-3
    for (let i = 1; i <= 3; i++) {
        const lessonData = generateLesson(topic, i);
        fs.writeFileSync(
            path.join(folderPath, `lesson-0${i}-${topic.skill}.json`),
            JSON.stringify(lessonData, null, 2),
            'utf8',
        );
        console.log(`  → lesson-0${i}-${topic.skill}.json создан`);
    }
});

console.log('✅ Генерация завершена!');
