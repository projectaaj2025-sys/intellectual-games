# Curriculum game sources

`index.html` contains the embedded game bank and is the runnable app. To rebuild the curriculum games after editing these source modules, run:

```sh
python3 tools/plan/rebuild.py
python3 tools/plan/test_decks.py
```

The generators use only the Python standard library. `build2.py` generates the physics decks; `build3.py` generates mathematics, algebra, geometry and the puzzle game. The rebuild script combines their outputs, verifies unique IDs, replaces the embedded `PLAN_GAMES` declaration and removes its temporary JSON files.
