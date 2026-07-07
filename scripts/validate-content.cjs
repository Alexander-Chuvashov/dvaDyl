// scripts/validate-content.cjs
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
        } else if (file.endsWith('.json')) {
            validateFile(fullPath);
        }
    }
}

function validateFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileName = path.basename(filePath);
    console.log(`\n🔍 Проверка: ${filePath}`);

    if (fileName === 'chapter.json') {
        // Проверка chapter
        if (!data.id) console.error('❌ chapter.json: отсутствует id');
        if (!data.title) console.error('❌ chapter.json: отсутствует title');
        if (!data.level) console.error('❌ chapter.json: отсутствует level');
        if (!data.order && data.order !== 0)
            console.error('❌ chapter.json: отсутствует order');
    } else if (fileName.startsWith('theory-')) {
        // Проверка теории
        if (data.type !== 'theory')
            console.error('❌ theory: type должен быть "theory"');
        if (!data.id) console.error('❌ theory: отсутствует id');
        if (!data.chapterId) console.error('❌ theory: отсутствует chapterId');
        if (!data.content) console.error('❌ theory: отсутствует content');
        if (data.order === undefined)
            console.error('❌ theory: отсутствует order');
    } else if (fileName.startsWith('lesson-')) {
        // Проверка урока
        if (data.type !== 'lesson')
            console.error('❌ lesson: type должен быть "lesson"');
        if (!data.id) console.error('❌ lesson: отсутствует id');
        if (!data.chapterId) console.error('❌ lesson: отсутствует chapterId');
        if (!data.title) console.error('❌ lesson: отсутствует title');
        if (!data.titleTuvan)
            console.error('❌ lesson: отсутствует titleTuvan');
        if (!data.skill) console.error('❌ lesson: отсутствует skill');
        if (data.order === undefined)
            console.error('❌ lesson: отсутствует order');
        if (data.isPublished === undefined)
            console.error('❌ lesson: отсутствует isPublished');
        if (!data.exercises || !Array.isArray(data.exercises)) {
            console.error('❌ lesson: exercises должен быть массивом');
        } else {
            const ids = new Set();
            data.exercises.forEach((ex, index) => {
                if (!ex.id)
                    console.error(`❌ lesson: упражнение ${index} без id`);
                else if (ids.has(ex.id))
                    console.error(`❌ lesson: дублирующийся id "${ex.id}"`);
                else ids.add(ex.id);
                if (ex.order === undefined)
                    console.error(`❌ lesson: упражнение ${ex.id} без order`);
                if (!ex.type)
                    console.error(`❌ lesson: упражнение ${ex.id} без type`);
            });
        }
    }
}

walkDir(chaptersDir);
console.log('\n✅ Проверка завершена.');
