// Mocked structural checks; real PPTX downloads are also checked separately in a browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('index.html','utf8');
const start=h.indexOf('  async function showPptx(kind, game, opts) {'),end=h.indexOf('  /* ========================================================================\n     ЧАСТЬ 4.',start);
assert(start>=0&&end>start);
class FakeSlide{constructor(){this.objects=[]} addShape(t,o){this.objects.push({t,o})} addText(t,o){this.objects.push({t,o})} addImage(o){this.objects.push({t:'image',o})} addMedia(o){this.objects.push({t:'audio',o})}}
class FakePptx{constructor(){this.ShapeType={rect:'rect'};this._slides=[];ctx.current=this}defineLayout(x){this.layoutDef=x}addSlide(){const s=new FakeSlide;this._slides.push(s);return s}async writeFile(o){this.name=o.fileName}}
class Reader{readAsDataURL(x){this.result=x.data;this.onload()}}
const ctx=vm.createContext({console,FileReader:Reader,fetch:async url=>({ok:true,blob:async()=>({data:url.endsWith('.gif')?'data:image/gif;base64,AAAA':'data:image/jpeg;base64,AAAA'})}),pptxLib:()=>FakePptx,pptxApplyTheme:()=>{},pptxIsLight:()=>false,PPTX_COLORS:{gold:'F2C45A'},gameTitle:g=>g.title,nativeFormatName:k=>k,t:k=>k,tx:x=>x||'',LADDER:Array.from({length:15},(_,i)=>i+1),fmt:String,slug:x=>x,hundBuild:g=>g.showItems.map(it=>({q:it.q,answers:it.answers.map(a=>a.text),points:it.answers.map(a=>a.points)})),buildMillionQuestions:g=>g.showItems.map(it=>({...it,a:it.options[it.correct]})),chgkTimerConfig:()=>({standard:60,blitz:20}),takeRandom:x=>x,flattenQuestions:()=>[]});
vm.runInContext(h.slice(start,end),ctx);
const options={layout:'16x9',theme:'midnight',name:'test'};
const items=Array.from({length:6},(_,i)=>({q:'Q'+i,answers:Array.from({length:6},(_,j)=>({text:'A'+j,points:6-j}))}));
const million={title:'M',showFormat:'million',showItems:Array.from({length:15},(_,i)=>({q:'M'+i,options:['A','B','C','D'],correct:1}))};
const sectors=Array.from({length:13},(_,i)=>({kind:'normal',q:'C'+i,a:'A'+i}));
sectors[1]={kind:'blackbox',q:'Black box?',a:'Object'};sectors[2]={kind:'blitz',blitz:[{q:'B1',a:'1'},{q:'B2',a:'2'},{q:'B3',a:'3'}]};
(async()=>{
 for(const [kind,game] of [['million',million],['chgk',{title:'C',showFormat:'chgk',showItems:sectors}],['hundred',{title:'H',showFormat:'hundred',showItems:items,bigItems:items.slice(0,5)}]]){
  const result=await ctx.showPptx(kind,game,options),slides=ctx.current._slides;assert.equal(result.slides,slides.length);assert(slides.length>game.showItems.length);
  for(const slide of slides)for(const obj of slide.objects){const link=obj.o&&obj.o.hyperlink;if(link){assert(Number.isInteger(link.slide));assert(link.slide>=1&&link.slide<=slides.length,`${kind}: ${link.slide}/${slides.length}`)}}
  if(kind==='chgk'){assert(slides.some(s=>s.objects.some(o=>o.t==='image'&&o.o.data.startsWith('data:image/gif'))));assert(slides.some(s=>s.objects.some(o=>o.t==='Black box?')));assert(slides.some(s=>s.objects.some(o=>o.t==='B3')))}
  if(kind==='million') assert(slides.some(s=>s.objects.some(o=>String(o.t).includes('B:'))));
  if(kind==='hundred')assert(slides.some(s=>s.objects.some(o=>o.t==='A0  —  6\nA1  —  5\nA2  —  4\nA3  —  3\nA4  —  2\nA5  —  1')));
 }
 console.log('PPTX show slides, navigation targets, blitz, answers and animated GIF: OK');
})().catch(e=>{console.error(e);process.exit(1)});
