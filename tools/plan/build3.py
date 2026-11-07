# -*- coding: utf-8 -*-
"""Математика: математика 5–6, алгебра 7–11, геометрия 8/9/11 + сборные."""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
import m5, m6, alg, alg2, alg3, alg4, geo8, geo9, geo11, mathfun, stat11

VAL = [100, 200, 300, 400, 500]
GRADE_RU = {'5': '5 класс', '6': '6 класс', '7': '7 класс', '8': '8 класс',
            '9': '9 класс', '10': '10 класс', '11': '11 класс'}
GRADE_KK = {'5': '5 сынып', '6': '6 сынып', '7': '7 сынып', '8': '8 сынып',
            '9': '9 сынып', '10': '10 сынып', '11': '11 сынып'}
GRADE_EN = {'5': 'Grade 5', '6': 'Grade 6', '7': 'Grade 7', '8': 'Grade 8',
            '9': 'Grade 9', '10': 'Grade 10', '11': 'Grade 11'}
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
    if len(cats) <= n:
        return list(cats)
    step = len(cats) / n
    return [cats[int(i * step)] for i in range(n)]


def special_type(ci, qi):
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


FINAL = {
    'math': {
        'theme': {'ru': 'Математика вокруг', 'kk': 'Айналадағы математика', 'en': 'Maths around us'},
        'q': {'ru': 'Назовите три случая за сегодня, когда вы использовали математику, и объясните один.',
              'kk': 'Бүгін математиканы қолданған үш жағдайды атап, біреуін түсіндіріңіз.',
              'en': 'Name three times you used maths today and explain one.'},
        'a': {'ru': 'Например: посчитал сдачу, оценил время в пути, разделил пиццу на всех.',
              'kk': 'Мысалы: қайтарымды санадым, жол уақытын бағаладым, пиццаны тең бөлдім.',
              'en': 'For example: counted change, estimated travel time, split a pizza.'},
    },
    'algebra': {
        'theme': {'ru': 'Алгебра в жизни', 'kk': 'Өмірдегі алгебра', 'en': 'Algebra in life'},
        'q': {'ru': 'Придумайте задачу из своей жизни, которую можно записать уравнением, и составьте его.',
              'kk': 'Өз өміріңізден теңдеумен жазылатын есеп құрастырып, теңдеуін жазыңыз.',
              'en': 'Invent a problem from your life that becomes an equation, and write the equation.'},
        'a': {'ru': 'Например: «На сколько дней хватит 5000 тг, если в день тратить x?» — 5000/x = n.',
              'kk': 'Мысалы: «Күніне x жұмсаса, 5000 тг неше күнге жетеді?» — 5000/x = n.',
              'en': 'For example: "For how many days does 5000 last if I spend x a day?" — 5000/x = n.'},
    },
    'geometry': {
        'theme': {'ru': 'Геометрия вокруг', 'kk': 'Айналадағы геометрия', 'en': 'Geometry around us'},
        'q': {'ru': 'Назовите три предмета в комнате и геометрические фигуры, на которые они похожи.',
              'kk': 'Бөлмедегі үш затты және олар ұқсайтын геометриялық фигураларды атаңыз.',
              'en': 'Name three objects in the room and the geometric shapes they resemble.'},
        'a': {'ru': 'Например: окно — прямоугольник, стакан — цилиндр, мяч — шар.',
              'kk': 'Мысалы: терезе — тіктөртбұрыш, стақан — цилиндр, доп — шар.',
              'en': 'For example: a window is a rectangle, a glass a cylinder, a ball a sphere.'},
    },
}

SUBJ_RU = {'alg': 'Алгебра', 'geo': 'Геометрия', 'math': 'Математика'}
SUBJ_EN = {'alg': 'Algebra', 'geo': 'Geometry', 'math': 'Maths'}
SKIND = {'alg': 'algebra', 'geo': 'geometry', 'math': 'math'}
EMOJI = {'alg': '∑', 'geo': '📐', 'math': '🔢'}
ACCENT = {'alg': '#9a7bff', 'geo': '#39e29a', 'math': '#54e0ff'}
RU_SECTION = {'alg': 'алгебры', 'geo': 'геометрии', 'math': 'математики'}
KK_SECTION = {'alg': 'алгебра', 'geo': 'геометрия', 'math': 'математика'}
EN_SECTION = {'alg': 'algebra', 'geo': 'geometry', 'math': 'maths'}


def game(gid, title, desc, emoji, accent, rounds_cats, tags, grade, quarter,
         subject='math', grades=None):
    rounds = []
    for i, cats in enumerate(rounds_cats):
        rounds.append({
            'name': {'ru': 'Раунд %d' % (i + 1), 'kk': '%d-раунд' % (i + 1), 'en': 'Round %d' % (i + 1)},
            'values': VAL,
            'categories': [pack(c, ci) for ci, c in enumerate(cats)],
        })
    return {
        'id': gid, 'subject': 'math', 'grade': grade, 'quarter': quarter,
        'emoji': emoji, 'accent': accent, 'title': title, 'desc': desc,
        'tags': tags, 'grades': grades or [grade], 'builtin': True,
        'rounds': rounds, 'final': FINAL[subject],
    }


decks = []


def add_part(kind, grade, quarters, tag_extra=None):
    subj = SKIND[kind]
    allc = []
    for qi, cats in enumerate(quarters, 1):
        allc += cats
        decks.append(game(
            'plan-%s-%s-q%d' % (kind, grade, qi),
            {'ru': '%s · %s · %s' % (GRADE_RU[grade], SUBJ_RU[kind], Q_RU[qi - 1]),
             'kk': '%s · %s · %s' % (GRADE_KK[grade], SUBJ_RU[kind], Q_KK[qi - 1]),
             'en': '%s · %s · %s' % (GRADE_EN[grade], SUBJ_EN[kind], Q_EN[qi - 1])},
            {'ru': 'По КТП: %s %s этой четверти — задачи, «почему» и факты.' % (razdel(len(cats)), RU_SECTION[kind]),
             'kk': 'КТЖ бойынша: осы тоқсанның %d бөлімі — есептер, «неліктен» және фактілер.' % len(cats),
             'en': '%d sections of the term — problems, "why" questions and facts.' % len(cats)},
            EMOJI[kind], ACCENT[kind], [cats],
            ['plan', subj, 'grade%s' % grade, 'q%d' % qi], grade, qi, subject=subj))
    rounds = [pick_spread(allc[:len(allc) // 2], 5), pick_spread(allc[len(allc) // 2:], 5)]
    decks.append(game(
        'plan-%s-%s-course' % (kind, grade),
        {'ru': '%s · %s · весь курс' % (GRADE_RU[grade], SUBJ_RU[kind]),
         'kk': '%s · %s · толық курс' % (GRADE_KK[grade], SUBJ_RU[kind]),
         'en': '%s · %s · full course' % (GRADE_EN[grade], SUBJ_EN[kind])},
        {'ru': 'Обзор четырёх четвертей: 10 выбранных разделов, два раунда без повторов.',
         'kk': 'Төрт тоқсанға шолу: таңдалған 10 бөлім, екі раунд қайталанбайды.',
         'en': 'Full-year overview: 10 selected sections from four terms, two rounds with no repeats.'},
        '🏆', '#f2c45a', rounds,
        ['plan', subj, 'grade%s' % grade, 'course'], grade, 0, subject=subj))


ALG = {'7': [alg.A7_1, alg.A7_2, alg.A7_3, alg.A7_4],
       '8': [alg2.A8_1, alg2.A8_2, alg2.A8_3, alg2.A8_4],
       '9': [alg3.A9_1, alg3.A9_2, alg3.A9_3, alg3.A9_4],
       '10': [alg4.A10_1, alg4.A10_2, alg4.A10_3, alg4.A10_4],
       '11': [alg4.A11_1, alg4.A11_2, alg4.A11_3, alg4.A11_4]}
GEO = {'8': [geo8.G8_1, geo8.G8_2, geo8.G8_3, geo8.G8_4],
       '9': [geo9.G9_1, geo9.G9_2, geo9.G9_3, geo9.G9_4],
       '11': [geo11.G11_1, geo11.G11_2, geo11.G11_3, geo11.G11_4]}
MATH = {'5': [m5.M5_1, m5.M5_2, m5.M5_3, m5.M5_4],
        '6': [m6.M6_1, m6.M6_2, m6.M6_3, m6.M6_4]}

add_part('math', '5', MATH['5'])
add_part('math', '6', MATH['6'])
for g in ('7', '8', '9', '10', '11'):
    add_part('alg', g, ALG[g])
for g in ('8', '9', '11'):
    add_part('geo', g, GEO[g])

# Дополнительные тематические игры: не выдаются за конкретную четверть КТП.
for number, cats in enumerate((stat11.FIRST, stat11.SECOND), 1):
    deck = game('plan-alg-11-statistics-%d' % number,
        {'ru': '11 класс · Алгебра · Статистика %d' % number, 'kk': '11 сынып · Алгебра · Статистика %d' % number, 'en': 'Grade 11 · Algebra · Statistics %d' % number},
        {'ru': 'Практика статистики и исторические факты. Учебные данные, один раунд.', 'kk': 'Статистика практикасы және тарихи деректер. Оқу деректері, бір раунд.', 'en': 'Statistics practice and historical facts. Illustrative data, one round.'},
        '📊', '#9a7bff', [cats], ['algebra','statistics','grade11'], '11', 0, subject='algebra')
    deck['final'] = {
        'theme': {'ru':'Решение по данным','kk':'Деректерге сүйенген шешім','en':'A decision from data'},
        'q': {'ru':'В опросе 8 из 20 человек выбрали A, а 12 — B. Какую долю опрошенных составляет B?', 'kk':'Сауалнамада 20 адамның 8-і A, 12-сі B таңдады. Сұралғандардың қандай бөлігі B таңдады?', 'en':'In a survey, 8 out of 20 choose A and 12 choose B. What proportion chose B?'},
        'a': {'ru':'60%', 'kk':'60%', 'en':'60%'}
    }
    if number == 2:
        deck['final'] = {'theme': {'ru':'Корреляция','kk':'Корреляция','en':'Correlation'}, 'q': {'ru':'Связаны ли две величины причинно только потому, что их корреляция равна 0,9?', 'kk':'Екі шама корреляциясы 0,9 болғандықтан ғана олардың арасында себеп-салдар байланысы бар ма?', 'en':'Does a correlation of 0.9 alone establish that one variable causes the other?'}, 'a': {'ru':'Нет','kk':'Жоқ','en':'No'}}
    decks.append(deck)


def flat(grades, parts):
    out = []
    for g in grades:
        for part in parts:
            for qi in range(4):
                out += (part.get(g) or [[], [], [], []])[qi]
    return out


def add_combo(gid, kind, grades, parts, title_ru, title_kk, title_en, emoji, accent):
    allc = flat(grades, parts)
    rounds = [pick_spread(allc[:len(allc) // 2], 5), pick_spread(allc[len(allc) // 2:], 5)]
    if len(parts) == 2:
        a, b = (flat(grades, [part]) for part in parts)
        rounds = [pick_spread(a[:len(a)//2], 3) + pick_spread(b[:len(b)//2], 2),
                  pick_spread(a[len(a)//2:], 2) + pick_spread(b[len(b)//2:], 3)]
    subj = SKIND[kind]
    decks.append(game(
        gid,
        {'ru': title_ru, 'kk': title_kk, 'en': title_en},
        {'ru': 'Сборная по классам и четвертям: 10 выбранных разделов, два раунда без повторов.',
         'kk': 'Сыныптар мен тоқсандар бойынша жиынтық: таңдалған 10 бөлім, екі раунд қайталанбайды.',
         'en': 'Mixed grades and terms: 10 selected sections in two rounds, no repeats.'},
        emoji, accent, rounds, ['plan', subj, 'combo'], grades[0], 0,
        subject=subj, grades=grades))


add_combo('plan-math-combo-5-6', 'math', ['5', '6'], [MATH],
          'Математика · сборная 5–6 классы', 'Математика · жиынтық 5–6 сыныптар',
          'Maths · combined grades 5–6', '🔢', '#54e0ff')
add_combo('plan-alg-combo-7-9', 'alg', ['7', '8', '9'], [ALG],
          'Алгебра · сборная 7–9 классы', 'Алгебра · жиынтық 7–9 сыныптар',
          'Algebra · combined grades 7–9', '∑', '#9a7bff')
add_combo('plan-alg-combo-10-11', 'alg', ['10', '11'], [ALG],
          'Алгебра · сборная 10–11 классы', 'Алгебра · жиынтық 10–11 сыныптар',
          'Algebra · combined grades 10–11', '∑', '#9a7bff')
add_combo('plan-alg-combo-7-11', 'alg', ['7', '8', '9', '10', '11'], [ALG],
          'Алгебра · сборная 7–11 классы', 'Алгебра · жиынтық 7–11 сыныптар',
          'Algebra · combined grades 7–11', '🥇', '#f2c45a')
add_combo('plan-geo-combo-8-11', 'geo', ['8', '9', '11'], [GEO],
          'Геометрия · сборная 8, 9 и 11 классы', 'Геометрия · жиынтық 8, 9 және 11 сыныптар',
          'Geometry · combined grades 8, 9 and 11', '📐', '#39e29a')
add_combo('plan-math-combo-8-9', 'math', ['8', '9'], [ALG, GEO],
          'Математика · сборная 8–9 классы', 'Математика · жиынтық 8–9 сыныптар',
          'Maths · combined grades 8–9', '🧮', '#54e0ff')
add_combo('plan-math-combo-7-11', 'math', ['7', '8', '9', '10', '11'], [ALG, GEO],
          'Математика · сборная 7–11 классы (алгебра + геометрия)',
          'Математика · жиынтық 7–11 сыныптар (алгебра + геометрия)',
          'Maths · combined grades 7–11 (algebra + geometry)', '🥇', '#f2c45a')

decks.append(game(
    'plan-math-fun-1',
    {'ru': 'Математика · игра для любознательных', 'kk': 'Математика · қызықты ойын', 'en': 'Maths · a game for curious minds'},
    {'ru': 'Задачи на смекалку, игры, животные и пицца.', 'kk': 'Тапқырлық есептері, ойындар, жануарлар мен пицца.', 'en': 'Puzzles, games, animals and pizza.'},
    '🧩', '#f2c45a', [mathfun.FUN_MATH], ['fun', 'math'], '5', 0,
    subject='math', grades=['5', '6', '7', '8', '9']))

json.dump(decks, open(HERE / 'math_decks.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('наборов:', len(decks))
tot = 0
for d in decks:
    qq = sum(len(c['questions']) for r in d['rounds'] for c in r['categories'])
    tot += qq
    print('  %-24s %-44s R%d кат %-8s Q %3d' % (
        d['id'], d['title']['ru'], len(d['rounds']),
        str([len(r['categories']) for r in d['rounds']]), qq))
print('вопросов всего:', tot)
