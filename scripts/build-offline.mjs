import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else if(!path.endsWith('/sw.js')&&!path.endsWith('.map'))files.push(path);}}
await walk('out');
const hash=createHash('sha256');for(const path of files.toSorted())hash.update(await readFile(path));
const version=hash.digest('hex').slice(0,16);
const assets=files.map(path=>'/'+path.slice(4));assets.push('/');
const sw=`// Generated from the complete static export. External services are never cached.
const CACHE='spain-journal-${version}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('spain-journal-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  // This is a single-route app; hashes select the four views.
  if(url.pathname==='/'||url.pathname==='/index.html')event.respondWith(caches.match('/').then(hit=>hit||fetch(event.request)));
  return;
 }
 if(ASSETS.includes(url.pathname))event.respondWith(caches.match(url.pathname).then(hit=>hit||fetch(event.request)));
});
`;
await writeFile('out/sw.js',sw);
console.log(`Offline shell: ${assets.length} resources, version ${version}`);
