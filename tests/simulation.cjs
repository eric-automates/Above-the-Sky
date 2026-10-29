// Dependency-free logic regression tests: node tests/simulation.cjs
const fs=require('fs'),vm=require('vm'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const context2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),els={};
function el(s){return els[s]||=( {style:{},classList:{add(){},remove(){},toggle(){}},append(x){(this.children||=[]).push(x)},setAttribute(){},addEventListener(){},getContext(){return context2d},getBoundingClientRect(){return {width:1000,height:600,left:0,top:0}},setPointerCapture(){},innerHTML:'',textContent:''})}
const sandbox={sandboxEls:el,console,Math,Date,JSON,Image:class{constructor(){this.complete=true;this.naturalWidth=1000}},document:{querySelector:el,querySelectorAll(){return []},createElement:()=>el(Math.random())},window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},setTimeout(f){f()},clearTimeout(){},devicePixelRatio:1,confirm:()=>true};
vm.createContext(sandbox);vm.runInContext(code,sandbox);vm.runInContext(`
function assert(v,m){if(!v)throw Error(m)}
// Each scheduled destination must be in the same floor mask used by the renderer.
for(let group of jobs)for(let dest of group)assert(allowed(dest.x,dest.y,dest.deck),'invalid job '+JSON.stringify(dest));
for(let [deck,links] of Object.entries(portals))for(let [to,link] of Object.entries(links)){assert(allowed(...link.from,deck),'portal origin '+deck);assert(allowed(...link.to,to),'portal destination '+to)}
for(let deck of ['upper','lower','catwalk'])for(let p of points[deck]){assert(allowed(p.x,p.y,deck),'inaccessible station '+deck+':'+p.id);let origin=deck==='upper'?[150,300]:deck==='lower'?[110,300]:[405,300];assert(route(deck,...origin,p.x,p.y).length>0,'no path to '+deck+':'+p.id)}
// 20 simulated minutes. Count completions, including several multi-deck routes.
let completed=Array(9).fill(0), seen=Array.from({length:9},()=>new Set()), old=s.people.map(p=>p.job||0);
for(let n=0;n<12000;n++){tick(.1);for(let i=1;i<9;i++){let p=s.people[i];seen[i].add(p.deck);let j=p.job||0;if(j!==old[i]){completed[i]++;old[i]=j}}}
for(let i=1;i<9;i++)assert(completed[i]>=6,crew[i][0]+' stuck; completed '+completed[i]);
for(let i of [1,3,4,5,6,7,8])assert(seen[i].size>=2,crew[i][0]+' never changed decks');
// Player remains still with no input, even over long simulated time.
let ox=s.x,oy=s.y;for(let n=0;n<200;n++)tick(.1);assert(s.x===ox&&s.y===oy,'controlled player moved autonomously');
s.bunk='Kaylee';s.bunkHatch='bunkKaylee';goDeck('bunk',500,240);tick(.016);render();handleLayoutInteraction('bunkExit');assert(s.deck==='upper'&&s.x===325,'bunk exit');
handleLayoutInteraction('foreCatwalk');assert(s.deck==='catwalk','neck to catwalk');tick(.016);render();handleLayoutInteraction('catLower');assert(s.deck==='lower','catwalk to cargo');handleLayoutInteraction('cargoUp');handleLayoutInteraction('shuttleStar');assert(s.deck==='shuttle'&&s.shuttle===\"Inara's shuttle\",'shuttle entry');tick(.016);render();handleLayoutInteraction('shuttleExit');assert(s.deck==='catwalk'&&s.y===180,'starboard exit');handleLayoutInteraction('catUpper');handleLayoutInteraction('aftDown');assert(s.deck==='lower','aft stairs');handleLayoutInteraction('passengers');tick(.016);render();handleLayoutInteraction('passExit');assert(s.deck==='lower','passenger exit');
s.mode='flight';s.ship.x=0;s.ship.y=0;s.ship.vx=16;s.ship.vy=0;s.ship.hold=true;s.ship.anchor={x:0,y:0,a:0};s.ship.auto=false;for(let i=0;i<4000;i++)tick(.016);assert(Math.abs(s.ship.x)<.1&&Math.abs(s.ship.vx)<.1,'station keeping did not return after impulse');s.ship.hold=false;s.ship.anchor=null;s.ship.auto='dock';for(let i=0;i<10000&&!s.docked;i++)tick(.016);assert(s.docked,'autodock');s.mode='interior';goDeck('lower',88,300);tick(.016);assert(near&&near.id==='airlock','airlock proximity');
// Exercise the mission's real interaction handlers, dialogs and their buttons.
function click(label){let list=sandboxEls('#modalActions').children||[];let b=[...list].reverse().find(x=>x.textContent===label);assert(b,'missing action '+label);b.onclick()}
s.suited=false;interact();click('OVERRIDE SAFETY');assert(modal&&s.hp===0,'unsafe override');click('RECOVER');assert(s.hp===60,'recovery');goDeck('lower',320,232);tick(.016);assert(near.id==='suit','suit proximity');interact();click('PUT ON SUIT');assert(s.suited,'suit equip');goDeck('lower',88,300);tick(.016);interact();click('CROSS TO DERELICT');assert(s.deck==='wreck'&&s.visited,'crossing');goDeck('wreck',440,155);tick(.016);interact();assert(s.note,'note');click('POCKET THE NOTE');goDeck('wreck',720,245);tick(.016);interact();dial=[4,2,7];click('OPEN LOCK');assert(s.unlocked&&s.salvage===3,'locker reward');click('TAKE SALVAGE');goDeck('wreck',150,245);tick(.016);interact();assert(s.deck==='lower'&&s.delivered,'return home and finish');assert(objective().includes('complete'),'completed objective');
// Suits and survival stats must follow the selected person, not leak between crew.
s.suited=true;s.hp=65;s.food=50;s.water=40;let oldPlayer=s.player;switchCrew(1);assert(!s.suited&&s.hp===100&&s.food===100,'crew-specific gear and stats');switchCrew(oldPlayer);assert(s.suited&&s.hp===65&&s.food===50&&s.water===40,'restore crew gear and stats');
// Unclamp safely after returning the crew; retain the ship's free-flight state.
s.mode='flight';s.docked=true;s.people[1].deck='wreck';sandboxEls('#undock').onclick();assert(s.docked,'undock should not strand crew');s.people[1].deck='upper';sandboxEls('#undock').onclick();assert(!s.docked&&!s.ship.auto,'undock after crew return');
console.log('PASS: 20-minute crew routes, station pathfinding, player input, deck transitions, station keeping, docking and complete salvage flow, per-crew state and safe undocking.');
`,sandbox);
