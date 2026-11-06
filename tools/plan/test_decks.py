"""Structural checks for embedded curriculum games: python3 tools/plan/test_decks.py."""
import json
import re
from pathlib import Path

html = (Path(__file__).resolve().parents[2] / 'index.html').read_text(encoding='utf-8')
match = re.search(r'^const PLAN_GAMES = (.*);$', html, re.M)
assert match, 'Missing PLAN_GAMES'
games = json.loads(match.group(1))
ids = [g['id'] for g in games]
assert len(ids) == len(set(ids))
assert len(games) == 87
for kind, grades in [('math', (5, 6)), ('alg', (7, 8, 9, 10, 11)), ('geo', (8, 9, 11))]:
    for grade in grades:
        for quarter in range(1, 5):
            assert f'plan-{kind}-{grade}-q{quarter}' in ids
        assert f'plan-{kind}-{grade}-course' in ids
for game in games:
    assert game['subject'] in ('math', 'physics'), game['id']
    assert len(game['rounds']) in (1, 2), game['id']
    for key in ('theme', 'q', 'a'):
        assert all(game['final'][key].get(lang) for lang in ('ru', 'kk', 'en')), game['id']
    questions_seen = set()
    for round_ in game['rounds']:
        assert 1 <= len(round_['categories']) <= 6, game['id']
        for category in round_['categories']:
            assert len(category['questions']) == 5, game['id']
            for question in category['questions']:
                text = question['q']['ru']
                assert text not in questions_seen, (game['id'], text)
                questions_seen.add(text)
                for field in ('q', 'a', 'fact'):
                    assert all(question[field].get(lang) for lang in ('ru', 'kk', 'en')), (game['id'], field)
                assert question['type'] in ('normal', 'bonus', 'cat', 'auction', 'fail')
print(f'{len(games)} games passed structural checks')
