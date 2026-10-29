/* Above the Sky diagnostics: installed before the game script, no dependencies. */
(function(){
'use strict';
const events=[],frames=[],maxEvents=80;let results=[],lastReport='',timer=0,running=false;
function short(x){try{return String(x??'').slice(0,700)}catch(_){return '[unprintable]'}}
function log(kind,message){events.push({time:new Date().toISOString(),kind,message:short(message)});if(events.length>maxEvents)events.shift();badge()}
function $(id){return document.getElementById(id)}
function badge(){const b=$('diagnostics-badge');if(b){let n=events.filter(e=>e.kind==='ERROR').length;b.textContent=n?'('+n+')':''}}
window.addEventListener('error',function(e){if(e.error||e.message)log('ERROR',(e.message||'Script error')+(e.filename?' · '+e.filename.split('/').pop()+':'+e.lineno:''));else if(e.target&&e.target!==window)log('ERROR','Resource failed: '+(e.target.currentSrc||e.target.src||e.target.href||e.target.tagName||'unknown'))},true);
window.addEventListener('unhandledrejection',function(e){log('ERROR','Unhandled promise: '+short(e.reason&&e.reason.message||e.reason))});
function frame(t){if(typeof t!=='number')return;if(frames.length&&t-frames[frames.length-1]>2000)frames.length=0;frames.push(t);if(frames.length>121)frames.shift()}
function fps(){if(frames.length<3)return 'collecting';let ms=frames[frames.length-1]-frames[0];return ms>0?(1000*(frames.length-1)/ms).toFixed(1)+' FPS (recent)':'collecting'}
function add(status,name,detail){results.push({status,name,detail:short(detail)})}
function check(name,fn){try{let value=fn();if(value===true)add('PASS',name,'');else if(typeof value==='string')add('WARN',name,value);else if(value===false)add('FAIL',name,'Check returned false');else add('PASS',name,value||'')}catch(e){add('FAIL',name,e&&e.message||e);log('ERROR','Check '+name+': '+(e&&e.message||e))}}
function runtime(){
check('Game bootstrap',()=>typeof tick==='function'&&typeof render==='function'&&typeof s==='object');
if(typeof s!=='object'||typeof route!=='function'){add('WARN','Remaining runtime checks','Game did not start; inspect the error log and HTML integrity.');return}
check('Save storage',()=>{let k='above-sky-diagnostic-probe',before=localStorage.getItem(k);try{localStorage.setItem(k,'ok');if(localStorage.getItem(k)!=='ok')throw Error('Readback mismatch')}finally{if(before===null)localStorage.removeItem(k);else localStorage.setItem(k,before)}return true});
check('Saved state format',()=>{let raw=localStorage.getItem('above-sky-save');if(!raw)return 'No save exists yet';let o=JSON.parse(raw);return o.version===1?true:'Unknown save version '+o.version});
check('Crew and selected character',()=>Array.isArray(crew)&&crew.length===9&&Array.isArray(s.people)&&s.people.length===crew.length&&Number.isInteger(s.player)&&s.player>=0&&s.player<crew.length);
check('Position and deck',()=>Number.isFinite(s.x)&&Number.isFinite(s.y)&&!!points[s.deck]&&allowed(s.x,s.y,s.deck));
check('Survival values',()=>['hp','food','water'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100));
check('Ship and target numbers',()=>[s.ship.x,s.ship.y,s.ship.vx,s.ship.vy,s.ship.a,s.target.x,s.target.y,s.target.a].every(Number.isFinite));
check('Mission state',()=>s.delivered&&!s.unlocked?'Delivered flag without unlocked salvage':s.unlocked&&!s.note?'Locker unlocked without note (possible manual code entry)':true);
check('Station definitions',()=>{let bad=[];for(let [deck,list] of Object.entries(points)){let ids=new Set();for(let p of list){if(ids.has(p.id)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!allowed(p.x,p.y,deck))bad.push(deck+':'+p.id);ids.add(p.id)}}if(bad.length)throw Error(bad.join(', '));return Object.values(points).reduce((n,a)=>n+a.length,0)+' stations in bounds'});
check('Deck portal endpoints',()=>{let count=0;for(let [deck,links] of Object.entries(portals))for(let [dest,p] of Object.entries(links)){count++;if(!allowed(p.from[0],p.from[1],deck)||!allowed(p.to[0],p.to[1],dest))throw Error(deck+' → '+dest)}return count+' portal endpoints checked'});
check('Crew route destinations',()=>{let count=0;for(let group of jobs)for(let j of group){count++;if(!allowed(j.x,j.y,j.deck))throw Error(j.deck+' '+j.task)}return count+' scheduled destinations checked'});
check('Navigation connectivity',()=>{let origins={upper:[150,300],lower:[110,300],catwalk:[405,300]},count=0;for(let [deck,o] of Object.entries(origins))for(let p of points[deck]){count++;if(!route(deck,o[0],o[1],p.x,p.y).length)throw Error(deck+': '+p.name)}return count+' station routes checked'});
check('Deck illustrations loaded',()=>upperArt.complete&&upperArt.naturalWidth>0&&lowerArt.complete&&lowerArt.naturalWidth>0?true:'One or both deck images are not loaded (or are still loading)');
}
async function getFile(path){let controller=typeof AbortController==='function'?new AbortController():null,t=controller?setTimeout(()=>controller.abort(),8000):0;try{let r=await fetch(path,{cache:'no-store',signal:controller?controller.signal:undefined});if(!r.ok)throw Error('HTTP '+r.status);return new Uint8Array(await r.arrayBuffer())}finally{if(t)clearTimeout(t)}}
function hex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
async function integrity(){
if(location.protocol==='file:'){add('WARN','File integrity','Direct file opening often blocks browser file reads. Use a local web server or GitHub Pages to verify hashes. Image load checks still run.');return}
if(typeof fetch!=='function'){add('WARN','File integrity','This browser does not support fetch.');return}
let manifest;try{manifest=JSON.parse(new TextDecoder().decode(await getFile('integrity.json')))}catch(e){add('FAIL','Integrity manifest','Cannot read integrity.json: '+short(e.message||e));return}
if(!manifest||manifest.version!==1||!Array.isArray(manifest.files)){add('FAIL','Integrity manifest','Invalid or unsupported manifest');return}
let names=new Set(manifest.files.map(f=>f.path));for(let node of document.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src]')){let dep=node.getAttribute('src')||node.getAttribute('href');if(dep&&!/^(?:[a-z]+:|\/\/|\/|data:|#)/i.test(dep)){dep=dep.split(/[?#]/)[0].replace(/^\.\//,'');if(!names.has(dep))add('WARN','Untracked dependency',dep+' is referenced by the page but absent from the manifest')}}for(let needed of ['index.html','diagnostics.js','upper.png','lower.png'])if(!names.has(needed))add('FAIL','Manifest coverage',needed+' is missing from the manifest');
for(let f of manifest.files){if(!f||typeof f.path!=='string'||!/^[a-zA-Z0-9_.-]+$/.test(f.path)||!Number.isSafeInteger(f.bytes)||!/^[a-f0-9]{64}$/.test(f.sha256)){add('FAIL','Manifest entry','Invalid entry');continue}try{let bytes=await getFile(f.path);let sizeOK=bytes.length===f.bytes;if(!sizeOK)add('FAIL',f.path,'Size mismatch: expected '+f.bytes+', got '+bytes.length);if(f.path==='index.html'){let text=new TextDecoder().decode(bytes);let lower=text.toLowerCase(),i=lower.lastIndexOf('</html>');if(!/^\s*<!doctype html>/i.test(text)||i<0)add('FAIL','HTML boundaries','Missing doctype or closing </html>');else if(text.slice(i+7).trim())add('WARN','HTML trailing content','Non-whitespace follows </html>; check for accidental paste');else add('PASS','HTML boundaries','Doctype, closing tag and trailing content checked')}
if(!globalThis.crypto||!crypto.subtle){add('WARN',f.path,'Size matches; SHA-256 unavailable in this browser/context');continue}let digest=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));if(digest!==f.sha256)add('FAIL',f.path,'SHA-256 differs from the release manifest');else if(sizeOK)add('PASS',f.path,'Size and SHA-256 match')
}catch(e){add('FAIL',f.path,'Cannot read file: '+short(e.message||e))}}
add('WARN','Trust boundary','Hashes detect differences from the bundled manifest; they do not prove authenticity if the manifest is also changed.');
}
function telemetry(){let text='FPS: '+fps()+' · Logged errors: '+events.filter(e=>e.kind==='ERROR').length;try{if(typeof s==='object'){text+=' · '+s.mode+' / '+s.deck+' · '+crew[s.player][0]+' · speed '+Math.hypot(s.ship.vx,s.ship.vy).toFixed(1)+' · save v'+s.version}}catch(_){text+=' · game state unavailable'}return text}
function report(){return ['ABOVE THE SKY · HEALTH & DEBUG',new Date().toISOString(),telemetry(),'','CHECK RESULTS',...(results.length?results.map(r=>r.status+' | '+r.name+(r.detail?' | '+r.detail:'')):['Not run']), '', 'RECENT ERRORS / EVENTS',...(events.length?events.map(e=>e.time+' | '+e.kind+' | '+e.message):['No errors recorded in this session.']), '', 'Integrity compares against a bundled manifest, not a cryptographic signature.'].join('\n')}
function render(){let t=$('diagnostics-telemetry'),r=$('diagnostics-results');if(t)t.textContent=telemetry();if(r)r.textContent=results.length?results.map(x=>x.status+'  '+x.name+(x.detail?' — '+x.detail:'')).join('\n'):'Choose RUN ALL CHECKS. Runtime errors are recorded from page load.';badge()}
async function run(){if(running)return;running=true;results=[];add('INFO','Scope','Non-destructive checks; does not alter mission or run combat/visual tests.');render();try{runtime();await integrity()}catch(e){add('FAIL','Diagnostics',e.message||e);log('ERROR','Diagnostics: '+(e.message||e))}finally{running=false;lastReport=report();render()}}
function open(){let p=$('diagnostics-panel');if(!p)return;p.hidden=false;render();if(!timer)timer=setInterval(render,1000)}
function close(){let p=$('diagnostics-panel');if(p)p.hidden=true;if(timer){clearInterval(timer);timer=0}}
async function copy(){lastReport=report();let area=$('diagnostics-report');if(area){area.hidden=false;area.value=lastReport;area.focus();area.select()}try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(lastReport);log('INFO','Report copied to clipboard.')}catch(_){log('INFO','Select and copy the report text shown below.')}render()}
function bind(){let op=$('diagnostics-open'),cl=$('diagnostics-close'),runBtn=$('diagnostics-run'),copyBtn=$('diagnostics-copy'),clearBtn=$('diagnostics-clear');if(op)op.onclick=open;if(cl)cl.onclick=close;if(runBtn)runBtn.onclick=run;if(copyBtn)copyBtn.onclick=copy;if(clearBtn)clearBtn.onclick=()=>{events.length=0;badge();render()};badge()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.ASD={frame,run,report,open,log,getResults:()=>results.slice(),getEvents:()=>events.slice()};
})();
