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
