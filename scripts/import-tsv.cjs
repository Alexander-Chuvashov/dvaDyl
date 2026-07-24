// scripts/import-tsv.cjs
const fs = require('fs');
const path = require('path');

// ===== НАСТРОЙКИ =====
const TSV_PATH = path.join(__dirname, '../content/words/rus_tuv.tsv');
const VOCAB_PATH = path.join(__dirname, '../content/words/vocabulary.json');
const SEPARATOR = '\t';

// ===== ЗАГРУЗКА СЛОВАРЯ =====
let vocab = { words: [] };

if (fs.existsSync(VOCAB_PATH)) {
    try {
        const data = fs.readFileSync(VOCAB_PATH, 'utf8');
        if (data.trim()) {
            vocab = JSON.parse(data);
            // Убедимся, что поле words существует
            if (!vocab.words) vocab.words = [];
        } else {
            console.log('⚠️ vocabulary.json пуст, создаём новый словарь.');
            vocab = { words: [] };
        }
    } catch (e) {
        console.log(
            '⚠️ Не удалось прочитать vocabulary.json, создаём новый словарь.',
        );
        vocab = { words: [] };
    }
} else {
    console.log('⚠️ vocabulary.json не найден, создаём новый файл.');
    vocab = { words: [] };
}

// Создаём Set существующих слов (в нижнем регистре)
const existingWords = new Set(vocab.words.map(w => w.wordTuvan.toLowerCase()));

// Определяем максимальный id
let maxId = 0;
vocab.words.forEach(w => {
    const num = parseInt(w.id.replace('w_', ''));
    if (num > maxId) maxId = num;
});

// ===== ЧТЕНИЕ TSV =====
const tsvContent = fs.readFileSync(TSV_PATH, 'utf8');
const lines = tsvContent.split('\n').filter(line => line.trim() !== '');

// Пропускаем заголовок
const startLine = 1;

const newWords = [];

for (let i = startLine; i < lines.length; i++) {
    const columns = lines[i].split(SEPARATOR);
    if (columns.length < 4) continue;

    const wordTuvan = columns[2]?.trim();
    const wordRussian = columns[3]?.trim();
    if (!wordTuvan || !wordRussian) continue;

    if (existingWords.has(wordTuvan.toLowerCase())) {
        console.log(`⏭️ Слово "${wordTuvan}" уже есть, пропускаем`);
        continue;
    }

    const entry = {
        id: `w_${String(++maxId).padStart(3, '0')}`,
        wordTuvan: wordTuvan,
        wordRussian: wordRussian,
        transcription: '',
        partOfSpeech: 'other',
        difficulty: 1,
        categories: ['other'],
        exampleSentence: '',
        exampleTranslation: '',
    };

    newWords.push(entry);
    console.log(`✅ Добавлено слово: ${wordTuvan} → ${wordRussian}`);
}

// ===== СОХРАНЕНИЕ =====
if (newWords.length > 0) {
    vocab.words = vocab.words.concat(newWords);
    fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2), 'utf8');
    console.log(`\n🎉 Импортировано ${newWords.length} новых слов.`);
    console.log(`📊 Всего слов в словаре: ${vocab.words.length}`);
} else {
    console.log('\nℹ️ Новых слов не найдено.');
}
