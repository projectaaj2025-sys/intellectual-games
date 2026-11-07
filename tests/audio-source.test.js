const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const audio=fs.readFileSync('assets/shows/audio/hundred-wrong.mp3');
assert(audio.length>10000);assert(audio.subarray(0,3).toString()==='ID3'||(audio[0]===0xff&&(audio[1]&0xe0)===0xe0));
assert(html.includes("new Audio('assets/shows/audio/hundred-wrong.mp3')"));
assert(html.includes('if (!S.settings.sound || !S.settings.sfx) return;'));
assert(html.includes("hundWrongSound(); HUND.strikes++"));
assert(html.includes('github.com/amstiel/100to1/blob/master/100to1/Resources/wrong.mp3'));
console.log('Local wrong-answer audio, sound settings and source attribution: OK');
