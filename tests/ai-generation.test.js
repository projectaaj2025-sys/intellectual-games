// Run without an API key: node tests/ai-generation.test.js
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function section(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)}
const source=[section('const HUMOR_LEVELS =','function aiLog('),section('function chgkTimerConfig(', '/* tx()'),section('function nativeValid(', 'function launchNativeGame('),section('function aiCompletionError(', 'const GEMINI_FALLBACKS ='),section('function gameFromAiJson(', 'function renderAiPreview('),section('async function requestAiObject(', 'async function runAiGeneration(')].join('\n');
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
 requests=0;ctx=sandbox(async()=>{requests++;return '{"rounds":['});await assert.rejects(ctx.generateAiGame(cfg,new AbortController().signal),/ai.badJsonHelp/);assert.equal(requests,2);
 console.log('AI JSON extraction, batches, retries, truncation, quota and cancellation: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
