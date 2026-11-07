// Run without an API key: node tests/ai-generation.test.js
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function section(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)}
const source=[section('const HUMOR_LEVELS =','function aiLog('),section('function chgkTimerConfig(', '/* tx()'),section('function nativeValid(', 'function launchNativeGame('),section('function aiCompletionError(', 'const GEMINI_FALLBACKS ='),section('function normalizeAiResponse(', 'function renderAiPreview('),section('async function requestAiObject(', 'async function runAiGeneration(')].join('\n');
const cfg={provider:'gemini',format:'svoya',cats:5,qs:5,subject:'other',topic:'Кино',grade:7,quarter:1,sections:[],humor:2};
const originalText='текст , } и \\"фраза\\"';
function makeResponse(prompt, suffix) {
 const match=prompt.match(/ровно (\d+) различных категорий \(номера с (\d+) по/); assert(match,prompt);const n=Number(match[1]),start=Number(match[2]);
 const r=prompt.match(/часть раунда (\d+)/)[1];
 return JSON.stringify({title:'Кино',desc:'Описание',rounds:[{name:'Раунд '+r,categories:Array.from({length:n},(_,i)=>({name:'Категория '+r+'-'+(start+i)+suffix,questions:Array.from({length:5},(_,j)=>({q:'Вопрос '+j,a:'Ответ',type:'normal'}))}))}],final:{theme:'Тема',q:'Финал',a:'Ответ'}});
}
function sandbox(call){const context=vm.createContext({S:{lang:'ru'},clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),t:k=>k,uid:()=> 'id',NATIVE_DEFAULTS:{million:15,chgk:13,hundred:6},callGemini:call,callOpenAI:call,aiLog:()=>{}});vm.runInContext(source,context);return context}
(async()=>{
 const parser=sandbox(()=>{});
 assert.equal(parser.extractJson('```json\n{"text":"text , } and { value",}\n```').text,'text , } and { value');
 assert.equal(parser.extractJson('bad {"x": "truncated"'),null);
 assert.equal(parser.extractJson('prefix '+JSON.stringify({text:originalText})+' suffix').text,originalText);
 let calls=[];let ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);return makeResponse(prompt,'')});
 let game=await ctx.generateAiGame(cfg,new AbortController().signal);
 assert.equal(calls.length,4);assert.deepEqual(Array.from(game.rounds,r=>r.categories.length),[5,5]);assert.equal(game.rounds[0].categories[0].questions[0].a,'Ответ');
 calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);if(calls.length===1)return 'not json';return makeResponse(prompt,'');});
 game=await ctx.generateAiGame(cfg,new AbortController().signal);assert.equal(calls.length,5);assert.match(calls[1],/Предыдущий ответ/);assert.equal(game.rounds[1].categories.length,5);
 calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);const match=prompt.match(/ровно (\d+) различных категорий/);if(Number(match[1])>1){const e=new Error('truncated');e.aiRetryable=true;e.aiTruncated=true;throw e}return makeResponse(prompt,'');});
 game=await ctx.generateAiGame({...cfg,cats:3},new AbortController().signal);assert.equal(game.rounds[0].categories.length,3);assert.equal(calls.length,8);
 let requests=0;ctx=sandbox(async()=>{requests++;throw new Error('ai.errQuota')});await assert.rejects(ctx.generateAiGame(cfg,new AbortController().signal),/ai.errQuota/);assert.equal(requests,1);
 requests=0;const abort=new AbortController();ctx=sandbox(async(_cfg,prompt)=>{requests++;abort.abort();return makeResponse(prompt,'')});await assert.rejects(ctx.generateAiGame(cfg,abort.signal),e=>e.name==='AbortError');assert.equal(requests,1);
 requests=0;ctx=sandbox(async()=>{requests++;return '{"rounds":['});await assert.rejects(ctx.generateAiGame(cfg,new AbortController().signal),/ai.badJsonHelp/);assert.equal(requests,4);
 // Structural errors in larger requests recover via individual categories.
 calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);const n=Number(prompt.match(/ровно (\d+) различных категорий/)[1]);return n>1 ? JSON.stringify({rounds:[{categories:[]}]}) : makeResponse(prompt,'');});
 game=await ctx.generateAiGame({...cfg,cats:3},new AbortController().signal);assert.deepEqual(Array.from(game.rounds,r=>r.categories.length),[3,3]);assert.equal(calls.length,10);
 // Equivalent names and numeric answers are accepted without inventing content.
 const equivalent={categories:[{category:'Cat',questions:[{question:'How many?',answer:42,type:'normal'}]}]};
 let normalized=ctx.validateAiBatch(equivalent,1,1);assert.equal(normalized.rounds[0].categories[0].questions[0].a,'42');
 assert.throws(()=>ctx.validateAiBatch({categories:[{category:'Cat',questions:[{question:'Q'}]}]},1,1),/ai.badCell/);
 assert.throws(()=>ctx.validateAiBatch({categories:[]},1,1),/ai.badCategories/);
 // Missing metadata must not lose completed categories; missing finale is requested separately.
 calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);if(prompt.includes('Создай один оригинальный финальный вопрос'))return JSON.stringify({final:{category:'Финал',question:'Q',answer:'A'}});const obj=JSON.parse(makeResponse(prompt,''));delete obj.title;delete obj.final;return JSON.stringify(obj)});
 game=await ctx.generateAiGame({...cfg,cats:3,sourceText:'DOC_FINAL_SENTINEL'},new AbortController().signal);assert.equal(game.title,'Кино');assert.equal(game.final.theme,'Финал');assert.equal(calls.length,3);assert(calls.every(prompt=>prompt.includes('DOC_FINAL_SENTINEL')));
 // Incomplete finale never becomes a playable partial game.
 requests=0;ctx=sandbox(async(_cfg,prompt)=>{requests++;if(prompt.includes('Создай один оригинальный финальный вопрос'))return '{"final":{"theme":"F","q":"Q"}}';const obj=JSON.parse(makeResponse(prompt,''));delete obj.final;return JSON.stringify(obj)});
 await assert.rejects(ctx.generateAiGame({...cfg,cats:3},new AbortController().signal),/ai.badFinal/);assert.equal(requests,4);
 // Native shows are generated and validated in bounded chunks too.
 for (const [kind,total] of [['million',15],['chgk',13],['hundred',6]]) {
   calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);const m=prompt.match(/вопросы или секторы с номера (\d+) по (\d+)/);assert(m,prompt);const start=+m[1],count=+m[2]-start+1;
     const items=Array.from({length:count},(_,i)=>kind==='million'?{question:'Q'+(start+i),options:['A','B','C','D'],correct:'B'}:kind==='chgk'?{question:'Q'+(start+i),answer:'A'}:{question:'Q'+(start+i),answers:[30,22,16,12,10,8].map((points,j)=>({text:'A'+j,points}))});
     return JSON.stringify({title:'Game',items});});
   game=await ctx.generateAiGame({...cfg,format:kind},new AbortController().signal);assert.equal(game.showItems.length,total);assert.equal(calls.length,Math.ceil((total+(kind==='hundred'?5:0))/3));
   if(kind==='million')assert.equal(game.showItems[0].correct,1);if(kind==='chgk')assert.equal(game.showItems[0].kind,'normal');if(kind==='hundred'){assert.match(game.desc,/ai.surveyWarning/);assert.equal(game.bigItems.length,5);assert.notEqual(game.bigItems[0].q,game.showItems[0].q);}
 }
 // Native malformed chunks split, while quota errors and malformed single items stop.
 calls=[];ctx=sandbox(async(_cfg,prompt)=>{calls.push(prompt);const m=prompt.match(/вопросы или секторы с номера (\d+) по (\d+)/);const start=+m[1],count=+m[2]-start+1;return JSON.stringify({title:'Game',showItems:count>1?[]:[{q:'Q'+start,options:['A','B','C','D'],correct:'D'}]})});
 game=await ctx.generateAiGame({...cfg,format:'million'},new AbortController().signal);assert.equal(game.showItems.length,15);assert.equal(calls.length,25);
 requests=0;ctx=sandbox(async()=>{requests++;throw new Error('ai.errQuota')});await assert.rejects(ctx.generateAiGame({...cfg,format:'chgk'},new AbortController().signal),/ai.errQuota/);assert.equal(requests,1);
 assert.throws(()=>ctx.validateAiNativeBatch({showItems:[{q:'Q',options:['A','B','C','D'],correct:'4'}]},'million',1),/ai.badMillion/);
 assert.throws(()=>ctx.validateAiNativeBatch({showItems:[{q:'Q',answers:[30,30,30,30,30,30].map((points,i)=>({text:'A'+i,points}))}]},'hundred',1),/ai.badHundred/);
 assert.throws(()=>ctx.validateAiNativeBatch({showItems:[{q:'Q',answers:[30,22,16,12,10,null].map((points,i)=>({text:'A'+i,points}))}]},'hundred',1),/ai.badHundred/);
 console.log('AI JSON extraction, batches, retries, truncation, quota and cancellation: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
