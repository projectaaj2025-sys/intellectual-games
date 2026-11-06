# -*- coding: utf-8 -*-
"""Полная сборка: четверти, курсы, сборные, смешные, плюс метаданные КТП."""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
from schema import cat, q
import q7, q7b, q7c, q8, q8b, q8c, q9, q9b, q10, q10b, q11, q11b, q11c, qfun

QUARTERS = {
    ('7', 1): q7.Q7_1, ('7', 2): q7b.Q7_2, ('7', 3): q7c.Q7_3, ('7', 4): q7c.Q7_4,
    ('8', 1): q8.Q8_1, ('8', 2): q8b.Q8_2, ('8', 3): q8c.Q8_3, ('8', 4): q8c.Q8_4,
    ('9', 1): q9.Q9_1, ('9', 2): q9.Q9_2, ('9', 3): q9b.Q9_3, ('9', 4): q9b.Q9_4,
    ('10', 1): q10.Q10_1, ('10', 2): q10.Q10_2, ('10', 3): q10b.Q10_3, ('10', 4): q10b.Q10_4,
    ('11', 1): q11.Q11_1, ('11', 2): q11b.Q11_2, ('11', 3): q11b.Q11_3, ('11', 4): q11c.Q11_4,
}

VAL = [100, 200, 300, 400, 500]
GRADE_RU = {'7': '7 класс', '8': '8 класс', '9': '9 класс', '10': '10 класс', '11': '11 класс'}
GRADE_KK = {'7': '7 сынып', '8': '8 сынып', '9': '9 сынып', '10': '10 сынып', '11': '11 сынып'}
GRADE_EN = {'7': 'Grade 7', '8': 'Grade 8', '9': 'Grade 9', '10': 'Grade 10', '11': 'Grade 11'}
Q_RU = ['1 четверть', '2 четверть', '3 четверть', '4 четверть']
Q_KK = ['1 тоқсан', '2 тоқсан', '3 тоқсан', '4 тоқсан']
Q_EN = ['Term 1', 'Term 2', 'Term 3', 'Term 4']


def plural(n, one, few, many):
    n = abs(int(n))
    if n % 10 == 1 and n % 100 != 11:
        return one
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return few
    return many


def razdel(n):
    return '%d %s' % (n, plural(n, 'раздел', 'раздела', 'разделов'))


def pick_spread(cats, n=5):
    """Берём n категорий, равномерно распределённых по списку."""
    if len(cats) <= n:
        return list(cats)
    step = len(cats) / n
    return [cats[int(i * step)] for i in range(n)]


def special_type(ci, qi):
    """Спецвопросы раздаём редко и по-разному, чтобы поле не было однообразным."""
    if qi == 4:
        return 'bonus' if ci % 2 == 0 else 'normal'
    if qi == 3:
        return 'cat' if ci % 3 == 2 else 'normal'
    if qi == 2:
        return 'auction' if ci % 3 == 1 else 'normal'
    if qi == 0:
        return 'fail' if ci % 5 == 3 else 'normal'
    return 'normal'


def pack(c, ci=0):
    qs = []
    for i, it in enumerate(c['qs']):
        qs.append({
            'q': {'ru': it['ru'], 'kk': it['kk'], 'en': it['en']},
            'a': {'ru': it['a'], 'kk': it['akk'], 'en': it['aen']},
            'type': special_type(ci, i),
            'fact': {'ru': it.get('fact', ''), 'kk': it.get('fkk', ''), 'en': it.get('fen', '')},
            'value': VAL[i],
        })
    return {'name': {'ru': c['ru'], 'kk': c['kk'], 'en': c['en']}, 'questions': qs}


def game(gid, title, desc, emoji, accent, rounds_cats, tags, grade, quarter,
         subject='physics', grades=None):
    """rounds_cats — список списков категорий: один список = один раунд."""
    rounds = []
    for i, cats in enumerate(rounds_cats):
        rounds.append({
            'name': {'ru': 'Раунд %d' % (i + 1), 'kk': '%d-раунд' % (i + 1), 'en': 'Round %d' % (i + 1)},
            'values': VAL,
            'categories': [pack(c, ci) for ci, c in enumerate(cats)],
        })
    return {
        'id': gid, 'subject': subject, 'grade': grade, 'quarter': quarter,
        'emoji': emoji, 'accent': accent, 'title': title, 'desc': desc,
        'tags': tags, 'grades': grades or [grade], 'builtin': True,
        'rounds': rounds,
        'final': {
            'theme': {'ru': 'Физика вокруг', 'kk': 'Айналадағы физика', 'en': 'Physics around us'},
            'q': {'ru': 'Назовите три физических явления, которые вы видели сегодня по дороге в школу, и объясните одно из них.',
                  'kk': 'Бүгін мектепке бара жатқанда көрген үш физикалық құбылысты атап, біреуін түсіндіріңіз.',
                  'en': 'Name three physical phenomena you saw on the way to school today and explain one.'},
            'a': {'ru': 'Например: таяние снега (тепловое), тень от дерева (световое), звук звонка (звуковое).',
                  'kk': 'Мысалы: қардың еруі (жылулық), ағаш көлеңкесі (жарық), қоңырау дыбысы (дыбыс).',
                  'en': 'For example: melting snow (thermal), a tree\'s shadow (light), the bell ringing (sound).'},
        },
    }


def rotate(cats, n=5, off=0):
    if len(cats) <= n:
        return list(cats)
    return [cats[(i + off) % len(cats)] for i in range(n)]


decks = []
# --- четверти
for (g, quarter), cats in QUARTERS.items():
    decks.append(game(
        'plan-%s-q%d' % (g, quarter),
        {'ru': '%s · %s' % (GRADE_RU[g], Q_RU[quarter - 1]),
         'kk': '%s · %s' % (GRADE_KK[g], Q_KK[quarter - 1]),
         'en': '%s · %s' % (GRADE_EN[g], Q_EN[quarter - 1])},
        {'ru': 'По КТП: %s четверти, задачи, опыты и неожиданные факты.' % razdel(len(cats)),
         'kk': 'КТЖ бойынша: тоқсанның %d бөлімі, есептер, тәжірибелер және күтпеген фактілер.' % len(cats),
         'en': '%d sections of the term, with problems, experiments and surprising facts.' % len(cats)},
        '⚛️', '#54e0ff', [cats], ['plan', 'grade%s' % g, 'q%d' % quarter], g, quarter))

# --- курс класса
for g in sorted({k[0] for k in QUARTERS}):
    allc = []
    for quarter in (1, 2, 3, 4):
        allc += QUARTERS.get((g, quarter), [])
    decks.append(game(
        'plan-%s-course' % g,
        {'ru': '%s · весь курс' % GRADE_RU[g],
         'kk': '%s · толық курс' % GRADE_KK[g],
         'en': '%s · full course' % GRADE_EN[g]},
        {'ru': 'Сборная игра за год: %s четырёх четвертей, два раунда без повторов.' % razdel(len(allc)),
         'kk': 'Жыл бойынша жиынтық ойын: төрт тоқсанның %d бөлімі, екі раунд қайталанбайды.' % len(allc),
         'en': 'Full-year game: %d sections from four terms, two rounds with no repeats.' % len(allc)},
        '🏆', '#f2c45a', [pick_spread(allc[:10] if len(allc) > 10 else allc, 5),
                          pick_spread(allc[10:] if len(allc) > 10 else allc, 5)],
        ['plan', 'grade%s' % g, 'course'], g, 0))

# --- сборные 7-9, 10-11, 7-11
COMBOS = [
    (['7', '8', '9'], '7–9', 'сборная 7–9 классы', 'жиынтық 7–9 сыныптар', 'combined grades 7–9', '🥉', '#39e29a'),
    (['10', '11'], '10–11', 'сборная 10–11 классы', 'жиынтық 10–11 сыныптар', 'combined grades 10–11', '🥈', '#9a7bff'),
    (['7', '8', '9', '10', '11'], '7–11', 'сборная 7–11 классы', 'жиынтық 7–11 сыныптар', 'combined grades 7–11', '🥇', '#f2c45a'),
]
for grades, label, ru, kk, en, emoji, accent in COMBOS:
    allc = []
    for g in grades:
        for quarter in (1, 2, 3, 4):
            allc += QUARTERS.get((g, quarter), [])
    half = len(allc) // 2
    decks.append(game(
        'plan-combo-%s' % label.replace('–', '-'),
        {'ru': 'Физика · %s' % ru, 'kk': 'Физика · %s' % kk, 'en': 'Physics · %s' % en},
        {'ru': 'Сборная из всех четвертей и классов: %s, два раунда без повторов.' % razdel(len(allc)),
         'kk': 'Барлық тоқсандар мен сыныптардан жиынтық: %d бөлім, екі раунд қайталанбайды.' % len(allc),
         'en': 'Mixed from every term and grade: %d sections in two rounds, no repeats.' % len(allc)},
        emoji, accent, [pick_spread(allc[:half], 5), pick_spread(allc[half:], 5)],
        ['plan', 'combo'], grades[0], 0, grades=grades))

# --- смешные
decks.append(game(
    'plan-fun-1',
    {'ru': 'Смешная физика · просто так', 'kk': 'Күлкілі физика · жай ғана', 'en': 'Fun physics · just for fun'},
    {'ru': 'Игра не по программе: кошки, еда, мемы и глупые вопросы — с научными ответами.' if False else
          'Игра не по программе: кошки, еда, мемы и «глупые» вопросы — с научными ответами.',
     'kk': 'Бағдарламасыз ойын: мысықтар, тағам, мемдер және «ақымақ» сұрақтар — ғылыми жауаптармен.',
     'en': 'Not from the syllabus: cats, food, memes and "silly" questions with real science answers.'},
    '😹', '#ff6079', [qfun.FUN_1], ['fun', 'plan'], 7, 0))

json.dump(decks, open(HERE / 'decks.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('наборов:', len(decks))
tot = 0
for d in decks:
    n = len(d['rounds'])
    qq = sum(len(c['questions']) for r in d['rounds'] for c in r['categories'])
    catn = [len(r['categories']) for r in d['rounds']]
    tot += qq
    print('  %-18s %-34s R%d кат %-8s Q %3d' % (d['id'], d['title']['ru'], n, str(catn), qq))
print('вопросов всего:', tot)
