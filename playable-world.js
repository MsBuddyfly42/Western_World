(()=>{
'use strict';
if(window.__westernPlayableLoaded)return;window.__westernPlayableLoaded=true;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const buildings=[
{name:"Sheriff's Office",x:170,y:150,w:250,h:180,icon:"★",label:"SHERIFF"},
{name:"Golden Spur Saloon",x:520,y:120,w:300,h:210,icon:"♫",label:"GOLDEN SPUR"},
{name:"Sunset Hotel",x:920,y:140,w:260,h:190,icon:"☾",label:"SUNSET HOTEL"},
{name:"Dusty Trail Bank",x:1320,y:145,w:260,h:185,icon:"$",label:"BANK"},
{name:"General Store",x:235,y:585,w:285,h:190,icon:"◇",label:"GENERAL STORE"},
{name:"Frontier Gazette",x:650,y:600,w:260,h:175,icon:"N",label:"GAZETTE"},
{name:"Railroad Depot",x:1050,y:600,w:315,h:180,icon:"🚂",label:"DEPOT"},
{name:"Prairie Kitchen",x:1435,y:575,w:250,h:195,icon:"♨",label:"PRAIRIE KITCHEN"},
{name:"Community Chapel",x:1430,y:350,w:190,h:155,icon:"✦",label:"CHAPEL"},
{name:"Livery Stable",x:70,y:370,w:270,h:160,icon:"♞",label:"LIVERY"}
];
const npcs=[
{name:"Deputy Mae",x:455,y:390,color:"#78482e",lines:["Morning, traveler. Keep your eyes open near the depot.","Dusty Trail has been too quiet today. That's usually when something happens."]},
{name:"Rosa Bell",x:780,y:410,color:"#8c3e48",lines:["The Golden Spur has music tonight.","I heard a traveler asking about Whispering Mesa."]},
{name:"Eli Mercer",x:330,y:520,color:"#41685d",lines:["That horse by the livery likes apples.","Take the south road if you want a quiet ride."]},
{name:"Ada Quinn",x:930,y:520,color:"#635a85",lines:["I've got a headline looking for a mystery.","The Gazette prints facts. The saloon prints rumors."]},
{name:"Stationmaster",x:1215,y:520,color:"#44526a",lines:["Express train in soon!","Don't stand too close to the tracks."]}
];
const pickups=[
{id:"badge",x:465,y:760,label:"Old Badge",symbol:"★"},
{id:"horseshoe",x:860,y:845,label:"Lucky Horseshoe",symbol:"U"},
{id:"telegram",x:1250,y:405,label:"Folded Telegram",symbol:"✉"},
{id:"coin",x:1550,y:840,label:"Frontier Token",symbol:"●"}
];
let saved={x:850,y:460,found:[],talked:[],mounted:false};
try{saved={...saved,...JSON.parse(localStorage.getItem('western-playable-v1')||'{}')}}catch{}
const save=()=>{try{localStorage.setItem('western-playable-v1',JSON.stringify(saved))}catch{}};
const style=document.createElement('style');style.textContent=`
#westernPlayBtn{font-size:1.05rem;box-shadow:0 0 0 3px rgba(255,224,153,.22),0 8px 24px rgba(0,0,0,.25)}
.ww-game{border:0;padding:0;background:#1e130d;width:min(98vw,1100px);max-width:1100px;border-radius:18px;color:#fff7df;overflow:hidden;box-shadow:0 28px 100px #000c}
.ww-game::backdrop{background:#0e0806ed;backdrop-filter:blur(5px)}
.ww-shell{display:grid;grid-template-rows:auto auto;min-width:0}
.ww-top{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap;background:#4a291c;padding:10px 13px;border-bottom:3px solid #c5914f}
.ww-brand{display:flex;align-items:center;gap:10px;min-width:0}.ww-brand strong{font:800 1.05rem Georgia,serif}.ww-brand span{font-size:.78rem;color:#ead3a6}
.ww-stats{display:flex;gap:8px;flex-wrap:wrap}.ww-chip{background:#2d1c15;border:1px solid #8d623f;border-radius:999px;padding:5px 9px;font-size:.78rem}
.ww-close{border:1px solid #e9c47f;background:#f0d39b;color:#332116;border-radius:9px;min-height:40px;padding:7px 11px;font-weight:800;cursor:pointer}
.ww-viewport{position:relative;height:min(66vw,620px);min-height:470px;overflow:hidden;background:#d79550;outline:none;touch-action:none}
.ww-world{position:absolute;width:1800px;height:1000px;transform-origin:0 0;background:
radial-gradient(circle at 78% 12%,#ffd779 0 38px,transparent 40px),
linear-gradient(#78afbf 0 38%,#b5a46d 38% 48%,#c9894a 48% 100%);will-change:transform}
.ww-mountain{position:absolute;bottom:520px;width:420px;height:220px;background:#8b694d;clip-path:polygon(0 100%,25% 28%,38% 60%,58% 10%,78% 55%,100% 100%);opacity:.7}
.ww-road{position:absolute;left:0;top:330px;width:1800px;height:290px;background:#d6a264;clip-path:polygon(0 24%,100% 5%,100% 95%,0 78%)}
.ww-road:after{content:"";position:absolute;inset:48% 0 auto;height:5px;background:repeating-linear-gradient(90deg,transparent 0 42px,#8d643d 42px 72px);opacity:.4}
.ww-track{position:absolute;left:0;top:800px;width:1800px;height:50px;border-top:8px solid #604333;border-bottom:8px solid #604333;background:repeating-linear-gradient(90deg,transparent 0 24px,#50372c 24px 34px,transparent 34px 55px)}
.ww-building{position:absolute;border:5px solid #5a3522;background:linear-gradient(#ac6538,#744026);border-radius:5px 5px 2px 2px;box-shadow:0 12px 0 #553220,0 18px 16px #59351d66}
.ww-building:before{content:"";position:absolute;left:-14px;right:-14px;top:-38px;height:48px;background:#603521;clip-path:polygon(8% 100%,0 25%,50% 0,100% 25%,92% 100%);z-index:-1}
.ww-sign{position:absolute;top:15px;left:50%;transform:translateX(-50%);background:#ead09a;color:#422819;border:3px solid #5c3825;padding:5px 8px;font:800 12px Georgia,serif;white-space:nowrap}
.ww-door{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:54px;height:82px;background:#40291e;border:4px solid #2a1b15}.ww-window{position:absolute;bottom:70px;width:40px;height:44px;background:#90c4cc;border:4px solid #5b3925}.ww-window.a{left:28px}.ww-window.b{right:28px}
.ww-building.near{filter:brightness(1.16);box-shadow:0 0 0 5px #f7d071,0 12px 0 #553220,0 18px 22px #3c2418aa}
.ww-player{position:absolute;width:44px;height:72px;z-index:40;transform:translate(-22px,-62px);filter:drop-shadow(0 6px 3px #0005)}
.ww-player .head{position:absolute;left:12px;top:10px;width:20px;height:20px;border-radius:50%;background:#b98261;border:2px solid #4b3024}
.ww-player .hat{position:absolute;left:4px;top:4px;width:36px;height:9px;border-radius:50%;background:#5c3826}.ww-player .hat:before{content:"";position:absolute;left:10px;top:-8px;width:17px;height:13px;background:#5c3826;border-radius:6px 6px 2px 2px}
.ww-player .body{position:absolute;left:9px;top:30px;width:26px;height:28px;border-radius:7px 7px 3px 3px;background:#304f61}
.ww-player .leg{position:absolute;top:55px;width:8px;height:17px;background:#3c3028;transform-origin:top}.ww-player .leg.l{left:12px}.ww-player .leg.r{right:12px}
.ww-player.walk .leg.l{animation:wwleg .32s alternate infinite}.ww-player.walk .leg.r{animation:wwleg .32s alternate-reverse infinite}.ww-player.mounted{transform:translate(-35px,-72px) scale(1.25)}
.ww-player.mounted:after{content:"🐎";position:absolute;font-size:42px;left:-3px;top:30px;z-index:-1}
@keyframes wwleg{to{transform:rotate(25deg)}}
.ww-npc{position:absolute;width:34px;height:58px;transform:translate(-17px,-48px);z-index:25}.ww-npc:before{content:"";position:absolute;left:8px;top:0;width:18px;height:18px;border-radius:50%;background:#bd8e6f;border:2px solid #4a3023}.ww-npc:after{content:"";position:absolute;left:4px;top:18px;width:26px;height:35px;border-radius:7px;background:var(--npc);border:2px solid #3d2d24}.ww-npc.wander{animation:wwbob 1.8s ease-in-out infinite}
@keyframes wwbob{50%{margin-top:-4px}}
.ww-pickup{position:absolute;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f5d986;color:#54351f;border:3px solid #7a4c2e;font-weight:900;box-shadow:0 0 0 5px #fff4bf33;animation:wwfloat 1.5s ease-in-out infinite alternate;z-index:22}
@keyframes wwfloat{to{transform:translateY(-8px)}}
.ww-pickup.found{display:none}
.ww-horse{position:absolute;left:370px;top:515px;font-size:54px;filter:drop-shadow(0 5px 2px #0004);animation:wwbob 2.3s ease-in-out infinite}
.ww-tumble{position:absolute;font-size:35px;opacity:.65;animation:wwroll 14s linear infinite}
@keyframes wwroll{from{transform:translateX(-100px) rotate(0)}to{transform:translateX(1900px) rotate(720deg)}}
.ww-prompt{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);z-index:70;min-width:min(88%,480px);text-align:center;background:#2d1a13e8;border:2px solid #dbb66d;border-radius:12px;padding:10px 12px;box-shadow:0 8px 24px #0008}.ww-prompt[hidden]{display:none}.ww-prompt strong{color:#ffd986}
.ww-message{position:absolute;left:50%;top:16px;transform:translateX(-50%);z-index:70;background:#f5dfb3;color:#3d291d;border:3px solid #6e472d;border-radius:12px;padding:10px 14px;max-width:min(90%,620px);font-weight:700;text-align:center;box-shadow:0 6px 18px #0005}.ww-message[hidden]{display:none}
.ww-controls{position:absolute;inset:auto 12px 12px 12px;display:flex;justify-content:space-between;align-items:end;z-index:80;pointer-events:none}.ww-dpad{display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(2,48px);gap:5px}.ww-dpad button,.ww-action{pointer-events:auto;min-width:48px;min-height:48px;border:2px solid #f0cc83;background:#45291de8;color:white;border-radius:12px;font-weight:900;font-size:20px;touch-action:none}.ww-dpad .up{grid-column:2}.ww-dpad .left{grid-column:1}.ww-dpad .down{grid-column:2}.ww-dpad .right{grid-column:3}.ww-action{min-width:104px;font-size:14px;background:#8d4d27}
.ww-help{font-size:.75rem;color:#ead7b5;padding:7px 12px;background:#362219;text-align:center}
@media(max-width:650px){.ww-game{width:100%;border-radius:0}.ww-top{padding:8px}.ww-brand span{display:none}.ww-viewport{height:560px;min-height:520px}.ww-stats .ww-chip:nth-child(3){display:none}.ww-dpad{grid-template-columns:repeat(3,45px);grid-template-rows:repeat(2,45px)}.ww-dpad button{min-width:45px;min-height:45px}.ww-action{min-width:90px}.ww-prompt{bottom:88px;font-size:.85rem}}
@media(prefers-reduced-motion:reduce){.ww-player.walk .leg,.ww-npc,.ww-pickup,.ww-horse,.ww-tumble{animation:none!important}}
`;document.head.append(style);

const dialog=document.createElement('dialog');dialog.className='ww-game';dialog.setAttribute('aria-label','Playable Western World');
dialog.innerHTML=`<div class="ww-shell"><div class="ww-top"><div class="ww-brand"><div><strong>🤠 PLAYABLE WESTERN WORLD</strong><br><span>Walk the town • meet people • enter buildings • collect keepsakes</span></div></div><div class="ww-stats"><span class="ww-chip">📍 <b id="wwPlace">Main Street</b></span><span class="ww-chip">🎒 <b id="wwFound">0</b>/4</span><span class="ww-chip">🐎 <b id="wwRide">On foot</b></span></div><button class="ww-close" type="button">Exit Game</button></div><div class="ww-viewport" tabindex="0" aria-label="Use arrow keys or WASD to walk around Dusty Trail"><div class="ww-world"><div class="ww-mountain" style="left:40px"></div><div class="ww-mountain" style="left:430px;transform:scale(.8)"></div><div class="ww-mountain" style="left:1030px;transform:scale(1.1)"></div><div class="ww-road"></div><div class="ww-track"></div><div class="ww-horse" aria-label="horse">🐎</div><div class="ww-tumble" style="top:530px;animation-delay:-6s">✺</div><div class="ww-player" aria-label="your character"><i class="hat"></i><i class="head"></i><i class="body"></i><i class="leg l"></i><i class="leg r"></i></div></div><div class="ww-message" hidden></div><div class="ww-prompt" hidden></div><div class="ww-controls"><div class="ww-dpad"><button type="button" class="up" data-dir="up" aria-label="Walk up">▲</button><button type="button" class="left" data-dir="left" aria-label="Walk left">◀</button><button type="button" class="down" data-dir="down" aria-label="Walk down">▼</button><button type="button" class="right" data-dir="right" aria-label="Walk right">▶</button></div><button type="button" class="ww-action">INTERACT</button></div></div><div class="ww-help">Keyboard: WASD / arrow keys to move • E or Space to interact • Walk to the horse to mount</div></div>`;
document.body.append(dialog);
const viewport=dialog.querySelector('.ww-viewport'),world=dialog.querySelector('.ww-world'),player=dialog.querySelector('.ww-player'),prompt=dialog.querySelector('.ww-prompt'),message=dialog.querySelector('.ww-message'),placeEl=dialog.querySelector('#wwPlace'),foundEl=dialog.querySelector('#wwFound'),rideEl=dialog.querySelector('#wwRide');
buildings.forEach(b=>{const el=document.createElement('div');el.className='ww-building';el.dataset.place=b.name;Object.assign(el.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});el.innerHTML=`<span class="ww-sign">${b.icon} ${b.label}</span><i class="ww-window a"></i><i class="ww-window b"></i><i class="ww-door"></i>`;world.append(el);b.el=el;b.doorX=b.x+b.w/2;b.doorY=b.y+b.h+26;});
npcs.forEach((n,i)=>{const el=document.createElement('div');el.className='ww-npc wander';el.style.setProperty('--npc',n.color);el.style.left=n.x+'px';el.style.top=n.y+'px';el.title=n.name;world.append(el);n.el=el;});
pickups.forEach(p=>{const el=document.createElement('div');el.className='ww-pickup'+(saved.found.includes(p.id)?' found':'');el.style.left=p.x+'px';el.style.top=p.y+'px';el.textContent=p.symbol;el.title=p.label;world.append(el);p.el=el;});
const keys=new Set();let last=0,near=null,raf=0,msgTimer=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
function showMessage(text,time=2400){message.textContent=text;message.hidden=false;clearTimeout(msgTimer);msgTimer=setTimeout(()=>message.hidden=true,time);}
function solidAt(x,y){
 for(const b of buildings){if(x>b.x-22&&x<b.x+b.w+22&&y>b.y-18&&y<b.y+b.h-8)return true;}return false;
}
function updateNear(){
 near=null;let best=90;
 for(const b of buildings){const d=dist(saved.x,saved.y,b.doorX,b.doorY);if(d<best){best=d;near={type:'building',item:b};}}
 for(const n of npcs){const d=dist(saved.x,saved.y,n.x,n.y);if(d<best){best=d;near={type:'npc',item:n};}}
 for(const p of pickups){if(saved.found.includes(p.id))continue;const d=dist(saved.x,saved.y,p.x,p.y);if(d<best){best=d;near={type:'pickup',item:p};}}
 if(dist(saved.x,saved.y,395,535)<best&&dist(saved.x,saved.y,395,535)<100)near={type:'horse'};
 buildings.forEach(b=>b.el.classList.toggle('near',near?.type==='building'&&near.item===b));
 if(!near){prompt.hidden=true;placeEl.textContent='Dusty Trail';return;}
 prompt.hidden=false;
 if(near.type==='building'){prompt.innerHTML=`Press <strong>E / INTERACT</strong> to enter <strong>${near.item.name}</strong>`;placeEl.textContent=near.item.name;}
 if(near.type==='npc'){prompt.innerHTML=`Press <strong>E / INTERACT</strong> to talk to <strong>${near.item.name}</strong>`;placeEl.textContent='Main Street';}
 if(near.type==='pickup'){prompt.innerHTML=`Press <strong>E / INTERACT</strong> to pick up <strong>${near.item.label}</strong>`;}
 if(near.type==='horse'){prompt.innerHTML=`Press <strong>E / INTERACT</strong> to ${saved.mounted?'dismount':'mount your horse'}`;}
}
function render(){
 player.style.left=saved.x+'px';player.style.top=saved.y+'px';player.classList.toggle('mounted',saved.mounted);foundEl.textContent=saved.found.length;rideEl.textContent=saved.mounted?'Mounted':'On foot';
 const vw=viewport.clientWidth,vh=viewport.clientHeight;const cx=clamp(vw/2-saved.x, vw-1800,0),cy=clamp(vh/2-saved.y, vh-1000,0);world.style.transform=`translate(${cx}px,${cy}px)`;updateNear();
}
function move(dx,dy,amount){let nx=clamp(saved.x+dx*amount,35,1765),ny=clamp(saved.y+dy*amount,355,930);if(!solidAt(nx,ny)){saved.x=nx;saved.y=ny;}player.classList.add('walk');}
function loop(t){const dt=Math.min(32,t-last||16);last=t;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx--;if(keys.has('ArrowRight')||keys.has('d'))dx++;if(keys.has('ArrowUp')||keys.has('w'))dy--;if(keys.has('ArrowDown')||keys.has('s'))dy++;if(dx||dy){const len=Math.hypot(dx,dy)||1;move(dx/len,dy/len,(saved.mounted?0.34:0.22)*dt);render();}else player.classList.remove('walk');raf=requestAnimationFrame(loop);}
function interact(){
 if(!near)return showMessage('Walk closer to a building, person, keepsake, or horse.');
 if(near.type==='building'){save();const target=document.querySelector('.building[data-place="'+CSS.escape(near.item.name)+'"]');dialog.close();setTimeout(()=>target?.click(),80);return;}
 if(near.type==='npc'){const n=near.item;const line=n.lines[Math.floor(Math.random()*n.lines.length)];showMessage(n.name+': “'+line+'”',3600);if(!saved.talked.includes(n.name)){saved.talked.push(n.name);save();}}
 if(near.type==='pickup'){const p=near.item;saved.found.push(p.id);p.el.classList.add('found');showMessage('Collected: '+p.label+'!  '+saved.found.length+'/4 keepsakes found.',3000);save();}
 if(near.type==='horse'){saved.mounted=!saved.mounted;showMessage(saved.mounted?'You mounted your horse. You can travel faster now!':'You hopped down from your horse.');save();render();}
}
function openGame(){if(!dialog.open)dialog.showModal();render();viewport.focus();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);showMessage(saved.found.length===4?'Welcome back, trail legend!':'Walk around Dusty Trail. Find 4 keepsakes and enter any building.',3200);}
function closeGame(){save();keys.clear();cancelAnimationFrame(raf);dialog.close();}
dialog.querySelector('.ww-close').onclick=closeGame;dialog.querySelector('.ww-action').onclick=interact;
viewport.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);}if(k==='e'||k===' '){e.preventDefault();interact();}});
viewport.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k);});
dialog.querySelectorAll('[data-dir]').forEach(btn=>{const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'},k=map[btn.dataset.dir];const on=e=>{e.preventDefault();keys.add(k);viewport.focus();},off=e=>{e.preventDefault();keys.delete(k);};btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off);});
dialog.addEventListener('close',()=>{keys.clear();cancelAnimationFrame(raf);save();});
const heroActions=document.querySelector('.hero-actions');if(heroActions){const btn=document.createElement('button');btn.id='westernPlayBtn';btn.className='primary';btn.type='button';btn.textContent='🎮 Play Western World';btn.onclick=openGame;heroActions.prepend(btn);}
const enter=document.querySelector('[data-action="open-town"]');if(enter)enter.textContent='Browse Western World';
window.openWesternPlayable=openGame;
render();
})();

/* Frontier Life expansion: moving train, day/night, ambient life, quests, minimap. */
(()=>{
'use strict';
const game=document.querySelector('.ww-game'),world=document.querySelector('.ww-world'),viewport=document.querySelector('.ww-viewport');if(!game||!world||!viewport||game.dataset.frontierLife)return;game.dataset.frontierLife='1';
const extra=document.createElement('style');extra.textContent=`
.ww-skyfx{position:absolute;inset:0;pointer-events:none;z-index:2;transition:background .8s,opacity .8s}.ww-skyfx.night{background:linear-gradient(#08152fcf,#1c284bad 55%,#2e2a31a8)}.ww-skyfx.sunset{background:linear-gradient(#8a3f3150,#e17e3840 55%,transparent)}
.ww-starscape{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.5px);background-size:57px 43px;opacity:0;transition:opacity .8s}.ww-skyfx.night .ww-starscape{opacity:.7}
.ww-firefly{position:absolute;width:5px;height:5px;border-radius:50%;background:#ffe772;box-shadow:0 0 10px #ffe772;opacity:0}.ww-skyfx.night .ww-firefly{opacity:.85;animation:wwfly 4s ease-in-out infinite alternate}@keyframes wwfly{to{transform:translate(24px,-18px);opacity:.25}}
.ww-train{position:absolute;left:-360px;top:778px;width:320px;height:84px;z-index:18;animation:wwtrain 18s linear infinite;filter:drop-shadow(0 9px 5px #0006)}.ww-engine{position:absolute;left:120px;bottom:9px;width:145px;height:60px;border:5px solid #2d2621;border-radius:8px 20px 5px 5px;background:#35434b}.ww-engine:before{content:'';position:absolute;left:22px;top:-39px;width:38px;height:42px;background:#30383d;border-radius:4px 4px 0 0}.ww-engine:after{content:'';position:absolute;right:20px;top:-22px;border-left:28px solid transparent;border-right:28px solid transparent;border-bottom:35px solid #30383d}.ww-car{position:absolute;left:0;bottom:10px;width:125px;height:54px;border:5px solid #573a2a;background:#a65c34;border-radius:6px}.ww-wheel{position:absolute;bottom:-16px;width:30px;height:30px;border:6px solid #211c19;border-radius:50%;background:#6e655d;animation:wwspin .7s linear infinite}.ww-wheel.a{left:18px}.ww-wheel.b{right:16px}@keyframes wwspin{to{transform:rotate(360deg)}}@keyframes wwtrain{0%{transform:translateX(0)}100%{transform:translateX(2220px)}}
.ww-wagon{position:absolute;left:-120px;top:505px;font-size:56px;z-index:16;animation:wwwagon 26s linear infinite;filter:drop-shadow(0 5px 3px #0005)}@keyframes wwwagon{to{transform:translateX(2050px)}}
.ww-smoke{position:absolute;width:22px;height:22px;border-radius:50%;background:#e9dfd0aa;z-index:8;animation:wwsmoke 4s ease-out infinite}@keyframes wwsmoke{to{transform:translate(18px,-90px) scale(2);opacity:0}}
.ww-questhud{position:absolute;right:12px;top:74px;z-index:72;width:min(280px,43%);background:#2c1b13e8;border:2px solid #d4a760;border-radius:12px;padding:9px 11px;font-size:.78rem;line-height:1.35;box-shadow:0 8px 20px #0007}.ww-questhud strong{display:block;color:#ffd987;margin-bottom:3px}.ww-questhud.done{border-color:#88c477}.ww-questhud[hidden]{display:none}
.ww-mini{position:absolute;right:12px;bottom:84px;width:118px;height:74px;z-index:71;background:#e2b875dd;border:3px solid #60402a;border-radius:8px;overflow:hidden;pointer-events:none}.ww-mini:before{content:'';position:absolute;left:0;right:0;top:31px;height:18px;background:#c78e55}.ww-mini-dot{position:absolute;width:9px;height:9px;border-radius:50%;background:#e8f1ff;border:2px solid #263c55;transform:translate(-50%,-50%);transition:left .12s linear,top .12s linear}
.ww-timebtn,.ww-questbtn{border:1px solid #e9c47f;background:#3e281e;color:#fff5d8;border-radius:9px;min-height:40px;padding:7px 10px;font-weight:800;cursor:pointer}
@media(max-width:650px){.ww-questhud{top:64px;width:52%;font-size:.7rem}.ww-mini{width:88px;height:58px;bottom:82px}.ww-mini:before{top:24px;height:13px}.ww-timebtn,.ww-questbtn{min-height:38px;padding:6px 8px;font-size:.72rem}}
@media(prefers-reduced-motion:reduce){.ww-train,.ww-wagon,.ww-smoke,.ww-firefly{animation:none!important}.ww-train{left:980px}.ww-wagon{left:760px}}
`;document.head.append(extra);
const sky=document.createElement('div');sky.className='ww-skyfx sunset';sky.innerHTML='<div class="ww-starscape"></div>';for(let i=0;i<10;i++){const f=document.createElement('i');f.className='ww-firefly';f.style.left=(80+i*153)+'px';f.style.top=(500+(i%3)*95)+'px';f.style.animationDelay=(-i*.37)+'s';sky.append(f);}world.prepend(sky);
const train=document.createElement('div');train.className='ww-train';train.innerHTML='<div class="ww-car"><i class="ww-wheel a"></i><i class="ww-wheel b"></i></div><div class="ww-engine"><i class="ww-wheel a"></i><i class="ww-wheel b"></i></div>';world.append(train);
const wagon=document.createElement('div');wagon.className='ww-wagon';wagon.textContent='🐎🛻';wagon.setAttribute('aria-hidden','true');world.append(wagon);
[[635,98],[1090,112],[1510,118]].forEach((p,i)=>{const s=document.createElement('i');s.className='ww-smoke';s.style.left=p[0]+'px';s.style.top=p[1]+'px';s.style.animationDelay=(-i*1.2)+'s';world.append(s);});
const mini=document.createElement('div');mini.className='ww-mini';mini.setAttribute('aria-label','Mini map');mini.innerHTML='<i class="ww-mini-dot"></i>';viewport.append(mini);const dot=mini.firstElementChild;
let frontier={time:'sunset',visited:[],quest:0};try{frontier={...frontier,...JSON.parse(localStorage.getItem('western-frontier-life')||'{}')}}catch{}const store=()=>{try{localStorage.setItem('western-frontier-life',JSON.stringify(frontier))}catch{}};
const quests=[
{name:'Meet the Town',text:'Talk to 3 different townspeople.',test:()=>{try{return (JSON.parse(localStorage.getItem('western-playable-v1')||'{}').talked||[]).length>=3}catch{return false}}},
{name:'Sharp Eyes',text:'Collect at least 2 hidden keepsakes.',test:()=>{try{return (JSON.parse(localStorage.getItem('western-playable-v1')||'{}').found||[]).length>=2}catch{return false}}},
{name:'Doors of Dusty Trail',text:'Enter 3 different town buildings.',test:()=>frontier.visited.length>=3}
];
const hud=document.createElement('div');hud.className='ww-questhud';viewport.append(hud);
function drawQuest(){const q=quests[Math.min(frontier.quest,quests.length-1)];if(frontier.quest>=quests.length){hud.classList.add('done');hud.innerHTML='<strong>★ Frontier Explorer</strong>All three starter town quests completed. Free-roam however you like!';return;}hud.classList.toggle('done',q.test());hud.innerHTML='<strong>Quest: '+q.name+'</strong>'+q.text+(q.test()?'<br>✓ Complete — press Quest to claim.':'');}
const top=game.querySelector('.ww-top');const timeBtn=document.createElement('button');timeBtn.className='ww-timebtn';timeBtn.type='button';timeBtn.textContent='🌅 Time';const questBtn=document.createElement('button');questBtn.className='ww-questbtn';questBtn.type='button';questBtn.textContent='📜 Quest';top.insertBefore(questBtn,game.querySelector('.ww-close'));top.insertBefore(timeBtn,questBtn);
const times=['day','sunset','night'];function applyTime(){sky.className='ww-skyfx '+frontier.time;timeBtn.textContent=frontier.time==='night'?'🌙 Night':frontier.time==='day'?'☀️ Day':'🌅 Sunset';}
timeBtn.onclick=()=>{frontier.time=times[(times.indexOf(frontier.time)+1)%times.length];applyTime();store();};
questBtn.onclick=()=>{const q=quests[frontier.quest];if(!q){drawQuest();return;}if(q.test()){frontier.quest++;store();drawQuest();const msg=game.querySelector('.ww-message');if(msg){msg.textContent='Quest complete! A new frontier task has been added.';msg.hidden=false;setTimeout(()=>msg.hidden=true,2600);}}else{hud.hidden=!hud.hidden;}};
document.querySelectorAll('.building[data-place]').forEach(b=>b.addEventListener('click',()=>{const p=b.dataset.place;if(p&&!frontier.visited.includes(p)){frontier.visited.push(p);store();drawQuest();}}));
function updateMini(){const p=world.querySelector('.ww-player');if(!p)return;const x=parseFloat(p.style.left)||850,y=parseFloat(p.style.top)||460;dot.style.left=(x/1800*100)+'%';dot.style.top=(y/1000*100)+'%';drawQuest();requestAnimationFrame(updateMini);}applyTime();drawQuest();requestAnimationFrame(updateMini);
})();


/* Playable expansion: enterable interiors, ambient NPC movement, weather, saloon game, bounty quest. */
(()=>{
'use strict';
const game=document.querySelector('.ww-game'),world=document.querySelector('.ww-world'),viewport=document.querySelector('.ww-viewport');if(!game||!world||game.dataset.playExpansion)return;game.dataset.playExpansion='1';
const css=document.createElement('style');css.textContent=`
.ww-weather{position:absolute;inset:0;pointer-events:none;z-index:60;overflow:hidden}.ww-rain{position:absolute;inset:-40px 0 0;background:repeating-linear-gradient(100deg,transparent 0 20px,#dcecff88 21px 23px,transparent 24px 42px);animation:wwrain .55s linear infinite;opacity:0}.ww-weather.rain .ww-rain{opacity:.8}@keyframes wwrain{to{transform:translate(-30px,55px)}}
.ww-dust{position:absolute;inset:0;background:radial-gradient(circle at 10% 70%,#d7a36266,transparent 16%),radial-gradient(circle at 80% 65%,#d7a36255,transparent 18%);opacity:0}.ww-weather.dust .ww-dust{opacity:1;animation:wwdust 3.5s ease-in-out infinite alternate}@keyframes wwdust{to{transform:translateX(35px)}}
.ww-interior-room{position:absolute;inset:0;z-index:95;background:#3e281d;display:none;overflow:hidden}.ww-interior-room.open{display:block}.ww-roomscene{position:absolute;inset:0;background:linear-gradient(#9a704d 0 54%,#6b4228 54%)}.ww-roomscene:before{content:'';position:absolute;left:8%;right:8%;top:12%;height:10px;background:#d6b37f;box-shadow:0 90px 0 #7b4d31,0 180px 0 #7b4d31}.ww-room-back{position:absolute;left:50%;top:48px;transform:translateX(-50%);background:#ead2a2;color:#3d291e;border:4px solid #5e3c28;padding:8px 14px;font:800 16px Georgia,serif}.ww-room-table{position:absolute;left:20%;right:20%;bottom:110px;height:70px;background:#6d432a;border:6px solid #4c2e20;border-radius:8px}.ww-room-npc{position:absolute;left:68%;bottom:120px;width:40px;height:70px}.ww-room-npc:before{content:'';position:absolute;left:8px;top:0;width:24px;height:24px;border-radius:50%;background:#c38d6a;border:3px solid #4b3022}.ww-room-npc:after{content:'';position:absolute;left:3px;top:23px;width:34px;height:45px;background:#5b7484;border-radius:7px;border:3px solid #35434a}.ww-room-actions{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;width:min(90%,620px)}.ww-room-actions button{min-height:44px;border:2px solid #e4bd7d;background:#603b29;color:white;border-radius:10px;padding:8px 12px;font-weight:800}.ww-room-exit{position:absolute;right:14px;top:14px;z-index:4}.ww-bountyboard{position:absolute;left:18px;top:86px;z-index:72;background:#f0d7a5;color:#3f2819;border:3px solid #6a452c;border-radius:10px;padding:10px;width:min(280px,45%);box-shadow:0 7px 20px #0005}.ww-bountyboard strong{display:block;margin-bottom:4px}.ww-bountyboard[hidden]{display:none}.ww-weatherbtn,.ww-bountybtn{border:1px solid #e9c47f;background:#3e281e;color:#fff5d8;border-radius:9px;min-height:40px;padding:7px 10px;font-weight:800}.ww-saloon-game{position:absolute;inset:0;z-index:100;background:#2a1711ee;display:none;place-items:center;padding:20px}.ww-saloon-game.open{display:grid}.ww-cardtable{width:min(560px,94%);background:#6e3e2a;border:5px solid #d6ac68;border-radius:16px;padding:20px;text-align:center}.ww-cards{display:flex;justify-content:center;gap:18px;margin:18px 0}.ww-card{width:90px;height:125px;background:#fff7e6;color:#3a261b;border-radius:12px;border:4px solid #4c3122;display:grid;place-items:center;font:bold 2rem Georgia,serif}.ww-cardtable button{min-height:44px;border:2px solid #f2d18c;background:#3f281d;color:white;border-radius:10px;padding:9px 14px;font-weight:800}
@media(max-width:650px){.ww-bountyboard{top:104px;font-size:.72rem}.ww-room-table{left:10%;right:10%}.ww-room-npc{left:74%}.ww-room-actions{bottom:12px}.ww-card{width:72px;height:100px}}
@media(prefers-reduced-motion:reduce){.ww-rain,.ww-dust{animation:none!important}}
`;document.head.append(css);
const weather=document.createElement('div');weather.className='ww-weather clear';weather.innerHTML='<div class="ww-rain"></div><div class="ww-dust"></div>';viewport.append(weather);
let exp={weather:'clear',bounty:0,bountyDone:[],saloonWins:0};try{exp={...exp,...JSON.parse(localStorage.getItem('western-play-expansion')||'{}')}}catch{}const save=()=>{try{localStorage.setItem('western-play-expansion',JSON.stringify(exp))}catch{}};
const top=game.querySelector('.ww-top');const wbtn=document.createElement('button');wbtn.className='ww-weatherbtn';wbtn.type='button';const bbtn=document.createElement('button');bbtn.className='ww-bountybtn';bbtn.type='button';bbtn.textContent='📌 Bounty';top.insertBefore(bbtn,game.querySelector('.ww-close'));top.insertBefore(wbtn,bbtn);
const weatherModes=['clear','rain','dust'];function applyWeather(){weather.className='ww-weather '+exp.weather;wbtn.textContent=exp.weather==='rain'?'🌧 Rain':exp.weather==='dust'?'🌪 Dust':'☀ Clear';}wbtn.onclick=()=>{exp.weather=weatherModes[(weatherModes.indexOf(exp.weather)+1)%weatherModes.length];applyWeather();save();};applyWeather();
const bounties=[{name:'The Missing Saddle',text:'Talk to Eli Mercer near the livery, then inspect the stable.'},{name:'Depot Lantern Mystery',text:'Speak to the Stationmaster and visit the Railroad Depot.'},{name:'The Quiet Bank Ledger',text:'Visit the bank and then talk to Deputy Mae.'}];
const board=document.createElement('div');board.className='ww-bountyboard';viewport.append(board);function drawBounty(){const q=bounties[exp.bounty%bounties.length];board.innerHTML='<strong>📌 '+q.name+'</strong>'+q.text+'<br><small>Optional bounty case</small>';board.hidden=false;}bbtn.onclick=()=>board.hidden=!board.hidden;drawBounty();
const room=document.createElement('div');room.className='ww-interior-room';room.innerHTML='<div class="ww-roomscene"><button type="button" class="ww-close ww-room-exit">Exit Building</button><div class="ww-room-back"></div><div class="ww-room-table"></div><div class="ww-room-npc"></div><div class="ww-room-actions"></div></div>';viewport.append(room);
const saloonGame=document.createElement('div');saloonGame.className='ww-saloon-game';saloonGame.innerHTML='<div class="ww-cardtable"><h3>Golden Spur High Card</h3><p>Draw against the house. Highest card wins.</p><div class="ww-cards"><div class="ww-card" id="wwYou">?</div><div class="ww-card" id="wwHouse">?</div></div><p id="wwCardResult">Ready when you are.</p><button type="button" id="wwDraw">Draw Cards</button> <button type="button" id="wwLeaveGame">Leave Table</button></div>';viewport.append(saloonGame);
let currentBuilding='';const roomLines={"Sheriff's Office":['Check the evidence board','Ask Deputy Mae about current cases'],"Golden Spur Saloon":['Play High Card','Listen to the piano'],"Sunset Hotel":['Read the guest ledger','Ask about unusual visitors'],"Livery Stable":['Inspect the saddle rack','Feed a horse'],"Dusty Trail Bank":['Inspect the ledger','Ask about the vault'],"General Store":['Browse trail supplies','Check the delivery list'],"Frontier Gazette":['Read tomorrow\'s headline','Help run the press'],"Railroad Depot":['Inspect the timetable','Watch for the express'],"Community Chapel":['Read a town memory','Sit quietly'],"Prairie Kitchen":['Taste the pie','Ask for a recipe']};
function openRoom(name){currentBuilding=name;room.classList.add('open');room.querySelector('.ww-room-back').textContent=name;const a=room.querySelector('.ww-room-actions');a.replaceChildren();(roomLines[name]||['Look around']).forEach(label=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.onclick=()=>{if(name==='Golden Spur Saloon'&&label.includes('High Card')){saloonGame.classList.add('open');return;}const msg=game.querySelector('.ww-message');msg.textContent=label.includes('quietly')?'You sit for a peaceful moment while the town carries on outside.':label+' — you discover a new detail about Dusty Trail.';msg.hidden=false;setTimeout(()=>msg.hidden=true,2500);};a.append(btn);});}
room.querySelector('.ww-room-exit').onclick=()=>room.classList.remove('open');
const draw=()=>Math.floor(Math.random()*13)+1;saloonGame.querySelector('#wwDraw').onclick=()=>{const y=draw(),h=draw();saloonGame.querySelector('#wwYou').textContent=y;saloonGame.querySelector('#wwHouse').textContent=h;let r=y>h?'You win this hand!':y<h?'The house takes this hand.':'It\'s a draw.';if(y>h){exp.saloonWins++;save();}saloonGame.querySelector('#wwCardResult').textContent=r;};saloonGame.querySelector('#wwLeaveGame').onclick=()=>saloonGame.classList.remove('open');
function interceptPlayableEntries(){document.querySelectorAll('.ww-building').forEach(el=>{el.addEventListener('dblclick',()=>openRoom(el.dataset.place));});const old=window.openWesternPlayable;window.openWesternPlayable=()=>{old?.();setTimeout(()=>{document.querySelectorAll('.ww-building').forEach(el=>{if(!el.dataset.roomBound){el.dataset.roomBound='1';el.addEventListener('click',()=>{const rect=el.getBoundingClientRect(),vr=viewport.getBoundingClientRect();if(rect.left<vr.right&&rect.right>vr.left&&rect.top<vr.bottom&&rect.bottom>vr.top&&el.classList.contains('near'))openRoom(el.dataset.place);});}});},150);};}
interceptPlayableEntries();
})();
