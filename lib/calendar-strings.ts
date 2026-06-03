"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import useTranslation from "@/components/i18n/useTranslation";
import { CAL_S, asLang, type Lang } from "@/lib/calendar-strings";

type Service = {
  id: string; name: string; slug: string; duration_minutes: number;
  price: number; currency: string; description: string; color: string;
  timezone: string; active: boolean;
};
type Availability = { day_of_week: number; start_time: string; end_time: string };
type Booking = {
  id: string; service_id: string; service_name?: string; service_price?: number;
  service_currency?: string; client_name: string; client_email: string;
  booking_date: string; booking_time: string; status: string; notes: string;
  series_id?: string; recurrence?: string; series_index?: number; created_at: string;
};
type BlockedDate = { id: string; blocked_date: string; reason: string };
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

const TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Mexico_City","America/Bogota","America/Lima","America/Santiago",
  "America/Buenos_Aires","America/Sao_Paulo","America/Caracas",
  "Europe/London","Europe/Lisbon","Europe/Paris","Europe/Berlin","Europe/Warsaw",
  "Europe/Rome","Europe/Madrid","Europe/Moscow",
  "Asia/Dubai","Asia/Kolkata","Asia/Bangkok","Asia/Singapore",
  "Asia/Shanghai","Asia/Tokyo","Asia/Seoul","Australia/Sydney","Pacific/Auckland",
];
const COLORS = ["#f5c542","#3b82f6","#10b981","#8b5cf6","#ef4444","#f97316","#06b6d4"];
const RECURRENCE_OPTIONS = ["none","weekly","biweekly","monthly","yearly"] as const;
const DEFAULT_AVAIL = [
  {day:0,enabled:false,start:"09:00",end:"17:00"},{day:1,enabled:true,start:"09:00",end:"17:00"},
  {day:2,enabled:true,start:"09:00",end:"17:00"},{day:3,enabled:true,start:"09:00",end:"17:00"},
  {day:4,enabled:true,start:"09:00",end:"17:00"},{day:5,enabled:true,start:"09:00",end:"17:00"},
  {day:6,enabled:false,start:"09:00",end:"17:00"},
];

const gold="#f5c542", bg="#06060a", surface="rgba(255,255,255,0.03)";
const border="rgba(255,255,255,0.08)", textMuted="rgba(255,255,255,0.4)";

const inp: React.CSSProperties = {
  width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid ${border}`,
  borderRadius:7,padding:"9px 12px",color:"#fff",fontFamily:"Outfit, sans-serif",
  fontSize:14,boxSizing:"border-box",outline:"none",
};

function Btn({onClick,disabled,children,variant="default",small}:{
  onClick?:()=>void;disabled?:boolean;children:React.ReactNode;
  variant?:"gold"|"green"|"red"|"blue"|"ghost"|"default";small?:boolean;
}) {
  const map:Record<string,React.CSSProperties>={
    gold:{background:gold,color:"#000",border:"none"},
    green:{background:"rgba(16,185,129,0.12)",color:"#34d399",border:"1px solid rgba(16,185,129,0.3)"},
    red:{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.3)"},
    blue:{background:"rgba(59,130,246,0.12)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.3)"},
    ghost:{background:"transparent",color:textMuted,border:`1px solid ${border}`},
    default:{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.75)",border:`1px solid ${border}`},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...map[variant],borderRadius:7,padding:small?"5px 10px":"8px 16px",
      fontFamily:"Outfit, sans-serif",fontSize:small?12:13,fontWeight:600,
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

export default function CalendarDashboard({userId:_userId}:{userId:string}) {
  const {lang:rawLang}=useTranslation();
  const lang=asLang(rawLang) as Lang;
  const s=CAL_S[lang];

  const [tab,setTab]=useState<"services"|"bookings"|"blocked">("services");
  const [services,setServices]=useState<Service[]>([]);
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [blocked,setBlocked]=useState<BlockedDate[]>([]);
  const [counts,setCounts]=useState({pending:0,confirmed:0,completed:0,cancelled:0});
  const [revenue,setRevenue]=useState(0);
  const [loading,setLoading]=useState(true);
  const [selectedSvcId,setSelectedSvcId]=useState<string|null>(null);
  const [showAddSvc,setShowAddSvc]=useState(false);
  const [avail,setAvail]=useState(DEFAULT_AVAIL.map(d=>({...d})));
  const [savingAvail,setSavingAvail]=useState(false);
  const [svcName,setSvcName]=useState("");
  const [svcDuration,setSvcDuration]=useState("60");
  const [svcPrice,setSvcPrice]=useState("0");
  const [svcCurrency,setSvcCurrency]=useState("USD");
  const [svcDesc,setSvcDesc]=useState("");
  const [svcColor,setSvcColor]=useState(COLORS[0]);
  const [svcTimezone,setSvcTimezone]=useState("UTC");
  const [savingSvc,setSavingSvc]=useState(false);
  const [bkgFilter,setBkgFilter]=useState<BookingStatus>("pending");
  const [actioningId,setActioningId]=useState<string|null>(null);
  const [expandedSeries,setExpandedSeries]=useState<Set<string>>(new Set());
  const [recurrenceId,setRecurrenceId]=useState<string|null>(null);
  const [recurrenceRule,setRecurrenceRule]=useState("weekly");
  const [recurrenceCount,setRecurrenceCount]=useState(12);
  const [applyingRec,setApplyingRec]=useState(false);
  const [newBlockDate,setNewBlockDate]=useState("");
  const [newBlockReason,setNewBlockReason]=useState("");
  const [addingBlock,setAddingBlock]=useState(false);
  const [notice,setNotice]=useState("");

  const load=useCallback(async()=>{
    try {
      const [sRes,bRes,blRes]=await Promise.all([
        fetch("/api/calendar/services"),fetch("/api/calendar/bookings"),fetch("/api/calendar/blocked"),
      ]);
      if(sRes.ok){const d=await sRes.json();setServices(d.services||[]);}
      if(bRes.ok){const d=await bRes.json();setBookings(d.bookings||[]);setCounts(d.counts||{});setRevenue(d.revenue||0);}
      if(blRes.ok){const d=await blRes.json();setBlocked(d.blocked||[]);}
    } finally{setLoading(false);}
  },[]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{try{setSvcTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);}catch{setSvcTimezone("UTC");}}, []);

  const selectedSvc=services.find(sv=>sv.id===selectedSvcId)||null;

  const {soloBookings,seriesGroups}=useMemo(()=>{
    const filtered=bookings.filter(b=>b.status===bkgFilter);
    const solo:Booking[]=[]; const groups=new Map<string,Booking[]>();
    for(const b of filtered){
      if(!b.series_id)solo.push(b);
      else{const ex=groups.get(b.series_id)||[];ex.push(b);groups.set(b.series_id,ex);}
    }
    for(const[,g] of groups)g.sort((a,b)=>a.booking_date.localeCompare(b.booking_date));
    return{soloBookings:solo,seriesGroups:groups};
  },[bookings,bkgFilter]);

  async function loadAvailability(serviceId:string){
    const res=await fetch("/api/calendar/availability?serviceId="+serviceId);
    if(!res.ok)return;
    const data=await res.json();const loaded:Availability[]=data.availability||[];
    setAvail(DEFAULT_AVAIL.map(d=>{const f=loaded.find(a=>a.day_of_week===d.day);return{...d,enabled:!!f,start:f?.start_time||"09:00",end:f?.end_time||"17:00"};}));
  }

  function resetSvcForm(){setSvcName("");setSvcDuration("60");setSvcPrice("0");setSvcCurrency("USD");setSvcDesc("");setSvcColor(COLORS[0]);try{setSvcTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);}catch{setSvcTimezone("UTC");}}
  function populateSvcForm(svc:Service){setSvcName(svc.name);setSvcDuration(String(svc.duration_minutes));setSvcPrice(String(svc.price));setSvcCurrency(svc.currency);setSvcDesc(svc.description);setSvcColor(svc.color);setSvcTimezone(svc.timezone||"UTC");}
  function setWeekdays(){setAvail(p=>p.map(d=>({...d,enabled:d.day>=1&&d.day<=5})));}
  function setAllDays(){setAvail(p=>p.map(d=>({...d,enabled:true})));}
  function clearDays(){setAvail(p=>p.map(d=>({...d,enabled:false})));}

  async function handleSaveService(){
    if(!svcName.trim())return;setSavingSvc(true);
    try{
      if(selectedSvc){
        await fetch("/api/calendar/services",{method:"PUT",headers:{"content-type":"application/json"},
          body:JSON.stringify({serviceId:selectedSvc.id,name:svcName,duration_minutes:parseInt(svcDuration),price:parseFloat(svcPrice),currency:svcCurrency,description:svcDesc,color:svcColor,timezone:svcTimezone})});
      } else {
        const res=await fetch("/api/calendar/services",{method:"POST",headers:{"content-type":"application/json"},
          body:JSON.stringify({name:svcName,duration_minutes:parseInt(svcDuration),price:parseFloat(svcPrice),currency:svcCurrency,description:svcDesc,color:svcColor,timezone:svcTimezone})});
        const data=await res.json();
        if(data.service){setSelectedSvcId(data.service.id);setShowAddSvc(false);}
      }
      await load();setNotice(s.svc.saved);
    }finally{setSavingSvc(false);}
  }

  async function handleToggleActive(svc:Service){
    await fetch("/api/calendar/services",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({serviceId:svc.id,active:!svc.active})});await load();
  }
  async function handleDeleteService(svc:Service){
    if(!confirm('Delete "'+svc.name+'"?'))return;
    await fetch("/api/calendar/services",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({serviceId:svc.id})});
    setSelectedSvcId(null);await load();
  }
  async function handleSaveAvailability(){
    if(!selectedSvcId)return;setSavingAvail(true);
    const slots=avail.filter(d=>d.enabled).map(d=>({day_of_week:d.day,start_time:d.start,end_time:d.end}));
    await fetch("/api/calendar/availability",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({serviceId:selectedSvcId,slots})});
    setSavingAvail(false);setNotice(s.avail.saved);
  }
  async function handleBookingAction(b:Booking,status:BookingStatus){
    setActioningId(b.id);
    await fetch("/api/calendar/bookings",{method:"PUT",headers:{"content-type":"application/json"},
      body:JSON.stringify({bookingId:b.id,status,clientEmail:b.client_email,clientName:b.client_name,serviceName:b.service_name,bookingDate:b.booking_date,bookingTime:b.booking_time,currency:b.service_currency,price:b.service_price})});
    setActioningId(null);await load();
    setNotice(status==="confirmed"?s.bkg.confirm+" → "+b.client_email:s.status[status as BookingStatus]);
  }
  async function handleCancelSeries(seriesId:string,fromDate?:string){
    await fetch("/api/calendar/recurrence",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({seriesId,fromDate})});
    await load();setNotice("Series cancelled.");
  }
  async function handleApplyRecurrence(bookingId:string){
    if(recurrenceRule==="none"){setRecurrenceId(null);return;}
    setApplyingRec(true);
    try{
      const res=await fetch("/api/calendar/recurrence",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({bookingId,rule:recurrenceRule,count:recurrenceCount})});
      const data=await res.json();if(!res.ok)throw new Error(data.error);
      setRecurrenceId(null);await load();
      setNotice(s.recurrence[recurrenceRule as keyof typeof s.recurrence]+" — "+data.occurrencesCreated+" "+s.bkg.occurrences+" created.");
    }catch(e:unknown){setNotice(e instanceof Error?e.message:"Failed");}
    finally{setApplyingRec(false);}
  }
  async function handleAddBlock(){
    if(!newBlockDate)return;setAddingBlock(true);
    await fetch("/api/calendar/blocked",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({date:newBlockDate,reason:newBlockReason})});
    setNewBlockDate("");setNewBlockReason("");setAddingBlock(false);await load();
  }
  async function handleRemoveBlock(id:string){
    await fetch("/api/calendar/blocked",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id})});await load();
  }

  const bookingLink=(svc:Service)=>"https://signalboostapp.com/book/"+svc.slug;
  function fmtDate(d:string){return new Date(d+"T12:00:00").toLocaleDateString(lang==="pl"?"pl-PL":lang==="pt"?"pt-BR":lang==="ru"?"ru-RU":lang==="es"?"es-ES":"en-US",{weekday:"short",month:"short",day:"numeric"});}

  function BookingCard({b,showSeriesControls=false}:{b:Booking;showSeriesControls?:boolean}){
    const isActioning=actioningId===b.id;const showingRec=recurrenceId===b.id;
    return (
      <div style={{background:surface,border:`1px solid ${b.series_id?"rgba(59,130,246,0.2)":border}`,borderRadius:12,padding:18,marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
              <p style={{margin:0,fontWeight:700,fontSize:14}}>{b.client_name}</p>
              {b.recurrence&&b.recurrence!=="none"&&(
                <span style={{fontSize:10,fontWeight:700,color:"#60a5fa",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:4,padding:"2px 6px"}}>
                  ↻ {s.recurrence[b.recurrence as keyof typeof s.recurrence]||b.recurrence}
                  {b.series_index!==undefined&&b.series_index>0&&" #"+(b.series_index+1)}
                </span>
              )}
            </div>
            <p style={{margin:0,fontSize:12,color:textMuted}}>{b.client_email}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{margin:"0 0 2px",fontWeight:600,fontSize:13,color:gold}}>{fmtDate(b.booking_date)} · {b.booking_time}</p>
            <p style={{margin:0,fontSize:12,color:textMuted}}>{b.service_name}</p>
          </div>
        </div>
        {b.notes&&<p style={{margin:"10px 0 0",fontSize:13,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.03)",padding:"8px 12px",borderRadius:6}}>{b.notes}</p>}
        {showingRec&&(
          <div style={{marginTop:14,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:16}}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:"#60a5fa"}}>↻ {s.bkg.recurrenceTitle}</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {RECURRENCE_OPTIONS.map(opt=>(
                <button key={opt} onClick={()=>setRecurrenceRule(opt)} style={{background:recurrenceRule===opt?"#3b82f6":"rgba(255,255,255,0.06)",color:recurrenceRule===opt?"#fff":textMuted,border:`1px solid ${recurrenceRule===opt?"#3b82f6":border}`,borderRadius:6,padding:"6px 12px",fontFamily:"Outfit, sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {s.recurrence[opt as keyof typeof s.recurrence]}
                </button>
              ))}
            </div>
            {recurrenceRule!=="none"&&(
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <label style={{fontSize:12,color:textMuted}}>{s.bkg.occurrences}:</label>
                <input type="number" value={recurrenceCount} onChange={e=>setRecurrenceCount(parseInt(e.target.value)||12)} min={2} max={52} style={{...inp,width:70,padding:"6px 8px"}}/>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>handleApplyRecurrence(b.id)} disabled={applyingRec} variant="blue">{applyingRec?s.bkg.applying:s.bkg.apply}</Btn>
              <Btn onClick={()=>setRecurrenceId(null)} variant="ghost">Cancel</Btn>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
          {b.status==="pending"&&(<>
            <Btn onClick={()=>handleBookingAction(b,"confirmed")} disabled={isActioning} variant="green">{isActioning?"…":s.bkg.confirm}</Btn>
            <Btn onClick={()=>handleBookingAction(b,"cancelled")} disabled={isActioning} variant="red">{isActioning?"…":s.bkg.decline}</Btn>
          </>)}
          {b.status==="confirmed"&&!b.series_id&&!showingRec&&(
            <Btn onClick={()=>{setRecurrenceId(b.id);setRecurrenceRule("weekly");}} variant="blue">↻ {s.bkg.setRecurrence}</Btn>
          )}
          {b.status==="confirmed"&&(<>
            <Btn onClick={()=>handleBookingAction(b,"completed")} disabled={isActioning} variant="default">{isActioning?"…":s.bkg.complete}</Btn>
            <Btn onClick={()=>handleBookingAction(b,"cancelled")} disabled={isActioning} variant="red" small>{s.bkg.cancel}</Btn>
          </>)}
          {showSeriesControls&&b.series_id&&b.status==="confirmed"&&(
            <Btn onClick={()=>handleCancelSeries(b.series_id!,b.booking_date)} variant="red" small>{s.bkg.cancelFrom}</Btn>
          )}
          {(b.status==="completed"||b.status==="cancelled")&&(
            <span style={{fontSize:12,color:textMuted}}>{b.status==="completed"?"✓ "+s.status.completed:"✗ "+s.status.cancelled}</span>
          )}
        </div>
      </div>
    );
  }

  if(loading)return <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:textMuted,fontFamily:"Outfit, sans-serif"}}>{s.loading}</div>;

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"Outfit, sans-serif",color:"#fff",display:"flex",flexDirection:"column"}}>
      <div style={{borderBottom:`1px solid ${border}`,padding:"20px 28px 16px",flexShrink:0}}>
        <p style={{color:gold,fontSize:10,fontWeight:700,letterSpacing:"0.18em",margin:"0 0 4px",textTransform:"uppercase"}}>SignalBoost</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <h1 style={{fontFamily:"Fraunces, serif",fontSize:30,fontWeight:700,margin:0}}>{s.title}</h1>
          <div style={{display:"flex",gap:16,fontSize:13,color:textMuted}}>
            <span>📋 <strong style={{color:"#fff"}}>{counts.pending}</strong> {s.status.pending}</span>
            <span>✓ <strong style={{color:"#fff"}}>{counts.confirmed}</strong> {s.status.confirmed}</span>
            {revenue>0&&<span>💰 <strong style={{color:gold}}>${revenue.toFixed(2)}</strong> {s.bkg.revenue}</span>}
          </div>
        </div>
        {notice&&<div style={{marginTop:10,fontSize:13,color:gold,display:"flex",gap:8,alignItems:"center"}}>{notice} <button onClick={()=>setNotice("")} style={{background:"none",border:"none",color:textMuted,cursor:"pointer"}}>×</button></div>}
      </div>
      <div style={{borderBottom:`1px solid ${border}`,display:"flex",padding:"0 28px",flexShrink:0}}>
        {(["services","bookings","blocked"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?"2px solid "+gold:"2px solid transparent",color:tab===t?gold:textMuted,fontFamily:"Outfit, sans-serif",fontSize:13,fontWeight:tab===t?700:400,padding:"12px 20px 14px",cursor:"pointer"}}>
            {t==="services"?s.tabs.services:t==="bookings"?s.tabs.bookings+" ("+(counts.pending+counts.confirmed)+")":s.tabs.blocked+" ("+blocked.length+")"}
          </button>
        ))}
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {tab==="services"&&(<>
          <div style={{width:240,flexShrink:0,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:14,borderBottom:`1px solid ${border}`}}>
              <Btn onClick={()=>{setShowAddSvc(true);setSelectedSvcId(null);resetSvcForm();}} variant="gold">{s.svc.new}</Btn>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {services.length===0?<div style={{padding:"20px 16px",color:textMuted,fontSize:13,textAlign:"center"}}>{s.svc.empty}</div>:
              services.map(svc=>(
                <div key={svc.id} onClick={()=>{setSelectedSvcId(svc.id);setShowAddSvc(false);populateSvcForm(svc);loadAvailability(svc.id);}}
                  style={{padding:"12px 16px",cursor:"pointer",borderBottom:`1px solid ${border}`,borderLeft:selectedSvcId===svc.id?"3px solid "+gold:"3px solid transparent",background:selectedSvcId===svc.id?"rgba(245,197,66,0.05)":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:svc.color,flexShrink:0}}/>
                    <span style={{fontWeight:600,fontSize:13,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{svc.name}</span>
                    {!svc.active&&<span style={{fontSize:9,color:textMuted,background:"rgba(255,255,255,0.06)",padding:"2px 5px",borderRadius:4}}>{s.svc.paused}</span>}
                  </div>
                  <div style={{fontSize:11,color:textMuted,marginTop:3,paddingLeft:16}}>{svc.duration_minutes} min{Number(svc.price)>0?" · "+svc.currency+" "+Number(svc.price).toFixed(2):""}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{width:320,flexShrink:0,borderRight:`1px solid ${border}`,overflowY:"auto",padding:"20px 20px"}}>
            {!selectedSvc&&!showAddSvc?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"50%",color:textMuted,textAlign:"center",gap:10,paddingTop:40}}>
                <div style={{fontSize:36,opacity:0.3}}>📅</div>
                <p style={{margin:0,fontSize:14,color:"rgba(255,255,255,0.3)",fontWeight:600}}>{s.svc.selectHint}</p>
                <p style={{margin:0,fontSize:12}}>{s.svc.selectSub}</p>
              </div>
            ):(
              <>
                <h2 style={{fontFamily:"Fraunces, serif",fontSize:18,fontWeight:700,marginBottom:18}}>{showAddSvc?s.svc.new.replace("+ ",""):s.svc.edit}</h2>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.name} *</label>
                    <input value={svcName} onChange={e=>setSvcName(e.target.value)} placeholder="e.g. Strategy Call" style={inp}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.duration}</label>
                      <input type="number" value={svcDuration} onChange={e=>setSvcDuration(e.target.value)} min="15" step="15" style={inp}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.price}</label>
                      <div style={{display:"flex",gap:6}}>
                        <select value={svcCurrency} onChange={e=>setSvcCurrency(e.target.value)} style={{...inp,width:"auto",paddingRight:6}}>
                          {["USD","EUR","GBP","MXN","BRL","PLN"].map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="number" value={svcPrice} onChange={e=>setSvcPrice(e.target.value)} min="0" step="0.01" style={inp}/>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.description}</label>
                    <textarea value={svcDesc} onChange={e=>setSvcDesc(e.target.value)} rows={2} style={{...inp,resize:"vertical",lineHeight:1.6} as React.CSSProperties}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.timezone}</label>
                    <select value={svcTimezone} onChange={e=>setSvcTimezone(e.target.value)} style={inp}>
                      {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.svc.color}</label>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {COLORS.map(c=><button key={c} onClick={()=>setSvcColor(c)} style={{width:26,height:26,borderRadius:"50%",background:c,border:svcColor===c?"3px solid #fff":"2px solid transparent",cursor:"pointer"}}/>)}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20}}>
                  <Btn onClick={handleSaveService} disabled={savingSvc||!svcName.trim()} variant="gold">{savingSvc?"…":selectedSvc?s.svc.save:s.svc.create}</Btn>
                  {selectedSvc&&<Btn onClick={()=>handleToggleActive(selectedSvc)} variant="ghost">{selectedSvc.active?s.svc.pause:s.svc.reactivate}</Btn>}
                  {selectedSvc&&<Btn onClick={()=>handleDeleteService(selectedSvc)} variant="red">{s.svc.delete}</Btn>}
                </div>
              </>
            )}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
            {selectedSvc?(<>
              <div style={{background:"rgba(245,197,66,0.04)",border:"1px solid rgba(245,197,66,0.15)",borderRadius:10,padding:14,marginBottom:20}}>
                <p style={{fontSize:11,color:textMuted,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.svc.link}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <code style={{flex:1,fontSize:11,color:gold,wordBreak:"break-all"}}>{bookingLink(selectedSvc)}</code>
                  <Btn small onClick={()=>{navigator.clipboard.writeText(bookingLink(selectedSvc));setNotice(s.svc.copied);}} variant="ghost">{s.svc.copy}</Btn>
                </div>
              </div>
              <div style={{background:surface,border:`1px solid ${border}`,borderRadius:12,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <h3 style={{fontSize:14,fontWeight:700,margin:0}}>{s.avail.title}</h3>
                  <div style={{display:"flex",gap:6}}>
                    {[{label:s.avail.weekdays,fn:setWeekdays},{label:s.avail.allDays,fn:setAllDays},{label:s.avail.none,fn:clearDays}].map(({label,fn})=>(
                      <button key={label} onClick={fn} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${border}`,borderRadius:6,padding:"4px 10px",color:"rgba(255,255,255,0.7)",fontFamily:"Outfit, sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>{label}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {avail.map((day,i)=>(
                    <div key={day.day} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<6?`1px solid ${border}`:"none"}}>
                      <input type="checkbox" checked={day.enabled} onChange={e=>{const c=[...avail];c[i]={...c[i],enabled:e.target.checked};setAvail(c);}} style={{width:16,height:16,cursor:"pointer",accentColor:gold}}/>
                      <span style={{width:28,fontSize:13,color:day.enabled?"#fff":textMuted,fontWeight:day.enabled?600:400}}>{s.days[day.day]}</span>
                      {day.enabled?(<>
                        <input type="time" value={day.start} onChange={e=>{const c=[...avail];c[i]={...c[i],start:e.target.value};setAvail(c);}} style={{...inp,width:"auto",fontSize:13,padding:"6px 8px"}}/>
                        <span style={{color:textMuted,fontSize:12}}>{s.avail.to}</span>
                        <input type="time" value={day.end} onChange={e=>{const c=[...avail];c[i]={...c[i],end:e.target.value};setAvail(c);}} style={{...inp,width:"auto",fontSize:13,padding:"6px 8px"}}/>
                        <span style={{fontSize:11,color:textMuted}}>{(()=>{const toM=(t:string)=>{const[h,m]=t.split(":").map(Number);return h*60+m;};const mins=toM(day.end)-toM(day.start);return mins>0?Math.floor(mins/60)+"h"+(mins%60?" "+mins%60+"m":""):"";})()}</span>
                      </>):<span style={{fontSize:12,color:textMuted}}>{s.avail.unavailable}</span>}
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16}}><Btn onClick={handleSaveAvailability} disabled={savingAvail} variant="gold">{savingAvail?"…":s.avail.save}</Btn></div>
              </div>
            </>):<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"50%",color:textMuted,fontSize:13,textAlign:"center",paddingTop:40}}>{s.svc.selectHint}</div>}
          </div>
        </>)}

        {tab==="bookings"&&(
          <div style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
            <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
              {(["pending","confirmed","completed","cancelled"] as BookingStatus[]).map(st=>(
                <button key={st} onClick={()=>setBkgFilter(st)} style={{background:bkgFilter===st?"rgba(245,197,66,0.12)":"rgba(255,255,255,0.04)",border:"1px solid "+(bkgFilter===st?"rgba(245,197,66,0.4)":border),color:bkgFilter===st?gold:textMuted,borderRadius:20,padding:"6px 16px",fontFamily:"Outfit, sans-serif",fontSize:13,fontWeight:bkgFilter===st?700:400,cursor:"pointer",textTransform:"capitalize"}}>
                  {s.status[st]} ({counts[st]||0})
                </button>
              ))}
            </div>
            {soloBookings.length===0&&seriesGroups.size===0?(
              <div style={{textAlign:"center",color:textMuted,padding:"48px 0",fontSize:14}}>{s.bkg.none(s.status[bkgFilter])}</div>
            ):(
              <div style={{maxWidth:680}}>
                {soloBookings.map(b=><BookingCard key={b.id} b={b}/>)}
                {Array.from(seriesGroups.entries()).map(([seriesId,group])=>{
                  const first=group[0];const isExpanded=expandedSeries.has(seriesId);
                  return(
                    <div key={seriesId} style={{background:"rgba(59,130,246,0.04)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:16,marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:11,fontWeight:700,color:"#60a5fa",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:4,padding:"3px 8px"}}>
                            ↻ {s.recurrence[first.recurrence as keyof typeof s.recurrence]||first.recurrence}
                          </span>
                          <span style={{fontWeight:700,fontSize:14}}>{first.client_name}</span>
                          <span style={{fontSize:12,color:textMuted}}>{group.length} {s.bkg.occurrences}</span>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          {bkgFilter==="confirmed"&&<Btn small onClick={()=>handleCancelSeries(seriesId)} variant="red">{s.bkg.cancelSeries}</Btn>}
                          <button onClick={()=>setExpandedSeries(prev=>{const n=new Set(prev);isExpanded?n.delete(seriesId):n.add(seriesId);return n;})}
                            style={{background:"none",border:`1px solid ${border}`,borderRadius:6,padding:"4px 10px",color:textMuted,fontFamily:"Outfit, sans-serif",fontSize:11,cursor:"pointer"}}>
                            {isExpanded?s.bkg.collapseSeries:s.bkg.expandSeries+" ("+group.length+")"}
                          </button>
                        </div>
                      </div>
                      <BookingCard b={first} showSeriesControls/>
                      {isExpanded&&group.slice(1).map(b=><BookingCard key={b.id} b={b} showSeriesControls/>)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab==="blocked"&&(
          <div style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
            <div style={{maxWidth:500}}>
              <p style={{color:textMuted,fontSize:14,marginBottom:24}}>{s.blk.hint}</p>
              <div style={{background:surface,border:`1px solid ${border}`,borderRadius:12,padding:20,marginBottom:28}}>
                <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 16px"}}>{s.blk.title}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12,marginBottom:14}}>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.blk.date}</label>
                    <input type="date" value={newBlockDate} onChange={e=>setNewBlockDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{...inp,colorScheme:"dark"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.blk.reason}</label>
                    <input value={newBlockReason} onChange={e=>setNewBlockReason(e.target.value)} placeholder="Holiday, vacation…" style={inp}/>
                  </div>
                </div>
                <Btn onClick={handleAddBlock} disabled={addingBlock||!newBlockDate} variant="gold">{addingBlock?"…":s.blk.btn}</Btn>
              </div>
              <h3 style={{fontSize:13,fontWeight:700,color:textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{s.blk.upcoming(blocked.length)}</h3>
              {blocked.length===0?<p style={{color:textMuted,fontSize:14}}>{s.blk.empty}</p>:(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {blocked.map(bd=>(
                    <div key={bd.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:surface,border:`1px solid ${border}`,borderRadius:8,padding:"12px 16px"}}>
                      <div>
                        <span style={{fontWeight:600,fontSize:14}}>{new Date(bd.blocked_date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                        {bd.reason&&<span style={{fontSize:13,color:textMuted,marginLeft:10}}>— {bd.reason}</span>}
                      </div>
                      <Btn small onClick={()=>handleRemoveBlock(bd.id)} variant="ghost">{s.blk.remove}</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
