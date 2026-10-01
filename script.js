const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const views=$$('.view'), navBtns=$$('.nav-btn');
const defaultState={role:'Traveler',rep:0,items:[],discoveries:[],visited:[],time:'sunset'};
let state={...defaultState,...JSON.parse(localStorage.getItem('westernWorldState')||'{}')};
function save(){localStorage.setItem('westernWorldState',JSON.stringify(state));renderStatus();}
function renderStatus(){statusRole.textContent=state.role;statusRep.textContent=state.rep;statusItems.textContent=state.items.length;document.body.dataset.time=state.time;}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
function reward(rep=1,item=null,discovery=null){state.rep+=rep;if(item&&!state.items.includes(item)){state.items.push(item);toast(`Keepsake found: ${item}`);}if(discovery&&!state.discoveries.includes(discovery))state.discoveries.push(discovery);save();}
function showView(id){
 const target=document.getElementById(id);
 if(!target||!target.classList.contains('view'))return;
 views.forEach(v=>v.classList.toggle('active-view',v.id===id));
 navBtns.forEach(b=>{b.classList.toggle('active',b.dataset.view===id);if(b.dataset.view===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const selected=navBtns.find(b=>b.dataset.view===id);const location=document.getElementById('currentLocation');if(location)location.textContent=selected?selected.textContent.trim():'Town Square';
 document.querySelectorAll('.favorite-bar [data-jump]').forEach(b=>{if(b.dataset.jump===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const finder=document.getElementById('activityFinder');const toggle=document.getElementById('explorerToggle');if(finder){finder.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='☰ Explore activities';}
 if(window.history&&window.history.replaceState)window.history.replaceState(null,'','#'+id);
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const top=document.getElementById('explorerToolbar').getBoundingClientRect().top+window.scrollY;
 window.scrollTo({top:Math.max(0,top),behavior:reduce?'auto':'smooth'});
 }
navBtns.forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));$$('[data-jump]').forEach(c=>c.addEventListener('click',()=>showView(c.dataset.jump)));$('[data-action="open-town"]').onclick=()=>showView('explore');

const townEvents=[
['The stagecoach from Copper Creek just arrived.','Three strangers stepped off, and one of them is carrying a locked metal case.'],
['A horse came back without its rider.','Its saddlebag contains a train ticket, a brass key, and half of a torn photograph.'],
['The Gazette printed an extra edition.','Someone claims a famous outlaw has been spotted eating pie at the Prairie Kitchen.'],
['A dust storm uncovered an old wagon trail.','Folks say it leads toward a ghost town missing from most maps.'],
['The saloon piano stopped in the middle of a song.','The pianist found a mysterious note tucked beneath the keys.'],
['The westbound train is six hours late.','The stationmaster swears a red signal lantern appeared on an empty stretch of track.'],
['A prize mare slipped out of the livery stable.','Oddly, the gate was still latched from the inside.'],
['Someone rang the chapel bell before sunrise.','Nobody admits being awake, but muddy footprints circle the bell tower.']
];
function refreshTown(){const [h,d]=townEvents[Math.floor(Math.random()*townEvents.length)];townHeadline.textContent=h;townDetail.textContent=d;}
$('[data-action="refresh-town"]').onclick=refreshTown;$('[data-action="random-adventure"]').onclick=()=>{const choices=['explore','adventures','roleplay','mystery','games','history','gazette','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};
const times=['sunrise','day','sunset','night'];$('[data-action="cycle-time"]').onclick=()=>{state.time=times[(times.indexOf(state.time)+1)%times.length];save();toast(`It is now ${state.time} in Dusty Trail.`);};

const places={
"Sheriff's Office":['Sheriff’s Office','A wanted board covers one wall. Deputy Mae offers old case files, local gossip, or a quiet patrol around town.',['Read an old case','Check the wanted board','Join evening patrol'],'Tin sheriff star'],
'Golden Spur Saloon':['Golden Spur Saloon','Music, cards, tall tales, and arguments about who really has the fastest draw.',['Hear a tall tale','Play a saloon game','Listen for gossip'],'Wooden drink token'],
'Sunset Hotel':['Sunset Hotel','Travelers come through with secrets, luggage, and stories. The guest register sometimes reveals more than people expect.',['Read the guest register','Sit in the lobby','Ask about room 7'],'Brass room key'],
'Livery Stable':['Livery Stable','Choose a horse, hear trail rumors, check tack, or ride toward the canyon.',['Choose a trail horse','Inspect the empty stall','Ask about strange tracks'],'Braided horsehair charm'],
'Dusty Trail Bank':['Dusty Trail Bank','A serious brick building with nervous clerks, heavy doors, and a vault nobody stops talking about.',['Inspect the lobby clock','Talk to the teller','Look at the old vault door'],'Old bank scrip'],
'General Store':['General Store','Supplies, candy jars, fabric, tools, newspapers, and local gossip.',['Browse the shelves','Buy peppermint sticks','Read the message board'],'Peppermint stick'],
'Frontier Gazette':['Frontier Gazette','Write headlines, investigate rumors, interview townsfolk, or compare sensational stories against the facts.',['Read today’s proof sheet','Interview the editor','Write a headline'],'Printer’s type block'],
'Railroad Depot':['Railroad Depot','Tickets point east and west. A locomotive can carry you into a whole new story.',['Check arrivals','Inspect the platform','Board an adventure train'],'Punched train ticket'],
'Community Chapel':['Community Chapel','A quiet gathering place where notices, weddings, music, and town meetings bring people together.',['Read community notices','Sit quietly','Check the bell rope'],'Pressed wildflower'],
'Prairie Kitchen':['Prairie Kitchen','Coffee, biscuits, stew, and pie make this one of the best places to hear what the town is talking about.',['Order pie','Ask for the daily special','Listen to booth gossip'],'Pie recipe card']
};
function visitPlace(name){const [h,p,actions,item]=places[name];if(!state.visited.includes(name)){state.visited.push(name);reward(1,null,`Visited ${name}`);}placePanel.innerHTML=`<h3>${h}</h3><p>${p}</p><div class="action-row">${actions.map((a,i)=>`<button class="secondary place-action" data-i="${i}">${a}</button>`).join('')}</div><p id="placeOutcome" class="outcome"></p>`;$$('.place-action').forEach(b=>b.onclick=()=>{const outcomes=[`You take your time. A small detail catches your attention and makes ${h} feel a little more real.`,`A local pauses to speak with you. You leave knowing one more piece of Dusty Trail gossip.`,`You notice something most hurried travelers would have missed.`];$('#placeOutcome').textContent=outcomes[+b.dataset.i];if(+b.dataset.i===2)reward(1,item,`${h}: hidden detail`);});}
$$('.building').forEach(b=>b.onclick=()=>visitPlace(b.dataset.place));

const roles=[
['Town Sheriff','Keep the peace, investigate trouble, and decide who to trust.','A telegram warns that a wanted fugitive may already be in town.'],['Ranch Owner','Manage land, livestock, weather, and rival claims.','A section of fence was cut overnight and six cattle are missing.'],['Frontier Journalist','Chase leads and print the truth—or a really good story.','Three witnesses describe the same event in three completely different ways.'],['Stagecoach Traveler','Arrive with no obligations and follow whatever catches your attention.','Your coach stops unexpectedly because the road ahead has been blocked.'],['Bounty Hunter','Track clues, compare stories, and decide whether a wanted poster tells the whole truth.','Your newest target may have been framed.'],['Saloon Owner','Run the room, hear everybody’s business, host games, and settle disputes.','A high-stakes card game draws a crowd—and one player is cheating.'],['Railroad Detective','Protect passengers, cargo, and the strange secrets moving along the line.','A sealed crate vanished between two stations without the train stopping.'],['Town Doctor','Help travelers and residents while hearing stories nobody else gets told.','A miner arrives with a pocket watch that belongs to a man presumed missing.']
];
roleGrid.innerHTML=roles.map((r,i)=>`<article class="role-card"><h3>${r[0]}</h3><p>${r[1]}</p><button class="secondary" data-role="${i}">Play This Role</button></article>`).join('');$$('[data-role]').forEach(b=>b.onclick=()=>{const r=roles[+b.dataset.role];state.role=r[0];reward(2,null,`Played as ${r[0]}`);rolePanel.innerHTML=`<h3>You are the ${r[0]}.</h3><p>${r[2]}</p><p><strong>Your move:</strong> look around, ask questions, head out of town, or ignore the trouble and get some pie.</p>`;});

const adventures=[
{id:'rail',icon:'🚂',title:'The Midnight Express',desc:'Board a night train carrying passengers, mail, valuables—and one person using a false name.',steps:[['The conductor quietly asks for help. A passenger vanished between cars.','Search the sleeper car','Check the baggage car'],['A suitcase sits open beneath a window. Inside is a map with one station circled.','Question the porter','Keep the map'],['The train slows near an abandoned water tower. A lantern flashes twice from the darkness.','Signal back','Tell the conductor']],item:'Silver train whistle'},
{id:'ranch',icon:'🐂',title:'Ranch Day',desc:'Spend a day on the open range: cattle, weather, fences, horses, and whatever trouble rides in.',steps:[['You find fresh hoofprints along a broken fence.','Follow the tracks','Repair the fence first'],['Clouds gather over the ridge while the herd grows restless.','Move the herd','Wait and watch'],['A stray calf is discovered near the creek.','Bring it home','Search for its mother']],item:'Ranch brand token'},
{id:'ghosttown',icon:'🏚️',title:'Whispering Mesa Ghost Town',desc:'Explore an abandoned mining settlement where a lantern has been seen moving after midnight.',steps:[['The main street is empty, but one upstairs curtain moves.','Enter the hotel','Check the old assay office'],['A dusty ledger lists a shipment that supposedly never arrived.','Take a rubbing','Search the desk'],['A floorboard creaks behind you. Nobody is there.','Follow the sound','Step outside']],item:'Ghost-town coin'},
{id:'trail',icon:'🌵',title:'Canyon Trail Expedition',desc:'Ride beyond town with no fixed destination and see what the territory gives you.',steps:[['A fork leads toward red cliffs or cottonwood trees.','Ride toward the cliffs','Follow the trees'],['You discover a half-buried wagon wheel beside a faded trail marker.','Dig nearby','Photograph it in your journal'],['At sunset, campfire smoke appears on the far ridge.','Ride closer','Make your own camp']],item:'Painted trail stone'}
];
adventureGrid.innerHTML=adventures.map(a=>`<article class="adventure-card"><span class="big-icon">${a.icon}</span><h3>${a.title}</h3><p>${a.desc}</p><button class="primary" data-adventure="${a.id}">Start Adventure</button></article>`).join('');
let activeAdventure=null, adventureStep=0;function renderAdventure(){const a=activeAdventure,s=a.steps[adventureStep];adventureStage.innerHTML=`<p class="kicker">${a.title.toUpperCase()}</p><h3>${s[0]}</h3><div class="action-row">${s.slice(1).map((x,i)=>`<button class="secondary adv-choice" data-i="${i}">${x}</button>`).join('')}</div><p class="outcome" id="advOutcome"></p>`;$$('.adv-choice').forEach(b=>b.onclick=()=>{$('#advOutcome').textContent=`You choose: ${b.textContent}. The territory remembers your decision.`;adventureStep++;if(adventureStep<a.steps.length)setTimeout(renderAdventure,650);else {reward(4,a.item,`Completed ${a.title}`);setTimeout(()=>adventureStage.innerHTML=`<h3>Adventure complete—for now.</h3><p>You return to Dusty Trail with a new story and <strong>${a.item}</strong> in your keepsakes.</p><button class="secondary" onclick="showView('adventures')">Choose Another Adventure</button>`,650);}});}
$$('[data-adventure]').forEach(b=>b.onclick=()=>{activeAdventure=adventures.find(a=>a.id===b.dataset.adventure);adventureStep=0;renderAdventure();});

const cases={payroll:{title:'The Case of the Vanishing Payroll',badge:'Case #001',intro:'The railroad payroll vanished from a locked office at 8:15 PM.',answer:'Eli Mercer',solution:'The strongest evidence points toward Eli Mercer: he knew the office and had paid a locksmith. The rear-window detail suggests the scene may have been staged or that someone else helped.',suspects:[{name:'Eli Mercer',job:'Rail clerk',text:'Says he left at 7:50 PM, but the night watchman remembers seeing his lamp still on.',clue:'A torn receipt in his desk shows a locksmith payment.'},{name:'Nora Bell',job:'Hotel owner',text:'Says she never went near the rail office, though muddy boot prints lead toward the hotel alley.',clue:'Her boots are clean—the prints are one size larger.'},{name:'Cal Boone',job:'Freight driver',text:'Claims his wagon broke down outside town and he arrived after 9 PM.',clue:'The stable ledger confirms his horse was checked in at 9:12 PM.'},{name:'Martha Quinn',job:'Telegraph operator',text:'Says the office door was still locked when she sent the 8:05 message.',clue:'She heard metal scraping from the rear window at 8:10 PM.'}]},ghost:{title:'The Lantern at Whispering Mesa',badge:'Case #002',intro:'A moving lantern has appeared in the windows of an abandoned ghost town three nights in a row.',answer:'Jonah Pike',solution:'Jonah Pike has been using the abandoned hotel to secretly search old records for a lost mine claim. The “ghost lantern” was real light, but the haunting story grew around it.',suspects:[{name:'Jonah Pike',job:'Prospector',text:'Says he has not visited Whispering Mesa in years.',clue:'Red dust matching the ghost town road is packed into his boot heels.'},{name:'Ada Frost',job:'Schoolteacher',text:'Admits watching the lights through a telescope.',clue:'Her notebook records the light appearing at nearly the same time each night.'},{name:'Sam Doolin',job:'Teamster',text:'Claims ghosts are bad for business and refuses to go near the place.',clue:'His wagon mileage log supports that he was on the south road.'},{name:'Lena Ward',job:'Photographer',text:'Went there in daylight to photograph ruins but left before dark.',clue:'One photograph shows a recently oiled hotel door hinge.'}]}};
let currentCase='payroll',found=new Set();function loadCase(id){currentCase=id;found=new Set();const c=cases[id];caseTitle.textContent=c.title;caseBadge.textContent=c.badge;caseIntro.textContent=c.intro;clueCount.textContent=0;clueTotal.textContent=c.suspects.length;accuseBtn.disabled=true;mysteryPanel.innerHTML='<h3>Start by questioning people.</h3><p>Some statements are facts, some are suspicious, and some are distractions.</p>';suspectCards.innerHTML=c.suspects.map((s,i)=>`<article class="suspect"><h3>${s.name}</h3><p><em>${s.job}</em></p><p>${s.text}</p><button class="secondary" data-question="${i}">Question</button></article>`).join('');$$('[data-question]').forEach(b=>b.onclick=()=>{const i=+b.dataset.question;found.add(i);clueCount.textContent=found.size;mysteryPanel.innerHTML=`<h3>Clue from ${c.suspects[i].name}</h3><p>${c.suspects[i].clue}</p>`;accuseBtn.disabled=found.size<3;});$$('.case-choice').forEach(x=>x.classList.toggle('active',x.dataset.case===id));}
$$('.case-choice').forEach(b=>b.onclick=()=>loadCase(b.dataset.case));accuseBtn.onclick=()=>{const c=cases[currentCase];mysteryPanel.innerHTML=`<h3>Case conclusion</h3><p><strong>${c.answer}</strong> is the strongest suspect.</p><p>${c.solution}</p><p>Case status: <strong>Solved.</strong></p>`;reward(5,`Case badge: ${c.badge}`,`Solved ${c.title}`);};loadCase('payroll');

function gameDraw(){const a=Math.ceil(Math.random()*12),b=Math.ceil(Math.random()*12);gameBox.innerHTML=`<h3>Quick Draw Math</h3><p>Solve the frontier arithmetic.</p><p class="clue-count">${a} × ${b} = ?</p><input id="mathAns" inputmode="numeric" /> <button class="primary" id="mathBtn">Fire!</button><p id="mathMsg"></p>`;mathBtn.onclick=()=>{if(Number(mathAns.value)===a*b){mathMsg.textContent='Bullseye! Correct.';reward(1,null,'Won Quick Draw Math');}else mathMsg.textContent='Not quite—try another shot.';};}
function gameWanted(){const q=[['This person runs the newspaper and loves a good scoop.','journalist'],['This person keeps track of horses and saddles.','stable'],['This person may know who checked into town last night.','hotel'],['This person sends urgent messages over wires.','telegraph']];const [clue,ans]=q[Math.floor(Math.random()*q.length)];gameBox.innerHTML=`<h3>Wanted Poster Guess</h3><p>${clue}</p><input id="guessAns" placeholder="Who is it?" /> <button class="primary" id="guessBtn">Guess</button><p id="guessMsg"></p>`;guessBtn.onclick=()=>{if(guessAns.value.toLowerCase().includes(ans)){guessMsg.textContent='Yep! You got it.';reward(1);}else guessMsg.textContent=`Close. Look for the key idea: ${ans}.`;};}
function gameTrail(){gameBox.innerHTML=`<h3>Trail Choice</h3><p>You reach a fork at sundown. Which route do you choose?</p><div class="action-row"><button class="secondary trail-choice">Canyon Road</button><button class="secondary trail-choice">River Trail</button><button class="secondary trail-choice">Old Rail Path</button></div><p id="trailMsg"></p>`;const m={'Canyon Road':'You find a campfire still warm—but nobody nearby.','River Trail':'You discover wagon tracks disappearing into the shallows.','Old Rail Path':"A telegraph pole is marked with a symbol you don't recognize."};$$('.trail-choice').forEach(b=>b.onclick=()=>{trailMsg.textContent=m[b.textContent];reward(1);});}
function gameLuck(){gameBox.innerHTML=`<h3>Lucky Horseshoe</h3><p>Pick one of three horseshoes. One earns a lucky keepsake.</p><div class="horseshoes"><button class="horseshoe">🧲</button><button class="horseshoe">🧲</button><button class="horseshoe">🧲</button></div><p id="luckMsg"></p>`;const lucky=Math.floor(Math.random()*3);$$('.horseshoe').forEach((b,i)=>b.onclick=()=>{luckMsg.textContent=i===lucky?'Lucky throw! You found a polished horseshoe charm.':'That one landed in the dust. Try the next round!';if(i===lucky)reward(2,'Polished horseshoe charm','Won Lucky Horseshoe');});}
function gameWord(){const words=[['SHERIFF','FIRSEHF'],['SALOON','NOOLAS'],['CANYON','NOCYNA'],['SADDLE','DASDLE'],['OUTLAW','WTAOLU']];const [ans,scr]=words[Math.floor(Math.random()*words.length)];gameBox.innerHTML=`<h3>Frontier Word Scramble</h3><p>Unscramble: <strong class="clue-count">${scr}</strong></p><input id="wordAns" /> <button class="primary" id="wordBtn">Check</button><p id="wordMsg"></p>`;wordBtn.onclick=()=>{if(wordAns.value.trim().toUpperCase()===ans){wordMsg.textContent=`Correct: ${ans}!`;reward(1);}else wordMsg.textContent='Not yet—give it another try.';};}
const gameFns={draw:gameDraw,wanted:gameWanted,trail:gameTrail,luck:gameLuck,word:gameWord};$$('.game-tab').forEach(t=>t.onclick=()=>{$$('.game-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');gameFns[t.dataset.game]();});gameDraw();

const history=[
['FACT','Cattle Drives','Large cattle drives moved herds from Texas toward railheads, especially in the decades after the Civil War.'],['MOVIE MYTH','Quick-Draw Duels','Formal noon showdowns in the middle of a street were far less common than Western movies make them seem.'],['FACT','Boomtowns','Mining discoveries could cause towns to grow quickly—and shrink just as fast when resources or money dried up.'],['LEGEND + FACT','Famous Outlaws','Some real criminals became folk legends because newspapers, dime novels, and later films exaggerated their lives.'],['FACT','Women in the West','Women worked as ranchers, business owners, teachers, writers, performers, homesteaders, and more.'],['MYTH CHECK','The “Wild” West','Daily life also involved farming, trade, family, law, labor, community, migration, and routine—not nonstop gunfights.'],['FACT','Railroads','Railroads reshaped travel, trade, settlement, timekeeping, and communication across western territories.'],['HISTORY LENS','Many Wests','The American West included Indigenous nations, Mexican and Mexican American communities, Black settlers and cowboys, immigrants, soldiers, traders, ranchers, farmers, miners, townspeople, and many others.']
];historyGrid.innerHTML=history.map(h=>`<article class="history-card"><span class="type">${h[0]}</span><h3>${h[1]}</h3><p>${h[2]}</p></article>`).join('');

const editions=[
['STRANGE LIGHT SEEN BEYOND CANYON RIDGE','Several residents insist a lantern moved through the abandoned mining settlement after midnight.'],['WESTBOUND TRAIN ARRIVES WITHOUT MAIL BAG','Rail workers are asking how a locked mail car reached Dusty Trail one bag short.'],['MYSTERY HORSE WANDERS INTO TOWN','The mare is well groomed, well fed, and wearing a saddle marked with an unfamiliar brand.'],['PIE CONTEST ENDS IN TIE — ARGUMENT CONTINUES','The judges agree the apple and peach entries were equally good. The bakers absolutely do not agree.']
];
const notices=['Town meeting Friday evening at the chapel. Bring a chair if you have one.','Lost: one blue scarf, last seen near the livery stable.','Volunteers wanted to repair the footbridge after last week’s rain.'];
const rumors=['Someone says the hotel has a room that is never rented.','A prospector claims the canyon echoes words that nobody said.','Folks insist Deputy Mae can identify any horse in town by its hoofbeat.'];
const ads=['PRAIRIE KITCHEN — Hot coffee, warm biscuits, no questions asked before breakfast.','GOLDEN SPUR SALOON — Piano nightly. Tall tales free with purchase.','GENERAL STORE — Rope, soap, flour, buttons, peppermints, and whatever else you forgot.'];
function newEdition(){const [h,l]=editions[Math.floor(Math.random()*editions.length)];gazetteHeadline.textContent=h;gazetteLead.textContent=l;gazetteNotice.textContent=notices[Math.floor(Math.random()*notices.length)];gazetteRumor.textContent=rumors[Math.floor(Math.random()*rumors.length)];gazetteAd.textContent=ads[Math.floor(Math.random()*ads.length)];}
$('[data-action="new-edition"]').onclick=newEdition;$('[data-action="investigate-headline"]').onclick=()=>{showView(gazetteHeadline.textContent.includes('LIGHT')?'mystery':'explore');toast('The headline just became your next lead.');};newEdition();

const porchStories=['A lantern glows inside the hotel as a late traveler signs the guest book. Nobody is in a hurry.','A warm breeze moves across the street, carrying piano music and the smell of coffee from the kitchen.','The horses settle into the stable while the sky turns deep orange behind the hills.','Someone laughs softly inside the Prairie Kitchen. A screen door closes, then the street grows peaceful again.'];
const porchScenes=['Night settles over Dusty Trail. Stars brighten above the rooftops, and the street finally goes quiet.','Morning comes slowly. Storekeepers sweep their porches while a wagon creaks toward town.','A light rain taps the awning. Nobody seems bothered; folks just move their chairs farther under the porch.','The sunset turns the whole street copper and gold. Even the busiest folks slow down for a minute.'];
$('[data-action="porch-story"]').onclick=()=>porchText.textContent=porchStories[Math.floor(Math.random()*porchStories.length)];$('[data-action="porch-scene"]').onclick=()=>porchText.textContent=porchScenes[Math.floor(Math.random()*porchScenes.length)];$('[data-action="porch-silence"]').onclick=()=>porchText.textContent='You sit. The town carries on without asking anything from you.';

function openJournal(){journalBody.innerHTML=`<div class="journal-grid"><section><h3>Current Role</h3><p>${state.role}</p><h3>Reputation</h3><p>${state.rep} stars</p><h3>Places Visited</h3><p>${state.visited.length?state.visited.join(', '):'None yet. Wander whenever you feel like it.'}</p></section><section><h3>Keepsakes</h3>${state.items.length?`<ul>${state.items.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>Your saddlebag is empty—for now.</p>'}<h3>Discoveries</h3>${state.discoveries.length?`<ul>${state.discoveries.slice(-12).map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>No discoveries recorded yet.</p>'}</section></div>`;journalDialog.showModal();}
$('[data-action="open-journal"]').onclick=openJournal;$('[data-action="close-journal"]').onclick=()=>journalDialog.close();$('[data-action="reset-progress"]').onclick=()=>{if(confirm('Reset role, reputation, keepsakes, visits, and discoveries?')){state={...defaultState};save();journalDialog.close();toast('Western World progress reset.');}};
renderStatus();

// VERSION 3: Big territory expansion
state.territories = state.territories || [];
state.campaign = state.campaign || 0;
state.festivalWins = state.festivalWins || 0;
save();

const territoryData=[
 {name:'Copper Creek',icon:'🏘️',tag:'Neighboring Town',desc:'A lively cattle-and-rail town with a suspiciously busy freight yard.',hook:'A sealed freight crate arrived under a false name.'},
 {name:'Whispering Mesa',icon:'🏚️',tag:'Ghost Town',desc:'Abandoned storefronts, old mine works, and a lantern nobody can explain.',hook:'Fresh bootprints cross a street abandoned for twenty years.'},
 {name:'Red Rock Ranch',icon:'🐂',tag:'Ranch Country',desc:'Open range, cattle work, horses, fence repairs, and ranch-house stories.',hook:'A section of fence was cut cleanly during the night.'},
 {name:'Silver Needle Mine',icon:'⛏️',tag:'Mining Country',desc:'A former silver camp reopening after an old survey map turns up.',hook:'The map shows a tunnel that does not appear on company records.'},
 {name:'Canyon Ridge',icon:'🌄',tag:'Open Trail',desc:'High desert trail, hidden springs, wagon tracks, and lookout points.',hook:'Smoke rises from a canyon where no camp is registered.'},
 {name:'Blackwater Crossing',icon:'🌉',tag:'River Settlement',desc:'A ferry crossing, trading post, courthouse annex, and muddy river road.',hook:'A witness in an upcoming trial disappeared before dawn.'}
];

function renderTerritory(){
 const map=document.getElementById('territoryMap'); if(!map)return;
 map.innerHTML=territoryData.map((t,i)=>`<button class="territory-card" data-territory="${i}"><span style="font-size:2rem">${t.icon}</span><strong>${t.name}</strong><small>${t.tag}</small><span>${t.desc}</span></button>`).join('');
 document.querySelectorAll('[data-territory]').forEach(b=>b.onclick=()=>openTerritory(+b.dataset.territory));
}
function openTerritory(i){
 const t=territoryData[i];
 if(!state.territories.includes(t.name)) state.territories.push(t.name);
 save(); renderStatus();
 territoryPanel.innerHTML=`<h3>${t.icon} ${t.name}</h3><p>${t.desc}</p><p><strong>Current rumor:</strong> ${t.hook}</p><div class="travel-row"><button class="primary travel-choice" data-mode="horse">🐎 Ride Horse</button><button class="secondary travel-choice" data-mode="stagecoach">🚌 Stagecoach</button><button class="secondary travel-choice" data-mode="train">🚂 Train</button></div><div id="travelResult" class="route-log">Choose how you want to travel—or don't go yet.</div>`;
 document.querySelectorAll('.travel-choice').forEach(btn=>btn.onclick=()=>travelTo(t,btn.dataset.mode));
}
function travelTo(t,mode){
 const scenes={horse:`You ride toward ${t.name} at your own pace, stopping once where the trail overlooks miles of open country.`,stagecoach:`The stagecoach rattles toward ${t.name}. Halfway there, another passenger quietly asks whether you've heard the latest rumor.`,train:`The train pulls out in a cloud of steam. By the time ${t.name} comes into view, a conductor has slipped you a folded note.`};
 document.getElementById('travelResult').innerHTML=`<strong>Arrival:</strong> ${scenes[mode]}<br><br><strong>Lead:</strong> ${t.hook}<div class="travel-row"><button class="secondary" id="territoryInvestigate">Investigate</button><button class="secondary" id="territoryWander">Just Wander</button></div>`;
 reward(1,null,`Visited ${t.name} by ${mode}`);
 document.getElementById('territoryInvestigate').onclick=()=>territoryEncounter(t);
 document.getElementById('territoryWander').onclick=()=>document.getElementById('travelResult').innerHTML+=`<p>You wander without taking a case. You notice a bakery, two horses tied outside a store, and three people arguing about tomorrow's weather. Nothing demands your attention.</p>`;
}
function territoryEncounter(t){
 const encounters={
 'Copper Creek':'At the freight yard you find a crate stamped “farm tools,” but the weight ledger lists it at nearly half a ton. The clerk swears the paperwork came from Dusty Trail.',
 'Whispering Mesa':'The fresh bootprints lead behind the assay office, where someone has hidden food, lamp oil, and a recently used bedroll.',
 'Red Rock Ranch':'The cut fence has no broken wire ends. Someone used proper fence cutters, then carefully moved the loose strand aside.',
 'Silver Needle Mine':'Inside the office, an old survey book references “Tunnel C.” The current foreman insists the mine has only A and B.',
 'Canyon Ridge':'The smoke belongs to a tiny signal fire. Beside it lies a strip of blue cloth matching a missing-traveler notice from town.',
 'Blackwater Crossing':'The missing witness left a courthouse receipt in the ferry shed. Written on the back: “Do not trust the man with the silver watch.”'
 };
 territoryPanel.innerHTML+=`<div class="campaign-banner"><h3>Territory Discovery</h3><p>${encounters[t.name]}</p><button class="primary" id="saveLead">Save This Lead</button></div>`;
 document.getElementById('saveLead').onclick=()=>{reward(2,`${t.name} territory stamp`,`Found a lead in ${t.name}`);toast('Lead saved in your Trail Journal.');};
}
renderTerritory();

// Add new home card and a campaign banner
const homeGrid=document.querySelector('#home .choice-grid');
if(homeGrid && !document.querySelector('[data-jump="territory"]')) homeGrid.insertAdjacentHTML('beforeend','<article class="choice-card rust" data-jump="territory"><span class="icon">🗺️</span><h3>Ride the Territory</h3><p>Travel to neighboring towns, ranch country, mines, canyon trails, and river settlements.</p></article>');
document.querySelectorAll('[data-jump]').forEach(c=>c.onclick=()=>showView(c.dataset.jump));

// Expand adventures into longer story campaigns without removing existing adventures
const oldAdventureRender=typeof renderAdventures==='function'?renderAdventures:null;
const campaignSteps=[
 {title:'Chapter 1 — The Missing Ledger',text:'A freight ledger disappears from the Dusty Trail depot the same evening an unmarked wagon leaves town.'},
 {title:'Chapter 2 — Road to Copper Creek',text:'The wagon tracks point east. In Copper Creek, somebody paid cash to store a heavy crate under a false name.'},
 {title:'Chapter 3 — The Cut Fence',text:'A rancher reports a fence deliberately opened along the same back-road route used by the wagon.'},
 {title:'Chapter 4 — Silver Needle',text:'A mining survey reveals an abandoned service tunnel large enough to hide freight.'},
 {title:'Chapter 5 — Courthouse Day',text:'Evidence leads to a hearing at Blackwater Crossing, where you must decide which testimony actually fits the facts.'}
];
function injectCampaign(){
 const section=document.getElementById('adventures'); if(!section || document.getElementById('campaignBlock'))return;
 const block=document.createElement('div');block.id='campaignBlock';block.className='campaign-banner';
 block.innerHTML=`<p class="kicker">LONG STORY CAMPAIGN</p><h3>The Freight Road Conspiracy</h3><p>A five-chapter mystery-adventure that moves across the territory. You can stop after any chapter and come back later.</p><div class="story-chain" id="campaignSteps"></div><button class="primary" id="campaignNext">Continue Campaign</button>`;
 section.querySelector('.section-heading').after(block);
 renderCampaign();
}
function renderCampaign(){
 const box=document.getElementById('campaignSteps'); if(!box)return;
 box.innerHTML=campaignSteps.map((s,i)=>`<div class="story-step ${i<state.campaign?'done':''}"><strong>${i<state.campaign?'✓ ':''}${s.title}</strong><p>${i<state.campaign?s.text:(i===state.campaign?'Ready when you are.':'Locked until the previous chapter is visited.')}</p></div>`).join('');
 const btn=document.getElementById('campaignNext');
 btn.textContent=state.campaign>=campaignSteps.length?'Campaign Complete — Replay Finale':`Play Chapter ${Math.min(state.campaign+1,campaignSteps.length)}`;
 btn.onclick=playCampaignStep;
}
function playCampaignStep(){
 let i=Math.min(state.campaign,campaignSteps.length-1);const step=campaignSteps[i];
 const choices=[
  ['Inspect the evidence','You notice one detail everyone else overlooked. The wagon route and freight times finally line up.'],
  ['Question a witness','The witness hesitates at exactly the wrong part of the story, giving you a new angle.'],
  ['Follow the trail','The trail is faint, but it leads to a mark cut into a post—the same symbol found on a freight receipt.']
 ];
 adventureStage.innerHTML=`<h3>${step.title}</h3><p>${step.text}</p><div class="court-options">${choices.map((c,n)=>`<button class="secondary campaign-choice" data-c="${n}">${c[0]}</button>`).join('')}</div><div id="campaignResult" class="route-log"></div>`;
 document.querySelectorAll('.campaign-choice').forEach(b=>b.onclick=()=>{
   campaignResult.textContent=choices[+b.dataset.c][1];
   if(state.campaign<campaignSteps.length){state.campaign++;reward(3,null,`Completed ${step.title}`);save();renderCampaign();}
 });
}
injectCampaign();

// Courthouse interactive sequence
function courthouseTrial(){
 adventureStage.innerHTML=`<h3>⚖️ Blackwater Courthouse Hearing</h3><p>Three statements conflict. Which piece of evidence deserves the most weight?</p><div class="court-options"><button class="secondary courtPick" data-good="0">A loud rumor repeated by five people</button><button class="secondary courtPick" data-good="1">A dated freight receipt matching the train ledger</button><button class="secondary courtPick" data-good="0">The defendant's reputation around town</button></div><div id="courtResult" class="route-log"></div>`;
 document.querySelectorAll('.courtPick').forEach(b=>b.onclick=()=>{courtResult.textContent=b.dataset.good==='1'?'Strong choice. The dated receipt is direct documentary evidence and can be checked against another record.':'That may matter to the story, but it is weaker than verifiable documentary evidence.';if(b.dataset.good==='1')reward(2,'Courthouse observer badge','Completed courthouse evidence challenge');});
}

// Festival
const festivalData=[
 {icon:'🥧',title:'Pie Contest',text:'Judge apple, peach, and blackberry entries—or just eat a slice.',act:'pie'},
 {icon:'🎯',title:'Tin-Can Toss',text:'Three throws. Aim for the center stack.',act:'toss'},
 {icon:'🎻',title:'Music Pavilion',text:'Listen to fiddle tunes and choose the next dance.',act:'music'},
 {icon:'🐴',title:'Horse Parade',text:'Pick your favorite parade horse and learn its name.',act:'horse'},
 {icon:'🧺',title:'Market Row',text:'Browse handmade goods, candy jars, cloth, tools, and curiosities.',act:'market'},
 {icon:'📣',title:'Tall-Tale Stage',text:'Hear a ridiculous frontier story and decide whether to top it.',act:'tale'}
];
function renderFestival(){
 const g=document.getElementById('festivalGrid');if(!g)return;
 g.innerHTML=festivalData.map(f=>`<article class="festival-card"><div class="big">${f.icon}</div><h3>${f.title}</h3><p>${f.text}</p><button class="secondary fest-btn" data-fest="${f.act}">Visit</button></article>`).join('');
 document.querySelectorAll('.fest-btn').forEach(b=>b.onclick=()=>festivalPlay(b.dataset.fest));
}
function festivalPlay(act){
 const results={pie:'You sample all three pies. The blackberry has the flakiest crust, but the peach filling gets the loudest crowd reaction.',music:'The band launches into a lively tune. Couples spin under lanterns while children clap from the edge of the platform.',horse:'You choose a chestnut mare named Ruby Tuesday. Her owner gives you a little ribbon from the parade bridle.',market:'You browse without buying anything. One table has carved horses, polished stones, old postcards, and a brass compass.',tale:'An old ranch hand claims he once rode a tornado “until it got tired.” Nobody believes him, which only improves the story.'};
 if(act==='toss'){
   const score=Math.floor(Math.random()*4);festivalStage.innerHTML=`<h3>🎯 Tin-Can Toss</h3><p>You knock down <strong>${score}</strong> of 3 stacks.</p><button class="secondary" id="tossAgain">Throw Again</button>`;if(score===3){state.festivalWins++;reward(2,'Founders Day blue ribbon','Won Tin-Can Toss');}document.getElementById('tossAgain').onclick=()=>festivalPlay('toss');return;
 }
 festivalStage.innerHTML=`<h3>${festivalData.find(x=>x.act===act).title}</h3><p>${results[act]}</p>`;
 if(act==='horse')reward(1,'Red parade ribbon','Visited the Horse Parade');
}
renderFestival();

// Add direct buttons into existing adventure area for new gameplay
if(document.getElementById('adventureGrid')){
 adventureGrid.insertAdjacentHTML('beforeend',`<article class="adventure-card"><span class="icon">⚖️</span><h3>Courthouse Day</h3><p>Test evidence and testimony in a frontier hearing.</p><button class="secondary" id="courtAdventure">Enter Courthouse</button></article><article class="adventure-card"><span class="icon">🐂</span><h3>Cattle Drive</h3><p>Manage weather, water, strays, and trail choices across open country.</p><button class="secondary" id="driveAdventure">Start Drive</button></article><article class="adventure-card"><span class="icon">🕵️</span><h3>Outlaw Hideout</h3><p>Scout an abandoned line shack rumored to be hiding stolen freight.</p><button class="secondary" id="hideoutAdventure">Scout Hideout</button></article><article class="adventure-card"><span class="icon">⛏️</span><h3>Mine Expedition</h3><p>Choose how far to explore an old survey tunnel.</p><button class="secondary" id="mineAdventure">Enter Mine</button></article>`);
 document.getElementById('courtAdventure').onclick=courthouseTrial;
 document.getElementById('driveAdventure').onclick=()=>cattleDrive(0);
 document.getElementById('hideoutAdventure').onclick=outlawHideout;
 document.getElementById('mineAdventure').onclick=mineExplore;
}
function cattleDrive(stage){
 const steps=[
  ['Morning Start','A storm is building west of the herd.','Take the ridge trail','Stay low near the creek'],
  ['Midday Water','The usual water hole is muddy after heavy rain.','Use it carefully','Ride two miles to a spring'],
  ['Stray Cattle','Three steers break toward a brushy ravine.','Send two riders','Turn the whole herd slowly'],
  ['Night Camp','Coyotes start calling beyond the firelight.','Double the watch','Keep normal watch and rest']
 ];
 if(stage>=steps.length){adventureStage.innerHTML='<h3>🐂 Cattle Drive Complete</h3><p>The herd reaches the rail pens by morning. Dusty, tired, and intact.</p>';reward(4,'Cattle drive trail token','Completed the cattle drive');return;}
 const s=steps[stage];adventureStage.innerHTML=`<h3>🐂 ${s[0]}</h3><p>${s[1]}</p><div class="court-options"><button class="secondary drivePick">${s[2]}</button><button class="secondary drivePick">${s[3]}</button></div><div id="driveLog" class="route-log"></div>`;
 document.querySelectorAll('.drivePick').forEach(b=>b.onclick=()=>{driveLog.textContent=`You choose: ${b.textContent}. The herd settles and the drive continues.`;setTimeout(()=>cattleDrive(stage+1),450);});
}
function outlawHideout(){
 adventureStage.innerHTML=`<h3>🕵️ Outlaw Hideout Scout</h3><p>The line shack looks abandoned, but a horse was tied here recently.</p><div class="court-options"><button class="secondary hidePick">Circle around back</button><button class="secondary hidePick">Check the horse tracks</button><button class="secondary hidePick">Look through the window</button></div><div id="hideLog" class="route-log"></div>`;
 const clues={'Circle around back':'Behind the shack: fresh bootprints and a torn freight label.','Check the horse tracks':'The tracks match a shoe pattern recorded at the Dusty Trail stable.','Look through the window':'Inside: canned food, two bedrolls, and a locked crate stamped with railroad initials.'};
 document.querySelectorAll('.hidePick').forEach(b=>b.onclick=()=>{hideLog.textContent=clues[b.textContent];reward(1,null,'Scouted the outlaw hideout');});
}
function mineExplore(){
 adventureStage.innerHTML=`<div class="mine-shaft"><h3>⛏️ Silver Needle Mine</h3><p>Your lantern reveals three possible routes.</p><div class="court-options"><button class="secondary minePick">Old timber passage</button><button class="secondary minePick">Marked Tunnel B</button><button class="secondary minePick">Unmarked side tunnel</button></div><div id="mineLog" class="route-log"></div></div>`;
 const r={'Old timber passage':'The supports creak. You decide not to push your luck and mark the unsafe route on your map.','Marked Tunnel B':'You find abandoned tools and a chalk date from six years earlier.','Unmarked side tunnel':'Behind loose boards is a survey marker reading “C.” The supposedly nonexistent tunnel is real.'};
 document.querySelectorAll('.minePick').forEach(b=>b.onclick=()=>{mineLog.textContent=r[b.textContent];if(b.textContent==='Unmarked side tunnel')reward(3,'Silver Needle survey marker','Discovered Tunnel C');});
}

// Expand the journal with territory and campaign progress by wrapping original journal opener
const oldOpenJournal=openJournal;
openJournal=function(){
 oldOpenJournal();
 const body=document.getElementById('journalBody');
 body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Territory Passport</h3><p>${state.territories.length?state.territories.map(x=>`<span class="territory-stamp">${x}</span>`).join(''):'No territory stamps yet.'}</p><h3>Freight Road Campaign</h3><p>${Math.min(state.campaign,campaignSteps.length)} of ${campaignSteps.length} chapters completed.</p><h3>Festival Wins</h3><p>${state.festivalWins||0}</p></section>`);
};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

// Add more world events
if(typeof townEvents!=='undefined') townEvents.push(
 ['A cattle herd blocks the east road.','The trail boss says one steer refuses to move until somebody retrieves a red blanket from the ditch.'],
 ['The courthouse bell rings twice before noon.','Nobody scheduled a hearing, yet three riders are already tying horses outside.'],
 ['A prospector buys every candle in the General Store.','He will not say why, but his boots are covered in pale gray mine dust.'],
 ['Founders Day bunting appears overnight.','By breakfast, the entire main street is preparing for music, contests, food, and a parade.']
);

// Surprise Me now includes the new sections naturally if the original list exists

// ===== VERSION 4: PEOPLE, BOUNTIES, BANK CASE, DOCTOR CALLS, CARDS, SCAVENGER HUNT, ACHIEVEMENTS =====
state.relationships=state.relationships||{};
state.bounties=state.bounties||[];
state.achievements=state.achievements||[];
state.bankCase=state.bankCase||0;
state.doctorCases=state.doctorCases||0;
state.scavenger=state.scavenger||[];
save();

const people=[
 {id:'mae',icon:'⭐',name:'Deputy Mae Carter',job:'Deputy Sheriff',bio:'Sharp-eyed, practical, and almost impossible to surprise.',prompt:'Mae is comparing bootprints from two different cases.'},
 {id:'eli',icon:'📰',name:'Eli Mercer',job:'Gazette Editor',bio:'Believes every quiet afternoon is suspiciously short on headlines.',prompt:'Eli wants to know whether a rumor deserves ink.'},
 {id:'rosa',icon:'🥧',name:'Rosa Bell',job:'Prairie Kitchen Owner',bio:'Feeds half the town and somehow hears the other half talking.',prompt:'Rosa has saved you the last piece of blackberry pie.'},
 {id:'isaac',icon:'🐴',name:'Isaac Cole',job:'Stable Keeper',bio:'Understands horses better than most people and people better than he admits.',prompt:'Isaac found a strange horseshoe near the canyon road.'},
 {id:'doc',icon:'🩺',name:'Dr. Clara Boone',job:'Town Doctor',bio:'Calm under pressure, observant, and very hard to fool.',prompt:'Dr. Boone needs a second pair of eyes on an unusual emergency.'},
 {id:'sam',icon:'🚂',name:'Samuel Reed',job:'Stationmaster',bio:'Knows every scheduled train—and notices the unscheduled ones.',prompt:'Samuel has a telegram that arrived without a sender name.'},
 {id:'ada',icon:'🎹',name:'Ada Quinn',job:'Saloon Pianist',bio:'Plays beautifully and remembers every conversation people think she cannot hear.',prompt:'Ada heard a name whispered during last night’s card game.'},
 {id:'jonas',icon:'⛏️',name:'Jonas Pike',job:'Prospector',bio:'Optimistic, dusty, and forever one ridge away from a fortune.',prompt:'Jonas insists his newest map is different from all his previous “newest maps.”'}
];
function relationshipName(n){return n>=8?'Trusted Friend':n>=4?'Friendly':n>=1?'Acquainted':n<=-4?'Rival':'New Face';}
function renderPeople(){const g=document.getElementById('peopleGrid');if(!g)return;g.innerHTML=people.map(p=>{const v=state.relationships[p.id]||0;const width=Math.max(8,Math.min(100,50+v*6));return `<article class="person-card"><div class="person-face">${p.icon}</div><h3>${p.name}</h3><p class="kicker">${p.job}</p><p>${p.bio}</p><div class="relationship-label">${relationshipName(v)} • ${v>=0?'+':''}${v}</div><div class="relationship-meter"><span style="width:${width}%"></span></div><button class="secondary meet-person" data-person="${p.id}">Spend Time</button></article>`}).join('');document.querySelectorAll('.meet-person').forEach(b=>b.onclick=()=>meetPerson(b.dataset.person));}
function meetPerson(id){const p=people.find(x=>x.id===id);peoplePanel.innerHTML=`<h3>${p.icon} ${p.name}</h3><p>${p.prompt}</p><div class="person-actions"><button class="secondary person-choice" data-d="2">Offer to help</button><button class="secondary person-choice" data-d="1">Talk awhile</button><button class="secondary person-choice" data-d="1">Share a joke</button><button class="secondary person-choice" data-d="-1">Disagree sharply</button></div><p id="peopleOutcome" class="outcome"></p>`;document.querySelectorAll('.person-choice').forEach(b=>b.onclick=()=>{const d=+b.dataset.d;state.relationships[id]=(state.relationships[id]||0)+d;const msg=d>1?`${p.name} appreciates that you stepped in to help.`:d>0?`You spend a little time together. Dusty Trail feels more familiar.`:`The conversation gets a little prickly. Nothing a future visit cannot fix.`;peopleOutcome.textContent=msg;reward(Math.max(0,d),null,`Spent time with ${p.name}`);renderPeople();checkAchievements();});}
renderPeople();

const bountyCases=[
 {id:'mare',title:'MISSING: Blue Ribbon Mare',reward:'$18 reward',text:'Prize mare vanished from a locked stable. Gate still latched.',steps:['Inspect the latch','Follow hoofprints','Question the night watch'],item:'Braided blue ribbon'},
 {id:'crate',title:'STOLEN: Railroad Freight Crate',reward:'$25 reward',text:'A sealed crate disappeared between Dusty Trail and Copper Creek.',steps:['Check freight ledger','Inspect train seals','Visit the line shack'],item:'Freight inspector tag'},
 {id:'watch',title:'FOUND: Engraved Pocket Watch',reward:'Owner sought',text:'Found near the old mine road. Initials inside read C.B.',steps:['Ask at the hotel','Check old Gazette notices','Show Dr. Boone'],item:'Watchmaker receipt'},
 {id:'lantern',title:'NOTICE: Red Lantern Signals',reward:'Sheriff requests help',text:'Unauthorized red signal seen beside westbound track after midnight.',steps:['Speak to stationmaster','Ride to water tower','Compare signal times'],item:'Red signal lens'},
 {id:'letters',title:'MISSING: Bundle of Letters',reward:'Sentimental value',text:'Tied with green string; last seen at the stage depot.',steps:['Check coach seats','Ask depot porter','Search lost-property shelf'],item:'Green ribbon'},
 {id:'cowbells',title:'STRANGE: Cowbells at Midnight',reward:'One pie + coffee',text:'Rancher hears cattle bells from an empty north pasture.',steps:['Visit the pasture','Check fence line','Follow the sound'],item:'Tiny brass cowbell'}
];
function renderBounties(){const g=document.getElementById('bountyGrid');if(!g)return;g.innerHTML=bountyCases.map(c=>`<article class="wanted-card board-note"><h3>${c.title}</h3><strong>${c.reward}</strong><p>${c.text}</p><button class="secondary bounty-open" data-bounty="${c.id}">${state.bounties.includes(c.id)?'Revisit Case':'Take Notice'}</button></article>`).join('');document.querySelectorAll('.bounty-open').forEach(b=>b.onclick=()=>openBounty(b.dataset.bounty));}
function openBounty(id){const c=bountyCases.find(x=>x.id===id);bountyStage.innerHTML=`<h3>${c.title}</h3><p>${c.text}</p><div class="bounty-actions">${c.steps.map((s,i)=>`<button class="secondary bounty-step" data-i="${i}">${s}</button>`).join('')}</div><div id="bountyLog" class="route-log">Choose where to start.</div>`;let done=new Set();document.querySelectorAll('.bounty-step').forEach(b=>b.onclick=()=>{done.add(+b.dataset.i);const notes=['You find a detail that narrows the timeline.','A witness gives you a small but useful contradiction.','The trail points toward a place you have visited before.'];bountyLog.textContent=notes[+b.dataset.i];if(done.size===c.steps.length&&!state.bounties.includes(id)){state.bounties.push(id);reward(3,c.item,`Completed bounty notice: ${c.title}`);bountyLog.textContent+=' Case complete—at least for now.';renderBounties();checkAchievements();}});}
renderBounties();

function bankRobberyStory(){const steps=[
 ['The Morning Alarm','The bank opens to find the vault outer door scarred but still closed.','Inspect the scratches','Question the teller'],
 ['The Missing Ledger','A small transfer ledger is gone even though the cash appears untouched.','Search the desk','Check yesterday’s customers'],
 ['The Alley Window','A rear window was unlatched from inside. A flour sack lies in the alley.','Visit Prairie Kitchen','Check wagon tracks'],
 ['The Decoy','The evidence suggests the “robbery” may have been staged to hide one missing document.','Confront the clerk','Set a quiet watch']
];const i=state.bankCase||0;if(i>=steps.length){adventureStage.innerHTML=`<div class="bank-scene"><h3>🏦 The Bank Case: Solved</h3><p>The attempted break-in was a distraction. The real target was a transfer ledger connecting stolen freight to a false account.</p></div>`;return;}const s=steps[i];adventureStage.innerHTML=`<div class="bank-scene"><h3>🏦 ${s[0]}</h3><p>${s[1]}</p><div class="court-options"><button class="secondary bankPick">${s[2]}</button><button class="secondary bankPick">${s[3]}</button></div><div id="bankLog" class="route-log"></div></div>`;document.querySelectorAll('.bankPick').forEach(b=>b.onclick=()=>{bankLog.textContent=`You choose to ${b.textContent.toLowerCase()}. A new connection appears in the case file.`;state.bankCase++;reward(2,null,`Bank case: ${s[0]}`);setTimeout(bankRobberyStory,450);if(state.bankCase>=steps.length)reward(5,'Brass bank investigator badge','Solved the Dusty Trail bank case');checkAchievements();});}

function doctorEmergency(){const calls=[
 ['Heat and Dust','A trail rider arrives dizzy after hours in the sun.','Move them to shade and offer water slowly','Send them immediately back outside'],
 ['The Twisted Ankle','A child fell near the festival grounds and cannot comfortably bear weight.','Rest, support, and let Dr. Boone examine it','Tell them to walk it off'],
 ['Mine Cough','A miner comes in coughing after heavy dust exposure.','Move to fresh air and evaluate breathing','Send them back underground']
];const c=calls[Math.min(state.doctorCases,calls.length-1)];adventureStage.innerHTML=`<div class="emergency-box"><h3>🩺 Doctor Call: ${c[0]}</h3><p>${c[1]}</p><div class="court-options"><button class="secondary docPick" data-good="1">${c[2]}</button><button class="secondary docPick" data-good="0">${c[3]}</button></div><div id="docLog" class="route-log"></div></div>`;document.querySelectorAll('.docPick').forEach(b=>b.onclick=()=>{if(b.dataset.good==='1'){docLog.textContent='Good judgment. Dr. Boone takes over and explains why the safer response matters.';state.doctorCases=Math.min(calls.length,state.doctorCases+1);reward(2,null,`Helped Dr. Boone: ${c[0]}`);if(state.doctorCases===calls.length)reward(3,'Town doctor helper pin','Completed all doctor calls');checkAchievements();}else docLog.textContent='Dr. Boone stops you and chooses the safer response instead.';});}

function scavengerHunt(){const items=['Old train ticket','Pressed wildflower','Red horseshoe mark','Printer’s type block','Tiny brass bell','Pie recipe'];adventureStage.innerHTML=`<h3>🧭 Dusty Trail Scavenger Hunt</h3><p>Search around town for six little details. There is no timer.</p><div class="scavenger-list">${items.map((x,i)=>`<button class="secondary scavenger-item ${state.scavenger.includes(i)?'found':''}" data-s="${i}">${state.scavenger.includes(i)?'✓ ':''}${x}</button>`).join('')}</div><div id="scavengerLog" class="route-log">Pick an item to search for.</div>`;document.querySelectorAll('.scavenger-item').forEach(b=>b.onclick=()=>{const i=+b.dataset.s;if(!state.scavenger.includes(i)){state.scavenger.push(i);reward(1,null,`Scavenger find: ${items[i]}`);scavengerLog.textContent=`Found: ${items[i]}. You tuck the memory into your trail journal.`;}else scavengerLog.textContent='You already found that one.';if(state.scavenger.length===items.length)reward(4,'Dusty Trail scavenger medal','Completed the scavenger hunt');scavengerHunt();checkAchievements();});}

if(document.getElementById('adventureGrid')){adventureGrid.insertAdjacentHTML('beforeend',`<article class="adventure-card"><span class="icon">🏦</span><h3>The Bank Without a Robbery</h3><p>Someone attacked the vault—but may not have wanted the money.</p><button class="secondary" id="bankAdventure">Investigate Bank</button></article><article class="adventure-card"><span class="icon">🩺</span><h3>Doctor on Call</h3><p>Help Dr. Boone think through frontier emergencies safely.</p><button class="secondary" id="doctorAdventure">Answer Call</button></article><article class="adventure-card"><span class="icon">🧭</span><h3>Town Scavenger Hunt</h3><p>Find small details all around Dusty Trail at your own pace.</p><button class="secondary" id="scavengerAdventure">Start Hunt</button></article>`);bankAdventure.onclick=bankRobberyStory;doctorAdventure.onclick=doctorEmergency;scavengerAdventure.onclick=scavengerHunt;}

function gameCards(){const ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'],suits=['♠','♥','♦','♣'];const draw=()=>({r:Math.floor(Math.random()*ranks.length),s:suits[Math.floor(Math.random()*suits.length)]});const you=draw(),house=draw();gameBox.innerHTML=`<h3>High Card Showdown</h3><p>A simple saloon high-card game—no betting, just luck.</p><div class="card-hand"><div class="playing-card"><small>You</small><br>${ranks[you.r]}${you.s}</div><div class="playing-card"><small>House</small><br>${ranks[house.r]}${house.s}</div></div><p id="cardMsg"></p><button class="secondary" id="cardAgain">Deal Again</button>`;cardMsg.textContent=you.r>house.r?'You take the round!':you.r<house.r?'House takes the round.':'Tie round!';if(you.r>house.r)reward(1,null,'Won High Card Showdown');cardAgain.onclick=gameCards;}
gameFns.cards=gameCards;const cardsTab=document.querySelector('[data-game="cards"]');if(cardsTab)cardsTab.onclick=()=>{document.querySelectorAll('.game-tab').forEach(x=>x.classList.remove('active'));cardsTab.classList.add('active');gameCards();};

const moreHistory=[
 ['HISTORY','Stagecoach Travel','Stagecoaches were important for passengers, mail, and express service in many regions before railroads reached them. Travel could be uncomfortable, slow, and weather-dependent.'],
 ['HISTORY','Cattle Drives','Large cattle drives became especially associated with the decades after the Civil War, when herds were moved to railheads for shipment to market.'],
 ['HISTORY','Black Cowboys','Black cowboys were a real and significant part of the cattle industry and western history, though older popular media often underrepresented them.'],
 ['HISTORY','Women in Western Towns','Women worked as ranchers, entrepreneurs, teachers, doctors, journalists, performers, and in many other roles throughout the American West.'],
 ['MOVIE MYTH','Every Town Had a Noon Showdown','Classic Western films made formal street duels iconic, but everyday western violence did not usually follow a neat movie-style ritual.'],
 ['LEGEND','Ghost Town Lanterns','Abandoned mining settlements attracted many supernatural stories. Those legends are part of western folklore even when they are not verifiable history.']
];
if(document.getElementById('historyGrid'))historyGrid.insertAdjacentHTML('beforeend',moreHistory.map(h=>`<article class="history-card"><span class="type">${h[0]}</span><h3>${h[1]}</h3><p>${h[2]}</p></article>`).join(''));

const achievementDefs=[
 {id:'wanderer',icon:'🐎',name:'Town Wanderer',desc:'Visit 5 places in Dusty Trail.',ok:()=>state.visited.length>=5},
 {id:'collector',icon:'🎒',name:'Keepsake Collector',desc:'Collect 8 keepsakes.',ok:()=>state.items.length>=8},
 {id:'known',icon:'🤝',name:'Known Around Town',desc:'Build a positive relationship with 3 townspeople.',ok:()=>Object.values(state.relationships).filter(v=>v>=1).length>=3},
 {id:'casework',icon:'🔎',name:'Case Worker',desc:'Complete 3 bounty-board notices.',ok:()=>state.bounties.length>=3},
 {id:'bank',icon:'🏦',name:'Ledger Detective',desc:'Solve the Dusty Trail bank case.',ok:()=>state.bankCase>=4},
 {id:'medic',icon:'🩺',name:'Doctor’s Helper',desc:'Complete all 3 doctor calls.',ok:()=>state.doctorCases>=3},
 {id:'hunter',icon:'🧭',name:'Sharp Eyes',desc:'Finish the scavenger hunt.',ok:()=>state.scavenger.length>=6},
 {id:'legend',icon:'⭐',name:'Territory Legend',desc:'Reach 50 reputation stars.',ok:()=>state.rep>=50}
];
function checkAchievements(){let changed=false;achievementDefs.forEach(a=>{if(a.ok()&&!state.achievements.includes(a.id)){state.achievements.push(a.id);changed=true;toast(`Achievement unlocked: ${a.name}`);}});if(changed)save();renderAchievements();}
function renderAchievements(){const g=document.getElementById('achievementGrid');if(!g)return;g.innerHTML=achievementDefs.map(a=>{const yes=state.achievements.includes(a.id);return `<article class="achievement-card ${yes?'unlocked':'locked'}"><div class="achievement-icon">${yes?a.icon:'🔒'}</div><h3>${a.name}</h3><p>${a.desc}</p><strong>${yes?'Unlocked':'Still waiting on the trail'}</strong></article>`}).join('');}
checkAchievements();

// Extend the trail journal without breaking prior versions.
const v4OpenJournal=openJournal;
openJournal=function(){v4OpenJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>People & Reputation</h3><p>${Object.entries(state.relationships).length?Object.entries(state.relationships).map(([id,v])=>`${people.find(p=>p.id===id)?.name||id}: ${relationshipName(v)} (${v>=0?'+':''}${v})`).join('<br>'):'You have not spent much time with the townspeople yet.'}</p><h3>Bounty Board</h3><p>${state.bounties.length} of ${bountyCases.length} notices completed.</p><h3>Achievements</h3><p>${state.achievements.length} of ${achievementDefs.length} unlocked.</p></section>`);};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

if(typeof townEvents!=='undefined')townEvents.push(
 ['The bank vault alarm rings just after opening.','Oddly, no cash appears to be missing—but one small ledger cannot be found.'],
 ['Dr. Boone sends a boy running for the sheriff.','Nobody knows whether the emergency is medical, criminal, or both.'],
 ['Six new notices appear on the bounty board.','One offers a reward for something as strange as “cowbells heard where no cattle live.”'],
 ['Ada Quinn stops playing mid-song.','She recognizes a stranger who just entered the saloon, but refuses to say from where.']
);

const originalRandom=document.querySelector('[data-action="random-adventure"]');if(originalRandom)originalRandom.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};


// VERSION 5: Living territory systems
state.weather = state.weather || 'Clear Skies';
state.season = state.season || 'Late Summer';
state.day = state.day || 1;
state.hour = Number.isFinite(state.hour) ? state.hour : 18;
state.horse = state.horse || {name:'Comet',bond:1,stamina:5,gear:[]};
state.ranchUpgrades = state.ranchUpgrades || [];
state.jobsDone = state.jobsDone || [];
state.treasures = state.treasures || {};
state.railTrips = state.railTrips || 0;
state.railIncidents = state.railIncidents || [];
state.jailCase = state.jailCase || 0;
state.rumorsHeard = state.rumorsHeard || [];
save();

// Add a living-world strip beneath the status bar.
if(!document.getElementById('weatherStrip')){
 const strip=document.createElement('div'); strip.id='weatherStrip'; strip.className='weather-strip';
 document.querySelector('.statusbar').after(strip);
}
const weatherOptions=[
 {name:'Clear Skies',icon:'☀️',cls:'weather-clear',line:'Long shadows stretch across the main street.'},
 {name:'Prairie Rain',icon:'🌧️',cls:'weather-rain',line:'Rain darkens the boardwalks and keeps most folks under awnings.'},
 {name:'Dusty Wind',icon:'🌬️',cls:'weather-dust',line:'A dry wind pushes tumbleweeds past the hitching posts.'},
 {name:'Cool Front',icon:'🍂',cls:'weather-cold',line:'The air turns crisp enough for jackets after sundown.'},
 {name:'Thunderheads',icon:'⛈️',cls:'weather-rain',line:'Distant thunder rolls beyond Canyon Ridge.'}
];
function hourLabel(){const h=state.hour%24, ap=h>=12?'PM':'AM', n=h%12||12; return `${n}:00 ${ap}`;}
function renderWorldClock(){
 const w=weatherOptions.find(x=>x.name===state.weather)||weatherOptions[0];
 document.body.classList.remove(...weatherOptions.map(x=>x.cls));document.body.classList.add(w.cls);
 weatherStrip.innerHTML=`<span class="weather-chip">${w.icon} ${state.weather}</span><span class="weather-chip">🗓️ Day ${state.day}</span><span class="weather-chip">🕰️ ${hourLabel()}</span><span class="weather-chip season-tag">${state.season}</span><button class="tiny" id="advanceTime">Pass 2 Hours</button><button class="tiny" id="changeWeather">Change Weather</button>`;
 document.getElementById('advanceTime').onclick=()=>{state.hour+=2;if(state.hour>=24){state.hour-=24;state.day++;}state.time=state.hour<6?'night':state.hour<9?'sunrise':state.hour<18?'day':state.hour<21?'sunset':'night';save();renderWorldClock();toast(`Time passes. It is ${hourLabel()}.`);};
 document.getElementById('changeWeather').onclick=()=>{const next=weatherOptions[(weatherOptions.findIndex(x=>x.name===state.weather)+1)%weatherOptions.length];state.weather=next.name;save();renderWorldClock();refreshTown();toast(`${next.icon} ${next.name}`);};
}
renderWorldClock();

// Horse & homestead
const ranchUpgrades=[
 ['Water Trough','💧','Keeps the horses comfortable after long trail rides.',4],['Vegetable Garden','🥕','Adds a quiet morning ranch activity and kitchen supplies.',5],['Bigger Corral','🐎','Makes room for visiting horses and ranch events.',7],['Front Porch Swing','🪑','Adds another no-pressure resting spot.',3],['Workshop','🔨','Unlocks repair-flavored ranch stories.',6],['Guest Bunkhouse','🛏️','Lets traveling characters stay at your ranch.',8]
];
function renderHomestead(){
 const hp=document.getElementById('horsePanel'), rp=document.getElementById('ranchPanel'); if(!hp||!rp)return;
 hp.innerHTML=`<div class="horse-card"><div class="horse-avatar">🐴</div><label>Horse name <input id="horseName" value="${state.horse.name}"></label><p><strong>Bond:</strong> ${state.horse.bond}/10</p><div class="meter"><span style="width:${state.horse.bond*10}%"></span></div><p><strong>Trail stamina:</strong> ${state.horse.stamina}/10</p><div class="meter"><span style="width:${state.horse.stamina*10}%"></span></div><div class="action-row"><button class="secondary" id="groomHorse">Groom</button><button class="secondary" id="trailRideHorse">Take Trail Ride</button><button class="secondary" id="restHorse">Rest</button></div><p>${state.horse.gear.length?'Gear: '+state.horse.gear.join(', '):'No special tack collected yet.'}</p></div>`;
 horseName.onchange=()=>{state.horse.name=horseName.value.trim()||'Comet';save();};
 groomHorse.onclick=()=>{state.horse.bond=Math.min(10,state.horse.bond+1);reward(1,null,`Groomed ${state.horse.name}`);renderHomestead();};
 trailRideHorse.onclick=()=>{if(state.horse.stamina<2){toast(`${state.horse.name} needs a rest first.`);return;}state.horse.stamina-=2;state.horse.bond=Math.min(10,state.horse.bond+1);reward(2,null,`Trail ride with ${state.horse.name}`);renderHomestead();};
 restHorse.onclick=()=>{state.horse.stamina=Math.min(10,state.horse.stamina+3);save();renderHomestead();toast(`${state.horse.name} rests at the ranch.`);};
 rp.innerHTML=`<p>Your ranch grows only when you choose to improve it. Reputation stars act like play currency here—nothing is required.</p><div class="upgrade-grid">${ranchUpgrades.map((u,i)=>`<article class="upgrade-card ${state.ranchUpgrades.includes(i)?'owned':''}"><h4>${u[1]} ${u[0]}</h4><p>${u[2]}</p>${state.ranchUpgrades.includes(i)?'<strong>Built ✓</strong>':`<button class="secondary ranchBuy" data-up="${i}">Build for ${u[3]} ⭐</button>`}</article>`).join('')}</div>`;
 document.querySelectorAll('.ranchBuy').forEach(b=>b.onclick=()=>{const i=+b.dataset.up,c=ranchUpgrades[i][3];if(state.rep<c){toast(`You need ${c} reputation stars for that upgrade.`);return;}state.rep-=c;state.ranchUpgrades.push(i);state.horse.stamina=Math.min(10,state.horse.stamina+1);reward(1,ranchUpgrades[i][0]+' ranch plaque',`Built ${ranchUpgrades[i][0]}`);renderHomestead();checkAchievements();});
}
renderHomestead();

// Optional town jobs
const townJobs=[
 {id:'mail',icon:'📮',name:'Sort the Mail',desc:'Match four pieces of mail to their destinations.',rep:3},
 {id:'stable',icon:'🧹',name:'Help at the Stable',desc:'Choose the sensible order for a few stable chores.',rep:3},
 {id:'gazette',icon:'📰',name:'Gazette Assistant',desc:'Pick the clearest headline for a town event.',rep:3},
 {id:'kitchen',icon:'🥧',name:'Prairie Kitchen Rush',desc:'Remember a short breakfast order.',rep:3},
 {id:'depot',icon:'🚂',name:'Depot Clerk',desc:'Route passengers to the correct train platform.',rep:4},
 {id:'ranchhand',icon:'🐂',name:'Ranch Hand',desc:'Make three calm decisions during a cattle-work morning.',rep:4}
];
function renderJobs(){const g=document.getElementById('jobGrid');if(!g)return;g.innerHTML=townJobs.map((j,i)=>`<article class="job-card ${state.jobsDone.includes(j.id)?'done':''}"><h3>${j.icon} ${j.name}</h3><p>${j.desc}</p><button class="secondary jobStart" data-job="${i}">${state.jobsDone.includes(j.id)?'Do Again':'Take Job'}</button></article>`).join('');document.querySelectorAll('.jobStart').forEach(b=>b.onclick=()=>startJob(+b.dataset.job));}
function startJob(i){const j=townJobs[i];const prompts={mail:['Letter: Sheriff Mae Carter','Sheriff’s Office','Saloon','Mine'],stable:['A thirsty horse returns from the trail. What first?','Offer water and let it cool down','Immediately race it again','Ignore it'],gazette:['A storm delays the westbound train by six hours.','STORM DELAYS WESTBOUND TRAIN','EVERYTHING IS TERRIBLE','TRAIN VANISHES FOREVER'],kitchen:['Order: coffee, biscuits, peach pie.','Coffee, biscuits, peach pie','Tea, beans, apple pie','Coffee, stew, cake'],depot:['Passenger ticket says Copper Creek Express.','Platform 2: Copper Creek','Freight siding','Stable yard'],ranchhand:['The herd bunches near a washed-out creek crossing.','Slow down and find a safer crossing','Force them through immediately','Scatter the herd']};const p=prompts[j.id];jobStage.innerHTML=`<h3>${j.icon} ${j.name}</h3><p>${p[0]}</p><div class="action-row">${p.slice(1).map((x,k)=>`<button class="secondary jobAnswer" data-good="${k===0?1:0}">${x}</button>`).join('')}</div><p id="jobResult"></p>`;document.querySelectorAll('.jobAnswer').forEach(b=>b.onclick=()=>{if(b.dataset.good==='1'){jobResult.textContent='Nice work. The job is finished cleanly.';if(!state.jobsDone.includes(j.id))state.jobsDone.push(j.id);reward(j.rep,j.id==='depot'?'Brass depot punch':null,`Completed town job: ${j.name}`);renderJobs();checkAchievements();}else jobResult.textContent='That makes the job harder. Try another approach.';});}
renderJobs();

// Treasure trails
const treasureTrails=[
 {id:'bell',icon:'🔔',title:'The Bellmaker’s Cache',clues:['Find the chapel bell with three tiny stars scratched into the rim.','Match those stars to the old hotel register margin.','Follow the register’s room number to a loose floorboard in the abandoned boarding house.'],item:'Tiny silver bell'},
 {id:'canyon',icon:'🗺️',title:'Map of the Split Mesa',clues:['Ride until the red cliff divides like a giant doorway.','Look for a cottonwood growing beside dry stone.','Count seven paces toward sunset from the old survey marker.'],item:'Surveyor’s brass compass'},
 {id:'rail',icon:'🚂',title:'The Conductor’s Lost Box',clues:['Check the punched ticket for a station that no longer appears on the timetable.','Search the old water tower platform.','Use the initials carved under the railing to identify the correct lockbox.'],item:'Antique conductor badge'}
];
function renderTreasures(){const g=document.getElementById('treasureGrid');if(!g)return;g.innerHTML=treasureTrails.map((t,i)=>{const step=state.treasures[t.id]||0;return `<article class="treasure-card ${step>=t.clues.length?'done':''}"><span class="icon">${t.icon}</span><h3>${t.title}</h3><p>${step>=t.clues.length?'Treasure found.':`Clue ${step+1} of ${t.clues.length}`}</p><button class="secondary treasureStart" data-t="${i}">${step>=t.clues.length?'Revisit':'Follow Map'}</button></article>`}).join('');document.querySelectorAll('.treasureStart').forEach(b=>b.onclick=()=>treasureStep(+b.dataset.t));}
function treasureStep(i){const t=treasureTrails[i],step=state.treasures[t.id]||0;if(step>=t.clues.length){treasureStage.innerHTML=`<h3>${t.icon} ${t.title}</h3><p>You already solved this hunt. The trail is still open if you just want to revisit the scenery.</p>`;return;}treasureStage.innerHTML=`<h3>${t.icon} ${t.title}</h3><div class="map-fragment">CLUE ${step+1}</div><p>${t.clues[step]}</p><button class="primary" id="solveTreasure">I Found This Clue</button>`;solveTreasure.onclick=()=>{state.treasures[t.id]=step+1;if(step+1>=t.clues.length)reward(5,t.item,`Solved treasure trail: ${t.title}`);else reward(1,null,`Treasure clue: ${t.title} ${step+1}`);renderTreasures();treasureStep(i);checkAchievements();};}
renderTreasures();

// Railroad board and incidents
const railRoutes=[['Copper Creek Local','8:10 AM','Copper Creek','Freight cars, ranch families, and one very talkative salesman.'],['Canyon Limited','12:40 PM','Canyon Ridge','A scenic run along the cliffs with a dining car.'],['Blackwater Express','4:20 PM','Blackwater Crossing','River country, courthouse passengers, and heavy mail bags.'],['Midnight Star','11:55 PM','Whispering Mesa Junction','A late train that passes the old mining spur after dark.']];
const railIncidents=[
 ['Missing Ticket','A child’s ticket blows from the platform just as the conductor calls boarding.','Help search the platform','Ask the clerk to verify the passenger list'],
 ['Hot Box','A railroad worker spots smoke near one freight car axle.','Alert the conductor immediately','Pretend not to notice'],
 ['Unclaimed Case','A locked leather case sits beneath a seat after everyone leaves the car.','Turn it over to railway staff','Open it yourself'],
 ['Signal Trouble','A red lantern appears where the dispatcher says no signal worker should be.','Stop and verify the track','Keep full speed without checking']
];
function renderRail(){const b=document.getElementById('railBoard');if(!b)return;b.innerHTML=railRoutes.map((r,i)=>`<article class="rail-card"><div class="rail-time">${r[1]}</div><h3>🚂 ${r[0]}</h3><p><strong>To:</strong> ${r[2]}</p><p>${r[3]}</p><button class="secondary railRide" data-r="${i}">Board Train</button></article>`).join('');document.querySelectorAll('.railRide').forEach(x=>x.onclick=()=>railTrip(+x.dataset.r));}
function railTrip(i){const r=railRoutes[i],inc=railIncidents[Math.floor(Math.random()*railIncidents.length)];state.railTrips++;railStage.innerHTML=`<h3>🚂 Aboard the ${r[0]}</h3><p>The train leaves Dusty Trail for ${r[2]}.</p><div class="rumor-scroll"><strong>Incident: ${inc[0]}</strong><br>${inc[1]}</div><div class="action-row"><button class="secondary railChoice" data-good="1">${inc[2]}</button><button class="secondary railChoice" data-good="0">${inc[3]}</button></div><p id="railResult"></p>`;document.querySelectorAll('.railChoice').forEach(c=>c.onclick=()=>{if(c.dataset.good==='1'){railResult.textContent='The situation is handled safely, and the train continues.';if(!state.railIncidents.includes(inc[0]))state.railIncidents.push(inc[0]);reward(2,state.railTrips===5?'Railroad traveler pin':null,`Rail incident: ${inc[0]}`);checkAchievements();}else railResult.textContent='A railroad worker steps in and chooses the safer course before the situation gets worse.';save();});}
renderRail();

// Jail-to-court mini storyline added to the adventure screen.
function jailCourtStory(){const scenes=[['Night Arrest','A stranger is jailed after a fight, but two witnesses tell completely different stories.','Interview both witnesses','Assume the first story is true'],['Missing Evidence','The sheriff notices the evidence envelope is not where it was logged.','Check the evidence log and desk','Accuse the prisoner immediately'],['Morning Hearing','The judge asks what is actually supported by the record.','Present only verified facts','Add rumors to make the case stronger']];const s=scenes[Math.min(state.jailCase,scenes.length-1)];adventureStage.innerHTML=`<h3>⚖️ Jail & Court: ${s[0]}</h3><p>${s[1]}</p><div class="action-row"><button class="secondary courtV5" data-good="1">${s[2]}</button><button class="secondary courtV5" data-good="0">${s[3]}</button></div><p id="courtV5Log"></p>`;document.querySelectorAll('.courtV5').forEach(b=>b.onclick=()=>{if(b.dataset.good==='1'){state.jailCase=Math.min(scenes.length,state.jailCase+1);courtV5Log.textContent='You keep the case grounded in evidence.';reward(2,null,`Jail & court: ${s[0]}`);if(state.jailCase>=scenes.length)reward(4,'Courthouse record ribbon','Completed Jail & Court storyline');checkAchievements();setTimeout(()=>{if(state.jailCase<scenes.length)jailCourtStory();},350);}else courtV5Log.textContent='That would make the case less reliable. Try the evidence-based option.';});}
if(document.getElementById('adventureGrid')&&!document.getElementById('jailCourtAdventure')){adventureGrid.insertAdjacentHTML('beforeend',`<article class="adventure-card"><span class="icon">⚖️</span><h3>Jail & Court</h3><p>Follow one arrest from conflicting witness stories through a morning hearing.</p><button class="secondary" id="jailCourtAdventure">Open Case</button></article>`);jailCourtAdventure.onclick=jailCourtStory;}

// Dynamic rumors injected into Gazette and town life.
const v5Rumors=['The Midnight Star conductor swears somebody boarded at a station closed fifteen years ago.','A ranch hand says the creek changed course after last night’s storm and exposed an old wagon axle.','Someone left a fresh bouquet on a grave whose marker has no name.','The new horse at the livery stable seems to know the road to Whispering Mesa by itself.','A courthouse clerk found a map fragment tucked inside a law book printed decades ago.'];
function hearRumor(){const r=v5Rumors[Math.floor(Math.random()*v5Rumors.length)];if(!state.rumorsHeard.includes(r))state.rumorsHeard.push(r);save();return r;}
if(typeof refreshTown==='function'){const oldRefresh=refreshTown;refreshTown=function(){oldRefresh();if(Math.random()<.45)townDetail.textContent+=' Rumor: '+hearRumor();};document.querySelector('[data-action="refresh-town"]').onclick=refreshTown;}

// Expand achievements without replacing V4 achievements.
achievementDefs.push(
 {id:'horsefriend',icon:'🐴',name:'Trail Partner',desc:'Build your horse bond to 6.',ok:()=>state.horse.bond>=6},
 {id:'homesteader',icon:'🏡',name:'Homesteader',desc:'Build 3 ranch upgrades.',ok:()=>state.ranchUpgrades.length>=3},
 {id:'worker',icon:'🛠️',name:'Town Regular',desc:'Complete 4 different town jobs.',ok:()=>state.jobsDone.length>=4},
 {id:'treasure',icon:'🗺️',name:'Treasure Tracker',desc:'Complete all 3 treasure trails.',ok:()=>treasureTrails.every(t=>(state.treasures[t.id]||0)>=t.clues.length)},
 {id:'railroader',icon:'🚂',name:'Railroad Rover',desc:'Take 5 train trips.',ok:()=>state.railTrips>=5},
 {id:'courtroom',icon:'⚖️',name:'Record Keeper',desc:'Complete the Jail & Court story.',ok:()=>state.jailCase>=3},
 {id:'biglegend',icon:'🌟',name:'Living Legend',desc:'Reach 100 reputation stars.',ok:()=>state.rep>=100}
);
checkAchievements();

// Extend journal with V5 systems.
const v5OpenJournal=openJournal;
openJournal=function(){v5OpenJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Living Territory</h3><p>Day ${state.day} • ${hourLabel()} • ${state.weather} • ${state.season}</p><h3>Trail Horse</h3><p>${state.horse.name} • Bond ${state.horse.bond}/10 • Stamina ${state.horse.stamina}/10</p><h3>Homestead</h3><p>${state.ranchUpgrades.length} upgrades built.</p><h3>Town Jobs</h3><p>${state.jobsDone.length} of ${townJobs.length} unique jobs completed.</p><h3>Treasure Trails</h3><p>${treasureTrails.filter(t=>(state.treasures[t.id]||0)>=t.clues.length).length} of ${treasureTrails.length} completed.</p><h3>Railroad</h3><p>${state.railTrips} trips • ${state.railIncidents.length} unique incidents handled.</p></section>`);};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

// Keep Surprise Me aware of new sections.
const surprise=document.querySelector('[data-action="random-adventure"]');if(surprise)surprise.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

renderStatus();renderWorldClock();renderHomestead();renderJobs();renderTreasures();renderRail();


// VERSION 6: Frontier Life, social events, market, wardrobe, road encounters, and long-form saga.
state.tokens = Number.isFinite(state.tokens) ? state.tokens : 8;
state.camp = state.camp || {warmth:5,supplies:4,stories:0,fish:0};
state.marketOwned = state.marketOwned || [];
state.outfit = state.outfit || 'Trail Traveler';
state.title = state.title || 'Wayfarer of Dusty Trail';
state.encounters = state.encounters || [];
state.saga6 = Number.isFinite(state.saga6) ? state.saga6 : 0;
state.socialEvents = state.socialEvents || [];
save();

function addTokens(n,why=''){state.tokens=Math.max(0,(state.tokens||0)+n);save();const el=document.getElementById('tokenCount');if(el)el.textContent=state.tokens;if(n>0)toast(`+${n} market token${n===1?'':'s'}${why?' • '+why:''}`);}

const campActivities=[
 {id:'rest',icon:'🌙',name:'Rest by the Fire',text:'Restore your horse and settle in for a quiet evening.',go(){state.horse.stamina=Math.min(10,state.horse.stamina+3);state.camp.warmth=Math.min(10,state.camp.warmth+1);reward(1,null,'Rested at camp');campfireStage.innerHTML='<h3>🌙 A quiet hour</h3><p>The horses settle, the fire burns low, and nobody asks anything of you. Comet regains stamina.</p>';renderCamp();}},
 {id:'story',icon:'📖',name:'Campfire Story',text:'Hear a rotating frontier tale, legend, or mystery hook.',go(){const tales=['An old conductor tells of a bell heard beneath a bridge where no church ever stood.','A retired rancher remembers the winter every fence post vanished beneath the snow.','A traveling actress recalls a town that elected its newspaper editor mayor for one very strange week.','A prospector insists the brightest gold he ever found was a brass button mistaken for treasure.'];state.camp.stories++;addTokens(1,'story night');campfireStage.innerHTML=`<h3>📖 Firelight Tale</h3><p>${tales[state.camp.stories%tales.length]}</p><p><em>Some campfire tales are history-flavored fiction, not historical claims.</em></p>`;renderCamp();}},
 {id:'meal',icon:'🥘',name:'Cook Trail Supper',text:'Use one supply to make a simple camp meal.',go(){if(state.camp.supplies<1){campfireStage.innerHTML='<h3>🥘 Empty chuck box</h3><p>You are out of camp supplies. Visit the Frontier Market or choose another activity.</p>';return;}state.camp.supplies--;state.camp.warmth=Math.min(10,state.camp.warmth+2);addTokens(1,'trail supper');reward(1,null,'Cooked trail supper');campfireStage.innerHTML='<h3>🥘 Supper is ready</h3><p>A warm skillet meal makes the camp feel like home for a little while.</p>';renderCamp();}},
 {id:'fish',icon:'🎣',name:'Creek Fishing',text:'A light, non-graphic luck challenge by the creek.',go(){const hit=Math.random()<.65;if(hit){state.camp.fish++;state.camp.supplies++;addTokens(2,'good catch');campfireStage.innerHTML='<h3>🎣 A good catch</h3><p>You pull in a small creek fish and add one food supply to camp.</p>';}else campfireStage.innerHTML='<h3>🎣 Quiet water</h3><p>No catch this time, but the creek is peaceful and the evening was worth it anyway.</p>';save();renderCamp();}},
 {id:'stars',icon:'✨',name:'Watch the Stars',text:'No score, no reward—just a peaceful scene.',go(){campfireStage.innerHTML='<h3>✨ Nothing to accomplish</h3><p>The prairie is dark and enormous. The fire pops softly. You can stay here as long as you like.</p>';}}
];
function renderCamp(){const g=document.getElementById('campfireGrid');if(!g)return;g.innerHTML=campActivities.map((a,i)=>`<article class="life-card"><span class="icon">${a.icon}</span><h3>${a.name}</h3><p>${a.text}</p><button class="secondary campGo" data-i="${i}">Choose</button></article>`).join('');document.querySelectorAll('.campGo').forEach(b=>b.onclick=()=>campActivities[+b.dataset.i].go());const st=document.getElementById('campfireStage');if(st&&!st.querySelector('.camp-meter'))st.insertAdjacentHTML('afterbegin',`<div class="camp-meter"><span>🔥 Warmth ${state.camp.warmth}/10</span><span>🎒 Supplies ${state.camp.supplies}</span><span>📖 Stories ${state.camp.stories}</span><span>🎣 Catches ${state.camp.fish}</span></div>`);}
renderCamp();

const marketItems=[
 ['coffee','☕','Blue Tin Coffee Pot',3,'A cheerful enamel pot for your homestead.'],['blanket','🧶','Woven Saddle Blanket',4,'Cosmetic horse gear with a bright frontier pattern.'],['lantern2','🏮','Storm Lantern',5,'A sturdy keepsake for late trail rides.'],['boots','🥾','Polished Trail Boots',5,'Unlocks the Trail Boss outfit.'],['hat','🤠','Black Felt Hat',6,'Unlocks the Night Rider outfit.'],['shawl','🧣','Festival Shawl',4,'Unlocks the Founders Day outfit.'],['campbox','📦','Camp Supply Box',3,'Adds 3 camp supplies each time purchased.'],['mapcase','🗺️','Leather Map Case',6,'A collectible for the Trail Journal.']
];
function renderMarket(){const g=document.getElementById('marketGrid');if(!g)return;document.getElementById('tokenCount').textContent=state.tokens;g.innerHTML=marketItems.map(([id,ic,n,p,d])=>{const owned=state.marketOwned.includes(id)&&id!=='campbox';return `<article class="market-card ${owned?'owned':''}"><span class="icon">${ic}</span><h3>${n}</h3><p>${d}</p><p class="price">🪙 ${p}</p><button class="secondary marketBuy" data-id="${id}" ${owned?'disabled':''}>${owned?'Owned':'Buy'}</button></article>`}).join('');document.querySelectorAll('.marketBuy').forEach(b=>b.onclick=()=>buyMarket(b.dataset.id));}
function buyMarket(id){const it=marketItems.find(x=>x[0]===id);if(!it)return;if(state.tokens<it[3]){marketStage.innerHTML='<h3>Not enough tokens yet.</h3><p>Earn tokens through jobs, campfire activities, encounters, and story chapters. There is no real money involved.</p>';return;}state.tokens-=it[3];if(id==='campbox')state.camp.supplies+=3;else if(!state.marketOwned.includes(id))state.marketOwned.push(id);if(id!=='campbox'&&!state.items.includes(it[2]))state.items.push(it[2]);save();marketStage.innerHTML=`<h3>${it[1]} ${it[2]}</h3><p>Purchased with in-world market tokens.</p>`;renderMarket();renderWardrobe();checkAchievements();}
renderMarket();

const outfits=[
 ['Trail Traveler','🥾','Your reliable everyday frontier look.',()=>true],
 ['Trail Boss','🐂','Ranch-ready coat, polished boots, and practical gloves.',()=>state.marketOwned.includes('boots')],
 ['Night Rider','🌙','Dark hat and long coat for late train arrivals.',()=>state.marketOwned.includes('hat')],
 ['Founders Day','🎻','A colorful festival outfit with a woven shawl.',()=>state.marketOwned.includes('shawl')],
 ['Railroad Detective','🚂','Travel coat, notebook, and brass rail pin.',()=>state.railTrips>=5],
 ['Territory Legend','⭐','A ceremonial outfit for a reputation of 100 or more.',()=>state.rep>=100]
];
const titles=[['Wayfarer of Dusty Trail',()=>true],['Friend of the Town',()=>Object.values(state.relationships||{}).filter(v=>v>=1).length>=3],['Keeper of the Trail Journal',()=>state.items.length>=12],['Railroad Rover',()=>state.railTrips>=5],['Mystery Hand',()=>state.bounties.length>=3],['Living Legend',()=>state.rep>=100]];
function renderWardrobe(){const g=document.getElementById('wardrobeGrid'),h=document.getElementById('wardrobeHero');if(!g||!h)return;h.innerHTML=`<div><p class="kicker">CURRENT LOOK</p><h3>${state.outfit}</h3><p>${state.title}</p></div><div class="avatar-badge">🤠</div>`;g.innerHTML=outfits.map((o,i)=>{const ok=o[3]();return `<article class="outfit-card ${state.outfit===o[0]?'selected':''}"><span class="icon">${o[1]}</span><h3>${o[0]}</h3><p>${o[2]}</p><button class="secondary outfitPick" data-i="${i}" ${ok?'':'disabled'}>${ok?(state.outfit===o[0]?'Wearing':'Wear'):'Locked'}</button></article>`}).join('')+`<article class="outfit-card"><span class="icon">🏷️</span><h3>Choose a Title</h3><p>${titles.filter(t=>t[1]()).map((t,i)=>`<button class="tiny titlePick" data-title="${t[0]}">${t[0]}</button>`).join(' ')}</p></article>`;document.querySelectorAll('.outfitPick').forEach(b=>b.onclick=()=>{state.outfit=outfits[+b.dataset.i][0];save();renderWardrobe();});document.querySelectorAll('.titlePick').forEach(b=>b.onclick=()=>{state.title=b.dataset.title;save();renderWardrobe();});}
renderWardrobe();

const roadEncounters=[
 ['🌉','Washed-Out Crossing','Recent rain has made a creek crossing uncertain.',['Take the marked detour','Wait and ask a local rider about the safest route'],2],
 ['🧳','Lost Suitcase','A battered travel case sits beside the stage road with a name tag still attached.',['Take it to the depot lost-property desk','Ride to the nearby ranch named on the tag'],2],
 ['🐴','Loose Horse','A saddled horse trots along the road with no rider in sight.',['Calm the horse and check for owner markings','Lead it toward the nearest ranch'],3],
 ['🎻','Traveling Musicians','A wagon of musicians asks which road leads to Founders Day.',['Give directions to Dusty Trail','Escort them as far as the crossroads'],1],
 ['🌪️','Dust Wall','A heavy wall of dust is moving across the open road.',['Turn back toward shelter','Wait in a protected low area away from the road'],2],
 ['📬','Mail Sack','A tied mail pouch has fallen from a postal wagon.',['Deliver it unopened to the depot','Flag down the next postal rider'],3],
 ['🪵','Broken Wagon Wheel','A family wagon has a cracked wheel near Canyon Ridge.',['Ride for the nearest wheelwright','Help move the wagon safely off the road'],2],
 ['🦅','High Mesa View','The road climbs to a broad mesa with an incredible view.',['Stop for a quiet look','Sketch the territory in your journal'],1]
];
function runEncounter(){const e=roadEncounters[Math.floor(Math.random()*roadEncounters.length)];encounterStage.innerHTML=`<div class="encounter-icon">${e[0]}</div><h3>${e[1]}</h3><p>${e[1]==='Dust Wall'?'The horizon turns brown as wind picks up.':'Something unexpected interrupts the ride.'}</p><div class="action-row">${e[2].map((x,i)=>`<button class="secondary encPick" data-i="${i}">${x}</button>`).join('')}</div>`;document.querySelectorAll('.encPick').forEach(b=>b.onclick=()=>{const line=`${e[0]} ${e[1]} — ${b.textContent}`;if(!state.encounters.includes(e[1]))state.encounters.push(e[1]);addTokens(e[3],e[1]);reward(1,null,`Road encounter: ${e[1]}`);encounterLog.insertAdjacentHTML('afterbegin',`<div>${line}</div>`);checkAchievements();});}
const rideBtn=document.getElementById('rideEncounter');if(rideBtn)rideBtn.onclick=runEncounter;

// Extra relationship events that can emerge after you've met townspeople.
const socialScenes=[
 ['Mae Carter','Deputy Mae asks whether you will help organize old case files before the sheriff returns.','Help sort them','Trade a joke and keep her company'],
 ['Rosa Bell','Rosa has two travelers arguing over the last hotel room.','Help find a fair solution','Offer to check the Sunset Hotel annex'],
 ['Ada Quinn','Ada wants a second opinion on a new song before Founders Day.','Listen seriously','Suggest a lively chorus'],
 ['Dr. Clara Boone','Dr. Boone is collecting clean blankets for the clinic.','Carry a bundle over','Ask the market for donated extras']
];
function socialEvent(){const s=socialScenes[Math.floor(Math.random()*socialScenes.length)];const who=people.find(p=>p.name===s[0]);peoplePanel.innerHTML=`<div class="social-event"><h3>🤝 ${s[0]}: Small Town Moment</h3><p>${s[1]}</p><div class="action-row"><button class="secondary socialPick">${s[2]}</button><button class="secondary socialPick">${s[3]}</button></div></div>`;document.querySelectorAll('.socialPick').forEach(b=>b.onclick=()=>{if(who){state.relationships[who.id]=(state.relationships[who.id]||0)+1;}state.socialEvents.push(`${s[0]} — ${b.textContent}`);addTokens(1,'helping around town');reward(1,null,`Social event with ${s[0]}`);renderPeople();checkAchievements();});}
if(document.getElementById('peoplePanel'))peoplePanel.insertAdjacentHTML('beforebegin','<button class="primary" id="socialEventBtn">See What\'s Happening Around Town</button>');if(document.getElementById('socialEventBtn'))socialEventBtn.onclick=socialEvent;

const sagaChapters=[
 ['The First Bell','At sunrise, the chapel bell rings once even though nobody is inside. A tiny brass tag marked “7” is found beneath the rope.','Compare the tag with old town records','Ask Samuel Reed about the chapel history'],
 ['A Bell at the Depot','That evening, a second bell sound comes from the railroad yard. Stationmaster Eli Mercer finds a wooden crate stamped with a defunct freight company.','Inspect the freight stamp','Check the old timetable archive'],
 ['The Printer’s Mark','A third clue appears in the Gazette press room: an antique printer’s mark shaped like a bell.','Ask Ada who brought the old type block','Search bound newspaper editions'],
 ['Seven Names','An 1870s article lists seven founding families who financed the first public well, school, depot, clinic, chapel, bridge, and newspaper.','Map the seven civic sites','Compare the family names to town ledgers'],
 ['The Missing Deed','One founding-family deed is absent from the courthouse archive, and its parcel lies beneath modern Market Row.','Check the transfer ledger','Ask the judge for the archived survey'],
 ['The Bellmaker’s Letter','A letter explains that seven small bells once marked a town relief fund created after a severe winter. The bells were hidden when a dishonest trustee tried to seize it.','Trace the trustee’s account','Follow the letter’s location clue'],
 ['Under Market Row','A sealed iron box is discovered beneath an old floor beam—not treasure, but records showing the relief fund belonged to the whole town.','Bring the records to the courthouse','Bring the Gazette to document the discovery'],
 ['Founders Day Bells','The records are restored publicly. Replicas of the seven bells are hung across Dusty Trail as symbols of shared civic responsibility.','Attend the dedication','Write your own journal ending']
];
function renderSaga(){const st=document.getElementById('sagaStage'),bar=document.getElementById('sagaBar');if(!st||!bar)return;const i=Math.min(state.saga6,sagaChapters.length);bar.style.width=`${(i/sagaChapters.length)*100}%`;if(i>=sagaChapters.length){st.innerHTML='<h3>🔔 The Seven Bells — Complete</h3><p>Dusty Trail has restored the old civic records, and the seven bells now ring only on Founders Day. You can replay the world freely; nothing closes after the story.</p><button class="secondary" id="sagaReplay">Read Ending Again</button>';document.getElementById('sagaReplay').onclick=()=>toast('The town remembers what you uncovered.');return;}const c=sagaChapters[i];st.innerHTML=`<p class="kicker">CHAPTER ${i+1} OF ${sagaChapters.length}</p><h3>🔔 ${c[0]}</h3><div class="dialogue-box">${c[1]}</div><div class="action-row"><button class="secondary sagaPick">${c[2]}</button><button class="secondary sagaPick">${c[3]}</button></div>`;document.querySelectorAll('.sagaPick').forEach(b=>b.onclick=()=>{state.saga6++;addTokens(2,`Chapter ${i+1}`);reward(3,i===sagaChapters.length-1?'Seven Bells commemorative pin':null,`Seven Bells: ${c[0]}`);checkAchievements();renderSaga();});}
renderSaga();

achievementDefs.push(
 {id:'campkeeper',icon:'🔥',name:'Camp Keeper',desc:'Hear 4 campfire stories.',ok:()=>state.camp.stories>=4},
 {id:'merchant',icon:'🪙',name:'Trading Row Regular',desc:'Own 5 Frontier Market items.',ok:()=>state.marketOwned.length>=5},
 {id:'stylist',icon:'🤠',name:'Frontier Style',desc:'Wear an outfit other than Trail Traveler.',ok:()=>state.outfit!=='Trail Traveler'},
 {id:'roadwise',icon:'🌵',name:'Road Wise',desc:'Experience 6 different road encounters.',ok:()=>state.encounters.length>=6},
 {id:'neighbor',icon:'🤝',name:'Good Neighbor',desc:'Complete 4 social town moments.',ok:()=>state.socialEvents.length>=4},
 {id:'sevenbells',icon:'🔔',name:'Keeper of the Seven Bells',desc:'Complete the eight-chapter Seven Bells story.',ok:()=>state.saga6>=8}
);
checkAchievements();

const v6OpenJournal=openJournal;
openJournal=function(){v6OpenJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Frontier Life</h3><p>🪙 ${state.tokens} market tokens • 🔥 ${state.camp.stories} campfire stories • 🌵 ${state.encounters.length} road encounters</p><h3>Western Identity</h3><p>${state.outfit} • “${state.title}”</p><h3>Seven Bells Saga</h3><p>${Math.min(state.saga6,8)} of 8 chapters complete.</p><h3>Town Moments</h3><p>${state.socialEvents.length} social events remembered.</p></section>`);};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

// Expand Surprise Me for Version 6.
const v6Surprise=document.querySelector('[data-action="random-adventure"]');if(v6Surprise)v6Surprise.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

renderCamp();renderMarket();renderWardrobe();renderSaga();renderStatus();


// VERSION 7 — Dusty Trail Community Expansion
state.businesses = state.businesses || [];
state.businessDay = state.businessDay || {};
state.businessCoins = Number.isFinite(state.businessCoins) ? state.businessCoins : 10;
state.schoolDone = state.schoolDone || [];
state.mailDone = state.mailDone || [];
state.mailDay = state.mailDay || 0;
state.fairTown = state.fairTown || 'Copper Creek';
state.fairWins = state.fairWins || [];
state.npcStories = state.npcStories || {};
state.deepCases = state.deepCases || {};
save();

const frontierBusinesses=[
 {id:'bakery',icon:'🥧',name:'Prairie Pie Counter',cost:6,desc:'Serve pies, coffee, and rotating breakfast rushes.',events:['The peach shipment is late. Substitute apple, berry, or wait?','A trail crew arrives five minutes before closing.','The pie judge from Copper Creek quietly walks in.']},
 {id:'printshop',icon:'📰',name:'Tiny Print Shop',cost:7,desc:'Print notices, cards, menus, and special Gazette inserts.',events:['The sheriff needs 20 missing-horse notices before noon.','A wedding announcement has two misspelled names.','The Gazette presses jam during breaking news.']},
 {id:'trading',icon:'🧺',name:'Trading Post Booth',cost:8,desc:'Stock useful trail goods and interesting keepsakes.',events:['A traveler offers to trade a compass for three blankets.','A crate arrives with no invoice attached.','A child has lost the coin meant for a school slate.']},
 {id:'stablebiz',icon:'🐴',name:'Livery Partnership',cost:9,desc:'Help manage trail horses, rentals, and boarding.',events:['A nervous horse refuses to enter the stable.','Two travelers claim the same saddle tag.','A storm is coming and three horses remain outside.']},
 {id:'photo',icon:'📷',name:'Frontier Portrait Tent',cost:7,desc:'Pose townspeople for tintype-style keepsake portraits.',events:['Founders Day families form a line around the tent.','The backdrop tears just before a wedding portrait.','An outlaw-lookalike asks for a very serious portrait.']},
 {id:'music',icon:'🎻',name:'Music & Social Hall',cost:10,desc:'Host dances, recitals, storytelling nights, and town socials.',events:['The fiddle player misses the evening train.','Two clubs reserve the hall for the same hour.','A shy child wants to sing at open-mic night.']}
];
function renderBusinesses(){
 const g=document.getElementById('businessGrid'),s=document.getElementById('businessSummary'); if(!g||!s)return;
 s.innerHTML=`<span class="market-wallet">🪙 Business Tokens: ${state.businessCoins}</span><p>Earn tokens through optional town work, fairs, mysteries, and business events. Owning a business never creates mandatory tasks.</p>`;
 g.innerHTML=frontierBusinesses.map((b,i)=>`<article class="business-card ${state.businesses.includes(b.id)?'owned':''}"><div class="icon">${b.icon}</div><h3>${b.name}</h3><p>${b.desc}</p>${state.businesses.includes(b.id)?`<button class="secondary bizOpen" data-biz="${i}">Open for Today</button>`:`<button class="secondary bizBuy" data-biz="${i}">Acquire for ${b.cost} 🪙</button>`}</article>`).join('');
 document.querySelectorAll('.bizBuy').forEach(x=>x.onclick=()=>{const b=frontierBusinesses[+x.dataset.biz];if(state.businessCoins<b.cost){toast('Not enough business tokens yet.');return;}state.businessCoins-=b.cost;state.businesses.push(b.id);reward(2,`${b.name} deed`,`Opened ${b.name}`);renderBusinesses();checkAchievements();});
 document.querySelectorAll('.bizOpen').forEach(x=>x.onclick=()=>runBusiness(+x.dataset.biz));
}
function runBusiness(i){const b=frontierBusinesses[i];const evt=b.events[(state.day+i)%b.events.length];businessStage.innerHTML=`<h3>${b.icon} ${b.name}</h3><p><strong>Today's situation:</strong> ${evt}</p><div class="action-row"><button class="secondary bizChoice">Handle it calmly</button><button class="secondary bizChoice">Ask a townsperson for help</button><button class="secondary bizChoice">Turn it into a town story</button></div><p id="bizResult"></p>`;document.querySelectorAll('.bizChoice').forEach((x,k)=>x.onclick=()=>{const lines=['You solve it without much fuss and customers leave smiling.','A neighbor pitches in. The business feels like part of the community.','By supper, half the town has heard a funny version of what happened.'];bizResult.textContent=lines[k];state.businessCoins+=2;if(!state.businessDay[b.id]||state.businessDay[b.id]!==state.day){state.businessDay[b.id]=state.day;reward(2,null,`Ran ${b.name} on Day ${state.day}`);}save();renderBusinesses();checkAchievements();});}
renderBusinesses();

const schoolActivities=[
 {id:'object',icon:'🪶',name:'Mystery Object',q:'A small metal tool has a wheel with sharp teeth. What was it likely used for?',opts:['Marking fabric patterns','Shoe polishing','Train whistles'],a:0,ex:'Tracing wheels were used in sewing to transfer pattern markings.'},
 {id:'map',icon:'🗺️',name:'Map Desk',q:'A railroad town usually grew fastest when it had what nearby?',opts:['A useful rail stop or junction','An ocean harbor in every case','A royal palace'],a:0,ex:'Rail access could connect people, freight, livestock, and markets.'},
 {id:'words',icon:'✏️',name:'Frontier Word',q:'Which word best means “a person who settles in a new area”?',opts:['Settler','Conductor','Telegrapher'],a:0,ex:'Settler is the broad term; the others describe specific occupations.'},
 {id:'myth',icon:'🎬',name:'Movie Myth Check',q:'Were every Old West town’s streets constantly full of formal gun duels?',opts:['No—films exaggerated this image','Yes—every noon','Only on Sundays'],a:0,ex:'The ritualized showdown is a powerful movie image, not a description of normal daily life.'},
 {id:'numbers',icon:'🧮',name:'Mercantile Math',q:'Three sacks cost 4 tokens each. Total?',opts:['12','7','16'],a:0,ex:'3 × 4 = 12.'},
 {id:'quiet',icon:'📖',name:'Read the Chalkboard',q:'Today’s chalkboard note: “History is not only famous names. It is also work, family, travel, food, weather, inventions, mistakes, and ordinary days.”',opts:['Close the book quietly'],a:0,ex:'No quiz here. Just a thought to carry around.'}
];
function renderSchool(){const g=document.getElementById('schoolActivityGrid');if(!g)return;g.innerHTML=schoolActivities.map((a,i)=>`<article class="school-card ${state.schoolDone.includes(a.id)?'done':''}"><div class="icon">${a.icon}</div><h3>${a.name}</h3><p>${state.schoolDone.includes(a.id)?'Completed before — play again anytime.':'A short no-pressure schoolhouse activity.'}</p><button class="secondary schoolStart" data-school="${i}">Open Lesson</button></article>`).join('');document.querySelectorAll('.schoolStart').forEach(x=>x.onclick=()=>startSchool(+x.dataset.school));}
function startSchool(i){const a=schoolActivities[i];schoolStage.innerHTML=`<h3>${a.icon} ${a.name}</h3><p>${a.q}</p><div class="action-row">${a.opts.map((o,k)=>`<button class="secondary schoolAnswer" data-ok="${k===a.a?1:0}">${o}</button>`).join('')}</div><p id="schoolResult"></p>`;document.querySelectorAll('.schoolAnswer').forEach(x=>x.onclick=()=>{if(x.dataset.ok==='1'){schoolResult.textContent='✓ '+a.ex;if(!state.schoolDone.includes(a.id))state.schoolDone.push(a.id);reward(1,null,`Schoolhouse: ${a.name}`);checkAchievements();}else schoolResult.textContent='Try another choice. Nothing is deducted.';renderSchool();});}
renderSchool();

const mailMissions=[
 {id:'route',icon:'📮',name:'Morning Letter Route',q:'Letter for Dr. Clara Boone. Where does it go?',answers:['Clinic beside Prairie Kitchen','Rail freight shed','Silver Needle Mine'],a:0},
 {id:'parcel',icon:'📦',name:'Mystery Parcel',q:'The label says “FRAGILE — PRINTING TYPE.” Best destination?',answers:['Frontier Gazette','Livery Stable','Cattle pasture'],a:0},
 {id:'telegraph',icon:'⚡',name:'Decode Telegram',q:'“TRAIN DELAYED STOP BRIDGE INSPECTION STOP” means…',answers:['Train is delayed for a bridge inspection','Bridge has vanished','Train arrives early'],a:0},
 {id:'express',icon:'🚂',name:'Express Pouch',q:'Which item should ride the fastest secure route?',answers:['Time-sensitive legal papers','A sack of potatoes','An empty crate'],a:0}
];
function renderMail(){const b=document.getElementById('postOfficeBoard');if(!b)return;const order=[...mailMissions].sort((x,y)=>((state.day+x.id.length)%5)-((state.day+y.id.length)%5));b.innerHTML=`<div class="mailbag">📬 Day ${state.day} Mailbag</div><div class="compact-grid">${order.map(m=>`<article class="mail-card ${state.mailDone.includes(m.id)?'done':''}"><h3>${m.icon} ${m.name}</h3><p>${state.mailDone.includes(m.id)?'Delivered before. Routes can be replayed.':'Waiting in today’s pouch.'}</p><button class="secondary mailStart" data-mail="${m.id}">Handle</button></article>`).join('')}</div>`;document.querySelectorAll('.mailStart').forEach(x=>x.onclick=()=>startMail(x.dataset.mail));}
function startMail(id){const m=mailMissions.find(x=>x.id===id);mailStage.innerHTML=`<h3>${m.icon} ${m.name}</h3><p>${m.q}</p><div class="action-row">${m.answers.map((a,k)=>`<button class="secondary mailAnswer" data-ok="${k===m.a?1:0}">${a}</button>`).join('')}</div><p id="mailResult"></p>`;document.querySelectorAll('.mailAnswer').forEach(x=>x.onclick=()=>{if(x.dataset.ok==='1'){mailResult.textContent='Stamped, sorted, and headed the right direction.';if(!state.mailDone.includes(id))state.mailDone.push(id);state.businessCoins+=1;reward(2,null,`Post Office: ${m.name}`);renderMail();checkAchievements();}else mailResult.textContent='That would send it to the wrong place. Try another slot.';});}
renderMail();

const fairs={
 'Copper Creek':{icon:'🎪',activities:['Ribbon Baking','Horseshoe Pitch','Town Band','Quilt Display']},
 'Canyon Ridge':{icon:'🏜️',activities:['Trail Map Race','Photography Booth','Rock & Mineral Table','Campfire Stories']},
 'Blackwater Crossing':{icon:'🌉',activities:['Riverboat Model Show','Fishing Tale Contest','Pie Auction','Lantern Parade']}
};
function renderFairs(){const r=document.getElementById('fairRoute'),g=document.getElementById('fairActivityGrid');if(!r||!g)return;r.innerHTML=Object.entries(fairs).map(([n,f])=>`<button class="fair-stop ${state.fairTown===n?'active':''}" data-fair="${n}">${f.icon}<strong>${n}</strong></button>`).join('');const f=fairs[state.fairTown];const rotation=f.activities.map((a,i)=>f.activities[(i+state.day)%f.activities.length]);g.innerHTML=rotation.map((a,i)=>`<article class="festival-card"><div class="big">${['🏆','🎟️','🎶','🍰'][i]}</div><h3>${a}</h3><p>${i===0?'Today’s featured competition.':'Open all afternoon.'}</p><button class="secondary fairPlay" data-act="${a}">Join In</button></article>`).join('');document.querySelectorAll('.fair-stop').forEach(x=>x.onclick=()=>{state.fairTown=x.dataset.fair;save();renderFairs();fairStage.innerHTML=`<h3>Welcome to ${state.fairTown}</h3><p>The fair schedule changes as the days pass.</p>`;});document.querySelectorAll('.fairPlay').forEach(x=>x.onclick=()=>{const a=x.dataset.act;const key=state.fairTown+'-'+a;if(!state.fairWins.includes(key))state.fairWins.push(key);state.businessCoins+=1;reward(1,null,`Fair activity: ${a} at ${state.fairTown}`);fairStage.innerHTML=`<h3>🎟️ ${a}</h3><p>You join in, meet a few travelers, and leave with a little fair ribbon for the journal.</p>`;renderFairs();checkAchievements();});}
renderFairs();

const npcStoryDefs=[
 {id:'mae',name:'Deputy Mae Carter',icon:'⭐',need:0,chapters:['Mae asks you to help reconstruct the route of an old stagecoach robbery from forgotten notes.','She admits her father once investigated the same route and never solved it.','A final map suggests the “robbery” may actually have hidden a rescue mission.']},
 {id:'rosa',name:'Rosa Bell',icon:'🥧',need:0,chapters:['Rosa finds an old recipe card signed only “M.B.”','A visiting family recognizes the handwriting from Copper Creek.','The recipe leads to a reunion between two branches of a family separated for decades.']},
 {id:'ada',name:'Ada Quinn',icon:'🎹',need:0,chapters:['Ada receives sheet music with no return address.','The melody matches a tune played in Blackwater Crossing years ago.','The sender turns out to be an old performing partner inviting Ada to a reunion concert.']},
 {id:'clara',name:'Dr. Clara Boone',icon:'🩺',need:0,chapters:['Dr. Boone discovers old clinic notes from the town’s first physician.','The notes mention a winter epidemic and a volunteer network.','You help preserve the names of ordinary townspeople who kept neighbors fed and warm.']}
];
function relationshipForStory(id){return state.relationships[id]||0}
function renderNpcStories(){const g=document.getElementById('npcStoryGrid');if(!g)return;g.innerHTML=npcStoryDefs.map((n,i)=>{const step=state.npcStories[n.id]||0,rel=relationshipForStory(n.id);return `<article class="person-card"><div class="person-face">${n.icon}</div><h3>${n.name}</h3><p>Relationship: ${relationshipName(rel)}</p><p>Story chapter: ${Math.min(step+1,n.chapters.length)} / ${n.chapters.length}</p><button class="secondary npcStoryStart" data-npcstory="${i}">${step>=n.chapters.length?'Revisit Story':'Continue Story'}</button></article>`}).join('');document.querySelectorAll('.npcStoryStart').forEach(x=>x.onclick=()=>startNpcStory(+x.dataset.npcstory));}
function startNpcStory(i){const n=npcStoryDefs[i],step=state.npcStories[n.id]||0;if(step>=n.chapters.length){npcStoryStage.innerHTML=`<h3>${n.icon} ${n.name}</h3><p>You already completed this little character arc. You can still spend time with ${n.name.split(' ')[0]} in Townspeople.</p>`;return;}npcStoryStage.innerHTML=`<h3>${n.icon} ${n.name} — Chapter ${step+1}</h3><div class="dialogue-box">${n.chapters[step]}</div><div class="action-row"><button class="secondary npcStoryChoice">Listen and help</button><button class="secondary npcStoryChoice">Ask another question</button><button class="secondary npcStoryChoice">Just keep them company</button></div>`;document.querySelectorAll('.npcStoryChoice').forEach(x=>x.onclick=()=>{state.npcStories[n.id]=step+1;state.relationships[n.id]=(state.relationships[n.id]||0)+1;reward(2,step===n.chapters.length-1?`${n.name} story keepsake`:null,`Character story: ${n.name} chapter ${step+1}`);renderNpcStories();checkAchievements();npcStoryStage.innerHTML+=`<p class="social-event">Chapter complete. The next part will be here whenever you return.</p>`;});}
renderNpcStories();

const deepCaseDefs=[
 {id:'clock',icon:'🕰️',title:'The Clock That Stopped Twice',chapters:['A clockmaker claims the courthouse clock stopped at 2:17 twice in one week.','Witnesses disagree about whether a freight train passed at the same moment.','A loose telegraph line is found touching the clock tower mechanism.','Records reveal someone used the predictable stoppage to fake an alibi.'],keepsake:'Clockmaker evidence tag'},
 {id:'portrait',icon:'🖼️',title:'The Portrait With Two Names',chapters:['An old hotel portrait is labeled with one name on the frame and another on the back.','The Gazette archive shows both names arriving in town on the same day.','A school register reveals they were sisters traveling under different surnames.','The mystery ends not with a crime, but a hidden family story preserved in the town archive.'],keepsake:'Hotel archive ribbon'},
 {id:'freight',icon:'📦',title:'Freight Car Number Nine',chapters:['A sealed freight car arrives with paperwork for a rail line that closed years ago.','The lock is modern, but the shipping stamp is old.','Inside are preserved town records being quietly returned by a retired collector.','One missing ledger page connects back to the Seven Bells civic fund.'],keepsake:'Freight seal Number Nine'}
];
function renderDeepCases(){const a=document.getElementById('caseArchive');if(!a)return;a.innerHTML=deepCaseDefs.map((c,i)=>{const s=state.deepCases[c.id]||0;return `<article class="deep-case-card ${s>=c.chapters.length?'solved':''}"><div class="icon">${c.icon}</div><h3>${c.title}</h3><p>${s>=c.chapters.length?'Case archived.':`Chapter ${s+1} of ${c.chapters.length}`}</p><button class="secondary deepCaseStart" data-caseplus="${i}">${s>=c.chapters.length?'Review':'Open File'}</button></article>`}).join('');document.querySelectorAll('.deepCaseStart').forEach(x=>x.onclick=()=>startDeepCase(+x.dataset.caseplus));}
function startDeepCase(i){const c=deepCaseDefs[i],s=state.deepCases[c.id]||0;if(s>=c.chapters.length){deepCaseStage.innerHTML=`<h3>${c.icon} ${c.title}</h3><p>Case complete. The file is available for review in your journal discoveries.</p>`;return;}deepCaseStage.innerHTML=`<h3>${c.icon} ${c.title} — Chapter ${s+1}</h3><p>${c.chapters[s]}</p><div class="action-row"><button class="secondary casePlusChoice">Check records</button><button class="secondary casePlusChoice">Interview witnesses</button><button class="secondary casePlusChoice">Inspect the location</button></div><p id="casePlusLog"></p>`;document.querySelectorAll('.casePlusChoice').forEach((x,k)=>x.onclick=()=>{casePlusLog.textContent=['The records give you one useful date.','A witness remembers a detail everyone else skipped.','The location reveals a physical clue that changes the timeline.'][k];state.deepCases[c.id]=s+1;if(s+1>=c.chapters.length){state.businessCoins+=3;reward(5,c.keepsake,`Solved extended case: ${c.title}`);}else reward(2,null,`Extended case: ${c.title} chapter ${s+1}`);renderDeepCases();checkAchievements();});}
renderDeepCases();

// Fold Version 7 into Surprise Me.
const v7Random=document.querySelector('[data-action="random-adventure"]');if(v7Random)v7Random.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','ownership','schoolhouse','postoffice','faircircuit','npstories','deepmysteries','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

// Extra achievements layered onto the existing cabinet.
achievementDefs.push(
 {id:'entrepreneur',icon:'🏪',name:'Dusty Trail Entrepreneur',desc:'Own 3 frontier businesses.',ok:()=>state.businesses.length>=3},
 {id:'schoolhouse',icon:'🔔',name:'Schoolhouse Regular',desc:'Complete 5 schoolhouse activities.',ok:()=>state.schoolDone.length>=5},
 {id:'postmaster',icon:'📮',name:'Trusted With the Mail',desc:'Complete all post office mission types.',ok:()=>state.mailDone.length>=mailMissions.length},
 {id:'fairgoer',icon:'🎪',name:'Fair Circuit Traveler',desc:'Join 6 fair activities across the circuit.',ok:()=>state.fairWins.length>=6},
 {id:'storyfriend',icon:'🤝',name:'Stories Between Friends',desc:'Finish 2 character story arcs.',ok:()=>Object.entries(state.npcStories).filter(([id,v])=>v>=(npcStoryDefs.find(n=>n.id===id)?.chapters.length||99)).length>=2},
 {id:'archivist',icon:'🗃️',name:'Investigation Archivist',desc:'Finish all 3 extended case files.',ok:()=>deepCaseDefs.every(c=>(state.deepCases[c.id]||0)>=c.chapters.length)}
);
checkAchievements();

// Extend journal with V7 systems while preserving previous entries.
const v7PreviousJournal=openJournal;
openJournal=function(){v7PreviousJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Dusty Trail Community</h3><p><strong>Businesses owned:</strong> ${state.businesses.length} / ${frontierBusinesses.length}<br><strong>Business tokens:</strong> ${state.businessCoins}<br><strong>Schoolhouse activities:</strong> ${state.schoolDone.length} / ${schoolActivities.length}<br><strong>Post office missions:</strong> ${state.mailDone.length} / ${mailMissions.length}<br><strong>Fair activities joined:</strong> ${state.fairWins.length}<br><strong>Character story chapters:</strong> ${Object.values(state.npcStories).reduce((a,b)=>a+b,0)}<br><strong>Extended case progress:</strong> ${deepCaseDefs.map(c=>`${c.title}: ${Math.min(state.deepCases[c.id]||0,c.chapters.length)}/${c.chapters.length}`).join('<br>')}</p></section>`);};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

if(typeof townEvents!=='undefined')townEvents.push(
 ['The postmaster waves a telegram from the doorway.','It is addressed to somebody who left Dusty Trail twenty years ago.'],
 ['A traveling fair caravan rolls through town.','Three wagons continue toward Canyon Ridge while the pie judges stay behind.'],
 ['The school bell rings after supper.','Miss Hart is opening the classroom for an evening history club.'],
 ['A FOR LEASE sign appears on an empty storefront.','By breakfast, six townspeople already have opinions about what should open there.'],
 ['A thick new case folder lands on the sheriff’s desk.','The label reads only: CLOCK TOWER — DO NOT FILE YET.']
);

// ===== FINAL EXPANSION WORKING LAYER: LIVING WORLD, MUSEUM, PICTURE HOUSE, RODEO, COUNCIL, ALBUM, STORY GENERATOR, ALMANAC =====
state.calendarEvents=state.calendarEvents||[];
state.museumSeen=state.museumSeen||[];
state.moviesPlayed=state.moviesPlayed||[];
state.rodeoWins=state.rodeoWins||[];
state.councilProjects=state.councilProjects||[];
state.savedLegends=state.savedLegends||[];
state.almanacSeen=state.almanacSeen||[];
save();

const seasonalEvents={
 Spring:[['Creek-Rise Day','The spring creek is high enough to change two trail crossings.'],['Wildflower Sunday','The chapel steps and schoolhouse yard fill with fresh blooms.'],['Foaling Week','The livery is busy with newborn horses and proud ranch families.']],
 Summer:[['Long-Light Social','Music runs late because sunset takes its time.'],['Dust & Lemonade Day','Trading Row puts tubs of cold lemonade beneath striped awnings.'],['Ranchers’ Exchange','Families compare stock, tack, recipes, and trail news.']],
 Autumn:[['Harvest Lantern Night','Lanterns line Main Street and the Prairie Kitchen bakes until midnight.'],['Railroad Appreciation Day','The depot displays old tickets, tools, and conductor caps.'],['First-Frost Market','Blankets, preserves, and winter supplies fill the storefronts.']],
 Winter:[['Snow-on-the-Mesa Morning','Whispering Mesa turns white before breakfast.'],['Firewood Saturday','Neighbors stack wood for older residents before the next cold snap.'],['Winter Story Night','The saloon closes the card tables and makes room for storytellers.']]
};
function calendarSeason(){const raw=state.season||'Autumn';if(raw==='Late Summer')return 'Summer';return raw;}
function renderCalendar(){
 const h=document.getElementById('calendarHero'),g=document.getElementById('calendarEventGrid');if(!h||!g)return;
 const season=calendarSeason(),events=seasonalEvents[season]||seasonalEvents.Autumn;
 h.innerHTML=`<div><span class="calendar-icon">📅</span><p class="kicker">DAY ${state.day||1}</p><h3>${season} in Dusty Trail</h3><p>${hourLabel?hourLabel():''} • ${state.weather||'Clear'}</p></div><div class="action-row"><button class="primary" id="advanceCalendar">Advance One Day</button><button class="secondary" id="calendarRumor">Hear Today's Rumor</button></div>`;
 g.innerHTML=events.map((e,i)=>`<article class="mini-card"><h3>${e[0]}</h3><p>${e[1]}</p><button class="secondary calendarEvent" data-ce="${i}">${state.calendarEvents.includes(season+'-'+i)?'Revisit':'Join In'}</button></article>`).join('');
 document.getElementById('advanceCalendar').onclick=()=>{state.day=(state.day||1)+1;state.hour=9;const weathers=['Clear','Breezy','Cloudy','Light Rain','Dry & Warm','Cool'];state.weather=weathers[Math.floor(Math.random()*weathers.length)];if(state.day%12===0){const ss=['Spring','Summer','Autumn','Winter'];state.season=ss[(ss.indexOf(calendarSeason())+1)%ss.length];}save();renderWorldClock&&renderWorldClock();renderCalendar();calendarStage.innerHTML='<h3>A new day begins.</h3><p>Shops change their chatter, routes reshuffle, and fresh rumors start moving through town.</p>';};
 document.getElementById('calendarRumor').onclick=()=>{calendarStage.innerHTML=`<h3>Today’s Rumor</h3><p>${hearRumor?hearRumor():'Somebody saw lantern light beyond the ridge.'}</p>`;};
 document.querySelectorAll('.calendarEvent').forEach(b=>b.onclick=()=>{const key=season+'-'+b.dataset.ce,e=events[+b.dataset.ce];if(!state.calendarEvents.includes(key))state.calendarEvents.push(key);reward(1,null,`Seasonal event: ${e[0]}`);calendarStage.innerHTML=`<h3>${e[0]}</h3><p>${e[1]}</p><p>You join the town for a while and leave whenever you please.</p>`;renderCalendar();});
}
renderCalendar();

const museumItems=[
 {icon:'🧲',name:'Horseshoe & Farrier Tools',fact:'Horses were central to travel and ranch work, and farriers maintained hooves and shoes.',myth:'Not every person in a western town owned or rode a horse every day.'},
 {icon:'📨',name:'Telegraph Key',fact:'Telegraph lines sped up long-distance communication before telephones became widespread.',myth:'Messages were not instantaneous everywhere; service depended on connected lines and staffed offices.'},
 {icon:'🧵',name:'Work Dress & Apron',fact:'Clothing reflected work, climate, available materials, and personal means.',myth:'Movie costumes often make frontier clothing cleaner, flashier, and more uniform than everyday reality.'},
 {icon:'🚂',name:'Railroad Lantern',fact:'Railroads transformed migration, freight movement, markets, and town growth across the West.',myth:'A railroad arriving did not automatically make every town prosper.'},
 {icon:'🪶',name:'Buffalo Soldier Exhibit',fact:'Black U.S. Army regiments served in the West after the Civil War and became known as Buffalo Soldiers.',myth:'Western history was never only a story of white cowboys and outlaws.'},
 {icon:'📜',name:'Homestead Papers',fact:'Federal land policies encouraged settlement but also intensified dispossession of Indigenous peoples.',myth:'“Empty land” is a misleading picture of western expansion; Native nations already lived across these regions.'}
];
function renderMuseum(){const g=document.getElementById('museumGrid');if(!g)return;g.innerHTML=museumItems.map((m,i)=>`<article class="museum-card ${state.museumSeen.includes(i)?'seen':''}"><div class="museum-icon">${m.icon}</div><h3>${m.name}</h3><button class="secondary museumOpen" data-m="${i}">Inspect Exhibit</button></article>`).join('');document.querySelectorAll('.museumOpen').forEach(b=>b.onclick=()=>{const i=+b.dataset.m,m=museumItems[i];if(!state.museumSeen.includes(i))state.museumSeen.push(i);reward(1,null,`Museum exhibit: ${m.name}`);museumStage.innerHTML=`<h3>${m.icon} ${m.name}</h3><p><strong>Historical context:</strong> ${m.fact}</p><p><strong>Movie myth check:</strong> ${m.myth}</p>`;renderMuseum();});}
renderMuseum();

const movieStories=[
 {icon:'🌅',title:'Sunset at Broken Mesa',role:'a traveler who finds a deserted coach',problem:'a locked dispatch box bears the name of a town erased from the map',twist:'the “outlaw trail” may actually be an old emergency route'},
 {icon:'🚂',title:'Last Train to Copper Creek',role:'a railroad detective',problem:'one passenger claims to have boarded at a station that closed years ago',twist:'an old timetable contains a handwritten platform number'},
 {icon:'⭐',title:'The Sheriff Who Wouldn’t Draw',role:'a newly appointed sheriff',problem:'two feuding families expect you to take sides',twist:'the dispute began with a land-marker mistake, not a crime'},
 {icon:'🎹',title:'Music at Midnight',role:'the owner of a crowded saloon',problem:'a stranger requests the same song three nights in a row',twist:'the tune is a coded signal for someone waiting outside town'}
];
function renderMovies(){const g=document.getElementById('movieGrid');if(!g)return;g.innerHTML=movieStories.map((m,i)=>`<article class="movie-card"><div class="poster-icon">${m.icon}</div><p class="kicker">ORIGINAL WESTERN</p><h3>${m.title}</h3><p>You play ${m.role}.</p><button class="primary moviePlay" data-movie="${i}">Start Picture</button></article>`).join('');document.querySelectorAll('.moviePlay').forEach(b=>b.onclick=()=>playMovie(+b.dataset.movie));}
function playMovie(i){const m=movieStories[i];if(!state.moviesPlayed.includes(i))state.moviesPlayed.push(i);movieStage.innerHTML=`<h3>🎬 ${m.title}</h3><p><strong>Your role:</strong> You are ${m.role}.</p><p><strong>Opening problem:</strong> ${m.problem}.</p><p><strong>Halfway twist:</strong> ${m.twist}.</p><div class="action-row"><button class="secondary movieChoice">Investigate quietly</button><button class="secondary movieChoice">Bring in a trusted friend</button><button class="secondary movieChoice">Walk away and see who follows</button></div><p id="movieResult"></p>`;document.querySelectorAll('.movieChoice').forEach((b,k)=>b.onclick=()=>{movieResult.textContent=['You notice a detail that was invisible when everyone was talking.','Two perspectives reveal that part of the story was misunderstood.','Your patience works—the person hiding information makes the next move.'][k];reward(2,null,`Picture House: ${m.title}`);});}
renderMovies();

const rodeoEvents=[
 {id:'barrels',icon:'🐎',title:'Barrel Pattern',desc:'Guide your horse around three markers without clipping one.'},
 {id:'rope',icon:'⭕',title:'Rope-the-Post',desc:'A simple timing challenge using a practice post—not an animal.'},
 {id:'trail',icon:'🌵',title:'Trail Obstacle Course',desc:'Pick the safest route through gates, poles, and shallow water.'},
 {id:'show',icon:'🎀',title:'Horse Show',desc:'Present your trail horse and earn a ribbon for care and partnership.'}
];
function renderRodeo(){const g=document.getElementById('rodeoGrid'),s=document.getElementById('rodeoScoreboard');if(!g||!s)return;s.innerHTML=`<strong>Rodeo ribbons:</strong> ${state.rodeoWins.length} &nbsp; • &nbsp; <strong>${state.horse?.name||'Trail Horse'} bond:</strong> ${state.horse?.bond||0}/10`;g.innerHTML=rodeoEvents.map((r,i)=>`<article class="festival-card"><div class="big">${r.icon}</div><h3>${r.title}</h3><p>${r.desc}</p><button class="secondary rodeoPlay" data-rodeo="${i}">Enter Event</button></article>`).join('');document.querySelectorAll('.rodeoPlay').forEach(b=>b.onclick=()=>rodeoPlay(+b.dataset.rodeo));}
function rodeoPlay(i){const r=rodeoEvents[i],score=Math.floor(Math.random()*41)+60;let msg=`You finish with a score of ${score}/100.`;if(score>=85&&!state.rodeoWins.includes(r.id)){state.rodeoWins.push(r.id);reward(2,`${r.title} ribbon`,`Rodeo win: ${r.title}`);msg+=' That earns a ribbon.';}else reward(1,null,`Rodeo event: ${r.title}`);if(state.horse){state.horse.bond=Math.min(10,(state.horse.bond||0)+1);}save();rodeoStage.innerHTML=`<h3>${r.icon} ${r.title}</h3><p>${msg}</p><button class="secondary" id="rodeoAgain">Try Again</button>`;document.getElementById('rodeoAgain').onclick=()=>rodeoPlay(i);renderRodeo();}
renderRodeo();

const councilProjects=[
 {id:'park',icon:'🌳',name:'Cottonwood Commons',desc:'Turn an unused lot into shade trees, benches, and a community picnic ground.',result:'Main Street gains a quiet green space for fairs, lunches, and evening music.'},
 {id:'library',icon:'📚',name:'Reading Room',desc:'Add a public reading room beside the schoolhouse and Gazette archive.',result:'The schoolhouse gains evening reading hours and traveling-book shelves.'},
 {id:'bridge',icon:'🌉',name:'Creek Footbridge',desc:'Build a safer pedestrian crossing beside the wagon ford.',result:'The creek becomes easier to cross during high water and evening walks.'},
 {id:'garden',icon:'🌻',name:'Community Garden',desc:'Create shared growing beds behind the Prairie Kitchen.',result:'The kitchen starts serving a seasonal “town garden” supper.'}
];
function renderCouncil(){const b=document.getElementById('councilBoard');if(!b)return;b.innerHTML=councilProjects.map((p,i)=>`<article class="council-card ${state.councilProjects.includes(p.id)?'approved':''}"><div class="big">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><button class="secondary councilVote" data-cp="${i}">${state.councilProjects.includes(p.id)?'Project Approved':'Support Project'}</button></article>`).join('');document.querySelectorAll('.councilVote').forEach(x=>x.onclick=()=>{const p=councilProjects[+x.dataset.cp];if(!state.councilProjects.includes(p.id)){state.councilProjects.push(p.id);reward(2,null,`Town project: ${p.name}`);}councilStage.innerHTML=`<h3>${p.icon} ${p.name}</h3><p>${p.result}</p>`;renderCouncil();});}
renderCouncil();

function renderAlbum(){const g=document.getElementById('albumGrid');if(!g)return;const rels=Object.entries(state.relationships||{}).filter(([,v])=>v!==0).length;const cards=[['🗺️','Places Visited',state.visited?.length||0],['🎒','Keepsakes',state.items?.length||0],['🔎','Discoveries',state.discoveries?.length||0],['🤝','Relationships',rels],['🏆','Achievements',state.achievements?.length||0],['🚂','Rail Trips',state.railTrips||0],['📖','Saved Story Seeds',state.savedLegends.length],['🎬','Picture House Stories',state.moviesPlayed.length]];g.innerHTML=cards.map(c=>`<article class="album-card"><div class="big">${c[0]}</div><strong>${c[2]}</strong><span>${c[1]}</span></article>`).join('');}
renderAlbum();

const legendParts={
 settings:['a storm-dark railroad siding','a bright cattle town on fair day','an abandoned mining camp','a lonely stagecoach stop','a river crossing at sunset','a ranch beneath red cliffs'],
 roles:['town sheriff','traveling singer','railroad detective','ranch owner','newspaper reporter','stagecoach passenger','doctor','saloon owner'],
 problems:['a locked box has the wrong owner’s name','a horse returns without its rider','three people claim the same suitcase','a telegram arrives twenty years late','a town bell rings with nobody near it','a map points to a road nobody remembers'],
 twists:['the feared outlaw is trying to return stolen property','the “ghost” is a signal system','two witnesses are both telling the truth about different moments','the missing person left clues on purpose','a famous local legend began as a newspaper joke','the valuable object matters for family history, not money'],
 endings:['tell the whole town what you found','keep one harmless secret for a friend','turn the evidence over to the proper owner','publish the truth in the Gazette','close the case and ride on','invite everyone involved to settle the story together']
};
let currentLegend='';
function makeLegend(){const pick=a=>a[Math.floor(Math.random()*a.length)];currentLegend=`You are the <strong>${pick(legendParts.roles)}</strong> in <strong>${pick(legendParts.settings)}</strong>. Trouble begins when <strong>${pick(legendParts.problems)}</strong>. Halfway through, you learn that <strong>${pick(legendParts.twists)}</strong>. Your final choice is whether to <strong>${pick(legendParts.endings)}</strong>.`;legendCard.innerHTML=`<p class="kicker">YOUR ORIGINAL WESTERN</p><h3>Tonight in Dusty Trail...</h3><p>${currentLegend}</p><div class="action-row"><button class="secondary" id="legendRoleplay">Play This Setup</button><button class="secondary" id="legendReroll">Deal Another</button></div>`;document.getElementById('legendRoleplay').onclick=()=>{reward(1,null,'Generated a custom Western story');legendCard.insertAdjacentHTML('beforeend','<p class="outcome">The rest is yours. Use any role, place, mystery, or townsperson in Western World to continue it.</p>');};document.getElementById('legendReroll').onclick=makeLegend;}
function renderSavedLegends(){const g=document.getElementById('savedLegendGrid');if(!g)return;g.innerHTML=state.savedLegends.length?state.savedLegends.slice(-6).reverse().map((x,i)=>`<article class="mini-card"><h3>Saved Western ${state.savedLegends.length-i}</h3><p>${x}</p></article>`).join(''):'<p class="muted">No saved story seeds yet.</p>';}
if(document.getElementById('makeLegend'))document.getElementById('makeLegend').onclick=makeLegend;
if(document.getElementById('saveLegend'))document.getElementById('saveLegend').onclick=()=>{if(!currentLegend){makeLegend();return;}const plain=currentLegend.replace(/<[^>]+>/g,'');if(!state.savedLegends.includes(plain))state.savedLegends.push(plain);save();renderSavedLegends();toast('Story seed saved to your album.');};
renderSavedLegends();

const almanacData={
 Wildlife:[['🦅','Red-tailed Hawk','A common raptor across much of North America; often seen soaring over open country.'],['🦌','Mule Deer','Named for their large ears; common in many western habitats.'],['🦬','American Bison','Once numbered in enormous herds; their history is inseparable from Indigenous cultures and U.S. expansion.'],['🦉','Great Horned Owl','A powerful owl found across varied habitats, including wooded areas near open range.']],
 Weather:[['⛈️','Thunderstorm','Open country can expose travelers to lightning, wind, flash flooding, and sudden temperature changes.'],['🌪️','Dust Devil','A small rotating column of air and dust; not the same thing as a tornado.'],['❄️','High Plains Cold','Western settings can be brutally cold as well as hot; movie deserts are only one part of the landscape.'],['🌧️','Flash Flood','Dry channels can become dangerous quickly when rain falls upstream.']],
 Plants:[['🌵','Prickly Pear','A cactus with edible fruit and pads when prepared properly; do not treat wild plants as safe without expert knowledge.'],['🌾','Buffalo Grass','A native shortgrass adapted to dry plains conditions.'],['🌳','Cottonwood','Often found near rivers and creeks; historically a useful sign of nearby water.'],['🌿','Sagebrush','A signature shrub across large parts of the interior West.']],
 Navigation:[['⭐','North Star','Polaris sits close to celestial north in the Northern Hemisphere and can help indicate direction.'],['☀️','Sun & Shadow','The sun’s apparent path can suggest general direction, but it is not a precision compass.'],['🗺️','Survey Marks','Survey markers and mapped landmarks are far more reliable than movie-style “ride toward that mountain” navigation.'],['🧭','Compass','A magnetic compass gives direction, but users still need to understand terrain and maps.']]
};
let almanacCategory='Wildlife';
function renderAlmanac(){const tabs=document.getElementById('almanacTabs'),g=document.getElementById('almanacGrid');if(!tabs||!g)return;tabs.innerHTML=Object.keys(almanacData).map(k=>`<button class="secondary almanacTab ${k===almanacCategory?'active':''}" data-cat="${k}">${k}</button>`).join('');g.innerHTML=almanacData[almanacCategory].map((a,i)=>`<article class="almanac-card"><div class="big">${a[0]}</div><h3>${a[1]}</h3><button class="secondary almanacOpen" data-ai="${i}">Open Card</button></article>`).join('');document.querySelectorAll('.almanacTab').forEach(b=>b.onclick=()=>{almanacCategory=b.dataset.cat;renderAlmanac();});document.querySelectorAll('.almanacOpen').forEach(b=>b.onclick=()=>{const a=almanacData[almanacCategory][+b.dataset.ai],key=almanacCategory+'-'+b.dataset.ai;if(!state.almanacSeen.includes(key))state.almanacSeen.push(key);reward(1,null,`Almanac: ${a[1]}`);almanacStage.innerHTML=`<h3>${a[0]} ${a[1]}</h3><p>${a[2]}</p>`;});}
renderAlmanac();

// Final-layer achievements
achievementDefs.push(
 {id:'museumcurator',icon:'🏛️',name:'Museum Regular',desc:'Inspect all Frontier Museum exhibits.',ok:()=>state.museumSeen.length>=museumItems.length},
 {id:'picturehouse',icon:'🎬',name:'Saturday Picture Show',desc:'Play all original Picture House stories.',ok:()=>state.moviesPlayed.length>=movieStories.length},
 {id:'rodeo',icon:'🎀',name:'Arena Ribbon Rack',desc:'Earn ribbons in 3 rodeo events.',ok:()=>state.rodeoWins.length>=3},
 {id:'townbuilder',icon:'🌳',name:'Town Builder',desc:'Support all Dusty Trail community projects.',ok:()=>state.councilProjects.length>=councilProjects.length},
 {id:'almanac',icon:'📚',name:'Trail Naturalist',desc:'Open 10 Frontier Almanac cards.',ok:()=>state.almanacSeen.length>=10},
 {id:'storydealer',icon:'🃏',name:'Western Story Dealer',desc:'Save 3 generated Western story seeds.',ok:()=>state.savedLegends.length>=3}
);
checkAchievements();

// Extend Surprise Me into the final expansion areas.
const finalRandom=document.querySelector('[data-action="random-adventure"]');if(finalRandom)finalRandom.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','ownership','schoolhouse','postoffice','faircircuit','npstories','deepmysteries','calendar','museum','picturehouse','rodeo','council','album','legendmaker','almanac','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

// Refresh album and achievements when users change views.
const finalNavBtns=[...document.querySelectorAll('.nav-btn')];finalNavBtns.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='album')renderAlbum();if(b.dataset.view==='calendar')renderCalendar();if(b.dataset.view==='achievements')checkAchievements();}));

// Append final-layer notes to the journal while preserving every previous journal section.
const finalPreviousJournal=openJournal;
openJournal=function(){finalPreviousJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Living Western World</h3><p><strong>Seasonal events joined:</strong> ${state.calendarEvents.length}<br><strong>Museum exhibits:</strong> ${state.museumSeen.length}/${museumItems.length}<br><strong>Picture House stories:</strong> ${state.moviesPlayed.length}/${movieStories.length}<br><strong>Rodeo ribbons:</strong> ${state.rodeoWins.length}<br><strong>Town projects:</strong> ${state.councilProjects.length}/${councilProjects.length}<br><strong>Saved Western story seeds:</strong> ${state.savedLegends.length}<br><strong>Almanac cards opened:</strong> ${state.almanacSeen.length}</p></section>`);};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;

if(typeof townEvents!=='undefined')townEvents.push(
 ['The Picture House hangs a new hand-painted poster.','Tonight’s feature has no printed ending—the audience gets to decide it.'],
 ['The Frontier Museum receives a wooden crate.','Inside is a telegraph key, three old tickets, and a note asking the town to preserve their stories.'],
 ['The rodeo grounds open early.','Your trail horse perks up at the sound of the arena announcer.'],
 ['A town council notice appears beside the General Store.','Residents are choosing between a reading room, a footbridge, a garden, and a shade-tree commons.'],
 ['The almanac club meets on the hotel porch.','Someone has brought weather notes, bird sketches, and a battered compass.']
);

renderStatus();

// ===== NAVIGATION QUALITY-OF-LIFE =====
const quickJump=document.getElementById('quickJump');
if(quickJump){
 [...document.querySelectorAll('.nav-btn')].forEach(b=>{const o=document.createElement('option');o.value=b.dataset.view;o.textContent=b.textContent.trim();quickJump.appendChild(o);});
 quickJump.onchange=()=>{if(quickJump.value){showView(quickJump.value);quickJump.value='';}};
}
const floatingHome=document.getElementById('floatingHome');if(floatingHome)floatingHome.onclick=()=>showView('home');

// Save-code backup lets the world travel between browsers without managing version files.
const backupJournal=openJournal;
openJournal=function(){backupJournal();const body=document.getElementById('journalBody');body.insertAdjacentHTML('beforeend',`<section class="campaign-banner save-tools"><h3>Carry Your World With You</h3><p>Copy a save code if you ever want to move your Western World progress to another browser or computer.</p><div class="action-row"><button class="secondary" id="copySaveCode">Copy Save Code</button><button class="secondary" id="restoreSaveCode">Restore From Code</button></div><textarea id="saveCodeBox" rows="4" placeholder="Your save code will appear here, or paste one here to restore progress."></textarea></section>`);document.getElementById('copySaveCode').onclick=async()=>{const code=btoa(unescape(encodeURIComponent(JSON.stringify(state))));saveCodeBox.value=code;try{await navigator.clipboard.writeText(code);toast('Save code copied.');}catch(e){toast('Save code is ready in the box.');}};document.getElementById('restoreSaveCode').onclick=()=>{const raw=saveCodeBox.value.trim();if(!raw){toast('Paste a save code into the box first.');return;}try{const restored=JSON.parse(decodeURIComponent(escape(atob(raw))));state={...defaultState,...restored};save();toast('Western World progress restored.');setTimeout(()=>location.reload(),500);}catch(e){toast('That save code could not be read.');}};};
document.querySelector('[data-action="open-journal"]').onclick=openJournal;


// ===== CONTINUING EXPANSION: STAGECOACH, SOCIAL HALL, PROCEDURAL CASES, NIGHT WATCH =====
state.coachTrips=state.coachTrips||[];
state.socialHallNights=state.socialHallNights||[];
state.generatedCasesSolved=state.generatedCasesSolved||0;
state.nightWatchFinds=state.nightWatchFinds||[];
save();

const coachRoutes=[
 {id:'copper',icon:'🏘️',name:'Copper Creek Run',time:'3 hours',desc:'Rolling prairie, creek crossings, and a busy trading stop.'},
 {id:'blackwater',icon:'🌉',name:'Blackwater Crossing',time:'5 hours',desc:'A longer road through cottonwoods and low river country.'},
 {id:'mesa',icon:'🏚️',name:'Whispering Mesa Line',time:'4 hours',desc:'Dry country, abandoned diggings, and plenty of rumors.'},
 {id:'ridge',icon:'⛰️',name:'Canyon Ridge Express',time:'6 hours',desc:'Steep grades, big views, and narrow road cuts.'}
];
const coachEvents=[
 ['🛞','Loose Wheel','The driver hears a rhythmic knock and stops before the wheel can worsen. Everyone helps unload one side of the coach while it is tightened.'],
 ['🌧️','Sudden Shower','Rain sweeps across the road. The coach waits beneath a cottonwood break until the worst passes.'],
 ['🐎','Rider With News','A lone rider catches up carrying a message about road conditions farther ahead.'],
 ['🧳','Mixed-Up Trunk','Two passengers discover nearly identical luggage. The tags settle the confusion before the coach moves on.'],
 ['🦌','Wildlife Crossing','The driver slows while a small group of animals crosses the trail ahead.'],
 ['🌅','Golden-Hour Stop','The driver gives everyone five quiet minutes to stretch while the whole western sky turns copper and pink.']
];
function renderCoachRoutes(){const b=document.getElementById('coachRouteBoard');if(!b)return;b.innerHTML=coachRoutes.map((r,i)=>`<article class="route-ticket"><div class="big">${r.icon}</div><h3>${r.name}</h3><p>${r.desc}</p><p><strong>Typical run:</strong> ${r.time}</p><button class="secondary coachRide" data-cr="${i}">Board Coach</button></article>`).join('');document.querySelectorAll('.coachRide').forEach(x=>x.onclick=()=>rideCoach(+x.dataset.cr));}
function rideCoach(i){const r=coachRoutes[i],e=coachEvents[Math.floor(Math.random()*coachEvents.length)],key=r.id+'-'+e[1];if(!state.coachTrips.includes(key))state.coachTrips.push(key);reward(1,null,`Stagecoach: ${r.name}`);document.getElementById('coachStage').innerHTML=`<h3>${r.icon} ${r.name}</h3><p>The coach rolls out of Dusty Trail.</p><div class="rumor-scroll"><strong>${e[0]} ${e[1]}</strong><br>${e[2]}</div><p>You arrive with one more road story for the journal.</p><button class="secondary" id="coachAgain">Ride Another Route</button>`;document.getElementById('coachAgain').onclick=()=>rideCoach(Math.floor(Math.random()*coachRoutes.length));save();}
renderCoachRoutes();

const socialNights=[
 ['🎻','Fiddle & Footwork','Join an easygoing dance night where the fun is choosing partners, watching the room, or sitting one out.'],
 ['📖','Story Circle','Townspeople take turns telling original frontier tall tales. You can add a twist when your turn comes.'],
 ['🎶','Melody Night','The hall fills with instrumental tunes and humming. No lyrics to learn—just atmosphere.'],
 ['🍰','Cake Walk Social','A community supper turns into a playful parade around the hall.'],
 ['🪑','Wallflower Evening','Sit along the wall, people-watch, and hear snippets of town gossip without joining anything.'],
 ['🎭','Improvised Frontier Play','Pick a role and help the room make up a five-minute Western scene on the spot.']
];
function renderSocialHall(){const g=document.getElementById('socialHallGrid');if(!g)return;g.innerHTML=socialNights.map((n,i)=>`<article class="mini-card"><div class="big">${n[0]}</div><h3>${n[1]}</h3><p>${n[2]}</p><button class="secondary socialNight" data-sn="${i}">Spend the Evening</button></article>`).join('');document.querySelectorAll('.socialNight').forEach(b=>b.onclick=()=>{const n=socialNights[+b.dataset.sn];if(!state.socialHallNights.includes(n[1]))state.socialHallNights.push(n[1]);reward(1,null,`Social Hall: ${n[1]}`);document.getElementById('socialHallStage').innerHTML=`<h3>${n[0]} ${n[1]}</h3><p>${n[2]}</p><p>The evening unfolds at your pace. Stay, participate, or head home whenever you like.</p>`;save();});}
renderSocialHall();

const generatedCaseParts={
 place:['the livery stable','the hotel kitchen','the newspaper office','the depot platform','the general store','the schoolhouse porch','the river landing'],
 object:['a brass key','a locked cashbox','a bundle of letters','a survey notebook','a silver watch','a red scarf','a crate manifest'],
 witness:['a sleepy telegraph clerk','a ranch hand','a traveling photographer','a schoolteacher','a stagecoach driver','a night-shift porter'],
 clue:['fresh mud on a clean floor','a torn ticket stub','hoofprints that stop at a fence','a lantern wick still warm','two different handwriting styles','a button from an unusual coat'],
 twist:['the object was moved for safekeeping, not stolen','the witness saw the right event but guessed the wrong person','two unrelated incidents happened at the same time','the missing item contains information more valuable than the item itself','someone staged a dramatic clue to hide an ordinary mistake']
};
let activeGeneratedCase=null;
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function makeGeneratedCase(){activeGeneratedCase={place:pick(generatedCaseParts.place),object:pick(generatedCaseParts.object),witness:pick(generatedCaseParts.witness),clue:pick(generatedCaseParts.clue),twist:pick(generatedCaseParts.twist)};document.getElementById('generatedCaseStage').innerHTML=`<h3>📁 Case: The Matter of ${activeGeneratedCase.object}</h3><p><strong>Scene:</strong> ${activeGeneratedCase.place}</p><p><strong>First witness:</strong> ${activeGeneratedCase.witness}</p><p><strong>Visible clue:</strong> ${activeGeneratedCase.clue}</p><div class="action-row"><button class="secondary genCaseChoice" data-gc="0">Question the witness again</button><button class="secondary genCaseChoice" data-gc="1">Inspect the scene quietly</button><button class="secondary genCaseChoice" data-gc="2">Check records and timelines</button></div><div id="genCaseResult"></div>`;document.querySelectorAll('.genCaseChoice').forEach(b=>b.onclick=()=>solveGeneratedCase(+b.dataset.gc));}
function solveGeneratedCase(choice){if(!activeGeneratedCase)return;const approaches=['A second telling reveals one small contradiction.','The quiet inspection turns up a detail everyone stepped past.','The records expose a timing problem that changes the whole case.'];state.generatedCasesSolved++;reward(1,null,'Sheriff desk case');document.getElementById('genCaseResult').innerHTML=`<div class="rumor-scroll"><strong>Your approach:</strong> ${approaches[choice]}<br><br><strong>Twist:</strong> ${activeGeneratedCase.twist}.</div><p>Case closed for now. Generate another whenever you want a fresh mystery.</p>`;save();checkAchievements&&checkAchievements();}
const newGeneratedCase=document.getElementById('newGeneratedCase');if(newGeneratedCase)newGeneratedCase.onclick=makeGeneratedCase;

const nightEvents=[
 ['🐎','A loose horse is calmly waiting outside the closed general store.','You find the owner by checking the nearby hitching posts and stable records.'],
 ['🔔','The church bell gives one unexplained tap in the wind.','A loose rope and shifting weather provide a very ordinary answer.'],
 ['🚂','A freight train stops longer than usual at the depot.','Workers are replacing a damaged coupling before continuing safely.'],
 ['🕯️','A lamp is still burning in the newspaper office.','Ada is finishing tomorrow’s edition and waves from the window.'],
 ['🎹','A piano melody drifts from the saloon after closing time.','The owner is practicing alone with the doors locked for the night.'],
 ['🌠','The street is unusually quiet and the sky is exceptionally clear.','Nothing happens at all. You simply get a beautiful night in Dusty Trail.'],
 ['📦','A parcel sits beneath the post office awning.','The label shows it was deliberately left for the morning coach pickup.']
];
function takeNightPatrol(){const e=nightEvents[Math.floor(Math.random()*nightEvents.length)];if(!state.nightWatchFinds.includes(e[1]))state.nightWatchFinds.push(e[1]);reward(1,null,`Night Watch: ${e[1]}`);const s=document.getElementById('nightWatchScene');s.innerHTML=`<div class="moon-mark">${e[0]}</div><h3>${e[1]}</h3><p>${e[2]}</p><button class="primary" id="nightPatrol">Keep Walking</button>`;document.getElementById('nightPatrol').onclick=takeNightPatrol;const log=document.getElementById('nightWatchLog');if(log)log.innerHTML=state.nightWatchFinds.slice(-5).reverse().map(x=>`<div>🌙 ${x}</div>`).join('');save();}
const nightPatrol=document.getElementById('nightPatrol');if(nightPatrol)nightPatrol.onclick=takeNightPatrol;

achievementDefs.push(
 {id:'coachtraveler',icon:'🚌',name:'Overland Traveler',desc:'Experience 6 different stagecoach route events.',ok:()=>state.coachTrips.length>=6},
 {id:'socialregular',icon:'🎻',name:'Social Hall Regular',desc:'Try all 6 Social Hall evenings.',ok:()=>state.socialHallNights.length>=6},
 {id:'deskdetective',icon:'⭐',name:'Desk Detective',desc:'Solve 5 generated Sheriff’s Desk cases.',ok:()=>state.generatedCasesSolved>=5},
 {id:'nightowl',icon:'🌙',name:'Dusty Trail Night Owl',desc:'Discover 5 different Night Watch scenes.',ok:()=>state.nightWatchFinds.length>=5}
);
checkAchievements();

// Extend quick navigation and surprise routing with the continuing expansion.
const extraViews=['stagecoach','socialhall','casegenerator','nightwatch'];
const qj=document.getElementById('quickJump');if(qj){const labels={stagecoach:'Stagecoach Lines',socialhall:'Social Hall',casegenerator:"Sheriff's Desk",nightwatch:'Night Watch'};extraViews.forEach(v=>{if(![...qj.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=labels[v];qj.appendChild(o);}});}
const continuedRandom=document.querySelector('[data-action="random-adventure"]');if(continuedRandom)continuedRandom.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','ownership','schoolhouse','postoffice','faircircuit','npstories','deepmysteries','calendar','museum','picturehouse','rodeo','council','album','legendmaker','almanac','stagecoach','socialhall','casegenerator','nightwatch','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

const continuationJournal=openJournal;openJournal=function(){continuationJournal();const body=document.getElementById('journalBody');if(body)body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>More Life in Dusty Trail</h3><p><strong>Stagecoach road stories:</strong> ${state.coachTrips.length}<br><strong>Social Hall evenings:</strong> ${state.socialHallNights.length}/6<br><strong>Sheriff’s Desk cases:</strong> ${state.generatedCasesSolved}<br><strong>Night Watch discoveries:</strong> ${state.nightWatchFinds.length}</p></section>`);};


// --- Continuing world expansion: Time Trail, Pony Express, River Landing, Trail Cookhouse ---
state.timeTrailSeen=state.timeTrailSeen||[];
state.ponyDeliveries=state.ponyDeliveries||[];
state.riverStories=state.riverStories||[];
state.cookhouseBadges=state.cookhouseBadges||[];

const timeTrailEras=[
 {id:'1840s',icon:'🧭',name:'1840s — Trails & Migration',fact:'Large overland migrations increased during the 1840s. Routes such as the Oregon Trail were difficult travel corridors, not a single paved road.',scene:'A wagon party reaches a river crossing after days of rain. You are asked whether to wait, scout another crossing, or help reorganize the wagons.'},
 {id:'1850s',icon:'⛏️',name:'1850s — Gold, Towns & Change',fact:'Gold rushes accelerated migration and town growth across parts of the West, while producing major environmental, economic, and social disruption.',scene:'A boomtown newspaper needs someone to verify a rumor before it sparks a stampede toward a supposedly rich claim.'},
 {id:'1860s',icon:'📨',name:'1860s — Mail, War & Railroads',fact:'The Pony Express operated only from 1860 to 1861. The first transcontinental railroad was completed in 1869.',scene:'A courier arrives exhausted with two dispatches and one damaged saddlebag. Which message must move first?'},
 {id:'1870s',icon:'🐂',name:'1870s — Cattle & Railheads',fact:'Long cattle drives helped connect ranching regions with railroad markets, especially after the Civil War. The classic trail-drive era was relatively brief.',scene:'A herd reaches a crowded railhead where weather, prices, and a missing tally sheet complicate the sale.'},
 {id:'1880s',icon:'🏘️',name:'1880s — Towns, Law & Industry',fact:'Western communities varied widely. Many had schools, churches, newspapers, businesses, immigrant communities, and civic organizations alongside saloons and law offices.',scene:'The town council must decide whether to fund a bridge, a school addition, or new fire equipment.'},
 {id:'1890s',icon:'📸',name:'1890s — Memory Becomes Legend',fact:'By the 1890s, dime novels, touring shows, photographs, and later films increasingly shaped popular ideas about the “Wild West.”',scene:'A traveling show asks you to turn a complicated local event into a dramatic stage story. Do you preserve the facts, embellish them, or present both versions?'}
];
function renderTimeTrail(){const g=document.getElementById('timeTrailGrid');if(!g)return;g.innerHTML=timeTrailEras.map((e,i)=>`<article class="era-card"><div class="big">${e.icon}</div><h3>${e.name}</h3><button class="secondary timeEra" data-te="${i}">${state.timeTrailSeen.includes(e.id)?'Revisit Era':'Enter Era'}</button></article>`).join('');document.querySelectorAll('.timeEra').forEach(b=>b.onclick=()=>openTimeEra(+b.dataset.te));}
function openTimeEra(i){const e=timeTrailEras[i];if(!state.timeTrailSeen.includes(e.id))state.timeTrailSeen.push(e.id);reward(1,null,`Time Trail: ${e.name}`);document.getElementById('timeTrailStage').innerHTML=`<h3>${e.icon} ${e.name}</h3><div class="history-note"><strong>Historical context:</strong> ${e.fact}</div><p>${e.scene}</p><div class="action-row"><button class="secondary eraChoice">Investigate carefully</button><button class="secondary eraChoice">Help the people involved</button><button class="secondary eraChoice">Record it in the Gazette</button></div><p id="eraOutcome"></p>`;document.querySelectorAll('.eraChoice').forEach((b,n)=>b.onclick=()=>{const out=['You slow the scene down and separate observation from assumption.','You make a practical choice that helps the people in front of you first.','You write an account that distinguishes what is known from what is only rumor.'];eraOutcome.textContent=out[n];reward(1,null,`${e.id} role-play choice`);});save();renderTimeTrail();}
renderTimeTrail();

const ponyRoutes=[
 {id:'ridge',icon:'🏔️',name:'Ridge Dispatch',desc:'Carry a courthouse notice over the high trail before an approaching storm closes the pass.',events:['Loose shale narrows the trail.','A ranch family offers fresh water.','Clouds gather over the ridge.']},
 {id:'river',icon:'🌊',name:'River Mail',desc:'Deliver sealed letters to a ferry landing where the regular coach is delayed.',events:['The ford is deeper than yesterday.','A ferry rope needs a quick repair.','A passenger recognizes one of the destination names.']},
 {id:'night',icon:'🌙',name:'Night Telegram',desc:'Carry a short urgent dispatch from the depot to Copper Creek after sunset.',events:['Moonlight makes the trail easier to follow.','A distant lantern flashes from a ranch gate.','The road is quiet enough to hear the horse breathe.']},
 {id:'mesa',icon:'🌵',name:'Mesa Packet',desc:'Take business papers to a survey camp beyond Whispering Mesa.',events:['Wind lifts dust across the road.','A marker post has fallen.','You find an older trail running parallel to the new road.']}
];
function renderPonyRoutes(){const g=document.getElementById('ponyRouteGrid');if(!g)return;g.innerHTML=ponyRoutes.map((r,i)=>`<article class="route-ticket"><div class="big">${r.icon}</div><h3>${r.name}</h3><p>${r.desc}</p><button class="secondary ponyRide" data-pr="${i}">${state.ponyDeliveries.includes(r.id)?'Ride Again':'Take Dispatch'}</button></article>`).join('');document.querySelectorAll('.ponyRide').forEach(b=>b.onclick=()=>runPonyRoute(+b.dataset.pr));}
function runPonyRoute(i){const r=ponyRoutes[i],event=r.events[Math.floor(Math.random()*r.events.length)];document.getElementById('ponyStage').innerHTML=`<h3>${r.icon} ${r.name}</h3><p>${r.desc}</p><div class="rumor-scroll"><strong>On the route:</strong> ${event}</div><div class="action-row"><button class="secondary ponyChoice">Slow down and check conditions</button><button class="secondary ponyChoice">Take the alternate trail</button><button class="secondary ponyChoice">Continue steadily</button></div><p id="ponyOutcome"></p>`;document.querySelectorAll('.ponyChoice').forEach((b,n)=>b.onclick=()=>{const o=['You protect the horse and cargo by reading the trail carefully.','The alternate route adds distance but avoids the problem.','A steady pace gets the packet through without unnecessary risk.'];ponyOutcome.textContent=o[n];if(!state.ponyDeliveries.includes(r.id)){state.ponyDeliveries.push(r.id);reward(2,'Courier ribbon',`Pony Express route: ${r.name}`);}else reward(1,null,`Repeated courier route: ${r.name}`);renderPonyRoutes();});}
renderPonyRoutes();

const riverActivities=[
 ['🛶','Ferry Crossing','Help organize passengers, wagons, and freight for a safe crossing.'],
 ['📦','Packet Boat Freight','Compare a cargo manifest against crates stacked on the landing.'],
 ['🎣','Quiet Riverbank','Sit near the water, watch traffic, and collect a peaceful journal memory.'],
 ['🔎','The Missing Trunk','A traveler insists a trunk vanished between the hotel and the boat landing.'],
 ['🧾','Merchant Ledger','Match invoices, crates, and destinations for the trading office.'],
 ['🎻','Riverboat Evening','Listen to instrumental music and people-watch as a packet boat prepares to leave.']
];
function renderRiver(){const g=document.getElementById('riverGrid');if(!g)return;g.innerHTML=riverActivities.map((a,i)=>`<article class="mini-card"><div class="big">${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p><button class="secondary riverAct" data-ra="${i}">Try It</button></article>`).join('');document.querySelectorAll('.riverAct').forEach(b=>b.onclick=()=>{const a=riverActivities[+b.dataset.ra];if(!state.riverStories.includes(a[1]))state.riverStories.push(a[1]);reward(1,null,`River Landing: ${a[1]}`);document.getElementById('riverStage').innerHTML=`<h3>${a[0]} ${a[1]}</h3><p>${a[2]}</p><p class="outcome">The river gives Dusty Trail another connection to the wider territory. You can stay with this scene or choose something completely different.</p>`;save();});}
renderRiver();

const trailMeals=[
 ['🥘','Chuckwagon Stew','A flexible one-pot meal built around available meat, vegetables, and pantry staples.'],
 ['🫘','Beans & Cornbread','Simple, filling food associated with many camps and households—not a single universal “cowboy menu.”'],
 ['🥞','Sourdough Flapjacks','A starter could be kept alive and used repeatedly when fresh yeast was hard to obtain.'],
 ['☕','Camp Coffee','Coffee was common in many settings, though preparation methods and quality varied widely.'],
 ['🍎','Dried Fruit Cobbler','Dried fruit traveled well and could become a simple camp dessert with flour and fat.'],
 ['🥔','Skillet Potatoes','A straightforward pantry-and-produce dish suited to a cast-iron skillet.']
];
function renderCookhouse(){const g=document.getElementById('cookGrid');if(!g)return;g.innerHTML=trailMeals.map((m,i)=>`<article class="cook-card"><div class="big">${m[0]}</div><h3>${m[1]}</h3><p>${m[2]}</p><button class="secondary cookMeal" data-cm="${i}">Cook & Learn</button></article>`).join('');document.querySelectorAll('.cookMeal').forEach(b=>b.onclick=()=>cookMeal(+b.dataset.cm));}
function cookMeal(i){const m=trailMeals[i],pantry=['flour','beans','coffee','dried fruit','potatoes','salt'];const missing=pantry[Math.floor(Math.random()*pantry.length)];document.getElementById('cookStage').innerHTML=`<h3>${m[0]} ${m[1]}</h3><p>${m[2]}</p><p><strong>Pantry challenge:</strong> The cookhouse is low on ${missing}. What do you do?</p><div class="action-row"><button class="secondary cookChoice">Substitute with what is on hand</button><button class="secondary cookChoice">Trade at the market</button><button class="secondary cookChoice">Choose a different meal</button></div><p id="cookOutcome"></p>`;document.querySelectorAll('.cookChoice').forEach((b,n)=>b.onclick=()=>{const o=['You improvise and keep the meal simple.','A quick market trade fills the pantry gap.','You change plans rather than forcing a recipe that does not fit the supplies.'];cookOutcome.textContent=o[n];const key=m[1];if(!state.cookhouseBadges.includes(key))state.cookhouseBadges.push(key);reward(1,null,`Cookhouse: ${m[1]}`);renderCookhouse();});}
renderCookhouse();

achievementDefs.push(
 {id:'timewalker',icon:'⌛',name:'Time Walker',desc:'Visit all six Time Trail eras.',ok:()=>state.timeTrailSeen.length>=6},
 {id:'courier',icon:'📨',name:'Trusted Courier',desc:'Complete all four courier routes.',ok:()=>state.ponyDeliveries.length>=4},
 {id:'riverhand',icon:'🚢',name:'River Landing Regular',desc:'Try all six river activities.',ok:()=>state.riverStories.length>=6},
 {id:'campcook',icon:'🥘',name:'Trail Cook',desc:'Try all six cookhouse meals.',ok:()=>state.cookhouseBadges.length>=6}
);
checkAchievements();

const frontierExtraViews=['timetrial','ponyexpress','riverlanding','cookhouse'];
const frontierQj=document.getElementById('quickJump');if(frontierQj){const labels={timetrial:'Time Trail',ponyexpress:'Pony Express',riverlanding:'River Landing',cookhouse:'Trail Cookhouse'};frontierExtraViews.forEach(v=>{if(![...frontierQj.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=labels[v];frontierQj.appendChild(o);}});}
const expandedRandom=document.querySelector('[data-action="random-adventure"]');if(expandedRandom)expandedRandom.onclick=()=>{const choices=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','ownership','schoolhouse','postoffice','faircircuit','npstories','deepmysteries','calendar','museum','picturehouse','rodeo','council','album','legendmaker','almanac','timetrial','ponyexpress','riverlanding','cookhouse','stagecoach','socialhall','casegenerator','nightwatch','festival','cozy'];showView(choices[Math.floor(Math.random()*choices.length)]);};

const frontierJournal=openJournal;openJournal=function(){frontierJournal();const body=document.getElementById('journalBody');if(body)body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Territory Life Expansion</h3><p><strong>Time Trail eras:</strong> ${state.timeTrailSeen.length}/6<br><strong>Courier routes:</strong> ${state.ponyDeliveries.length}/4<br><strong>River Landing activities:</strong> ${state.riverStories.length}/6<br><strong>Cookhouse meals:</strong> ${state.cookhouseBadges.length}/6</p></section>`);};

// === Choice Mode + Expedition Board + Passport + Wanted Poster Studio ===
state.moodVisits=state.moodVisits||{};
state.expeditions=state.expeditions||{};
state.passportStamps=state.passportStamps||[];
state.postersMade=state.postersMade||0;

const moodModes=[
 {id:'adventure',icon:'🐎',name:'I want an adventure',desc:'Travel, ride, explore, or take on a story.',views:['territory','adventures','stagecoach','ponyexpress','riverlanding','timetrial']},
 {id:'mystery',icon:'🔎',name:'I want a mystery',desc:'Investigate something strange without committing to a long campaign.',views:['mystery','bounties','deepmysteries','casegenerator','nightwatch']},
 {id:'games',icon:'🎯',name:'I want to play',desc:'Jump straight into something game-like.',views:['games','festival','rodeo','faircircuit']},
 {id:'history',icon:'📜',name:'I want history',desc:'Explore facts, artifacts, time periods, and movie myths.',views:['history','museum','almanac','timetrial','schoolhouse']},
 {id:'social',icon:'🤝',name:'I want company',desc:'Spend time with townspeople, stories, music, and community events.',views:['people','npstories','socialhall','gazette','council']},
 {id:'creative',icon:'🎬',name:'I want to create',desc:'Make a Western, build a silly poster, or play with story ideas.',views:['legendmaker','picturehouse','wantedmaker','ownership']},
 {id:'cozy',icon:'🌙',name:'I want something peaceful',desc:'No score, no pressure, and no need to finish anything.',views:['cozy','campfire','riverlanding','album','cookhouse']}
];
const viewLabels={territory:'Territory Map',adventures:'Adventures',stagecoach:'Stagecoach Lines',ponyexpress:'Pony Express',riverlanding:'River Landing',timetrial:'Time Trail',mystery:'Mysteries',bounties:'Bounty Board',deepmysteries:'Case Files+',casegenerator:"Sheriff's Desk",nightwatch:'Night Watch',games:'Games',festival:'Town Festival',rodeo:'Rodeo Grounds',faircircuit:'Fair Circuit',history:'History Trail',museum:'Frontier Museum',almanac:'Frontier Almanac',schoolhouse:'Schoolhouse',people:'Townspeople',npstories:'Character Stories',socialhall:'Social Hall',gazette:'Gazette',council:'Town Council',legendmaker:'Make a Western',picturehouse:'Picture House',wantedmaker:'Wanted Poster Studio',ownership:'Businesses',cozy:'Front Porch',campfire:'Campfire',album:'Memory Album',cookhouse:'Trail Cookhouse'};
function renderMoodBoard(){const g=document.getElementById('moodGrid');if(!g)return;g.innerHTML=moodModes.map((m,i)=>`<article class="mood-card"><div class="big">${m.icon}</div><h3>${m.name}</h3><p>${m.desc}</p><button class="secondary moodPick" data-mi="${i}">Show Me Choices</button></article>`).join('');document.querySelectorAll('.moodPick').forEach(b=>b.onclick=()=>pickMood(+b.dataset.mi));}
function pickMood(i){const m=moodModes[i];state.moodVisits[m.id]=(state.moodVisits[m.id]||0)+1;const picks=[...m.views].sort(()=>Math.random()-.5).slice(0,3);save();document.getElementById('moodStage').innerHTML=`<h3>${m.icon} ${m.name}</h3><p>Here are three ideas. Pick one—or ignore all three.</p><div class="action-row">${picks.map(v=>`<button class="secondary moodGo" data-go="${v}">${viewLabels[v]||v}</button>`).join('')}</div>`;document.querySelectorAll('.moodGo').forEach(b=>b.onclick=()=>showView(b.dataset.go));}
renderMoodBoard();

const expeditionTemplates=[
 {id:'lanternline',icon:'🏮',name:'Lantern Line Expedition',steps:[['museum','Inspect an old signal lantern'],['railroad','Visit the railroad board'],['nightwatch','Take a night walk']]},
 {id:'papertrail',icon:'📰',name:'Paper Trail Expedition',steps:[['gazette','Read the Gazette'],['postoffice','Visit the Post Office'],['casegenerator','Pull a quick case file']]},
 {id:'wideopen',icon:'🌄',name:'Wide Open Territory',steps:[['territory','Open the territory map'],['stagecoach','Ride a stagecoach route'],['campfire','End at the campfire']]},
 {id:'townnight',icon:'🎻',name:'Night in Dusty Trail',steps:[['socialhall','Visit the Social Hall'],['picturehouse','Play a Picture House story'],['cozy','Finish on the Front Porch']]},
 {id:'historyhunt',icon:'⌛',name:'History Hunt',steps:[['timetrial','Enter a Time Trail era'],['museum','Inspect a museum exhibit'],['history','Open the History Trail']]},
 {id:'makerun',icon:'🎬',name:'Make Your Own Western',steps:[['legendmaker','Generate a story seed'],['wantedmaker','Make a wanted poster'],['album','Check your Memory Album']]}
];
function expeditionProgress(e){return Math.min(state.expeditions[e.id]||0,e.steps.length)}
function renderExpeditions(){const g=document.getElementById('expeditionBoard');if(!g)return;const chosen=[...expeditionTemplates].sort(()=>.5-Math.random()).slice(0,3);g.innerHTML=chosen.map((e)=>{const p=expeditionProgress(e),next=e.steps[p]||null;return `<article class="expedition-card"><div class="big">${e.icon}</div><h3>${e.name}</h3><p>${p}/${e.steps.length} stops completed</p><div class="expedition-progress"><span style="width:${(p/e.steps.length)*100}%"></span></div><p>${next?`Next: ${next[1]}`:'Expedition complete. Replay anytime.'}</p><button class="secondary expeditionGo" data-eid="${e.id}">${next?'Go to Next Stop':'Restart Expedition'}</button></article>`}).join('');document.querySelectorAll('.expeditionGo').forEach(b=>b.onclick=()=>advanceExpedition(b.dataset.eid));}
function advanceExpedition(id){const e=expeditionTemplates.find(x=>x.id===id);let p=expeditionProgress(e);if(p>=e.steps.length){state.expeditions[id]=0;p=0;}const step=e.steps[p];state.expeditions[id]=p+1;reward(1,null,`Expedition: ${e.name} — ${step[1]}`);save();document.getElementById('expeditionStage').innerHTML=`<h3>${e.icon} ${e.name}</h3><p>${step[1]}</p><p>Opening <strong>${viewLabels[step[0]]||step[0]}</strong>. You can continue the expedition later from this board.</p>`;renderExpeditions();setTimeout(()=>showView(step[0]),250);}
renderExpeditions();

const passportDefs=[
 {id:'town',icon:'🏘️',name:'Dusty Trail Town',ok:()=>((state.visited||[]).length>=3)},
 {id:'territory',icon:'🗺️',name:'Wide Territory',ok:()=>((state.territoryStamps||[]).length>=3)},
 {id:'history',icon:'📜',name:'History Explorer',ok:()=>((state.museumSeen||[]).length>=3||(state.almanacSeen||[]).length>=5)},
 {id:'mystery',icon:'🔎',name:'Case Seeker',ok:()=>((state.discoveries||[]).length>=4)},
 {id:'rail',icon:'🚂',name:'Rail Traveler',ok:()=>((state.railTrips||0)>=2)},
 {id:'social',icon:'🤝',name:'Known Around Town',ok:()=>Object.values(state.relationships||{}).some(v=>v>=2)},
 {id:'cozy',icon:'🌙',name:'Porch Regular',ok:()=>((state.moodVisits?.cozy||0)>=1)},
 {id:'creator',icon:'🎬',name:'Western Creator',ok:()=>((state.savedLegends||[]).length>=1||(state.postersMade||0)>=1)}
];
function syncPassport(){passportDefs.forEach(p=>{if(p.ok()&&!state.passportStamps.includes(p.id))state.passportStamps.push(p.id)});save();}
function renderPassport(){syncPassport();const g=document.getElementById('passportGrid');if(!g)return;g.innerHTML=passportDefs.map(p=>{const u=state.passportStamps.includes(p.id);return `<article class="passport-stamp ${u?'unlocked':'locked'}"><div class="big">${p.icon}</div><h3>${p.name}</h3><p>${u?'Stamped into your passport.':'Keep wandering and this stamp may appear naturally.'}</p></article>`}).join('');document.getElementById('passportStage').innerHTML=`<h3>${state.passportStamps.length}/${passportDefs.length} stamps collected</h3><p>The passport rewards variety, not grinding.</p>`;}
renderPassport();

const makePoster=document.getElementById('makePoster');if(makePoster)makePoster.onclick=()=>{const name=(document.getElementById('posterName').value||'Mysterious Traveler').trim();const crime=document.getElementById('posterCrime').value;const rewardText=document.getElementById('posterReward').value;document.getElementById('wantedPoster').innerHTML=`<div class="wanted-top">WANTED</div><div class="wanted-sub">FOR PURELY FICTIONAL MISCHIEF</div><div class="wanted-name">${name.replace(/[<>]/g,'')}</div><p>Wanted for ${crime.toLowerCase()}.</p><strong>REWARD: ${rewardText}</strong>`;state.postersMade++;reward(1,null,`Wanted poster made: ${name}`);save();renderPassport();};

achievementDefs.push(
 {id:'moodwanderer',icon:'🧭',name:'Mood Wanderer',desc:'Use three different “What Do I Feel Like?” moods.',ok:()=>Object.keys(state.moodVisits||{}).filter(k=>state.moodVisits[k]>0).length>=3},
 {id:'expeditioner',icon:'🎒',name:'Expeditioner',desc:'Complete any three Expedition Board routes.',ok:()=>Object.values(state.expeditions||{}).filter(v=>v>=3).length>=3},
 {id:'passport',icon:'🛂',name:'Territory Passport',desc:'Collect six Trail Passport stamps.',ok:()=>state.passportStamps.length>=6},
 {id:'posterartist',icon:'📜',name:'Poster Artist',desc:'Make three fictional wanted posters.',ok:()=>state.postersMade>=3}
);
checkAchievements();

const choiceViews=['moodboard','expeditions','passport','wantedmaker'];
const choiceQj=document.getElementById('quickJump');if(choiceQj){const labels={moodboard:'What Do I Feel Like?',expeditions:'Expedition Board',passport:'Trail Passport',wantedmaker:'Wanted Poster Studio'};choiceViews.forEach(v=>{if(![...choiceQj.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=labels[v];choiceQj.appendChild(o);}});}
const choiceRandom=document.querySelector('[data-action="random-adventure"]');if(choiceRandom){const prior=choiceRandom.onclick;choiceRandom.onclick=()=>{const all=['explore','territory','adventures','roleplay','mystery','games','history','gazette','people','bounties','homestead','jobs','treasure','railroad','campfire','market','wardrobe','encounters','sagatrail','ownership','schoolhouse','postoffice','faircircuit','npstories','deepmysteries','calendar','museum','picturehouse','rodeo','council','album','legendmaker','almanac','timetrial','ponyexpress','riverlanding','cookhouse','stagecoach','socialhall','casegenerator','nightwatch','moodboard','expeditions','passport','wantedmaker','festival','cozy'];showView(all[Math.floor(Math.random()*all.length)]);};}

const choiceJournal=openJournal;openJournal=function(){choiceJournal();syncPassport();const body=document.getElementById('journalBody');if(body)body.insertAdjacentHTML('beforeend',`<section class="campaign-banner"><h3>Choice & Exploration</h3><p><strong>Moods tried:</strong> ${Object.keys(state.moodVisits||{}).filter(k=>state.moodVisits[k]>0).length}/7<br><strong>Passport stamps:</strong> ${state.passportStamps.length}/${passportDefs.length}<br><strong>Wanted posters made:</strong> ${state.postersMade}<br><strong>Expedition routes started:</strong> ${Object.keys(state.expeditions||{}).length}</p></section>`);};


/* Interactive Horseback Chase — additive expansion, compatible with earlier saves. */
state.chaseRuns=Number(state.chaseRuns)||0;
state.chaseWins=Number(state.chaseWins)||0;
const chaseArena=document.getElementById('chaseArena'),chaseHorse=document.getElementById('chaseHorse'),chaseHazard=document.getElementById('chaseHazard');
const chaseReport=document.getElementById('chaseReport'),chaseOverlay=document.getElementById('chaseOverlay');
const chaseLeft=document.getElementById('chaseLeft'),chaseMiddle=document.getElementById('chaseMiddle'),chaseRight=document.getElementById('chaseRight');
const chaseStart=document.getElementById('chaseStart'),chaseEnd=document.getElementById('chaseEnd');
let chaseActive=false,chaseLane=1,chaseStep=0,chaseHits=0,chaseTick=null,chaseSeconds=0,chaseObstacle=0;
const chaseLanes=['17%','50%','83%'],chaseRoadItems=['🌵','🪨','🌵','🛞','🪵','🪨'];
function chaseRecord(){document.getElementById('chaseRecord').textContent=`Rides: ${state.chaseRuns} · Rescues: ${state.chaseWins}`;}
function chaseSteer(lane){if(!chaseActive)return;chaseLane=lane;chaseHorse.style.left=chaseLanes[lane];[chaseLeft,chaseMiddle,chaseRight].forEach((b,i)=>b.classList.toggle('selected',i===lane));}
function chaseStop(completed=false){clearInterval(chaseTick);chaseActive=false;chaseArena.classList.remove('riding');[chaseLeft,chaseMiddle,chaseRight,chaseEnd].forEach(b=>b.disabled=true);chaseStart.disabled=false;chaseStart.textContent='Ride Again';chaseOverlay.hidden=false;chaseOverlay.innerHTML=completed?'<strong>🏇 The mailbag is safe!</strong><span>You can head back to town or ride this trail again.</span>':'<strong>Back at the stable</strong><span>The trail will be waiting whenever you feel like riding.</span>';if(completed){state.chaseWins++;reward(3,'Courier’s Lucky Horseshoe','Rescued the stolen mailbag');chaseReport.innerHTML=`<h3>Mail delivered! 📬</h3><p>You finished all six turns and navigated ${chaseHits} rough patches. The courier thanks you and the whole town celebrates.</p>`;}else{chaseReport.innerHTML=`<h3>Ride ended</h3><p>Completed ${chaseStep} of 6 turns. Your horse is safely back at the stable.</p>`;}save();chaseRecord();}
function chaseNext(){if(!chaseActive)return;if(chaseStep>=6){chaseStop(true);return;}chaseObstacle=(chaseStep*2+Math.floor(Math.random()*3))%3;chaseHazard.style.left=chaseLanes[chaseObstacle];chaseHazard.textContent=chaseRoadItems[chaseStep];chaseArena.classList.remove('riding');void chaseArena.offsetWidth;chaseArena.classList.add('riding');chaseSeconds=4;document.getElementById('chaseRound').textContent=`Trail ${chaseStep+1} of 6`;document.getElementById('chaseCountdown').textContent=`Steer! ${chaseSeconds}s`;
const calls=['A cactus blocks a narrow wash!','Falling rocks scatter over the trail!','Another thorny cactus appears!','An abandoned wagon wheel rolls across!','A fallen log cuts off one trail!','The last rocky bend is coming!'];chaseReport.innerHTML=`<h3>${calls[chaseStep]}</h3><p>Watch the obstacle and move to a different trail before time runs out.</p>`;
clearInterval(chaseTick);chaseTick=setInterval(()=>{if(!chaseActive){clearInterval(chaseTick);return;}chaseSeconds--;document.getElementById('chaseCountdown').textContent=`Steer! ${Math.max(0,chaseSeconds)}s`;if(chaseSeconds<=0){clearInterval(chaseTick);const struck=chaseLane===chaseObstacle;if(struck)chaseHits++;chaseStep++;chaseReport.innerHTML=`<h3>${struck?'Dust and hoofbeats!':'Clean getaway!'}</h3><p>${struck?'Your horse slows to get around the obstacle, but you both stay safe.':'You steer clear and gain ground on the runaway rider.'}</p>`;if(chaseStep===6){chaseStop(true);}else{chaseNext();}}},1000);
}
chaseLeft.onclick=()=>chaseSteer(0);chaseMiddle.onclick=()=>chaseSteer(1);chaseRight.onclick=()=>chaseSteer(2);
chaseStart.onclick=()=>{if(chaseActive)return;chaseActive=true;chaseLane=1;chaseStep=0;chaseHits=0;state.chaseRuns++;save();chaseRecord();chaseHorse.style.left=chaseLanes[1];chaseStart.disabled=true;chaseEnd.disabled=false;chaseOverlay.hidden=true;[chaseLeft,chaseMiddle,chaseRight].forEach(b=>b.disabled=false);chaseSteer(1);chaseNext();};
chaseEnd.onclick=()=>chaseStop(false);
document.addEventListener('keydown',e=>{if(!chaseActive||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(['ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();chaseSteer(e.key==='ArrowLeft'?0:e.key==='ArrowDown'?1:2);}});
const originalChaseShowView=showView;showView=function(id){if(chaseActive&&id!=='horsechase')chaseStop(false);return originalChaseShowView(id);};
const chaseJump=document.getElementById('quickJump');if(chaseJump&&!Array.from(chaseJump.options).some(o=>o.value==='horsechase')){const o=document.createElement('option');o.value='horsechase';o.textContent='Horseback Chase';chaseJump.appendChild(o);}
achievementDefs.push({id:'chasehero',icon:'🏇',name:'Courier’s Hero',desc:'Complete the horseback chase and retrieve the mailbag.',ok:()=>state.chaseWins>=1});chaseRecord();checkAchievements();


/* Switchyard Express — route-changing play, preserves pre-existing saves. */
state.yardWins=Number(state.yardWins)||0;
state.yardTrips=Number(state.yardTrips)||0;
const yardStations=['North Ridge','Silver Creek','Coyote Flats','Copper Creek'];
const yardCargoNames=['medicine for the clinic','the new schoolhouse books','festival lanterns','spare wagon wheels','letters from the eastern line','harvest seed','a box of brass instruments'];
const yardPaths=['M28 180 L160 180 L285 84 L620 48','M28 180 L160 180 L285 143 L620 136','M28 180 L160 180 L285 229 L620 222','M28 180 L160 180 L285 288 L620 311'];
const yardEndpoints=[[590,-124],[590,-36],[590,50],[590,139]];
let yardNorth=true,yardUpper=true,yardTarget=0,yardCargo='',yardBusy=false,yardLast=-1;
const yardScene=document.getElementById('switchyardScene'),yardTrain=document.getElementById('switchTrain');
function yardIndex(){return (yardNorth?0:2)+(yardUpper?0:1);}
function yardRender(){document.getElementById('yardA').textContent=yardNorth?'▲ Northern tracks':'▼ Southern tracks';document.getElementById('yardB').textContent=yardUpper?'◀ Upper branch':'▶ Lower branch';document.getElementById('yardA').setAttribute('aria-pressed',String(!yardNorth));document.getElementById('yardB').setAttribute('aria-pressed',String(!yardUpper));document.getElementById('yardSelected').textContent=yardStations[yardIndex()];document.getElementById('selectedTrack').setAttribute('d',yardPaths[yardIndex()]);document.getElementById('yardRecord').textContent=`Successful deliveries: ${state.yardWins} · Trains dispatched: ${state.yardTrips}`;}
function yardNewOrder(){if(yardBusy)return;const candidates=[0,1,2,3].filter(n=>n!==yardLast);yardTarget=candidates[Math.floor(Math.random()*candidates.length)];yardLast=yardTarget;yardCargo=yardCargoNames[Math.floor(Math.random()*yardCargoNames.length)];document.getElementById('yardOrder').textContent=`Ship to ${yardStations[yardTarget]}`;document.getElementById('yardCargo').textContent=`Cargo: ${yardCargo}. Flip the switches until the highlighted line reaches this town.`;document.getElementById('yardFeedback').textContent='Your train is at the depot, ready when you are.';yardTrain.style.transition='none';yardTrain.style.transform='translate(0px,0px)';yardRender();}
document.getElementById('yardA').onclick=()=>{if(yardBusy)return;yardNorth=!yardNorth;yardRender();};
document.getElementById('yardB').onclick=()=>{if(yardBusy)return;yardUpper=!yardUpper;yardRender();};
document.getElementById('yardNewOrder').onclick=yardNewOrder;
document.getElementById('yardDispatch').onclick=()=>{if(yardBusy)return;yardBusy=true;const station=yardIndex();state.yardTrips++;save();const success=station===yardTarget;document.getElementById('yardFeedback').textContent=`The locomotive is headed for ${yardStations[station]}…`;['yardA','yardB','yardNewOrder','yardDispatch'].forEach(id=>document.getElementById(id).disabled=true);yardScene.classList.add('dispatching');yardTrain.style.transition='transform 1.6s ease-in-out';yardTrain.style.transform=`translate(${yardEndpoints[station][0]}px, ${yardEndpoints[station][1]}px)`;setTimeout(()=>{if(success){state.yardWins++;reward(2,null,`Switchyard delivery: ${yardCargo} to ${yardStations[station]}`);document.getElementById('yardFeedback').textContent=`✅ Delivered! The station agent signs for ${yardCargo}. Another successful run!`;}else{document.getElementById('yardFeedback').textContent=`↪ The train reached ${yardStations[station]}, but the order was for ${yardStations[yardTarget]}. Try another route! No penalty.`;}yardBusy=false;yardScene.classList.remove('dispatching');['yardA','yardB','yardNewOrder','yardDispatch'].forEach(id=>document.getElementById(id).disabled=false);yardRender();save();},1650);};
const yardJump=document.getElementById('quickJump');if(yardJump&&!Array.from(yardJump.options).some(o=>o.value==='switchyard')){const option=document.createElement('option');option.value='switchyard';option.textContent='Switchyard Express';yardJump.appendChild(option);}
achievementDefs.push({id:'yardmaster',icon:'🚂',name:'Master Dispatcher',desc:'Deliver three loads in Switchyard Express.',ok:()=>state.yardWins>=3});yardNewOrder();checkAchievements();

/* Prospector's Creek — randomized deductive exploration, additive browser saves. */
state.prospectRuns=Number(state.prospectRuns)||0;
state.prospectFinds=Number(state.prospectFinds)||0;
const prospectPlaces=['Pine Bend','Quartz Hollow','Willow Ford'];
const prospectTraits=[
 ['The inner bend has dark, heavy sand.','Fresh bootprints end at a collapsed driftwood pile.','The creek gravel here is almost entirely pale limestone.'],
 ['A seam of milky quartz crosses the upstream ridge.','Someone left a rusted pick beside this cut.','A flood recently swept the gravel clear.'],
 ['The water slows beneath the willows.','Tiny flakes glitter along a buried bedrock crack.','An old wagon crossing has churned up the bank.']
];
let prospectTarget=0,prospectActive=false,prospectInspected=new Set(),prospectHintUsed=false;
const prospectBrief=document.getElementById('prospectorBrief'),prospectClues=document.getElementById('prospectorClues'),prospectFeedback=document.getElementById('prospectorFeedback');
function prospectRecord(){document.getElementById('prospectorRecord').textContent=`Expeditions: ${state.prospectRuns} · Finds: ${state.prospectFinds}`;}
function prospectRender(){document.querySelectorAll('[data-prospect]').forEach(b=>{let n=Number(b.dataset.prospect);b.classList.toggle('chosen',prospectInspected.has(n));b.disabled=!prospectActive;});document.getElementById('prospectorHint').disabled=!prospectActive;const options=document.getElementById('prospectorOptions');options.replaceChildren();if(prospectActive){const instruction=document.createElement('strong');instruction.textContent='Ready to pan? Select a site:';options.appendChild(instruction);prospectPlaces.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Pan at '+name;b.onclick=()=>prospectPan(i);options.appendChild(b);});}prospectRecord();}
function prospectStart(){prospectTarget=Math.floor(Math.random()*3);prospectActive=true;prospectInspected=new Set();prospectHintUsed=false;state.prospectRuns++;save();prospectBrief.textContent='The creek shifted after the spring flood. The old prospector says to inspect each site, then follow the strongest signs of heavy minerals.';prospectClues.replaceChildren();prospectFeedback.textContent='Choose a place in the landscape to inspect its banks before panning.';document.getElementById('prospectorStart').textContent='New Expedition';prospectRender();}
function prospectInspect(i){if(!prospectActive){prospectFeedback.textContent='Choose Begin Expedition to explore today’s creek.';return;}prospectInspected.add(i);const card=document.createElement('div');card.className='prospector-clue';const title=document.createElement('strong');title.textContent=prospectPlaces[i];const p=document.createElement('p');const hints=[['Dark sand gathers in this inside bend.','Fine silt is moving quickly, leaving little heavy material.','Small pebbles collect here, but there is no black sand.'],['A promising quartz vein meets the water and heavy mineral grains settle in a pocket.','Mostly clean surface rocks; the creek moves too quickly to settle heavier grains.','A vein appears uphill, but no material has washed down to this bank.'],['A crack in the exposed bedrock traps coarse dark sand and tiny bright flakes.','This shallow bedrock has been scrubbed clean by recent water.','There are bright mica flakes, but no dense mineral sand beneath them.']];p.textContent=i===prospectTarget?hints[i][0]:hints[i][prospectTarget===((i+1)%3)?1:2];card.append(title,p);const old=prospectClues.querySelector(`[data-note="${i}"]`);if(old)old.remove();card.dataset.note=String(i);prospectClues.appendChild(card);prospectFeedback.textContent=`Inspected ${prospectPlaces[i]}. You have checked ${prospectInspected.size} of 3 sites.`;prospectRender();}
function prospectPan(i){if(!prospectActive)return;prospectActive=false;const found=i===prospectTarget;if(found){state.prospectFinds++;reward(2,state.prospectFinds===1?'Prospector’s Brass Pan':null,'Gold-country creek find at '+prospectPlaces[i]);prospectFeedback.textContent=`✨ You found promising placer gold at ${prospectPlaces[i]}! The old prospector marks it in your trail journal.`;}else{prospectFeedback.textContent=`The pan holds mostly sand at ${prospectPlaces[i]}. The richer deposit was at ${prospectPlaces[prospectTarget]}. Start another expedition whenever you like.`;}save();prospectRender();checkAchievements();}
document.querySelectorAll('[data-prospect]').forEach(b=>b.addEventListener('click',()=>prospectInspect(Number(b.dataset.prospect))));
document.getElementById('prospectorStart').onclick=prospectStart;
document.getElementById('prospectorHint').onclick=()=>{if(!prospectActive)return;prospectHintUsed=true;prospectFeedback.textContent=`The old prospector says: “At ${prospectPlaces[prospectTarget]}, look for the signs of heavy material settling where the current slows.”`;};
const prospectJump=document.getElementById('quickJump');if(prospectJump&&!Array.from(prospectJump.options).some(o=>o.value==='prospector')){const option=document.createElement('option');option.value='prospector';option.textContent='Prospector’s Creek';prospectJump.appendChild(option);}
achievementDefs.push({id:'goldcountry',icon:'⛏️',name:'Gold Country Explorer',desc:'Find two promising creek deposits.',ok:()=>state.prospectFinds>=2});prospectRender();checkAchievements();


// Golden Spur: free piano and an untimed, replayable musical memory challenge.
state.saloonBest ??= 0; state.saloonSongs ??= 0;
let saloonSequence=[],saloonPosition=0,saloonPlaying=false,saloonMuted=false,saloonAudio=null,saloonToken=0;
const saloonFreq=[261.63,293.66,329.63,392,440],saloonStatus=document.getElementById('saloonMusicStatus');
function saloonRender(){document.getElementById('saloonProgress').textContent=`Your longest melody: ${state.saloonBest} notes · Songs learned: ${state.saloonSongs}`;}
function saloonTone(n){const key=document.querySelector(`[data-note="${n}"]`);if(!key)return;key.classList.add('playing');setTimeout(()=>key.classList.remove('playing'),300);if(saloonMuted)return;try{saloonAudio??=new (window.AudioContext||window.webkitAudioContext)();if(saloonAudio.state==='suspended')saloonAudio.resume();const oscillator=saloonAudio.createOscillator(),gain=saloonAudio.createGain();oscillator.type='triangle';oscillator.frequency.value=saloonFreq[n];gain.gain.setValueAtTime(.0001,saloonAudio.currentTime);gain.gain.exponentialRampToValueAtTime(.16,saloonAudio.currentTime+.035);gain.gain.exponentialRampToValueAtTime(.0001,saloonAudio.currentTime+.34);oscillator.connect(gain).connect(saloonAudio.destination);oscillator.start();oscillator.stop(saloonAudio.currentTime+.36);}catch(e){saloonMuted=true;document.getElementById('saloonMute').textContent='🔇 Sound Off';}}
function saloonFree(){saloonToken++;saloonPlaying=false;saloonSequence=[];document.getElementById('saloonReplay').disabled=true;saloonStatus.textContent='Free play: make your own melody. The audience is all yours!';}
async function saloonListen(){if(!saloonSequence.length)return;const token=++saloonToken;saloonPlaying=true;document.getElementById('saloonReplay').disabled=true;saloonStatus.textContent=`Listen to Rosa’s ${saloonSequence.length}-note melody…`;for(const n of saloonSequence){if(token!==saloonToken)return;await new Promise(r=>setTimeout(r,510));if(token!==saloonToken)return;saloonTone(n);}if(token!==saloonToken)return;await new Promise(r=>setTimeout(r,370));if(token!==saloonToken)return;saloonPosition=0;saloonPlaying=false;document.getElementById('saloonReplay').disabled=false;saloonStatus.textContent=`Your turn! Repeat ${saloonSequence.length} notes. Use the piano or keys 1–5.`;}
function saloonBegin(){saloonSequence=[Math.floor(Math.random()*5),Math.floor(Math.random()*5),Math.floor(Math.random()*5)];saloonPosition=0;saloonListen();}
function saloonPress(n){if(saloonPlaying)return;saloonTone(n);if(!saloonSequence.length)return;if(n!==saloonSequence[saloonPosition]){saloonStatus.textContent='That was a different note. No worries—hear the tune again or try from the beginning.';saloonPosition=0;return;}saloonPosition++;if(saloonPosition===saloonSequence.length){const learned=saloonSequence.length;state.saloonBest=Math.max(state.saloonBest,learned);state.saloonSongs++;saloonSequence=[];saloonPosition=0;reward(1,state.saloonSongs===1?'Golden Spur Music Ribbon':null,`Learned a ${learned}-note melody at the Golden Spur`);saloonRender();saloonStatus.textContent=`🎶 Beautifully played! ${learned} notes in a row. Start a new melody whenever you feel like it.`;document.getElementById('saloonReplay').disabled=true; if(state.saloonBest>=5)checkAchievements();}else saloonStatus.textContent=`That's it! ${saloonPosition} of ${saloonSequence.length} notes. Keep playing.`;}
document.querySelectorAll('.piano-key').forEach(b=>b.addEventListener('click',()=>saloonPress(Number(b.dataset.note))));
document.getElementById('saloonBegin').onclick=saloonBegin;document.getElementById('saloonReplay').onclick=saloonListen;document.getElementById('saloonFree').onclick=saloonFree;
document.getElementById('saloonMute').onclick=()=>{saloonMuted=!saloonMuted;document.getElementById('saloonMute').textContent=saloonMuted?'🔇 Sound Off':'🔊 Sound On';document.getElementById('saloonMute').setAttribute('aria-pressed',String(saloonMuted));};
document.addEventListener('keydown',e=>{if(!document.getElementById('saloonpiano').classList.contains('active-view')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;if(['1','2','3','4','5'].includes(e.key)){e.preventDefault();saloonPress(Number(e.key)-1);}});
const pianoJump=document.getElementById('quickJump');if(pianoJump&&!Array.from(pianoJump.options).some(o=>o.value==='saloonpiano')){const o=document.createElement('option');o.value='saloonpiano';o.textContent='Golden Spur Saloon Piano';pianoJump.appendChild(o);}
achievementDefs.push({id:'saloonmusician',icon:'🎹',name:'Golden Spur Musician',desc:'Learn three melodies at the Golden Spur.',ok:()=>state.saloonSongs>=3});saloonRender();checkAchievements();

/* Activity finder and keyboard-friendly navigation; does not alter the game's save format. */
(function enhanceExperience(){
 const finder=document.getElementById('activityFinder'),toggle=document.getElementById('explorerToggle'),input=document.getElementById('activitySearch'),results=document.getElementById('finderResults'),catWrap=document.getElementById('finderCategories'),count=document.getElementById('finderCount');
 if(!finder||!toggle)return;
 const groupNames=['All','Explore','Stories','Games','Frontier Life','Learn & Create','Relax'];
 const sectionGroups={home:'Explore',explore:'Explore',territory:'Explore',adventures:'Stories',roleplay:'Stories',mystery:'Stories',games:'Games',history:'Learn & Create',gazette:'Learn & Create',people:'Stories',bounties:'Stories',homestead:'Frontier Life',jobs:'Frontier Life',treasure:'Stories',railroad:'Explore',switchyard:'Games',campfire:'Relax',market:'Frontier Life',wardrobe:'Frontier Life',encounters:'Explore',sagatrail:'Stories',ownership:'Frontier Life',schoolhouse:'Learn & Create',postoffice:'Frontier Life',faircircuit:'Frontier Life',npstories:'Stories',deepmysteries:'Stories',calendar:'Frontier Life',museum:'Learn & Create',picturehouse:'Stories',rodeo:'Games',council:'Frontier Life',album:'Relax',legendmaker:'Learn & Create',almanac:'Learn & Create',timetrial:'Learn & Create',ponyexpress:'Games',riverlanding:'Explore',cookhouse:'Frontier Life',stagecoach:'Explore',socialhall:'Relax',casegenerator:'Stories',nightwatch:'Stories',moodboard:'Explore',expeditions:'Stories',passport:'Explore',wantedmaker:'Learn & Create',horsechase:'Games',saloonpiano:'Games',achievements:'Explore',festival:'Games',cozy:'Relax',prospector:'Games'};
 const activities=[...document.querySelectorAll('.nav-btn')].map(b=>({id:b.dataset.view,name:b.textContent.trim(),group:sectionGroups[b.dataset.view]||'Explore'}));
 activities.push({id:'prospector',name:"⛏️ Prospector's Creek",group:'Games'});
 let group='All';
 function render(){const query=input.value.trim().toLocaleLowerCase();const filtered=activities.filter(a=>(group==='All'||group===a.group)&&(!query||(a.name+' '+a.group+' '+a.id).toLocaleLowerCase().includes(query)));count.textContent=filtered.length+' activities';results.replaceChildren();for(const a of filtered){const b=document.createElement('button');b.type='button';b.textContent=a.name;b.onclick=()=>showView(a.id);results.append(b);}if(!filtered.length){const p=document.createElement('p');p.className='finder-empty';p.textContent='No matches yet. Try another word or category.';results.append(p);}}
 for(const name of groupNames){const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(name===group));b.onclick=()=>{group=name;catWrap.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));render();};catWrap.append(b);}
 toggle.onclick=()=>{const show=finder.hidden;finder.hidden=!show;toggle.setAttribute('aria-expanded',String(show));toggle.textContent=show?'✕ Close activities':'☰ Explore activities';if(show){render();input.focus();}};
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results.querySelector('button');if(first)first.click();}if(e.key==='Escape'){finder.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='☰ Explore activities';toggle.focus();}});
 document.querySelectorAll('[data-jump]').forEach(el=>{if(!el.matches('.choice-card'))return;el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showView(el.dataset.jump);}});});
 document.querySelectorAll('.favorite-bar [data-jump]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.jump)));
 const topBtn=document.getElementById('backToTop');function updateTop(){topBtn.classList.toggle('is-visible',window.scrollY>750);}window.addEventListener('scroll',updateTop,{passive:true});topBtn.onclick=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});updateTop();
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();finder.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.textContent='✕ Close activities';render();input.focus();}});
 const initial=decodeURIComponent(location.hash.slice(1));if(initial&&document.getElementById(initial)?.classList.contains('view'))showView(initial);
 else{document.getElementById('currentLocation').textContent='Town Square';document.querySelector('.favorite-bar [data-jump="home"]')?.setAttribute('aria-current','page');}
})();
