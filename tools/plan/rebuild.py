"""Rebuild embedded curriculum decks: python3 tools/plan/rebuild.py."""
import json
import re
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parent.parent
outputs = [here / 'decks.json', here / 'math_decks.json']
try:
    for script in ('build2.py', 'build3.py'):
        subprocess.run([sys.executable, str(here / script)], check=True)
    decks = [deck for path in outputs for deck in json.loads(path.read_text(encoding='utf-8'))]
    assert len({d['id'] for d in decks}) == len(decks), 'duplicate game id'
    html_path = root / 'index.html'
    html = html_path.read_text(encoding='utf-8')
    replacement = 'const PLAN_GAMES = ' + json.dumps(decks, ensure_ascii=False, separators=(',', ':')) + ';'
    html, count = re.subn(r'^const PLAN_GAMES = .*?;$', lambda _: replacement, html, count=1, flags=re.M)
    if count != 1:
        raise RuntimeError('PLAN_GAMES declaration not found')
    html_path.write_text(html, encoding='utf-8')
    print(f'Embedded {len(decks)} games in index.html')
finally:
    for output in outputs:
        output.unlink(missing_ok=True)
