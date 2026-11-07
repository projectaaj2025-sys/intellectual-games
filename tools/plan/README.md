# Curriculum game sources

`index.html` contains the embedded game bank and is the runnable app. To rebuild the curriculum games after editing these source modules, run:

```sh
python3 tools/plan/rebuild.py
python3 tools/plan/test_decks.py
```

The generators use only the Python standard library. `build2.py` generates the physics decks; `build3.py` generates mathematics, algebra, geometry and the puzzle game. The rebuild script combines their outputs, verifies unique IDs, replaces the embedded `PLAN_GAMES` declaration and removes its temporary JSON files.

`stat11.py` adds two supplementary 11th-grade algebra/statistics games (15 questions and a final each), with fictional classroom data and historical notes; they are not assigned to a specific term. Historical references: [Gresham College on Nightingale and Snow](https://www.gresham.ac.uk/sites/default/files/transcript/2023-05-16-1300_Hart-T.pdf), [Pearson, Britannica](https://www.britannica.com/biography/Karl-Pearson), [History of Correlation](https://library.oapen.org/bitstream/handle/20.500.12657/101548/9781040261750.pdf?sequence=1&isAllowed=y), and [the history of statistical methods and Bayes](https://science-spectrum.com/history-of-statistics/). Galton’s contributions are not an endorsement of his eugenic views.
