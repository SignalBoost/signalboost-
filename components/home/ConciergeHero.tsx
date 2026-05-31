<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SignalBoost — Signal-wave field</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
  :root{
    --bg:#040408; --text:#f5f6f8; --muted:#8a909c; --soft:rgba(245,246,248,.72);
    --line:rgba(255,255,255,.10); --gold:#f5c542; --goldDeep:#dfa837;
    --display:'Fraunces',Georgia,serif; --ui:'Outfit',system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{ margin:0; background:var(--bg); color:var(--text); font-family:var(--ui); min-height:100vh; overflow-x:hidden; }
  .wrap{ position:relative; z-index:2; max-width:1180px; margin:0 auto; padding:40px 22px 60px; }
  .brand{ font-family:var(--display); font-weight:900; font-size:22px; } .brand b{ color:var(--gold); }
  h1{ font-family:var(--display); font-weight:600; letter-spacing:-.03em; font-size:clamp(26px,4vw,42px); margin:16px 0 6px; }
  .sub{ color:var(--soft); font-size:15px; max-width:680px; margin:0 0 20px; line-height:1.55; }

  .controls{ display:flex; flex-direction:column; gap:12px; margin-bottom:14px; }
  .search{ width:100%; height:48px; background:rgba(255,255,255,.05); color:var(--text); border:1px solid var(--line); border-radius:14px; padding:0 16px; outline:none; font-family:inherit; font-size:15px; }
  .search:focus{ border-color:rgba(245,197,66,.55); box-shadow:0 0 0 3px rgba(245,197,66,.1); }
  .chips{ display:flex; flex-wrap:wrap; gap:8px; }
  .chip{ display:inline-flex; align-items:center; gap:7px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--text); border-radius:999px; padding:8px 13px; font-size:12.5px; font-weight:800; cursor:pointer; font-family:inherit; transition:.16s; }
  .chip.active{ border-color:rgba(245,197,66,.6); background:rgba(245,197,66,.14); color:var(--gold); }
  .chip .cnt{ color:var(--muted); font-size:11px; }
  .barrow{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin:14px 0 8px; }
  .count{ color:var(--muted); font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }
  .speed{ display:inline-flex; align-items:center; gap:8px; color:var(--muted); font-size:12px; font-weight:700; }
  .speed input{ accent-color:var(--gold); }
  .tog{ border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--soft); border-radius:999px; padding:7px 12px; font-size:12px; font-weight:800; font-family:inherit; cursor:pointer; }
  .tog.on{ border-color:rgba(245,197,66,.55); color:var(--gold); background:rgba(245,197,66,.1); }

  .field{ position:relative; width:100%; height:560px; border:1px solid var(--line); border-radius:22px; overflow:hidden; background:radial-gradient(circle at 50% 50%, #0a0a14, #040408 70%); }
  #waves{ position:absolute; inset:0; z-index:0; display:block; }
  .node{
    position:absolute; z-index:2; display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--text);
    border:1px solid rgba(245,197,66,.18); border-radius:14px;
    background:linear-gradient(180deg, rgba(18,18,26,.86), rgba(8,8,14,.86));
    -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
    padding:9px 13px 9px 9px; cursor:pointer; white-space:nowrap;
    box-shadow:0 10px 30px rgba(0,0,0,.45);
    transition:opacity .5s, border-color .2s, box-shadow .2s; will-change:transform;
  }
  .node:hover{ border-color:rgba(245,197,66,.6); box-shadow:0 16px 44px rgba(0,0,0,.55), 0 0 26px rgba(245,197,66,.2); z-index:30; }
  .node.gone{ opacity:0; pointer-events:none; }
  .logo{ width:34px; height:34px; flex-shrink:0; border-radius:9px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; color:#fff; }
  .meta{ display:flex; flex-direction:column; min-width:0; }
  .name{ font-size:13px; font-weight:800; }
  .cat{ color:var(--goldDeep); font-size:10.5px; font-weight:700; }
  .note{ margin-top:22px; color:var(--muted); font-size:12.5px; line-height:1.6; }
</style>

<div class="wrap">
  <div class="brand">signal<b>boost</b></div>
  <h1>Signal-wave field</h1>
  <p class="sub">Radio ripples broadcast continuously from the centre — the SignalBoost metaphor made literal. Partners drift as signals within the waves. The colours below are <em>simulated brand colours</em> to show how real logos break up the sameness. Search or filter to steer the field; the waves never stop.</p>

  <div class="controls">
    <input class="search" id="search" type="text" placeholder="Search partners (e.g. hotels, Brazil, eSIM)…" />
    <div class="chips" id="chips"></div>
  </div>
  <div class="barrow">
    <span class="count" id="count"></span>
    <label class="speed">drift <input id="speed" type="range" min="0" max="100" value="40"></label>
    <label class="speed">wave <input id="wspeed" type="range" min="0" max="100" value="50"></label>
    <button class="tog on" id="pauseHover">pause on hover</button>
  </div>

  <div class="field" id="field">
    <canvas id="waves"></canvas>
  </div>

  <p class="note">Throwaway playground — repo untouched. Continuous on-brand atmosphere: radio waves always emanating, signals always drifting, filtering steers without freezing. Drift + wave sliders tune the feel. Real partner logos would replace the coloured chips and add the variety you noticed was missing.</p>
</div>

<script>
const PARTNERS = [
  {n:"Aviasales",c:"Flights",k:"flights",col:"#2196f3"},{n:"CVC",c:"Flights",k:"flights",col:"#ffb300"},{n:"Oman Air",c:"Flights",k:"flights",col:"#c62828"},{n:"Lastminute",c:"Flights",k:"flights",col:"#e91e63"},
  {n:"Booking BR",c:"Hotels",k:"hotels",col:"#003580"},{n:"Trivago",c:"Hotels",k:"hotels",col:"#e53935"},{n:"Travelking",c:"Hotels",k:"hotels",col:"#00897b"},{n:"Zenhotels",c:"Hotels",k:"hotels",col:"#5e35b1"},{n:"Planet Hotels",c:"Hotels",k:"hotels",col:"#1e88e5"},
  {n:"Airalo",c:"SIM",k:"esim",col:"#f4511e"},{n:"Saily",c:"SIM",k:"esim",col:"#7e57c2"},{n:"Yesim",c:"SIM",k:"esim",col:"#26a69a"},{n:"Drimsim",c:"SIM",k:"esim",col:"#43a047"},
  {n:"Klook",c:"Tours",k:"tours",col:"#ff5722"},{n:"Tiqets",c:"Tours",k:"tours",col:"#00bcd4"},{n:"WeGoTrip",c:"Tours",k:"tours",col:"#ab47bc"},{n:"Searadar",c:"Tours",k:"tours",col:"#039be5"},
  {n:"Kiwitaxi",c:"Transfers",k:"transfers",col:"#fdd835"},{n:"Welcome Pickups",c:"Transfers",k:"transfers",col:"#ff7043"},{n:"GetTransfer",c:"Transfers",k:"transfers",col:"#1565c0"},
  {n:"Alamo",c:"Car Rentals",k:"car",col:"#2e7d32"},{n:"Europcar",c:"Car Rentals",k:"car",col:"#33691e"},{n:"QEEQ",c:"Car Rentals",k:"car",col:"#0277bd"},{n:"VIP Cars",c:"Car Rentals",k:"car",col:"#6a1b9a"},
  {n:"AirHelp",c:"Insurance",k:"ins",col:"#00acc1"},{n:"EKTA",c:"Insurance",k:"ins",col:"#3949ab"},{n:"Compensair",c:"Insurance",k:"ins",col:"#546e7a"},
  {n:"Amazon",c:"Marketplace",k:"mkt",col:"#ff9900"},{n:"AliExpress",c:"Marketplace",k:"mkt",col:"#e62e04"},{n:"Miravia",c:"Marketplace",k:"mkt",col:"#d81b60"},
];

const field=document.getElementById('field');
const canvas=document.getElementById('waves');
const ctx=canvas.getContext('2d');
const chipsEl=document.getElementById('chips');
const search=document.getElementById('search');
const countEl=document.getElementById('count');
const speedEl=document.getElementById('speed');
const wspeedEl=document.getElementById('wspeed');
const pauseBtn=document.getElementById('pauseHover');
let activeCat='all', query='', drift=0.40, waveSpeed=0.5, pauseOnHover=true;

const seen=new Map(); PARTNERS.forEach(p=>seen.set(p.k,(seen.get(p.k)||0)+1));
function catLabel(k){const p=PARTNERS.find(x=>x.k===k);return p?p.c:k;}
chipsEl.innerHTML=`<button class="chip active" data-k="all">All <span class="cnt">${PARTNERS.length}</span></button>`+
  [...seen.entries()].map(([k,n])=>`<button class="chip" data-k="${k}">${catLabel(k)} <span class="cnt">${n}</span></button>`).join('');
chipsEl.onclick=e=>{const b=e.target.closest('.chip'); if(!b)return; activeCat=b.dataset.k; [...chipsEl.children].forEach(c=>c.classList.toggle('active',c===b)); applyFilter();};
search.oninput=()=>{query=search.value.trim().toLowerCase(); applyFilter();};
speedEl.oninput=()=>drift=speedEl.value/100;
wspeedEl.oninput=()=>waveSpeed=wspeedEl.value/100;
pauseBtn.onclick=()=>{pauseOnHover=!pauseOnHover; pauseBtn.classList.toggle('on',pauseOnHover);};

const W=()=>field.clientWidth, H=()=>field.clientHeight;
function sizeCanvas(){ const r=field.getBoundingClientRect(); canvas.width=r.width*devicePixelRatio; canvas.height=r.height*devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }

const nodes=[];
PARTNERS.forEach(p=>{
  const el=document.createElement('a');
  el.className='node'; el.title=p.n;
  el.innerHTML=`<span class="logo" style="background:${p.col}">${p.n.charAt(0)}</span><span class="meta"><span class="name">${p.n}</span><span class="cat">${p.c}</span></span>`;
  field.appendChild(el);
  const node={p,el,x:0,y:0,vx:0,vy:0,w:150,h:52,hover:false,visible:true};
  el.addEventListener('pointerenter',()=>node.hover=true);
  el.addEventListener('pointerleave',()=>node.hover=false);
  nodes.push(node);
});

function seed(){ const w=W(),h=H(); nodes.forEach(n=>{ n.w=n.el.offsetWidth||150; n.h=n.el.offsetHeight||52; n.x=Math.random()*(w-n.w); n.y=Math.random()*(h-n.h); const a=Math.random()*Math.PI*2,s=0.25+Math.random()*0.35; n.vx=Math.cos(a)*s; n.vy=Math.sin(a)*s; }); }

function vis(n){ if(activeCat!=='all'&&n.p.k!==activeCat)return false; if(!query)return true; return (n.p.n+' '+n.p.c).toLowerCase().includes(query); }
function applyFilter(){ let c=0; nodes.forEach(n=>{ n.visible=vis(n); n.el.classList.toggle('gone',!n.visible); if(n.visible)c++; }); countEl.textContent=(activeCat==='all'&&!query)?`${c} signals broadcasting`:`${c} ${c===1?'signal':'signals'} matched`; }

let t=0, last=performance.now();

// ---- Cosmic reaction state: sporadic energy arcs between signals ----
let flash=0;                 // 0..1 field brightening when a reaction fires
let nextReaction=performance.now()+1500+Math.random()*2500;
let arcs=[];                 // active arcs {pts:[{x,y}...], life, max, hue}

function jaggedPath(x1,y1,x2,y2,segments,jitter){
  const pts=[{x:x1,y:y1}];
  for(let i=1;i<segments;i++){
    const tt=i/segments;
    const nx=x1+(x2-x1)*tt + (Math.random()-0.5)*jitter;
    const ny=y1+(y2-y1)*tt + (Math.random()-0.5)*jitter;
    pts.push({x:nx,y:ny});
  }
  pts.push({x:x2,y:y2});
  return pts;
}

function fireReaction(w,h,cx,cy){
  const live=nodes.filter(n=>n.visible);
  let ax,ay,bx,by;
  // from a random visible signal to either another signal or the core
  if(live.length>=2 && Math.random()<0.7){
    const a=live[Math.floor(Math.random()*live.length)];
    let b=live[Math.floor(Math.random()*live.length)];
    let guard=0; while(b===a && guard++<5) b=live[Math.floor(Math.random()*live.length)];
    ax=a.x+a.w/2; ay=a.y+a.h/2; bx=b.x+b.w/2; by=b.y+b.h/2;
  } else if(live.length>=1){
    const a=live[Math.floor(Math.random()*live.length)];
    ax=cx; ay=cy; bx=a.x+a.w/2; by=a.y+a.h/2;
  } else { return; }
  const dist=Math.hypot(bx-ax,by-ay);
  const segs=Math.max(5,Math.min(14,Math.round(dist/40)));
  const hue=Math.random()<0.5?'gold':'cyan';
  arcs.push({ pts:jaggedPath(ax,ay,bx,by,segs,dist*0.16), life:1, max:1, hue });
  // sometimes a fork
  if(Math.random()<0.5){
    const mid=arcs[arcs.length-1].pts[Math.floor(segs/2)];
    arcs.push({ pts:jaggedPath(mid.x,mid.y,mid.x+(Math.random()-0.5)*120,mid.y+(Math.random()-0.5)*120,5,40), life:0.8, max:0.8, hue });
  }
  flash=Math.min(1, flash+0.55);
}

function drawArcs(dt){
  for(const a of arcs){
    a.life-=dt*0.004; // ~250ms
    if(a.life<=0) continue;
    const al=a.life/a.max;
    const col=a.hue==='gold'?`245,197,66`:`56,196,255`;
    ctx.save();
    ctx.shadowBlur=14; ctx.shadowColor=`rgba(${col},${al})`;
    ctx.strokeStyle=`rgba(${col},${al})`;
    ctx.lineWidth=1.6; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(a.pts[0].x,a.pts[0].y);
    for(let i=1;i<a.pts.length;i++) ctx.lineTo(a.pts[i].x,a.pts[i].y);
    ctx.stroke();
    // bright white core of the bolt
    ctx.shadowBlur=0; ctx.strokeStyle=`rgba(255,255,255,${al*0.8})`; ctx.lineWidth=0.7;
    ctx.stroke();
    ctx.restore();
  }
  arcs=arcs.filter(a=>a.life>0);
}

function frame(now){
  const dt=Math.min(40, now-last); last=now; t+=dt*0.001*(0.4+waveSpeed);
  const w=W(), h=H(), cx=w/2, cy=h/2;
  // radio waves — gold + light-blue interweaving at different rhythms
  ctx.clearRect(0,0,w,h);

  // sporadic cosmic reaction trigger + fading field flash
  if(now>=nextReaction){
    fireReaction(w,h,cx,cy);
    nextReaction = now + 2200 + Math.random()*4200; // irregular gaps
  }
  flash=Math.max(0, flash-dt*0.0022);
  if(flash>0){
    const fg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(w,h)/1.3);
    fg.addColorStop(0,`rgba(120,160,220,${flash*0.10})`);
    fg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=fg; ctx.fillRect(0,0,w,h);
  }

  const maxR=Math.hypot(w,h)/1.4;
  const rings=6;
  // gold rings
  for(let i=0;i<rings;i++){
    const phase=((t*0.18)+(i/rings))%1;
    const r=phase*maxR;
    const alpha=(1-phase)*0.5;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(245,197,66,${alpha*0.5})`;
    ctx.lineWidth=2; ctx.stroke();
  }
  // light-blue rings — own rhythm + offset so they cross the gold
  for(let i=0;i<rings;i++){
    const phase=((t*0.135)+(i/rings)+0.5)%1;
    const r=phase*maxR;
    const alpha=(1-phase)*0.55;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(56,196,255,${alpha*0.5})`;
    ctx.lineWidth=1.6; ctx.stroke();
  }
  // central pulsing core — gold inner, cyan outer halo
  const core=6+Math.sin(t*2)*2;
  const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,80);
  gc.addColorStop(0,'rgba(56,196,255,.18)'); gc.addColorStop(1,'rgba(56,196,255,0)');
  ctx.fillStyle=gc; ctx.beginPath(); ctx.arc(cx,cy,80,0,Math.PI*2); ctx.fill();
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,60);
  g.addColorStop(0,'rgba(245,197,66,.5)'); g.addColorStop(1,'rgba(245,197,66,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,60,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(245,197,66,.9)'; ctx.beginPath(); ctx.arc(cx,cy,core,0,Math.PI*2); ctx.fill();

  // cosmic reaction arcs (above waves/core, below DOM nodes)
  drawArcs(dt);

  // drifting nodes
  for(const n of nodes){
    if(!n.visible) continue;
    if(!(pauseOnHover&&n.hover)){
      n.x+=n.vx*drift*(dt/16); n.y+=n.vy*drift*(dt/16);
      if(n.x<=0){n.x=0;n.vx=Math.abs(n.vx);} else if(n.x>=w-n.w){n.x=w-n.w;n.vx=-Math.abs(n.vx);}
      if(n.y<=0){n.y=0;n.vy=Math.abs(n.vy);} else if(n.y>=h-n.h){n.y=h-n.h;n.vy=-Math.abs(n.vy);}
    }
    n.el.style.transform=`translate(${n.x}px,${n.y}px)`;
  }
  requestAnimationFrame(frame);
}

addEventListener('resize',()=>{ sizeCanvas(); const w=W(),h=H(); nodes.forEach(n=>{ n.x=Math.min(n.x,w-n.w); n.y=Math.min(n.y,h-n.h); }); });
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
requestAnimationFrame(()=>{ sizeCanvas(); seed(); applyFilter(); if(reduce){ drift=0; waveSpeed=0; } requestAnimationFrame(frame); });
</script>
