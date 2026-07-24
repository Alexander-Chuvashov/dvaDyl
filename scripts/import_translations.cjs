// scripts/import_translations.cjs
const fs = require('fs');
const path = require('path');

// ===== НАСТРОЙКИ =====
// Путь к твоему TSV-файлу (по умолчанию ищем translations.tsv в папке content/words)
const TSV_PATH = path.join(__dirname, '../content/words/tyvan_dictionary.tsv');
// Если файл называется иначе, укажи полный путь:
// const TSV_PATH = path.join(__dirname, '../content/words/rus-tuv.tsv');

const VOCAB_PATH = path.join(__dirname, '../content/words/vocabulary.json');
const SEPARATOR = '\t'; // табуляция

// ===== ЗАГРУЗКА СУЩЕСТВУЮЩЕГО СЛОВАРЯ =====
let vocab = { words: [] };
if (fs.existsSync(VOCAB_PATH)) {
    try {
        const data = fs.readFileSync(VOCAB_PATH, 'utf8');
        if (data.trim()) {
            vocab = JSON.parse(data);
            if (!vocab.words) vocab.words = [];
        }
    } catch (e) {
        console.warn('⚠️ Не удалось прочитать vocabulary.json, создаём новый.');
        vocab = { words: [] };
    }
} else {
    console.log('ℹ️ vocabulary.json не найден, создаём новый.');
}

// ===== ПРОВЕРКА ДУБЛИКАТОВ =====
const existingTuvan = new Set(vocab.words.map(w => w.wordTuvan.toLowerCase()));
const existingRussian = new Set(
    vocab.words.map(w => w.wordRussian.toLowerCase()),
);

// ===== ОПРЕДЕЛЕНИЕ МАКСИМАЛЬНОГО ID =====
let maxId = 0;
vocab.words.forEach(w => {
    const num = parseInt(w.id.replace('w_', ''));
    if (num > maxId) maxId = num;
});

// ===== ЧТЕНИЕ TSV =====
if (!fs.existsSync(TSV_PATH)) {
    console.error(`❌ Файл не найден: ${TSV_PATH}`);
    console.log('Укажи правильный путь к TSV-файлу в переменной TSV_PATH');
    process.exit(1);
}

const tsvContent = fs.readFileSync(TSV_PATH, 'utf8');
const lines = tsvContent.split('\n').filter(line => line.trim() !== '');

// Предполагаем, что первая строка — заголовок (содержит "РУС" или "рус")
const startLine = lines[0].includes('РУС') || lines[0].includes('рус') ? 1 : 0;

const added = [];

for (let i = startLine; i < lines.length; i++) {
    const columns = lines[i].split(SEPARATOR);
    // Если колонок меньше 2, пропускаем
    if (columns.length < 2) continue;

    const russian = columns[0]?.trim();
    const tuvan = columns[1]?.trim();

    if (!russian || !tuvan) continue;

    // Пропускаем, если слово уже есть (проверяем по тувинскому и русскому)
    if (
        existingTuvan.has(tuvan.toLowerCase()) ||
        existingRussian.has(russian.toLowerCase())
    ) {
        console.log(`⏭️ Уже есть: ${russian} → ${tuvan}`);
        continue;
    }

    maxId++;
    const newEntry = {
        id: `w_${String(maxId).padStart(3, '0')}`,
        wordTuvan: tuvan,
        wordRussian: russian,
        transcription: '',
        partOfSpeech: 'other',
        difficulty: 1,
        categories: ['other'],
        exampleSentence: '',
        exampleTranslation: '',
    };

    vocab.words.push(newEntry);
    existingTuvan.add(tuvan.toLowerCase());
    existingRussian.add(russian.toLowerCase());
    added.push({ russian, tuvan });
    console.log(`✅ Добавлено: ${russian} → ${tuvan}`);
}

// ===== СОХРАНЕНИЕ =====
if (added.length > 0) {
    fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2), 'utf8');
    console.log(`\n🎉 Импортировано ${added.length} новых слов.`);
    console.log(`📊 Всего слов в словаре: ${vocab.words.length}`);
} else {
    console.log('\nℹ️ Новых слов не найдено.');
}
