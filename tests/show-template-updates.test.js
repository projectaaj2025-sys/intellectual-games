// Structural and AI-quality checks; no network or credentials.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const start=html.indexOf('function aiHundredShort('),end=html.indexOf('function aiInvalid(',start);
const ctx=vm.createContext({});vm.runInContext(html.slice(start,end),ctx);
const item=text=>({answers:Array.from({length:6},()=>({text}))});
assert(ctx.aiHundredShort(item('Квашеная капуста')));
assert(!ctx.aiHundredShort(item('Человек обычно любит гулять по городу вечером')));
assert(!ctx.aiHundredShort(item('Это длинное предложение.')));
assert(!ctx.aiHundredShort(item('Мороженое, которое люди едят потому что оно вкусное')));
assert(html.includes("idx > MI.safeIndex ? LADDER[MI.safeIndex] : 0"));
assert(html.includes("LADDER.slice(0, -1)"));
assert(html.includes("const seconds = player ? 20 : 15"));
assert(html.includes("a.toLocaleLowerCase() === big.players[0][i].answer.toLocaleLowerCase()"));
for (const file of ['million-studio.png','chgk-wheel.jpg','chgk-question.jpg','chgk-score.jpg','chgk-box.jpg','chgk-owl.jpg','hundred-board.jpg']) assert(fs.existsSync('assets/shows/'+file),file);
console.log('Short AI survey responses, chosen safety rung, final timer and source assets: OK');
