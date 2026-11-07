// Mock image services: no API key or network required.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('async function aiPictureRequest('),html.indexOf('async function runAiGeneration()'));
function context(fetch){const logs=[];const c=vm.createContext({fetch,t:k=>k,aiLog:(s)=>logs.push(s),logs,AbortController});vm.runInContext(source,c);vm.runInContext("compactAiPicture = async src => src;",c);return c}
const game=()=>({rounds:[{categories:[{questions:[{q:'Q1',a:'secret answer',type:'normal'}]}]},{categories:[{questions:[{q:'Q2',a:'secret answer',type:'normal'}]}]}]});
(async()=>{
 let requests=[];let c=context(async(url,opts)=>{requests.push({url,opts});return {ok:true,json:async()=>({data:[{b64_json:'YWJj'}]})}});let g=game();
 await c.addAiPictures(g,{provider:'openai',apiKey:'test'},new AbortController().signal);assert.equal(requests.length,2);assert.equal(g.rounds[0].categories[0].questions[0].photo,'data:image/png;base64,YWJj');assert(!requests[0].opts.body.includes('secret answer'));assert(requests[0].opts.body.includes('Do not include text'));
 requests=[];c=context(async(url,opts)=>{requests.push({url,opts});return {ok:true,json:async()=>({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:'YWJj'}}]}}]})}});g=game();await c.addAiPictures(g,{provider:'gemini',apiKey:'test'},new AbortController().signal);assert.equal(requests.length,2);assert.match(requests[0].url,/gemini-2.5-flash-image/);assert.equal(g.rounds[1].categories[0].questions[0].photo,'data:image/png;base64,YWJj');
 requests=[];c=context(async(url,opts)=>{requests.push(url);return {ok:false,status:429}});g=game();await c.addAiPictures(g,{provider:'openai',apiKey:'secret'},new AbortController().signal);assert.equal(requests.length,1);assert(!g.rounds[0].categories[0].questions[0].photo);assert(c.logs.some(x=>x.includes('ai.imageFailed')));assert(!c.logs.join('').includes('secret'));
 c=context(async()=>({ok:true,json:async()=>({data:[{b64_json:'<script>'}]})}));await assert.rejects(c.aiPictureRequest({provider:'openai'},'Q',new AbortController().signal),/invalid image/);
 const abort=new AbortController();c=context(async()=>{abort.abort();const e=new Error('aborted');e.name='AbortError';throw e});await assert.rejects(c.addAiPictures(game(),{provider:'openai'},abort.signal),e=>e.name==='AbortError');
 console.log('Optional AI images: provider requests, limits, failures and cancellation OK');
})().catch(e=>{console.error(e);process.exit(1)});
