// No browser dependencies: verify home controls route to the correct catalog and builder.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
for(const kind of ['svoya','million','chgk','hundred']) {
 assert(html.includes('data-format-catalog="'+kind+'"'));
 assert(html.includes('data-format-create="'+kind+'"'));
}
const source=html.slice(html.indexOf("/* привязка карточек форматов"),html.indexOf("document.addEventListener('DOMContentLoaded', boot)"));
function element(dataset={}) {return {dataset,handlers:{},addEventListener(k,f){this.handlers[k]=f},classList:{toggle(){}}}}
const catalog=['svoya','hundred','million','chgk'].map(kind=>element({formatCatalog:kind}));
const create=['svoya','hundred','million','chgk'].map(kind=>element({formatCreate:kind}));
const cards=[element({format:'chgk'})],tabs=[element({tab:'all'}),element({tab:'custom'})];
const els={'#libFormat':{value:''},'#libSearch':{value:'test'},'#libGrade':{value:'9'},'#libQuarter':{value:'3'}};
let boot,view='',selected='';const context=vm.createContext({document:{addEventListener:(type,fn)=>{if(type==='DOMContentLoaded')boot=fn}},$:s=>els[s],$$:s=>({'[data-format-catalog]':catalog,'[data-format-create]':create,'[data-format]':cards,'#libTabs button':tabs}[s]||[]),S:{libraryTab:'custom'},setView:s=>{view=s},selectBuilderFormat:s=>{selected=s}});
vm.runInContext(source,context);boot();
for(let i=0;i<catalog.length;i++) {catalog[i].handlers.click();assert.equal(view,'library');assert.equal(els['#libFormat'].value,catalog[i].dataset.formatCatalog);assert.equal(els['#libSearch'].value,'');assert.equal(context.S.libraryTab,'all');create[i].handlers.click();assert.equal(view,'builder');assert.equal(selected,create[i].dataset.formatCreate);}
let prevented=false;cards[0].handlers.keydown({key:'Enter',preventDefault:()=>prevented=true});assert(prevented);assert.equal(view,'library');assert.equal(els['#libFormat'].value,'chgk');
const preset=html.slice(html.indexOf('function renderPresets()'),html.indexOf('function libGameCard('));assert(preset.includes('concat(SHOW_DEMOS)'));
const wheel=html.slice(html.indexOf('function chgkWheelSvg()'),html.indexOf('function chgkRenderWheel()'));assert(wheel.includes('i < 13'));assert(wheel.includes('<rect x="201"'));assert(html.includes(':root[data-theme="light"] .show-screen .chgk-card .q-text'));
console.log('Home format catalog/builders, demo cards, wheel and contrast safeguards: OK');
