// Run with: node tests/chgk-timer.test.js. No browser or network required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const slice = (start, end) => {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  assert(a >= 0 && b > a, start); return html.slice(a, b);
};
const configCode = slice('function chgkTimerConfig(raw)', '/* Приведение любой игры');
const clockCode = slice('  function chgkClockHtml(isBlitz)', '  function chgkReveal()');
let now = 0, interval = null, alerts = 0, ticks = 0;
const nodes = {};
for (const name of ['chgkNum','chgkArc','chgkClock','chgkClockPanel','chgkClockStatus','chgkClockStart','chgkClockReset','chgkClockToggle']) {
  nodes['#'+name] = {textContent:'',disabled:false,attrs:{},events:{},classes:{},
    setAttribute(k,v){this.attrs[k]=v}, addEventListener(k,f){this.events[k]=f},
    classList:{toggle(){}}, click(){if(!this.disabled && this.events.click)this.events.click()}};
}
const state = {timer:null,clockEnabled:true,clockState:'ready',clockTotal:60,clockRemainingMs:60000};
const ctx = vm.createContext({CHGK:state, $:name=>nodes[name]||null, Date:{now:()=>now},
  setInterval:fn=>{interval=fn;return 1}, clearInterval:()=>{interval=null},
  AudioKit:{tick:()=>ticks++,timeUp:()=>alerts++}, t:x=>x, esc:x=>x});
vm.runInContext(configCode+clockCode,ctx);
const plain = x => JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(ctx.chgkTimerConfig()), {enabled:true,standard:60,blitz:20});
assert.deepEqual(plain(ctx.chgkTimerConfig({enabled:false,standard:40,blitz:10})), {enabled:false,standard:40,blitz:10});
assert.deepEqual(plain(ctx.chgkTimerConfig({enabled:false,standard:0,blitz:999})), {enabled:false,standard:60,blitz:20});
ctx.chgkPrepareClock(5);
assert.equal(nodes['#chgkNum'].textContent,'0:05'); assert.equal(state.clockState,'ready'); assert.equal(interval,null);
nodes['#chgkClockStart'].click(); assert.equal(state.clockState,'running');
now+=1200;interval();assert.equal(nodes['#chgkNum'].textContent,'0:04');
nodes['#chgkClockStart'].click(); assert.equal(state.clockState,'paused'); const remaining=state.clockRemainingMs;
now+=5000;assert.equal(state.clockRemainingMs,remaining);
nodes['#chgkClockStart'].click();now+=remaining;interval();
assert.equal(state.clockState,'expired');assert.equal(alerts,1);assert.equal(interval,null);assert.equal(nodes['#chgkClockStatus'].textContent,'show.clockExpired');
assert.equal(nodes['#chgkClockStart'].disabled,true);
nodes['#chgkClockReset'].click();assert.equal(nodes['#chgkNum'].textContent,'0:05');assert.equal(state.clockState,'ready');
nodes['#chgkClockToggle'].click();assert.equal(state.clockEnabled,false);assert.equal(nodes['#chgkClockStart'].disabled,true);
nodes['#chgkClockToggle'].click();nodes['#chgkClockStart'].click();assert.equal(state.clockState,'running');
ctx.chgkLockClock();assert.equal(state.clockState,'locked');assert.equal(interval,null);assert.equal(nodes['#chgkClockReset'].disabled,true);
assert(ticks > 0);
console.log('CHGK timer defaults, persistence config, start, pause, resume, expiry, reset, toggle and locking: OK');
