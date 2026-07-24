const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../content/words/vocabulary.json');

let content = fs.readFileSync(vocabPath, 'utf8');
// Удаляем BOM, если есть
if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

try {
    const data = JSON.parse(content);
    console.log('✅ JSON валидный. Слов:', data.words.length);
} catch (err) {
    console.warn('⚠️ Ошибка парсинга:', err.message);
    console.log('🔄 Пытаемся восстановить...');

    // Простая попытка восстановить — обрезаем до последней корректной записи
    // Ищем последний валидный JSON-объект в массиве
    const lines = content.split('\n');
    let validEnd = content.lastIndexOf('}');
    if (validEnd === -1) {
        console.error('❌ Невозможно восстановить JSON');
        process.exit(1);
    }
    // Обрезаем до последней закрывающей скобки массива
    const cut = content.lastIndexOf(']');
    if (cut > validEnd) validEnd = cut;
    const fixed = content.slice(0, validEnd + 1) + '\n}';

    try {
        JSON.parse(fixed);
        fs.writeFileSync(vocabPath, fixed, 'utf8');
        console.log('✅ JSON восстановлен!');
    } catch (e2) {
        console.error(
            '❌ Не удалось восстановить автоматически. Проверь вручную.',
        );
        console.log(
            'Возможная причина: незакрытая кавычка или лишняя запятая.',
        );
    }
}
