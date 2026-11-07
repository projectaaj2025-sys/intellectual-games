const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function section(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)}
const source=section('async function callOpenAI(', '/* Рабочие модели Gemini')+section('function aiCompletionError(', 'const GEMINI_FALLBACKS =');
const response=(data)=>({status:200,ok:true,json:async()=>data});
async function check(data,expected,retryable){const c=vm.createContext({fetch:async()=>response(data),t:k=>k});vm.runInContext(source,c);await assert.rejects(c.callOpenAI({apiKey:'test'},'prompt'),e=>e.message===expected && e.aiRetryable===retryable)}
(async()=>{await check({choices:[{finish_reason:'length',message:{content:'partial'}}]},'ai.truncated',true);await check({choices:[{finish_reason:'content_filter'}]},'ai.blocked',false);await check({choices:[{message:{content:''}}]},'ai.emptyResponse',true);const c=vm.createContext({fetch:async()=>response({choices:[{finish_reason:'stop',message:{content:'{"title":"ok"}'}}]}),t:k=>k});vm.runInContext(source,c);assert.equal(await c.callOpenAI({apiKey:'test'},'prompt'),'{"title":"ok"}');console.log('OpenAI truncation, filtering, empty and valid responses: OK')})().catch(e=>{console.error(e);process.exitCode=1});
