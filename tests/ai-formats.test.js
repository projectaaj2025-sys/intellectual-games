// Run with node tests/ai-formats.test.js; uses no network or API key.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
function section(start, end) { const a=html.indexOf(start), b=html.indexOf(end,a); assert(a>=0 && b>a); return html.slice(a,b); }
const source = [
  section('function aiCompletionError(', 'const GEMINI_FALLBACKS ='),section('const HUMOR_LEVELS =', 'function extractJson('),section('function chgkTimerConfig(', '/* tx()'),section('function nativeValid(', 'function launchNativeGame('),section('function normalizeAiResponse(', 'function renderAiPreview(')].join('\n');
const ctx=vm.createContext({S:{lang:'ru'},clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),t:k=>k,uid:()=> 'id',NATIVE_DEFAULTS:{million:15,chgk:13,hundred:6}}); vm.runInContext(source,ctx);
const cfg={format:'million',subject:'other',grade:7,quarter:1,topic:'Кино',sections:[],humor:2,media:false};
const million=Array.from({length:15},(_,i)=>({q:'Q'+i,options:['a','b','c','d'],correct:1}));
const chgk=Array.from({length:13},(_,i)=>({kind:'normal',q:'Q'+i,a:'A',fact:'logic',blitz:[]}));
const hundred=Array.from({length:6},(_,i)=>({q:'Q'+i,answers:[30,22,16,12,10,8].map((points,j)=>({text:'A'+j,points}))}));
for(const [kind,items] of [['million',million],['chgk',chgk],['hundred',hundred]]) {
 const game=ctx.gameFromAiJson({title:'Game',showItems:items},{...cfg,format:kind});
 assert.equal(game.showFormat,kind); assert.equal(game.showItems.length,items.length); assert.equal(game.subject,'other'); assert.equal(game.quarter,0);
 assert.throws(()=>ctx.gameFromAiJson({title:'Game',showItems:items.slice(1)},{...cfg,format:kind}),/ai.invalidResponse/);
 if(kind==='hundred') assert.match(game.desc,/ai.surveyWarning/);
 const prompt=ctx.buildAiPrompt({...cfg,format:kind}); assert.match(prompt,/Кино/); assert.match(prompt,/showItems/); assert.match(prompt,/без привязки/);
}
assert.throws(()=>ctx.gameFromAiJson({title:'Game',showItems:million.map(x=>({...x,correct:4}))},cfg),/ai.invalidResponse/);
const rounds=Array.from({length:2},()=>({categories:Array.from({length:5},()=>({name:'Cat',questions:Array.from({length:5},()=>({q:'Q',a:'A',type:'normal',fact:'F'}))}))}));
const board={title:'Game',rounds,final:{theme:'Theme',q:'Q',a:'A'}};
assert.equal(ctx.gameFromAiJson(board,{...cfg,format:'svoya'}).rounds[0].categories[0].questions[0].fact,'F');
assert.throws(()=>ctx.gameFromAiJson({...board,rounds:rounds.slice(0,1)},{...cfg,format:'svoya'}),/ai.invalidResponse/);
const shortRounds=Array.from({length:2},()=>({categories:Array.from({length:3},()=>({name:'Cat',questions:Array.from({length:4},()=>({q:'Q',a:'A',type:'normal'}))}))}));
const small={...board,rounds:shortRounds};
assert.equal(ctx.gameFromAiJson(small,{...cfg,format:'svoya',cats:3,qs:4}).rounds[0].categories[0].questions.length,4);
assert.throws(()=>ctx.gameFromAiJson(small,{...cfg,format:'svoya',cats:4,qs:4}),/ai.invalidResponse/);
assert.match(ctx.buildAiPrompt({...cfg,format:'svoya',cats:3,qs:4}),/ровно 3 категорий, в каждой ровно 4 вопросов/);
for (const [level,phrase] of [['easy','базовая'],['medium','средняя'],['hard','продвинутая']]) for (const kind of ['svoya','million','chgk','hundred']) {
 const prompt=ctx.buildAiPrompt({...cfg,format:kind,difficulty:level,humor:5});
 assert(prompt.includes(phrase));assert(prompt.includes('комичные ситуации'));assert(prompt.includes('применение знаний'));assert(prompt.includes('Не раскрывай'));
}
console.log('AI prompts, all four formats, custom topics, validation and survey warning: OK');
