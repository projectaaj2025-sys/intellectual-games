// Check that types and colours cannot reveal special cells on the board.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function renderBoard() {'),html.indexOf('function renderTeams() {'));
const board={innerHTML:'',style:{}};
const cats=['normal','cat','auction','bonus','fail'].map((type,i)=>({name:'C'+i,questions:[{q:'Q',a:'A',type}]}));
const ctx=vm.createContext({$:(s)=>s==='#board'?board:null,$$:()=>[],currentRound:()=>({categories:cats}),roundValues:()=>[100],boardKey:(ci,qi)=>ci+':'+qi,G:{used:new Set()},t:()=>'',esc:s=>String(s)});
vm.runInContext(source,ctx);ctx.renderBoard();
assert.equal((board.innerHTML.match(/class="tile"/g)||[]).length,5);assert(!/special|auction|bonus|fail|cat-bag/i.test(board.innerHTML));
const pptx=html.slice(html.indexOf('/* --- 2. поля раундов --- */'),html.indexOf('/* --- 3. слайды вопросов и ответов --- */'));
assert(pptx.includes('pptxTile(slide, pptx, x, y, colW, tileH, val, PPTX_COLORS.gold, false)'));assert(!pptx.includes('q.type'));
console.log('Special questions are hidden on web and PPTX boards: OK');
