// scripts/update-vocabulary.cjs
const fs = require('fs');
const path = require('path');

// Пути
const chaptersDir = path.join(__dirname, '../content/chapters');
const vocabPath = path.join(__dirname, '../content/words/vocabulary.json');

// Загружаем существующий словарь
let vocab = { words: [] };
if (fs.existsSync(vocabPath)) {
    vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
}
const existingWords = new Set(vocab.words.map(w => w.wordTuvan.toLowerCase()));

// Функция для извлечения всех тувинских слов из текста (учитываем буквы Ң, Ө, Ү)
function extractTuvanWords(text) {
    if (!text) return [];
    // Убираем HTML-теги
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    // Ищем слова, состоящие из кириллических букв, включая Ң, Ө, Ү
    const matches = cleanText.match(/[А-Яа-яҢңӨөҮү]+/g);
    if (!matches) return [];
    return matches.map(w => w.trim()).filter(w => w.length > 0);
}

// Функция для обхода всех JSON-файлов в папке (рекурсивно)
function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath, callback);
        } else if (file.endsWith('.json') && file !== 'chapter.json') {
            callback(fullPath);
        }
    }
}

// Сбор всех уникальных слов
const newWordsSet = new Set();

walkDir(chaptersDir, filePath => {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const exercises = data.exercises || [];

        // Если это диалоговый урок, обрабатываем dialogueLines
        if (data.dialogueLines) {
            data.dialogueLines.forEach(line => {
                if (line.textTuvan) {
                    extractTuvanWords(line.textTuvan).forEach(w =>
                        newWordsSet.add(w),
                    );
                }
            });
        }

        // Если это speaking card
        if (data.cards) {
            data.cards.forEach(card => {
                if (card.targetTuvan) {
                    extractTuvanWords(card.targetTuvan).forEach(w =>
                        newWordsSet.add(w),
                    );
                }
            });
        }

        // Обрабатываем все упражнения (включая вложенные в dialogue_lesson)
        const allExercises = [];
        const flatten = arr => {
            arr.forEach(ex => {
                allExercises.push(ex);
                if (ex.exercises) flatten(ex.exercises);
                if (ex.dialogueLines) {
                    ex.dialogueLines.forEach(line => {
                        if (line.textTuvan) {
                            extractTuvanWords(line.textTuvan).forEach(w =>
                                newWordsSet.add(w),
                            );
                        }
                    });
                }
                if (ex.cards) {
                    ex.cards.forEach(card => {
                        if (card.targetTuvan) {
                            extractTuvanWords(card.targetTuvan).forEach(w =>
                                newWordsSet.add(w),
                            );
                        }
                    });
                }
            });
        };
        flatten(exercises);

        // Также обрабатываем теорию (content)
        if (data.content) {
            extractTuvanWords(data.content).forEach(w => newWordsSet.add(w));
        }
    } catch (e) {
        console.error(`Ошибка в файле ${filePath}:`, e.message);
    }
});

// Удаляем существующие слова и служебные
const stopWords = [
    'мен',
    'сен',
    'ол',
    'бис',
    'силер',
    'олар',
    'дыр',
    'тир',
    'бе',
    'эвес',
    'чок',
    'ийе',
    'бо',
    'ким',
    'кандыг',
    'кайы',
    'чүге',
];
const newWords = [...newWordsSet]
    .filter(w => !existingWords.has(w.toLowerCase()))
    .filter(w => !stopWords.includes(w.toLowerCase()))
    .filter(w => w.length > 1);

// Если есть новые слова, добавляем их в словарь
if (newWords.length === 0) {
    console.log('✅ Новых слов не найдено.');
    return;
}

// Определяем категорию по контексту (упрощённо)
function guessCategory(word) {
    // Простая эвристика по наличию в уже существующих категориях (можно расширить)
    const lower = word.toLowerCase();
    if (
        [
            'экии',
            'байырлыы',
            'кудум',
            'бараалдажыр',
            'эртенги',
            'кежээлиги',
        ].includes(lower)
    )
        return 'greetings';
    if (
        [
            'ава',
            'ача',
            'акы',
            'уруг',
            'оол',
            'кырган-ава',
            'кырган-ача',
            'туңма',
        ].includes(lower)
    )
        return 'family';
    if (['нан', 'эт', 'сүт', 'шай', 'суксун', 'чем'].includes(lower))
        return 'food';
    if (
        [
            'бир',
            'ийи',
            'үш',
            'дөрт',
            'беш',
            'алды',
            'чеди',
            'сес',
            'тос',
            'он',
        ].includes(lower)
    )
        return 'numbers';
    if (['кызыл', 'көк', 'ак', 'кара', 'сарыг', 'ном'].includes(lower))
        return 'colors';
    if (['ат', 'инек', 'хой', 'амытан'].includes(lower)) return 'animals';
    return 'other';
}

function guessDifficulty(word) {
    const lower = word.toLowerCase();
    // Простые частотные слова - 1
    if (
        [
            'экии',
            'байырлыы',
            'кудум',
            'ийе',
            'чок',
            'мен',
            'сен',
            'ол',
        ].includes(lower)
    )
        return 1;
    // Средние - 2
    if (
        [
            'ава',
            'ача',
            'акы',
            'уруг',
            'оол',
            'эр кижи',
            'кыс кижи',
            'ажыл',
        ].includes(lower)
    )
        return 2;
    // Сложные - 3
    return 3;
}

function guessPartOfSpeech(word) {
    const lower = word.toLowerCase();
    if (['экии', 'байырлыы', 'кудум', 'бараалдажыр'].includes(lower))
        return 'interjection';
    if (
        [
            'бир',
            'ийи',
            'үш',
            'дөрт',
            'беш',
            'алды',
            'чеди',
            'сес',
            'тос',
            'он',
        ].includes(lower)
    )
        return 'numeral';
    if (
        ['мен', 'сен', 'ол', 'бис', 'силер', 'олар', 'бо', 'ким'].includes(
            lower,
        )
    )
        return 'pronoun';
    if (
        [
            'ава',
            'ача',
            'акы',
            'уруг',
            'оол',
            'эр кижи',
            'кыс кижи',
            'ажыл',
            'чем',
            'чай',
            'эт',
            'сүт',
            'нан',
        ].includes(lower)
    )
        return 'noun';
    if (
        ['турар', 'базар', 'чиир', 'ижер', 'кыл', 'номчу', 'ажылда'].includes(
            lower,
        )
    )
        return 'verb';
    if (['эки', 'багай', 'улуг', 'биче', 'күштүг'].includes(lower))
        return 'adjective';
    return 'other';
}

// Создаём новые записи
let maxId = 0;
vocab.words.forEach(w => {
    const num = parseInt(w.id.replace('w_', ''));
    if (num > maxId) maxId = num;
});

const newEntries = newWords.map(word => {
    maxId++;
    return {
        id: `w_${String(maxId).padStart(3, '0')}`,
        wordTuvan: word,
        wordRussian: '', // нужно заполнить вручную
        transcription: '',
        partOfSpeech: guessPartOfSpeech(word),
        difficulty: guessDifficulty(word),
        categories: [guessCategory(word)],
        exampleSentence: '',
        exampleTranslation: '',
    };
});

// Добавляем в словарь
vocab.words = vocab.words.concat(newEntries);

// Сохраняем
fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2), 'utf8');

console.log(`✅ Добавлено ${newEntries.length} новых слов.`);
console.log(
    '❗ Теперь нужно вручную заполнить поля wordRussian, transcription, exampleSentence, exampleTranslation для новых слов.',
);
console.log(`📝 Открой файл ${vocabPath} и заполни пропуски.`);
