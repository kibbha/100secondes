const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const KEY="100s_complete_v1",today=new Date().toISOString().slice(0,10);
let d=JSON.parse(localStorage.getItem(KEY)||'{"best":0,"coins":300,"games":0,"maxCombo":1,"daily":{"date":"","best":0,"played":false},"items":{"shield":0,"turbo":0,"double":0}}');
function save(){localStorage.setItem(KEY,JSON.stringify(d));refresh()}
function refresh(){$("#best").textContent=d.best;$("#coins").textContent=d.coins;$("#games").textContent=d.games;$("#shopCoins").textContent=d.coins;$("#sGames").textContent=d.games;$("#sBest").textContent=d.best;$("#sCoins").textContent=d.coins;$("#sCombo").textContent="x"+d.maxCombo;$("#dbest").textContent=d.daily.date===today?d.daily.best:0}
function screen(id){$$(".screen").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");refresh()}
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)}
$$("[data-screen]").forEach(b=>b.onclick=()=>screen(b.dataset.screen));
const shops=[
 ["shield","🛡️","Bouclier","Ignore une erreur",100],
 ["turbo","🔥","Turbo","Commence chaque partie à x2",150],
 ["double","💎","Double pièces","Double les pièces gagnées",250]
];
function renderShop(){$("#shopItems").innerHTML=shops.map(x=>`<article class="item"><div class="itemIcon">${x[1]}</div><div><h3>${x[2]}</h3><p>${x[3]} · Possédé : ${d.items[x[0]]}</p></div><button data-buy="${x[0]}" ${d.coins<x[4]?"disabled":""}>🪙 ${x[4]}</button></article>`).join("");$$("[data-buy]").forEach(b=>b.onclick=()=>{let x=shops.find(a=>a[0]===b.dataset.buy);if(d.coins>=x[4]){d.coins-=x[4];d.items[x[0]]++;save();renderShop();toast("Achat effectué !")}else toast("Pas assez de pièces")})}
const mini=[
 ()=>{let a=rand(2,12),b=rand(2,12),ans=a+b;return choices(`${a} + ${b} = ?`,ans)},
 ()=>{let a=rand(3,12),b=rand(2,9),ans=a*b;return choices(`${a} × ${b} = ?`,ans)},
 ()=>{let a=rand(10,90),b=rand(2,9),ans=a-b;return choices(`${a} − ${b} = ?`,ans)},
 ()=>{let ans=rand(10,99);let vals=[ans,ans+1,ans-1,ans+2].sort(()=>Math.random()-.5);return {html:`<div class="q">Trouve le nombre : <b>${ans}</b></div><div class="choices">${vals.map(v=>`<button class="choice" data-v="${v}">${v}</button>`).join("")}</div>`,answer:ans}},
 ()=>{let seq=Array.from({length:4},()=>rand(0,1));let html=`<div class="q">Quelle séquence contient le plus de ● ?</div><div class="choices">${[seq.join(" "),seq.map(x=>1-x).join(" ")].map((v,i)=>`<button class="choice" data-v="${i}">${v}</button>`).join("")}</div>`;let a=seq.filter(Boolean).length>=2?0:1;return {html,answer:a}},
];
function choices(q,ans){let vals=[ans,ans+rand(1,3),ans-rand(1,3),ans+rand(4,6)];vals=[...new Set(vals)].slice(0,4);while(vals.length<4)vals.push(ans+vals.length+7);vals.sort(()=>Math.random()-.5);return {html:`<div class="q">${q}</div><div class="choices">${vals.map(v=>`<button class="choice" data-v="${v}">${v}</button>`).join("")}</div>`,answer:ans}}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
let G={};
function start(mode="normal"){G={score:0,combo:d.items.turbo?2:1,left:100,mode,usedShield:false,max:1};screen("game");$("#gscore").textContent=0;$("#gcombo").textContent="x"+G.combo;next();clearInterval(G.int);G.int=setInterval(()=>{G.left--;$("#gtimer").textContent=G.left;$("#meter").style.width=G.left+"%";if(G.left<=0)finish()},1000)}
function next(){let c=mini[rand(0,mini.length-1)](),el=$("#challenge");el.innerHTML=c.html;$$(".choice").forEach(b=>b.onclick=()=>answer(Number(b.dataset.v),Number(c.answer)))}
function answer(v,a){if(v===a){G.score+=10*G.combo;G.combo=Math.min(12,G.combo+1);G.max=Math.max(G.max,G.combo);$("#feedback").textContent="✓ PARFAIT";$("#feedback").className="feedback good"}else{if(d.items.shield&&!G.usedShield){G.usedShield=true;$("#feedback").textContent="🛡️ Bouclier utilisé";$("#feedback").className="feedback good"}else{G.combo=1;$("#feedback").textContent="✕ Raté";$("#feedback").className="feedback bad"}}$("#gscore").textContent=G.score;$("#gcombo").textContent="x"+G.combo;setTimeout(()=>{if(G.left>0)next()},170)}
function finish(){clearInterval(G.int);let was=d.best;d.games++;d.maxCombo=Math.max(d.maxCombo,G.max);let gain=Math.max(5,Math.floor(G.score/25));if(d.items.double)gain*=2;d.coins+=gain;if(G.score>d.best)d.best=G.score;if(G.mode==="daily"){if(d.daily.date!==today){d.daily={date:today,best:G.score,played:true}}else d.daily.best=Math.max(d.daily.best,G.score)}save();$("#resultScore").textContent=G.score;$("#earned").textContent=gain;$("#resultLabel").textContent=G.mode==="daily"?"DÉFI DU JOUR TERMINÉ":"PARTIE TERMINÉE";$("#newRecord").innerHTML=G.score>was?'<span class="new">🏆 NOUVEAU RECORD</span>':"";screen("result")}
$("#play").onclick=()=>start();$("#replay").onclick=()=>start();$("#quit").onclick=()=>{if(confirm("Quitter la partie ?")){clearInterval(G.int);screen("home")}};
$("#daily").onclick=()=>{let names=["Réflexes express","Calcul éclair","Mémoire minute","Défi impossible"];$("#dailyDesc").textContent=names[new Date().getDate()%names.length]+" — une tentative à battre chaque jour.";screen("dailyScreen")};
$("#dailyPlay").onclick=()=>start("daily");
refresh();renderShop();