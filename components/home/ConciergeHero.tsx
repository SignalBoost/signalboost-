/* File: app/home-next/home.css
   Phase C6 — homepage styles ported from public/index.html, scoped under
   .sb-home so they don't affect the rest of the app. Class names are unchanged
   so HomeApp's markup maps 1:1. Imported by app/home-next/page.tsx. */

.sb-home{
  --bg:#0d1117;--panel:#0f141b;--card:#111822;--card2:#151d28;
  --line:rgba(255,255,255,.08);--line2:rgba(245,197,66,.24);
  --text:#fff;--muted:#9aa8b8;--soft:rgba(255,255,255,.72);
  --gold:#f5c542;--goldSoft:rgba(245,197,66,.14);--shadow:0 16px 42px rgba(0,0,0,.28);
  font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);display:block;min-height:100vh;
}
.sb-home *{box-sizing:border-box}
.sb-home a{color:inherit}

.sb-home .top{height:44px;background:#232f3e;display:grid;grid-template-columns:190px minmax(0,1fr) 16px;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);position:sticky;top:0;z-index:1000}
.sb-home .logo{height:44px;display:flex;align-items:center;color:var(--gold);font-weight:900;padding-left:12px;font-size:17px;white-space:nowrap;background:#232f3e}
.sb-home .travel-header{height:44px;display:flex;align-items:center;justify-content:center;gap:10px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding:0 12px;white-space:nowrap}
.sb-home .travel-header::-webkit-scrollbar{display:none}
.sb-home .travel-menu{position:relative;height:100%;display:flex;align-items:center}
.sb-home .travel-menu-btn{height:36px;display:flex;align-items:center;gap:6px;border:1px solid transparent;border-radius:999px;background:transparent;color:#fff;padding:0 10px;font-size:12px;font-weight:900;cursor:pointer;white-space:nowrap}
.sb-home .travel-menu-btn:hover{color:var(--gold);border-color:rgba(245,197,66,.30);background:rgba(245,197,66,.08)}
.sb-home .travel-count{font-size:10px;color:#111;background:var(--gold);border-radius:999px;padding:2px 6px;font-weight:900}

.sb-home .app{display:grid;grid-template-columns:280px minmax(540px,1fr) 320px;min-height:calc(100vh - 44px)}
.sb-home .col{min-height:0}
.sb-home .left,.sb-home .right{background:var(--panel)}
.sb-home .left{border-right:1px solid var(--line);overflow-y:auto;padding-bottom:80px}
.sb-home .right{border-left:1px solid var(--line);padding:16px;overflow-y:auto}
.sb-home .sidebar-top{position:sticky;top:0;z-index:20;background:linear-gradient(180deg,#0f141b 80%,rgba(15,20,27,.92));padding:14px;border-bottom:1px solid var(--line)}
.sb-home .small-title{font-size:12px;color:#c9d7e8;text-transform:uppercase;font-weight:900;letter-spacing:.06em;margin-bottom:9px}
.sb-home .partner-search{width:100%;height:40px;background:#0d1117;color:#fff;border:1px solid rgba(255,255,255,.13);border-radius:13px;padding:9px 11px;outline:none}
.sb-home .partner-search:focus{border-color:rgba(245,197,66,.48);box-shadow:0 0 0 3px rgba(245,197,66,.08)}

.sb-home .column1{padding:10px 0 22px}
.sb-home .category-grid{display:grid;grid-template-columns:1fr;gap:9px;margin:10px 12px 12px}
.sb-home .category-tile{width:100%;border:1px solid rgba(255,255,255,.08);background:var(--card);color:#fff;border-radius:16px;padding:13px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;transition:.16s ease}
.sb-home .category-tile:hover{border-color:rgba(245,197,66,.32);transform:translateY(-1px);background:#151d28}
.sb-home .category-tile.active{border-color:rgba(245,197,66,.60);background:rgba(245,197,66,.11)}
.sb-home .category-tile-left{display:flex;align-items:center;gap:10px;min-width:0}
.sb-home .category-tile-icon{font-size:18px;width:22px;text-align:center}
.sb-home .category-tile-title{font-size:13px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-home .category-tile-count{font-size:11px;color:#111;background:var(--gold);border-radius:999px;padding:4px 8px;font-weight:900;flex:0 0 auto}
.sb-home .selected-panel{margin:12px;border:1px solid rgba(245,197,66,.18);border-radius:18px;background:var(--card);overflow:hidden}
.sb-home .selected-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px;border-bottom:1px solid rgba(255,255,255,.07)}
.sb-home .selected-panel-head strong{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#c9d7e8}
.sb-home .selected-close{border:0;background:rgba(255,255,255,.07);color:#fff;border-radius:999px;width:28px;height:28px;font-weight:900;cursor:pointer}
.sb-home .selected-list{padding:8px}
.sb-home .partner-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:13px;text-decoration:none;color:#fff;transition:.15s ease}
.sb-home .partner-row:hover{background:rgba(245,197,66,.08)}
.sb-home .partner-row-main{min-width:0;flex:1}
.sb-home .partner-row strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-home .partner-row span{display:block;font-size:11px;color:rgba(255,255,255,.64);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.sb-home .tier-badge{font-size:10px;color:#111;background:var(--gold);font-weight:900;border-radius:999px;padding:3px 6px;flex:0 0 auto}
.sb-home .empty{margin:12px;padding:18px;border:1px solid rgba(255,255,255,.07);background:var(--card);border-radius:14px;color:var(--muted);font-size:13px;line-height:1.4}

.sb-home .main{position:relative;background:var(--bg);display:flex;align-items:flex-start;justify-content:center;padding:14px 14px 96px;overflow-y:auto}
.sb-home .main-layout{width:100%;max-width:900px;margin:0 auto;display:grid;gap:14px}
.sb-home .trend-strip{width:100%;padding:10px 12px;border:1px solid rgba(245,197,66,.18);border-radius:999px;background:rgba(17,24,34,.92);display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none}
.sb-home .trend-strip::-webkit-scrollbar{display:none}
.sb-home .trend-kicker{color:var(--gold);font-size:12px;font-weight:900;white-space:nowrap;text-transform:uppercase}
.sb-home .trend-items{display:flex;align-items:center;gap:8px;min-width:0}
.sb-home .trend-pill{display:inline-flex;align-items:center;white-space:nowrap;text-decoration:none;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900;color:#fff;transition:.18s ease}
.sb-home .trend-pill:hover{background:rgba(245,197,66,.15);border-color:rgba(245,197,66,.35);transform:translateY(-1px)}
.sb-home .hero-feed-row{width:100%;display:grid;grid-template-columns:minmax(260px,320px) minmax(320px,360px);justify-content:center;align-items:start;gap:16px}
.sb-home .region-hero{min-height:470px;border:1px solid rgba(245,197,66,.24);border-radius:26px;background:radial-gradient(circle at 18% 14%,rgba(245,197,66,.24),transparent 34%),linear-gradient(135deg,#152032,#0c1118);box-shadow:var(--shadow);padding:24px;display:flex;flex-direction:column;justify-content:space-between;position:sticky;top:58px}
.sb-home .region-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(245,197,66,.16);border:1px solid rgba(245,197,66,.25);color:var(--gold);font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:14px}
.sb-home .region-hero h1{margin:0 0 12px;font-size:34px;line-height:1.04;letter-spacing:-.04em}
.sb-home .region-hero p{margin:0;color:rgba(255,255,255,.82);font-size:15px;line-height:1.45}
.sb-home .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.sb-home .primary-cta,.sb-home .secondary-cta{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;padding:11px 15px;text-decoration:none;font-weight:900;font-size:13px;cursor:pointer;border:0;transition:.18s ease}
.sb-home .primary-cta{background:var(--gold);color:#10151d}
.sb-home .secondary-cta{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff}
.sb-home .primary-cta:hover,.sb-home .secondary-cta:hover{transform:translateY(-2px)}
.sb-home .hero-partners{display:grid;gap:10px;margin-top:18px}
.sb-home .hero-mini-card{display:block;text-decoration:none;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;transition:.18s ease;color:#fff}
.sb-home .hero-mini-card:hover{transform:translateX(3px);border-color:rgba(245,197,66,.36);background:rgba(245,197,66,.10)}
.sb-home .hero-mini-card strong{display:block;font-size:14px;margin-bottom:4px}
.sb-home .hero-mini-card span{display:block;color:rgba(255,255,255,.72);font-size:12px;line-height:1.3}
.sb-home .feed-container{max-width:360px;display:flex;flex-direction:column;gap:22px}
.sb-home .feed-card{position:relative;display:block;text-decoration:none;border:1px solid rgba(245,197,66,.22);border-radius:24px;background:var(--card);padding:16px;transition:transform .18s ease,border-color .18s ease;box-shadow:var(--shadow)}
.sb-home .feed-card:hover{transform:translateY(-2px);border-color:rgba(245,197,66,.42)}
.sb-home .feed-content-static{display:block}
.sb-home .feed-label{display:inline-block;margin-bottom:8px;padding:5px 9px;border:1px solid rgba(245,197,66,.22);border-radius:999px;background:rgba(245,197,66,.16);color:var(--gold);font-size:11px;font-weight:900;text-transform:uppercase}
.sb-home .feed-source{float:right;color:rgba(255,255,255,.82);font-size:11px;font-weight:900;text-transform:uppercase;margin-top:6px}
.sb-home .feed-content-static h3{clear:both;margin:8px 0 8px;font-size:22px;line-height:1.15}
.sb-home .feed-content-static p{margin:0;color:rgba(255,255,255,.86);font-size:14px;line-height:1.4}

.sb-home .right h2{text-align:center;margin:0 0 14px;font-size:20px}
.sb-home .right-sub{color:var(--muted);font-size:12px;text-align:center;margin:-6px 0 14px}
.sb-home .featured{display:block;text-decoration:none;border:1px solid rgba(245,197,66,.25);border-radius:16px;background:var(--card);overflow:hidden;margin-bottom:14px}
.sb-home .featured-body{padding:12px}
.sb-home .featured h4{margin:0 0 8px;color:var(--gold);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
.sb-home .featured p{margin:0 0 8px;font-weight:900;font-size:16px}
.sb-home .featured span{display:block;color:rgba(255,255,255,.78);font-size:13px;line-height:1.35}
.sb-home .chip-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.sb-home .chip{min-height:62px;display:flex;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(255,255,255,.08);background:#1b2128;border-radius:12px;padding:10px;font-weight:900;font-size:12px;text-decoration:none;color:#fff}
.sb-home .chip:hover{border-color:rgba(245,197,66,.32);color:var(--gold)}

.sb-home .language-trigger{position:fixed;right:14px;bottom:82px;z-index:2100;border:1px solid rgba(245,197,66,.28);background:#111822;color:#fff;border-radius:999px;padding:9px 12px;font-weight:900;font-size:12px;box-shadow:0 10px 28px rgba(0,0,0,.32);cursor:pointer;display:inline-flex;gap:7px;align-items:center}
.sb-home .language-prompt{position:fixed;top:58px;right:18px;width:min(380px,calc(100vw - 28px));background:#fff;color:#202124;border:1px solid rgba(0,0,0,.12);border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.28);z-index:2600;overflow:hidden}
.sb-home .language-tabs{display:grid;grid-template-columns:1fr 1fr 48px;align-items:center;border-bottom:1px solid #dadce0;background:#fff}
.sb-home .language-tab{height:52px;border:0;background:#fff;color:#3c4043;font-weight:700;font-size:15px;cursor:pointer;position:relative}
.sb-home .language-tab.active{color:#1a73e8}
.sb-home .language-tab.active::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:3px;background:#1a73e8;border-radius:3px 3px 0 0}
.sb-home .language-prompt-close{height:52px;border:0;background:#fff;color:#3c4043;font-size:26px;cursor:pointer;line-height:1}
.sb-home .language-prompt-body{padding:14px 18px 18px;color:#5f6368;font-size:14px;line-height:1.45;background:#fff}
.sb-home .language-prompt-body strong{display:block;color:#202124;font-size:15px;margin-bottom:5px}
.sb-home .language-prompt-body p{margin:0}

@media(max-width:1050px){.sb-home .app{grid-template-columns:280px minmax(520px,1fr)}.sb-home .right{display:none}}
@media(max-width:760px){
  .sb-home .app{display:block}
  .sb-home .left{border-right:0;border-bottom:1px solid var(--line)}
  .sb-home .category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sb-home .hero-feed-row{display:block}
  .sb-home .region-hero{position:relative;top:auto;min-height:auto;margin-bottom:14px}
  .sb-home .region-hero h1{font-size:27px}
  .sb-home .feed-container{max-width:100%}
}
@media(max-width:430px){.sb-home .category-grid{grid-template-columns:1fr}}

/* ---- R4: Concierge hero (centered, Claude-style) ---- */
.sb-home .concierge-hero{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 44px);padding:32px 18px}
.sb-home .concierge-hero-inner{width:100%;max-width:640px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px}
.sb-home .concierge-brand{font-size:30px;font-weight:900;color:var(--gold);letter-spacing:.01em}
.sb-home .concierge-value{margin:0;font-size:18px;line-height:1.5;color:var(--soft);max-width:520px}
.sb-home .concierge-input-wrap{width:100%;display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid rgba(245,197,66,.30);border-radius:16px;padding:8px 8px 8px 18px;box-shadow:var(--shadow);transition:border-color .15s ease}
.sb-home .concierge-input-wrap:focus-within{border-color:rgba(245,197,66,.6);box-shadow:0 0 0 3px rgba(245,197,66,.08)}
.sb-home .concierge-input{flex:1;min-width:0;background:transparent;border:0;outline:none;color:#fff;font-size:17px;font-family:inherit;padding:10px 0}
.sb-home .concierge-input::placeholder{color:rgba(255,255,255,.45)}
.sb-home .concierge-send{flex:0 0 auto;width:44px;height:44px;border:0;border-radius:12px;background:linear-gradient(135deg,var(--gold),#d9a92e);color:#10151d;font-size:20px;font-weight:900;cursor:pointer;transition:transform .12s ease}
.sb-home .concierge-send:hover{transform:translateY(-1px)}
.sb-home .concierge-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:2px}
.sb-home .concierge-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.12);background:#18202b;color:#fff;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:800;cursor:pointer;transition:.15s ease}
.sb-home .concierge-chip:hover{border-color:rgba(245,197,66,.4);color:var(--gold);transform:translateY(-1px)}
.sb-home .concierge-browse-all{margin-top:6px;border:0;background:transparent;color:var(--muted);font-size:13px;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.sb-home .concierge-browse-all:hover{color:var(--gold)}
@media(max-width:760px){.sb-home .concierge-brand{font-size:26px}.sb-home .concierge-value{font-size:16px}.sb-home .concierge-input{font-size:16px}}
