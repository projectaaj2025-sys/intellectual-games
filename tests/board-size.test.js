// node tests/board-size.test.js: size changes only the current round and protect data.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const section=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)};
const S={builder:{tab:'1',rounds:{1:[],2:[]}}};const ctx=vm.createContext({S,renderBuilder:()=>{},blankQuestion:()=>({q:'',a:'',type:'normal'})});
vm.runInContext(section('function resizeRound(', 'function collectBuilder()'),ctx);
const original=[{name:'Тема 1',questions:[{q:'one',a:'a',type:'normal'},{q:'two',a:'b',type:'normal'}]},{name:'Тема 2',questions:[{q:'three',a:'c',fact:'fact',type:'bonus'}]}];
assert.equal(ctx.resizeWouldLoseContent(original,1,2),true);assert.equal(ctx.resizeWouldLoseContent(original,2,1),true);assert.equal(ctx.resizeWouldLoseContent(original,3,3),false);
S.builder.rounds[1]=original;S.builder.rounds[2]=[{name:'another',questions:[{q:'keep'}]}];
ctx.applyBoardSize(3,3);assert.equal(S.builder.rounds[1].length,3);assert.equal(S.builder.rounds[1][0].questions.length,3);assert.equal(S.builder.rounds[1][1].questions[0].fact,'fact');assert.equal(S.builder.rounds[2][0].questions[0].q,'keep');
console.log('Board resize, data-loss detection and per-round independence: OK');
