// IndexedDB and FileReader stubs exercise persistence and portable JSON without network.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const from=html.indexOf('const VideoStore = (()=>{'),to=html.indexOf('function videoHtml(',from);assert(from>0&&to>from);
const records=new Map();let count=0;
const db={transaction(){let transaction={objectStore(){return {
 put(value,key){const req={};setImmediate(()=>{records.set(key,value);req.onsuccess?.();transaction.oncomplete()});return req},
 get(key){const req={};setImmediate(()=>{req.result=records.get(key);req.onsuccess?.();transaction.oncomplete()});return req},
 clear(){const req={};setImmediate(()=>{records.clear();req.onsuccess?.();transaction.oncomplete()});return req}
 }} };return transaction;}};
class Reader{async readAsDataURL(blob){this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onload()}}
const ctx=vm.createContext({Blob,Uint8Array,FileReader:Reader,crypto:{randomUUID:()=>`id-${++count}`},t:s=>s,URL:{createObjectURL:()=>`blob:test-${count}`,revokeObjectURL:()=>{}},fetch, indexedDB:{open(){const r={};setImmediate(()=>{r.result=db;r.onsuccess()});return r}}});
vm.runInContext(html.slice(from,to)+'globalThis.store=VideoStore;',ctx);const store=ctx.store;
(async()=>{
 const clip=new Blob([new Uint8Array([0,0,0,20,102,116,121,112,105,115,111,109,1,2,3,4])],{type:'video/mp4'});
 const id=await store.put(clip);assert.equal(id,'video:id-1');assert.equal((await store.blob(id)).size,16);assert.match(await store.src(id),/^blob:/);
 const g={rounds:[{categories:[{questions:[{video:id}]}]}],showItems:[{blitz:[{video:id}]}]};
 const portable=await store.portable(g);assert.match(portable.rounds[0].categories[0].questions[0].video,/^data:video\/mp4;base64,/);assert.equal(g.rounds[0].categories[0].questions[0].video,id);
 const imported=await store.importPortable(JSON.parse(JSON.stringify(portable)));const importedId=imported.showItems[0].blitz[0].video;assert.match(importedId,/^video:/);assert.equal((await store.blob(importedId)).size,16);
 await assert.rejects(()=>store.put(new Blob(['bad'],{type:'video/mp4'})),/video.invalid/);await assert.rejects(()=>store.put(new Blob(['x'],{type:'text/plain'})),/video.invalid/);
 await assert.rejects(()=>store.blob('video:missing'),/missing video/);await store.clearAll();await assert.rejects(()=>store.blob(id),/missing video/);
 for(const fragment of ['data-upload-video','data-native-video','data-native-big-video','videoHtml(q.video)','VideoStore.portable','VideoStore.importPortable',"type:'video',data:video,extn:'mp4'",'if(videos.has(it.video))'])assert(html.includes(fragment),fragment);
 console.log('Video storage, validation, portable JSON, nested questions and PPTX hooks: OK');
})().catch(e=>{console.error(e);process.exit(1)});
