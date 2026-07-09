// scripts/check-vocabulary.cjs
const fs = require('fs');
const path = require('path');

const allowed = [
    'noun',
    'verb',
    'adjective',
    'adverb',
    'pronoun',
    'other',
    'interjection',
    'numeral',
    'phrase',
    'conjunction',
    'preposition',
];

const vocabPath = path.join(__dirname, '../content/words/vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

const errors = [];
data.words.forEach((word, index) => {
    if (word.partOfSpeech && !allowed.includes(word.partOfSpeech)) {
        errors.push({ index, word: word.wordTuvan, value: word.partOfSpeech });
    }
});

if (errors.length > 0) {
    console.log('❌ Найдены проблемные значения:');
    errors.forEach(e => console.log(`  ${e.index}: "${e.word}" — ${e.value}`));
} else {
    console.log('✅ Все значения корректны.');
}
