// Уровни и необходимое XP
const LEVELS = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 50 },
    { level: 3, xpRequired: 120 },
    { level: 4, xpRequired: 210 },
    { level: 5, xpRequired: 320 },
    { level: 6, xpRequired: 450 },
    { level: 7, xpRequired: 600 },
    { level: 8, xpRequired: 770 },
    { level: 9, xpRequired: 960 },
    { level: 10, xpRequired: 1170 },
    // дальше можно добавить до 100 уровней, увеличивая XP на 150 за уровень
];

// Для упрощения: формула XP для уровня N = 50 + (N-1) * 30 + (N-1)^2 * 2
// Но используем простой массив

export const getLevelInfo = (xp: number) => {
    let currentLevel = 1;
    let nextLevelXp = 50;
    let previousLevelXp = 0;

    for (let i = 0; i < LEVELS.length; i++) {
        if (xp >= LEVELS[i].xpRequired) {
            currentLevel = LEVELS[i].level;
            previousLevelXp = LEVELS[i].xpRequired;
            nextLevelXp =
                LEVELS[i + 1]?.xpRequired || LEVELS[i].xpRequired + 150;
        } else {
            nextLevelXp = LEVELS[i].xpRequired;
            break;
        }
    }

    const xpInLevel = xp - previousLevelXp;
    const xpToNext = nextLevelXp - previousLevelXp;

    return {
        level: currentLevel,
        xpInLevel,
        xpToNext,
        progress: Math.min(100, Math.round((xpInLevel / xpToNext) * 100)),
        nextLevelXp,
    };
};
