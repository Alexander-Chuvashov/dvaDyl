#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json
import sys
from pathlib import Path

# ===== НАСТРОЙКИ =====
CHAPTERS_DIR = Path(__file__).parent.parent / "content" / "chapters"
OUTPUT_FILE = "words.txt"  # будет создан в корне проекта
MIN_WORD_LENGTH = 3         # минимальная длина слова (чтобы отсеять буквы)
STOP_WORDS = {
    "я", "ты", "он", "она", "оно", "мы", "вы", "они",
    "мой", "твой", "его", "её", "наш", "ваш", "их",
    "этот", "тот", "такой", "весь", "всякий",
    "и", "а", "но", "да", "или", "либо", "же",
    "в", "на", "с", "к", "у", "за", "под", "над", "о", "об",
    "быть", "стал", "становится", "являться",
    "что", "как", "когда", "где", "куда", "откуда",
    "не", "ни", "без", "для", "от", "до", "из", "через",
    "вот", "вон", "там", "тут", "здесь",
    "ещё", "уже", "только", "даже", "ведь", "всё", "всё-таки",
    "ничего", "никто", "нечего", "некого",
    "кто", "чего", "который", "какой", "сколько",
    "потому", "поэтому", "затем", "оттого",
    "тогда", "теперь", "сейчас", "позже", "раньше",
}

# ===== ФУНКЦИИ =====

def clean_text(text):
    """Удалить HTML-теги и лишние пробелы."""
    if not text:
        return ""
    # удаляем HTML-теги
    text = re.sub(r'<[^>]+>', ' ', text)
    # заменяем пунктуацию на пробелы
    text = re.sub(r'[^\w\s]', ' ', text)
    # удаляем цифры
    text = re.sub(r'\d+', ' ', text)
    # нормализуем пробелы
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_russian_words(text):
    """Извлекает все русские слова из текста, убирает стоп-слова и короткие."""
    text = clean_text(text)
    # разбиваем на слова
    words = text.split()
    # приводим к нижнему регистру
    words = [w.lower() for w in words]
    # фильтруем: только русские буквы (простейшая проверка на кириллицу)
    words = [w for w in words if re.match(r'^[а-яё]+$', w)]
    # фильтруем по длине и стоп-словам
    words = [w for w in words if len(w) >= MIN_WORD_LENGTH and w not in STOP_WORDS]
    return words

def process_json_file(file_path):
    """Обрабатывает один JSON-файл и возвращает список русских слов."""
    words = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # --- Уроки (обычные) ---
        if 'exercises' in data:
            for ex in data['exercises']:
                if 'question' in ex and ex['question']:
                    words.extend(extract_russian_words(ex['question']))
                if 'options' in ex and ex['options']:
                    for opt in ex['options']:
                        words.extend(extract_russian_words(opt))
                if 'correct' in ex and isinstance(ex['correct'], str):
                    words.extend(extract_russian_words(ex['correct']))
                if 'orderItems' in ex:
                    for item in ex['orderItems']:
                        words.extend(extract_russian_words(item))
                if 'matchPairs' in ex:
                    for pair in ex['matchPairs']:
                        if 'left' in pair:
                            words.extend(extract_russian_words(pair['left']))
                        if 'right' in pair:
                            words.extend(extract_russian_words(pair['right']))
                if 'promptRu' in ex:
                    words.extend(extract_russian_words(ex['promptRu']))

        # --- Диалоги (dialogueLines) ---
        if 'dialogueLines' in data:
            for line in data['dialogueLines']:
                if 'textRu' in line:
                    words.extend(extract_russian_words(line['textRu']))
                if 'text' in line:  # альтернативный формат
                    words.extend(extract_russian_words(line['text']))

        # --- Speaking cards ---
        if 'cards' in data:
            for card in data['cards']:
                if 'promptRu' in card:
                    words.extend(extract_russian_words(card['promptRu']))

        # --- Теория (content) ---
        if 'content' in data:
            words.extend(extract_russian_words(data['content']))

        # --- Дополнительно: заголовки, описания ---
        for field in ['title', 'description', 'question']:
            if field in data and data[field]:
                words.extend(extract_russian_words(data[field]))

    except Exception as e:
        print(f"⚠️ Ошибка при обработке {file_path}: {e}")

    return words

def main():
    if not CHAPTERS_DIR.exists():
        print(f"❌ Папка {CHAPTERS_DIR} не найдена.")
        sys.exit(1)

    all_words = set()

    print("🔄 Сбор русских слов из уроков...")
    for root, dirs, files in os.walk(CHAPTERS_DIR):
        for file in files:
            if file.endswith('.json'):
                file_path = Path(root) / file
                words = process_json_file(file_path)
                all_words.update(words)

    if not all_words:
        print("⚠️ Не найдено ни одного русского слова.")
        return

    # Сортируем и записываем в файл
    sorted_words = sorted(all_words)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for word in sorted_words:
            f.write(word + '\n')

    print(f"✅ Собрано {len(sorted_words)} уникальных русских слов.")
    print(f"📁 Сохранено в {OUTPUT_FILE}")

if __name__ == "__main__":
    main()