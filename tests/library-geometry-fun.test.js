// Run without a browser: node tests/library-geometry-fun.test.js
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('const FUN_MIXED_ROWS ='),html.indexOf('function allGames() {'));
const geometry=html.slice(html.indexOf('function isGeometryGame('),html.indexOf('function gameSubjectLabel('));
const match=html.match(/^const PLAN_GAMES = (.*);$/m);assert(match);
const games=JSON.parse(match[1]);const ctx=vm.createContext({});
vm.runInContext(source+'\n'+geometry+'\nthis.fun=FUN_MIXED_GAME;',ctx);
const fun=ctx.fun;assert.equal(fun.id,'fun-mixed-random-topics');assert(fun.builtin&&fun.tags.includes('fun'));
assert.equal(fun.rounds.length,2);let total=0;const types=new Set(), questions=new Set();
for(const r of fun.rounds){assert.equal(r.categories.length,5);for(const c of r.categories){assert.equal(c.questions.length,5);for(const lang of ['ru','kk','en'])assert(c.name[lang]);for(const q of c.questions){total++;types.add(q.type);for(const lang of ['ru','kk','en'])assert(q.q[lang]&&q.a[lang]);assert(!questions.has(q.q.ru));questions.add(q.q.ru)}}}
assert.equal(total,50);assert(types.has('cat')&&types.has('auction'));for(const lang of ['ru','kk','en'])for(const key of ['theme','q','a'])assert(fun.final[key][lang]);
const planGeometry=games.filter(g=>ctx.isGeometryGame(g));assert.equal(planGeometry.length,16);assert(planGeometry.every(g=>g.subject==='math'&&g.id.startsWith('plan-geo-')));
assert(ctx.isGeometryGame({subject:'geometry',tags:[]}));assert(!ctx.isGeometryGame({subject:'math',tags:['math','combo']}));
assert(html.includes("g.subject === 'math' && !isGeometryGame(g)"));assert(html.includes("S.libraryTab === 'geometry'"));
for(const lang of ['Геометрия','Geometry'])assert(html.includes("'lib.tabGeometry': '"+lang+"'"));
console.log('Geometry classification and complete multilingual fun game: OK');
