// Deterministic coverage of every random interval, pointer angle and exhaustion.
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('  function chgkSpin() {'), end=html.indexOf('  /** Открыть выпавший сектор',start);
assert(start>=0&&end>start);
let random=0, callback, finished, opened;
const btn={disabled:false}, clock={disabled:false}, wheel={style:{},offsetWidth:0};
const sectors=Array.from({length:13},(_,i)=>({n:i+1}));
const ctx=vm.createContext({
 CHGK:{sectors,used:new Set(),active:true,spinTimer:null},
 Math:Object.assign(Object.create(Math),{random:()=>random}),
 $:s=>({'#chgkSpin':btn,'#chgkWheelTimer':clock,'#wheelRot':wheel,'#chgkRoot':{}}[s]),
 AudioKit:{roundStart(){}}, setTimeout:fn=>(callback=fn,1),
 chgkOpenSector:()=>{opened=ctx.CHGK.sector.n}, chgkFinish:()=>{finished=true}
});
vm.runInContext(html.slice(start,end),ctx);
for(const used of [[],[1,4,7,12]]) {
 const available=sectors.filter(s=>!used.includes(s.n));
 for(let i=0;i<available.length;i++){
  btn.disabled=false;clock.disabled=false;ctx.CHGK.used=new Set(used);random=(i+.5)/available.length;ctx.chgkSpin();
  assert(clock.disabled);const angle=parseFloat(wheel.style.transform.match(/[\d.]+/)[0]);
  let target=(angle+(available[i].n-.5)*360/13)%360;
  assert(Math.min(target,360-target)<1e-8);callback();assert.equal(opened,available[i].n);
 }
}
ctx.CHGK.used=new Set(sectors.map(s=>s.n));btn.disabled=false;ctx.chgkSpin();assert(finished);assert(!btn.disabled);
// All palette text and accent colours contrast against their actual panels.
const themes=html.slice(html.indexOf('const PPTX_THEMES = '),html.indexOf('let pptxThemeKey'));
const themeCtx=vm.createContext({});vm.runInContext(themes+'globalThis.themes=PPTX_THEMES;',themeCtx);
function luminance(hex){const c=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const [name,{c}] of Object.entries(themeCtx.themes))for(const [fg,bg] of [[c.ink,c.panel],[c.ink,c.tile],[c.gold,c.panel],[c.ink,c.bg2]])assert(ratio(fg,bg)>=4.5,`${name}: ${fg}/${bg} = ${ratio(fg,bg)}`);
assert(html.includes("rect(board,2.87,y,7.58,.57,open?panel:PPTX_COLORS.tile"));
console.log('All wheel sectors, pointer alignment, no repeats/exhaustion and theme contrast: OK');
