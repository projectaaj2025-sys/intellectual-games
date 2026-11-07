// Regression coverage for returning to the catalogue after a game.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const start = html.indexOf('function renderLibrary()');
const end = html.indexOf('function findGame(', start);
assert(start >= 0 && end > start);
const els = Object.fromEntries(['libSearch','libFormat','libGrade','libQuarter'].map(id => ['#' + id, {value:''}]));
els['#libGrid'] = {innerHTML:''};
els['#libEmpty'] = {classList:{toggle(_name, value){this.hidden=value}}};
let view;
const games = [{builtin:true, id:'1', title:'Миллионер', showFormat:'million', subject:'Демо', grade:'9', quarter:'1'}, {builtin:true, id:'2',title:'Геометрия',subject:'Математика',grade:'8',quarter:'2'}];
const context = vm.createContext({
  S:{libraryTab:'all'}, $:sel=>els[sel], $$:()=>[], allGames:()=>games,
  t:s=>s, tx:v=>v, esc:s=>s, gameSubjectLabel:g=>g.subject, gameTitle:g=>g.title,
  libGameCard:g=>`[${g.id}]`, setView:s=>{view=s}
});
vm.runInContext(html.slice(start, end), context);
function render(){context.renderLibrary(); return (els['#libGrid'].innerHTML.match(/\[\d+\]/g) || []).sort().join('')}
assert.equal(render(), '[1][2]');
els['#libSearch'].value = 'миллионер'; els['#libFormat'].value = 'million';
assert.equal(render(), '[1]');
context.restoreLibraryAfterGame();
assert.equal(view, 'library'); assert.equal(els['#libSearch'].value, 'миллионер'); assert.equal(els['#libFormat'].value, 'million'); assert.equal(render(), '[1]');
els['#libSearch'].value = 'models/gemini-flash-lite-latest';
assert.equal(render(), '');
context.restoreLibraryAfterGame();
assert.equal(els['#libSearch'].value, ''); assert.equal(els['#libFormat'].value, ''); assert.equal(render(), '[1][2]');
context.S.libraryTab = 'custom'; els['#libGrade'].value='8'; els['#libQuarter'].value='2';
context.restoreLibraryAfterGame();
assert.equal(context.S.libraryTab,'all'); assert.equal(els['#libGrade'].value,''); assert.equal(els['#libQuarter'].value,''); assert.equal(render(), '[1][2]');
assert(html.includes('data-clear-library')); assert(html.includes('id="libSearch"') && /id="libSearch"[^>]*autocomplete="off"/.test(html));
assert(html.includes('restoreLibraryAfterGame();')); // Used by the game and show exit handlers.
assert(html.includes('hundred-board.jpg')); assert(html.includes('chgk-scene-wheel')); assert(html.includes('million-ans::before'));
console.log('Catalogue recovery, valid filters, reset control, and show presentation safeguards: OK');
