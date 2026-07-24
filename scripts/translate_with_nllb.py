#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import time
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# ===== НАСТРОЙКИ =====
# Меняем оригинальный NLLB на версию с поддержкой тувинского языка
MODEL_NAME = "slone/nllb-rus-tyv-v2-extvoc"
SRC_LANG = "rus_Cyrl"  # Русский
TGT_LANG = "tyv_Cyrl"  # Тувинский
INPUT_FILE = "words.txt"
OUTPUT_FILE = "nllb_result.json"
BATCH_SIZE = 8

# Выбираем устройство: GPU (cuda) если доступно, иначе CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ===== ЗАГРУЗКА МОДЕЛИ =====
print(f"🔄 Загрузка модели NLLB ({MODEL_NAME}) на устройство: {device}...")

# Важно: для NLLB сразу указываем src_lang в токенизаторе
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, src_lang=SRC_LANG)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)

print("✅ Модель загружена.")

# Проверяем, поддерживает ли токенизатор тувинский язык
tgt_lang_id = tokenizer.convert_tokens_to_ids(TGT_LANG)
if tgt_lang_id == tokenizer.unk_token_id:
    print(f"⚠️ Ошибка: Язык '{TGT_LANG}' не поддерживается этой моделью.")
    sys.exit(1)

def translate_batch(words):
    # Теперь мы НЕ добавляем код языка внутрь строки. NLLB управляет этим через спецтокены.
    encoded = tokenizer(
        words, 
        return_tensors="pt", 
        padding=True, 
        truncation=True, 
        max_length=128
    ).to(device)  # Переносим тензоры на GPU/CPU

    with torch.no_grad():
        outputs = model.generate(
            **encoded,
            forced_bos_token_id=tgt_lang_id,
            max_length=128,
            num_beams=4,
            early_stopping=True,
        )
    
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)

def load_words(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def main():
    try:
        words = load_words(INPUT_FILE)
    except FileNotFoundError:
        print(f"❌ Файл {INPUT_FILE} не найден. Создайте его со словами для перевода.")
        sys.exit(1)

    if not words:
        print("⚠️ Файл пуст.")
        return

    print(f"📖 Найдено {len(words)} слов(а)/фраз.")
    results = []
    total = len(words)

    for i in range(0, total, BATCH_SIZE):
        batch = words[i:i + BATCH_SIZE]
        print(f"🔄 Обработка строк {i+1}-{min(i+BATCH_SIZE, total)} из {total}...")
        
        try:
            translations = translate_batch(batch)
            for src, tgt in zip(batch, translations):
                results.append({"source": src, "translation": tgt})
                print(f"  {src} → {tgt}")
        except Exception as e:
            print(f"❌ Ошибка при обработке батча: {e}")
        
        # Небольшая пауза для стабильности (на CPU можно убрать)
        time.sleep(0.1)

    # Сохраняем итоговый JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    print(f"\n✅ Готово! Переведено {len(results)} элементов. Результат сохранен в {OUTPUT_FILE}.")

if __name__ == "__main__":
    main()
