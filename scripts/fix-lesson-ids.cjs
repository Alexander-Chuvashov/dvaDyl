const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, '../content/chapters');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.startsWith('lesson-') && file.endsWith('.json')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    console.log(`Обработка: ${filePath}`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!data.exercises || !Array.isArray(data.exercises)) {
            console.log(`  - Нет exercises, пропускаем`);
            return;
        }
        let changed = false;
        const baseName = path.basename(filePath, '.json');
        data.exercises.forEach((ex, index) => {
            if (!ex.id) {
                ex.id = `${baseName}_${index + 1}`;
                changed = true;
            }
            if (ex.order === undefined || ex.order === null) {
                ex.order = index;
                changed = true;
            }
        });
        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`  - Обновлено: добавлены id и order`);
        } else {
            console.log(`  - Уже есть все поля`);
        }
    } catch (err) {
        console.error(`  - Ошибка обработки ${filePath}:`, err.message);
    }
}

walkDir(chaptersDir);
console.log('Готово!');
