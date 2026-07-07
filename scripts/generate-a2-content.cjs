const fs = require('fs');
const path = require('path');

// Список тем для уровня A2
const topics = [
    {
        id: '09-daily-routine',
        title: 'Повседневные дела',
        titleTuvan: 'Хүн бүрү ажылдар',
        description: 'Расскажи о своих ежедневных занятиях',
        skill: 'daily_routine',
        level: 'A2',
        order: 9,
    },
    {
        id: '10-description',
        title: 'Описание людей и вещей',
        titleTuvan: 'Кижилер база херектерниң тайылбыры',
        description: 'Учимся описывать внешность, характер и предметы',
        skill: 'description',
        level: 'A2',
        order: 10,
    },
    {
        id: '11-weather',
        title: 'Погода и времена года',
        titleTuvan: 'Айы-салдар база чылдың катары',
        description: 'Говорим о погоде и сезонах',
        skill: 'weather',
        level: 'A2',
        order: 11,
    },
    {
        id: '12-travel',
        title: 'Путешествия и транспорт',
        titleTuvan: 'Аян-чорук база транспорт',
        description: 'Слова и фразы для путешествий',
        skill: 'travel',
        level: 'A2',
        order: 12,
    },
    {
        id: '13-shopping',
        title: 'Магазины и покупки',
        titleTuvan: 'Саттынар база садыглар',
        description: 'Как делать покупки на тувинском',
        skill: 'shopping',
        level: 'A2',
        order: 13,
    },
    {
        id: '14-health',
        title: 'Здоровье и тело',
        titleTuvan: 'Эргелек база кижи бүдүү',
        description: 'Части тела, болезни и здоровый образ жизни',
        skill: 'health',
        level: 'A2',
        order: 14,
    },
    {
        id: '15-hobbies',
        title: 'Хобби и свободное время',
        titleTuvan: 'Эрик-чорук база хостуг үе',
        description: 'Расскажи о своих увлечениях',
        skill: 'hobbies',
        level: 'A2',
        order: 15,
    },
];

const chaptersDir = path.join(__dirname, '../content/chapters');

// Создаём папку, если её нет
if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
}

topics.forEach(topic => {
    const folderPath = path.join(chaptersDir, topic.id);
    if (fs.existsSync(folderPath)) {
        console.log(`⚠️ Папка ${topic.id} уже существует, пропускаем`);
        return;
    }
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Создана папка: ${topic.id}`);

    // 1. chapter.json
    const chapter = {
        id: `ch_${topic.id}`,
        title: topic.title,
        titleTuvan: topic.titleTuvan,
        description: topic.description,
        level: topic.level,
        order: topic.order,
        coverImage: '',
    };
    fs.writeFileSync(
        path.join(folderPath, 'chapter.json'),
        JSON.stringify(chapter, null, 2),
    );
    console.log(`  └─ chapter.json`);

    // 2. theory-01-*.json
    const theory = {
        type: 'theory',
        id: `theory_${topic.id}`,
        chapterId: `ch_${topic.id}`,
        title: topic.title,
        titleTuvan: topic.titleTuvan,
        content: `<p>Это теория по теме "${topic.title}". Здесь можно разместить грамматические правила, полезные фразы и таблицы.</p>`,
        order: 1,
    };
    fs.writeFileSync(
        path.join(folderPath, `theory-01-${topic.id}.json`),
        JSON.stringify(theory, null, 2),
    );
    console.log(`  └─ theory-01-${topic.id}.json`);

    // 3. Три урока с примерами упражнений
    for (let i = 1; i <= 3; i++) {
        const lesson = {
            type: 'lesson',
            id: `lesson_${i}_${topic.id}`,
            chapterId: `ch_${topic.id}`,
            title: `${topic.title} (урок ${i})`,
            titleTuvan: `${topic.titleTuvan} (кичээл ${i})`,
            description: `Практика по теме "${topic.title}", урок ${i}`,
            skill: topic.skill,
            order: i + 1, // порядок внутри главы
            isPublished: true,
            difficulty: i === 1 ? 2 : i === 2 ? 2 : 3,
            estimatedTime: 12,
            exercises: [
                {
                    id: `ex_${topic.id}_${i}_1`,
                    type: 'translate',
                    order: 0,
                    question: `Переведи на тувинский: "Пример слова ${i}"`,
                    correct: `Тувинский перевод`,
                    hint: 'Подсказка',
                },
                {
                    id: `ex_${topic.id}_${i}_2`,
                    type: 'choice',
                    order: 1,
                    question: `Выбери правильный перевод:`,
                    options: ['Вариант А', 'Вариант Б', 'Вариант В'],
                    correct: 'Вариант А',
                },
                {
                    id: `ex_${topic.id}_${i}_3`,
                    type: 'order',
                    order: 2,
                    question: `Составь предложение:`,
                    orderItems: ['слово1', 'слово2', 'слово3'],
                    correct: ['слово1', 'слово2', 'слово3'],
                },
                {
                    id: `ex_${topic.id}_${i}_4`,
                    type: 'match',
                    order: 3,
                    question: `Сопоставь пары:`,
                    matchPairs: [
                        { left: 'Русский 1', right: 'Тувинский 1' },
                        { left: 'Русский 2', right: 'Тувинский 2' },
                    ],
                },
            ],
        };
        const fileName = `lesson-0${i}-${topic.id}.json`;
        fs.writeFileSync(
            path.join(folderPath, fileName),
            JSON.stringify(lesson, null, 2),
        );
        console.log(`  └─ ${fileName}`);
    }

    console.log(`✅ Глава ${topic.id} создана\n`);
});

console.log('🎉 Генерация контента A2 завершена!');
