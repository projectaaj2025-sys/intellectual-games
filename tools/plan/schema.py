# -*- coding: utf-8 -*-
"""Вопросы учебного плана. Структура:
   CATS = { '7-q1': [ {id, ru, kk, en, qs:[{v,ru,kk,en,a,a_kk,a_en,fact,fact_kk,fact_en,type}]} ] }
   Каждая категория — 5 вопросов (v=100..500), это одна колонка поля.
"""
from collections import OrderedDict
import json, sys

def cat(cid, ru, kk, en, qs):
    assert len(qs) == 5, (cid, len(qs))
    return {'id': cid, 'ru': ru, 'kk': kk, 'en': en, 'qs': qs}

def q(ru, kk, en, a, akk, aen, fact='', fkk='', fen='', t='normal'):
    return {'v': 0, 'ru': ru, 'kk': kk, 'en': en, 'a': a, 'akk': akk, 'aen': aen,
            'fact': fact, 'fkk': fkk, 'fen': fen, 'type': t}
