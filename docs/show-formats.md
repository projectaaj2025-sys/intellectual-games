# Show formats and question data

The format selector in the builder creates separate, format-specific sets. These are stored with their `showFormat` and `showItems` in the same local browser library as other custom games and can be exported/imported as JSON. Demo sets contain Russian text.

* **Quiz board:** the existing category/value board, with special question types and a final.
* **Millionaire:** 15 authored questions in the supplied order; each has four distinct options and an explicitly selected correct answer. The order should increase in difficulty. The in-app prize ladder and lifelines are an adaptation, not a reproduction of every season's television rules.
* **What? Where? When?:** 13 authored sectors; ordinary and black-box questions have an answer and an optional explanation/source. Blitz and superblitz sectors contain three questions, with 20 seconds per question; one wrong answer loses the sector. The match ends when either side reaches six points.
* **100 to 1:** six questions with six distinct answers and author-entered descending scores (integer 0–100, sum at most 100). These scores should come from the author's survey. The included demo uses **illustrative, invented scores**, not actual survey results. The implementation is a simplified host-operated board with three strikes and a cumulative score, not the full television team rounds or final. The answer key is visible to everyone when opened on a shared screen.

The show pickers deliberately list only sets created for that format. They do not fabricate poll answers or multiple-choice distractors from unrelated school-bank answers. A set must be complete before it can be saved or played; incomplete drafts remain in memory while switching formats.

## Rules consulted

* [What? Where? When? official regulations](https://chgk.tvigra.ru/reglament/) — standard minute, blitz and superblitz.
* [Millionaire programme description](https://tv.yandex.ru/program/kto-hochet-stat-millionerom-8661486) — 15 questions, increasing difficulty and four options.
* [100 to 1 classroom game description](https://videouroki.net/razrabotki/prezentatsiya-igra-sto-k-odnomu.html) — common survey answers and scores.

Run `node tests/show-formats.test.js` for sample-data and validation checks.

### ЧГК: таймер

В конструкторе набора можно включить или отключить таймер и указать время для обычного вопроса и блица (5–600 секунд). Стандартные значения — 60 и 20 секунд соответственно. Настройки сохраняются в JSON и локальной библиотеке. Для старых наборов применяются стандартные значения. Перед вращением волчка ведущий может включить или отключить таймер на текущую партию. На вопросе таймер запускается вручную после чтения; доступны пауза, продолжение и сброс. По истечении времени ответ не раскрывается автоматически — сначала отвечает команда, а ведущий открывает правильный ответ.

## Каталог и генерация с ИИ

Карточки форматов на главной и в разделе «Играть» открывают общий каталог с фильтром выбранного формата. В «Физике» находятся и обычные игры, и наборы по программе; карточки сгруппированы по классам, наборы для нескольких классов вынесены отдельно. Фильтры формата, класса, четверти и поиск действуют совместно.

В ИИ-генераторе можно выбрать любое из четырёх шоу и пункт «Своя тема»; в этом режиме тема не ограничивается школьной программой, а класс задаёт примерный возраст аудитории. Для «Своей игры» требуется два заполненных поля 5×5 и финал, для «Миллионера» — 15 вопросов с четырьмя вариантами, для ЧГК — 13 секторов, для «100 к 1» — шесть вопросов с шестью вариантами. Приложение не запускает неполный или структурно неверный ответ, а показывает ошибку. Результат можно сохранить и отредактировать в конструкторе либо запустить. Сгенерированные факты и ответы обязательно следует проверять: структурная проверка не гарантирует их достоверность. В «100 к 1» варианты и баллы ИИ — только предположения, не реальные результаты опроса; замените их реальными данными или используйте как условный пример.

Ошибка Gemini 503/502/504 означает временную недоступность сервиса; сама по себе она не доказывает, что ключ неверный. При генерации выполняются до двух повторов с задержкой, затем пробуются другие модели. Отменой можно прервать ожидание. Ошибки доступа и квоты не повторяются автоматически. Проверки в `tests/gemini.test.js` имитируют ответы сервиса и не требуют ключа.
