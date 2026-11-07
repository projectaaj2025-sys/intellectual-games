// No network: ensure all formats expose local media, theme, and export hooks.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const h = fs.readFileSync('index.html','utf8');
for (const fragment of ['data-upload-image', 'data-native-photo', 'data-remove-native-photo', 'readUserPicture', 'compactAiPicture']) assert(h.includes(fragment), fragment);
for (const fragment of ['data-show-music', 'data-show-theme', 'id="gMusic"', 'id="gTheme"', "Music.start('svoya')", "Music.start('million')", "Music.start('chgk')", "Music.start('hundred')"]) assert(h.includes(fragment), fragment);
for (const format of ['svoya','million','hundred','chgk']) assert(new RegExp(format+":'https://zvukipro.com/").test(h), format);
assert(h.includes("opts.audioFile = Music.fileFor(showKind || 'svoya')"));
assert(h.includes("pptxKindRef = showKind || game.showFormat || null"));
assert(h.includes('photo: it.photo ||'));
const scaleLine=h.match(/^const questionTextScale = .*;$/m);assert(scaleLine);
const ctx=vm.createContext({});vm.runInContext(scaleLine[0]+' globalThis.scale=questionTextScale;',ctx);
assert.equal(ctx.scale('short'),1);assert(ctx.scale('long text '.repeat(100))<1);assert(ctx.scale('X'.repeat(100000))>=.38);
assert(h.includes('data-native-big-photo'));
assert(h.includes(':root[data-theme="light"] .show-screen .chgk-card .q-text'));
assert(h.includes('id="pptxAudio"') && h.includes("sTitle.addMedia({type:'audio'"));
console.log('Local image and audio hooks, play-mode themes and show export routing: OK');
