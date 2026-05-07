import { useState, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import { Toast, Pill, Sel, StBadge, SocBadge, DiffBlock, AddBox, CrudP, iS, oBtn } from "./components";



function LoginPage({onLogin}:any){
  const [login,setLogin]=useState("");
  const [pwd,setPwd]=useState("");
  const [err,setErr]=useState("");
  const [show,setShow]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    try {
        const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pwd})});
        const data=await res.json();
        if(res.ok){setErr("");onLogin(data.user, data.token);}
        else{setErr(data.error||"Identifiant incorrect.");}
    } catch(err) {
        setErr("Erreur de connexion serveur.");
    }
  };
  return(
    <div style={{minHeight:"100vh",background:"#F3F3F1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box}input:focus{outline:none;border-color:#1A1A1A!important;}`}</style>
      <div style={{width:"100%",maxWidth:380,padding:24}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:48,height:48,borderRadius:12,background:"#1A1A1A",display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:22,color:"#fff",fontFamily:"'IBM Plex Mono',monospace",marginBottom:12}}>O</div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:3,color:"#1A1A1A"}}>OPPORTIX</div>
          <div style={{fontSize:12,color:"#999",marginTop:4}}>Plateforme de gestion de flotte</div>
        </div>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E5E3",padding:28,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:20}}>Connexion</div>
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:5,letterSpacing:.5}}>IDENTIFIANT</div>
              <input value={login} onChange={e=>{setLogin(e.target.value);setErr("");}} placeholder="Votre identifiant" autoComplete="username" style={{width:"100%",padding:"9px 12px",borderRadius:7,border:"1px solid #E0E0DE",background:"#FAFAF8",color:"#333",fontSize:13,fontFamily:"inherit"}}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:5,letterSpacing:.5}}>MOT DE PASSE</div>
              <div style={{position:"relative"}}>
                <input type={show?"text":"password"} value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} placeholder="••••••••••" autoComplete="current-password" style={{width:"100%",padding:"9px 40px 9px 12px",borderRadius:7,border:"1px solid #E0E0DE",background:"#FAFAF8",color:"#333",fontSize:13,fontFamily:"inherit"}}/>
                <button type="button" onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#AAA",fontSize:11,fontFamily:"inherit",padding:0}}>{show?"Cacher":"Voir"}</button>
              </div>
            </div>
            {err&&<div style={{fontSize:11,color:"#C0392B",background:"#FDECEC",padding:"8px 12px",borderRadius:6}}>{err}</div>}
            <button type="submit" style={{marginTop:4,padding:"10px",borderRadius:7,border:"none",background:"#1A1A1A",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:.5}}>Se connecter</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══ DATA ═══ */

const POLES={activite:{n:"Activite",c:"#E8633A"},parc:{n:"Parc",c:"#3A9BD5"},commercial:{n:"Commercial",c:"#2FAA6B"}};

const API_URL = "";
const uid=()=>crypto.randomUUID();

function getISOWeekLabel(date=new Date()){
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo=Math.ceil((((+d- +yearStart)/86400000)+1)/7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
}
function weekDateRange(weekLabel:string){
  const[y,w]=weekLabel.split('-W').map(Number);
  const jan4=new Date(Date.UTC(y,0,4));
  const monday=new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate()-(jan4.getUTCDay()||7)+1+(w-1)*7);
  const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6);
  const fmt=(d:Date)=>`${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
  return{from:fmt(monday),to:fmt(sunday)};
}

interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  pole: string;
}

export default function App(){
  const [session,setSession]=useState<any>(()=>{
    try{const s=localStorage.getItem("net-session");return s?JSON.parse(s):null;}catch{return null;}
  });
  const login=(u:any, token:string)=>{
    const s={user:u,token};
    localStorage.setItem("net-session",JSON.stringify(s));setSession(s);
  };
  const logout=()=>{localStorage.removeItem("net-session");setSession(null);};
  if(!session) return <LoginPage onLogin={login}/>;
  return <Dashboard user={session.user} userToken={session.token} onLogout={logout}/>;
}

function Dashboard({user,userToken,onLogout}:{user:AppUser,userToken:string,onLogout:()=>void}){
  const [tab,setTab]=useState("diffusion");
  const headers = { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' };
  const [urban,setUrban]=useState<any[]>([]);
  const [green,setGreen]=useState<any[]>([]);
  const [garage,setGarage]=useState<any[]>([]);
  const [deps,setDeps]=useState<any[]>([]);
  const [rets,setRets]=useState<any[]>([]);
  const [disp,setDisp]=useState<any[]>([]);
  const [vacs,setVacs]=useState<any[]>([]);
  const [pros,setPros]=useState<any[]>([]);
  const [dpvs,setDpvs]=useState<any[]>([]);
  const [rpvs,setRpvs]=useState<any[]>([]);
  const [msgs,setMsgs]=useState<any[]>([]);
  const [showAdd,setShowAdd]=useState<string|null>(null);
  const [form,setForm]=useState<any>({});
  const [newMsg,setNewMsg]=useState("");
  const [msgTo,setMsgTo]=useState("all");
  const [fTab,setFTab]=useState("urban");
  const [search,setSearch]=useState("");
  const [delC,setDelC]=useState<string|null>(null);
  const [editFleetIm,setEditFleetIm]=useState<string|null>(null);
  const [editFleetF,setEditFleetF]=useState<any>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [history,setHistory]=useState<any>({});
  const [histSearch,setHistSearch]=useState("");
  const ce=useRef<HTMLDivElement>(null);
  const savingRef=useRef(false);
  const [toast,setToast]=useState<{msg:string,type:"ok"|"err"}|null>(null);
  const [saving,setSaving]=useState(false);
  const [snapshots,setSnapshots]=useState<{weekLabel:string,from:string,to:string,createdAt:string}[]>([]);
  const [viewWeek,setViewWeek]=useState<string|null>(null);
  const [snapshotData,setSnapshotData]=useState<any>(null);
  const isHistorical=viewWeek!==null;
  // Force read-only role when viewing a past week so child components hide write buttons.
  const displayUser=isHistorical?{...user,role:"lecteur"}:user;

  useEffect(()=>{ce.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  
  // Charge les données depuis l'API
  const loadDataFromAPI=async()=>{
    if(savingRef.current) return;
    try{
      const res=await fetch(`${API_URL}/api/data`,{
        headers:{"Authorization":`Bearer ${userToken}`}
      });
      if(res.status===401){
        const d=await res.json().catch(()=>({}));
        if(d.expired){setToast({msg:"Session expirée — reconnectez-vous",type:"err"});setTimeout(onLogout,2000);}
        return;
      }
      if(res.ok){
        const data=await res.json();
        let u=data.u||[],g=data.g||[];
        const depList=data.dep||[];
        // Fix: re-parse marque/modele for all fleet vehicles (e.g. "BYD SEAL" in mo → mq:BYD, mo:SEAL)
        let changed=false;
        const fixFleet=(arr:any[])=>arr.map((v:any)=>{
          if(v.mo&&v.mo.includes(" ")&&!v.mq){const pm=parseMo(v.mo);changed=true;return{...v,mq:pm.mq,mo:pm.mo};}
          return v;
        });
        u=fixFleet(u);g=fixFleet(g);
        // Sync: ajouter les véhicules des départs manquants dans la flotte
        depList.forEach((d:any)=>{
          if(!d.im) return;
          const im=d.im.toUpperCase().trim();
          const exists=[...u,...g].find((v:any)=>v.im===im);
          if(!exists){
            const pm=d.mo?parseMo(d.mo):{mq:"",mo:""};
            const le=(d.le||"").toUpperCase().trim();
            const newVeh={im,mq:pm.mq,mo:pm.mo,le,st:"ACTIF",ch:d.ch||""};
            if(d.soc==="GREEN"){g=[...g,newVeh];}else{u=[...u,newVeh];}
            changed=true;
          } else {
            // Sync modele/leaser from departure to fleet if fleet is missing them
            const pm=d.mo?parseMo(d.mo):{mq:"",mo:""};
            const le=(d.le||"").toUpperCase().trim();
            const needSync=(d.mo&&!exists.mo)||(le&&!exists.le);
            if(needSync){
              const upd=(v:any)=>v.im===im?{...v,mq:pm.mq||v.mq,mo:pm.mo||v.mo,le:le||v.le}:v;
              if(u.find((v:any)=>v.im===im)) u=u.map(upd);
              if(g.find((v:any)=>v.im===im)) g=g.map(upd);
              changed=true;
            }
          }
        });
        setUrban(u);setGreen(g);
        if(data.ga) setGarage(data.ga.map((it:any)=>{
          // Patch id manquant + deviner la societe à partir de la flotte si absente
          let patched=it.id?it:{...it,id:uid()};
          if(!patched.soc&&patched.im){
            const im=patched.im.toUpperCase().trim();
            if(u.find((v:any)=>v.im===im)) patched={...patched,soc:"URBAN NEO"};
            else if(g.find((v:any)=>v.im===im)) patched={...patched,soc:"GREEN"};
          }
          return patched;
        }));
        const sortByDate=(a:any[])=>[...a].sort((x:any,y:any)=>{const p=(d:string)=>{if(!d)return-1;const[j,m]=d.split("/").map(Number);return(m||0)*100+(j||0);};return p(y.dt)-p(x.dt);});
        if(data.dep) setDeps(sortByDate(depList));
        if(data.ret) setRets(sortByDate(data.ret));
        if(data.di) setDisp(data.di);
        if(data.va) setVacs(data.va);
        if(data.pr) setPros(data.pr);
        if(data.dpv) setDpvs(data.dpv);
        if(data.rpv) setRpvs(data.rpv);
        if(data.msgs) setMsgs(data.msgs);
        // Save synced fleet if vehicles were added
        if(changed){
          savingRef.current=true;setSaving(true);
          try{
            await fetch(`${API_URL}/api/data`,{method:'PUT',headers,body:JSON.stringify({u,g,dep:data.dep,ret:data.ret,di:data.di,ga:data.ga,va:data.va,pr:data.pr,msgs:data.msgs})});
          }catch(e){console.error("Sync save error:",e);}
          finally{savingRef.current=false;setSaving(false);}
        }
      }
      if (user.role !== 'lecteur') {
        const uRes = await fetch('/api/users', { headers });
        if (uRes.ok) setUsersList(await uRes.json());
      }
    }catch(e){console.error("API error:",e);}
  };
  

  // Charge au démarrage + écoute les changements via WebSocket (fallback polling 15s)
  useEffect(()=>{
    loadDataFromAPI();
    const socket=io({transports:['websocket','polling']});
    const onChange=()=>{if(!savingRef.current) loadDataFromAPI();};
    socket.emit('auth',userToken);
    socket.on('data-changed',onChange);
    const interval=setInterval(loadDataFromAPI,15000);
    return ()=>{socket.off('data-changed',onChange);socket.disconnect();clearInterval(interval);};
  },[userToken]);

  // Load snapshot list
  useEffect(()=>{
    fetch('/api/snapshots',{headers:{"Authorization":`Bearer ${userToken}`}})
      .then(r=>r.ok?r.json():[]).then(setSnapshots).catch(()=>{});
  },[userToken]);

  const loadWeek=async(week:string|null)=>{
    if(!week){setViewWeek(null);setSnapshotData(null);return;}
    try{
      const r=await fetch(`/api/snapshots/${week}`,{headers:{"Authorization":`Bearer ${userToken}`}});
      if(!r.ok){setToast({msg:`Semaine ${week} introuvable`,type:"err"});setViewWeek(null);setSnapshotData(null);return;}
      setSnapshotData(await r.json());
      setViewWeek(week);
    }catch{
      setToast({msg:"Erreur chargement semaine",type:"err"});
      setViewWeek(null);setSnapshotData(null);
    }
  };

  const refreshSnapshots=async()=>{
    const r=await fetch('/api/snapshots',{headers:{"Authorization":`Bearer ${userToken}`}});
    if(r.ok){setSnapshots(await r.json());}
  };

  const sv=async(o:any={})=>{
    if(isHistorical){setToast({msg:"Lecture seule — retournez en direct pour modifier",type:"err"});return;}
    // Snapshot previous state for rollback if the save fails.
    const prev={u:urban,g:green,ga:garage,dep:deps,ret:rets,di:disp,va:vacs,pr:pros,dpv:dpvs,rpv:rpvs,msgs};
    const d={
      u:o.u??urban,g:o.g??green,ga:o.ga??garage,
      dep:o.dep??deps,ret:o.ret??rets,
      di:o.di??disp,va:o.va??vacs,pr:o.pr??pros,
      dpv:o.dpv??dpvs,rpv:o.rpv??rpvs,
      msgs:o.msgs??msgs
    };
    savingRef.current=true;setSaving(true);
    const rollback=()=>{setUrban(prev.u);setGreen(prev.g);setGarage(prev.ga);setDeps(prev.dep);setRets(prev.ret);setDisp(prev.di);setVacs(prev.va);setPros(prev.pr);setDpvs(prev.dpv);setRpvs(prev.rpv);setMsgs(prev.msgs);};
    try{
      const res=await fetch('/api/data', { method:'PUT', headers, body: JSON.stringify(d) });
      if(!res.ok){const e=await res.json().catch(()=>({error:"Erreur serveur"}));setToast({msg:e.error,type:"err"});rollback();}
    }catch(e){setToast({msg:"Erreur réseau — modifications annulées",type:"err"});rollback();}
    finally{savingRef.current=false;setSaving(false);}
  };

  // Parse "BYD SEAL" → mq:"BYD", mo:"SEAL" (tout en majuscule)
  const parseMo=(mo:string)=>{const parts=(mo||"").toUpperCase().trim().split(/\s+/);return parts.length>=2?{mq:parts[0],mo:parts.slice(1).join(" ")}:{mq:"",mo:parts[0]||""};};

  // Data source: snapshot or live
  const dUrban=isHistorical?(snapshotData?.u||[]):urban;
  const dGreen=isHistorical?(snapshotData?.g||[]):green;
  const dDeps=isHistorical?(snapshotData?.dep||[]):deps;
  const dRets=isHistorical?(snapshotData?.ret||[]):rets;
  const dGarage=isHistorical?(snapshotData?.ga||[]):garage;
  const dDisp=isHistorical?(snapshotData?.di||[]):disp;
  const dVacs=isHistorical?(snapshotData?.va||[]):vacs;
  const dPros=isHistorical?(snapshotData?.pr||[]):pros;
  const dDpvs=isHistorical?(snapshotData?.dpv||[]):dpvs;
  const dRpvs=isHistorical?(snapshotData?.rpv||[]):rpvs;
  const dMsgs=isHistorical?(snapshotData?.msgs||[]):msgs;

  const all=[...dUrban.map(v=>({...v,soc:"URBAN NEO"})),...dGreen.map(v=>({...v,soc:"GREEN"}))];
  const nUA=dUrban.filter(v=>v.st==="ACTIF").length, nUI=dUrban.filter(v=>v.st==="IMMO").length;
  const nGA=dGreen.filter(v=>v.st==="ACTIF").length, nGI=dGreen.filter(v=>v.st==="IMMO").length;
  const nCh=all.filter(v=>v.st==="ACTIF").length;

  const cur=fTab==="urban"?dUrban:dGreen;
  const filt=useMemo(()=>cur.filter(v=>{
    if(search){const s=search.toLowerCase();return (v.im||"").toLowerCase().includes(s)||(v.ch||"").toLowerCase().includes(s)||(v.mq||"").toLowerCase().includes(s)||(v.mo||"").toLowerCase().includes(s)||(v.le||"").toLowerCase().includes(s);}
    return true;
  }),[cur,search,fTab]);

  const add=(type:string,entry:any,extra:any={})=>{
    if(isHistorical) return;
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"]};
    const[arr,set,k]=m[type];
    const sortByDate=(a:any)=>[...a].sort((x:any,y:any)=>{const p=(d:string)=>{if(!d)return-1;const[j,m]=d.split("/").map(Number);return(m||0)*100+(j||0);};return p(y.dt)-p(x.dt);});
    const n=[...arr,(type==="urban"||type==="green")?{...entry}:{...entry,id:uid()}];
    if(type==="deps"||type==="rets") set(sortByDate(n)); else set(n);
    
    // Auto-remove from dispo when adding depart, auto-add to dispo when adding retour
    if(type==="deps"&&entry.im){
      const im=entry.im.toUpperCase().trim();
      // Retirer de DISPO
      const nd=disp.filter((d:any)=>d.im!==im);
      // Retirer du GARAGE
      const nGa=garage.filter((g:any)=>g.im?.toUpperCase().trim()!==im);
      if(nGa.length!==garage.length) setGarage(nGa);
      const exists=[...urban,...green].find((v:any)=>v.im===im);
      // Auto-fill modele/leaser from fleet if not provided
      if(!entry.mo&&exists) entry.mo=exists.mo||"";
      if(!entry.le&&exists) entry.le=exists.le||"";
      const pm=entry.mo?parseMo(entry.mo):{mq:"",mo:""};
      const le=(entry.le||"").toUpperCase().trim();
      let nu=urban.map((v:any)=>v.im===im?{...v,st:"ACTIF",ch:entry.ch||v.ch,mo:pm.mo||v.mo||"",mq:pm.mq||v.mq||"",le:le||v.le||""}:v);
      let ng=green.map((v:any)=>v.im===im?{...v,st:"ACTIF",ch:entry.ch||v.ch,mo:pm.mo||v.mo||"",mq:pm.mq||v.mq||"",le:le||v.le||""}:v);
      // Si la voiture n'existe pas dans la flotte, l'ajouter
      if(!exists){
        const newVeh={im,mq:pm.mq,mo:pm.mo,le,st:"ACTIF",ch:entry.ch||""};
        if(entry.soc==="GREEN"){ng=[...ng,newVeh];}else{nu=[...nu,newVeh];}
      }
      // Auto-supprimer la vacation du chauffeur s'il en a une
      const chDep=(entry.ch||"").toUpperCase().trim();
      const vacItem=chDep?vacs.find((v:any)=>v.ch&&v.ch.toUpperCase().trim()===chDep):null;
      const nv=vacItem?vacs.filter((v:any)=>v!==vacItem):vacs;
      if(vacItem){if(vacItem)fetch('/api/archive',{method:'POST',headers,body:JSON.stringify({section:'vacs',item:vacItem})}).catch(()=>{});setVacs(nv);}
      setUrban(nu);setGreen(ng);setDisp(nd);
      sv({u:nu,g:ng,dep:n,di:nd,ga:nGa,va:nv,...extra});
    }else if(type==="rets"&&entry.im){
      if(!disp.find((d:any)=>d.im===entry.im.toUpperCase().trim())){
        const im=entry.im.toUpperCase().trim();
        const veh=[...urban,...green].find((v:any)=>v.im===im);
        const nd=[...disp,{...entry,mo:entry.mo||veh?.mo||"",id:uid()}];
        // Mettre chauffeur à BUREAU et statut IMMO dans la flotte
        const nu=urban.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
        const ng=green.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
        setUrban(nu);setGreen(ng);setDisp(nd);
        sv({u:nu,g:ng,ret:n,di:nd,...extra});
      }else{sv({ret:n,...extra});}
    }else if(type==="disp"&&entry.im){
      // Ajout manuel en dispo → chauffeur BUREAU + IMMO dans la flotte
      const im=entry.im.toUpperCase().trim();
      const exists=[...urban,...green].find((v:any)=>v.im===im);
      let nu=urban.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
      let ng=green.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
      if(!exists){
        const pm=entry.mo?parseMo(entry.mo):{mq:"",mo:""};
        const newVeh={im,mq:pm.mq,mo:pm.mo,le:(entry.le||"").toUpperCase().trim(),st:"IMMO",ch:"BUREAU"};
        if(entry.soc==="GREEN"){ng=[...ng,newVeh];}else{nu=[...nu,newVeh];}
      }
      setUrban(nu);setGreen(ng);
      sv({u:nu,g:ng,di:n,...extra});
    }else if(type==="garage"&&entry.im){
      // Ajout au garage → IMMO dans la flotte + retirer de dispo
      const im=entry.im.toUpperCase().trim();
      const garLabel=entry.gar?`GARAGE ${entry.gar.toUpperCase()}`:"GARAGE";
      const inUrban=urban.find((v:any)=>v.im===im);
      const inGreen=green.find((v:any)=>v.im===im);
      const isGreen=entry.soc==="GREEN";
      const vehData={st:"IMMO" as string,ch:garLabel};
      let nu=[...urban]; let ng=[...green];
      if(inUrban&&!isGreen){
        // Car is in urban where it belongs — just update status
        nu=urban.map((v:any)=>v.im===im?{...v,...vehData}:v);
      }else if(inGreen&&isGreen){
        // Car is in green where it belongs — just update status
        ng=green.map((v:any)=>v.im===im?{...v,...vehData}:v);
      }else if(inUrban&&isGreen){
        // Car is in urban but should be in green — move it
        nu=urban.filter((v:any)=>v.im!==im);
        ng=[...green,{...inUrban,...vehData}];
      }else if(inGreen&&!isGreen){
        // Car is in green but should be in urban — move it
        ng=green.filter((v:any)=>v.im!==im);
        nu=[...urban,{...inGreen,...vehData}];
      }else{
        // Car doesn't exist in any fleet — create it
        const pm=entry.mo?parseMo(entry.mo):{mq:"",mo:""};
        const newVeh={im,mq:pm.mq,mo:pm.mo,le:(entry.le||"").toUpperCase().trim(),...vehData};
        if(isGreen){ng=[...ng,newVeh];}else{nu=[...nu,newVeh];}
      }
      const nd=disp.filter((d:any)=>d.im?.toUpperCase().trim()!==im);
      if(nd.length!==disp.length) setDisp(nd);
      setUrban(nu);setGreen(ng);
      sv({u:nu,g:ng,[k]:n,di:nd,...extra});
    }else if(type==="vacs"&&entry.ch){
      // Vacances → trouver la voiture du chauffeur, la déplacer dans la flotte choisie, la mettre en dispo
      const chName=entry.ch.toUpperCase().trim();
      const inUrban=urban.find((v:any)=>v.ch&&v.ch.toUpperCase().trim()===chName);
      const inGreen=green.find((v:any)=>v.ch&&v.ch.toUpperCase().trim()===chName);
      const veh=inUrban||inGreen;
      if(veh){
        const im=veh.im;
        const vehUpd={...veh,st:"IMMO",ch:"VACANCES"};
        let nu=urban, ng=green;
        if(entry.soc==="GREEN"){
          nu=urban.filter((v:any)=>v.im!==im);
          ng=inGreen?green.map((v:any)=>v.im===im?vehUpd:v):[...green,vehUpd];
        }else if(entry.soc==="URBAN NEO"){
          ng=green.filter((v:any)=>v.im!==im);
          nu=inUrban?urban.map((v:any)=>v.im===im?vehUpd:v):[...urban,vehUpd];
        }else{
          nu=urban.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"VACANCES"}:v);
          ng=green.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"VACANCES"}:v);
        }
        const isInDisp=disp.find((d:any)=>d.im===im);
        const nd=isInDisp
          ?disp
          :[...disp,{im,soc:entry.soc||veh.soc||"",mo:veh.mo||"",ch:chName,no:`VACANCES ${entry.deb||""}-${entry.fin||""}`.trim(),id:uid()}];
        setUrban(nu);setGreen(ng);setDisp(nd);
        sv({u:nu,g:ng,[k]:n,di:nd,...extra});
      }else{sv({[k]:n,...extra});}
    }else{
      sv({[k]:n,...extra});
    }
    setShowAdd(null);setForm({});
  };
  const edit=(type:string,id:any,updated:any)=>{
    if(isHistorical) return;
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"]};
    const[arr,set,k]=m[type];
    const sortByDate=(a:any)=>[...a].sort((x:any,y:any)=>{const p=(d:string)=>{if(!d)return-1;const[j,mm]=d.split("/").map(Number);return(mm||0)*100+(j||0);};return p(y.dt)-p(x.dt);});
    const n=arr.map((d:any)=>d.id===id?{...d,...updated,im:updated.im?.toUpperCase().trim()||d.im}:d);
    if(type==="deps"||type==="rets") set(sortByDate(n)); else set(n);
    // Sync modele/chauffeur/societe to fleet when editing a departure
    if(type==="deps"&&updated.im){
      const im=(updated.im||"").toUpperCase().trim();
      const pm=updated.mo?parseMo(updated.mo):{mq:"",mo:""};
      const le=(updated.le||"").toUpperCase().trim();
      const isGreen=updated.soc==="GREEN";
      const inUrban=urban.find((v:any)=>v.im===im);
      const inGreen=green.find((v:any)=>v.im===im);
      const upd=(v:any)=>({...v,mo:pm.mo||v.mo||"",mq:pm.mq||v.mq||"",le:le||v.le||"",ch:updated.ch||v.ch});
      let nu=[...urban]; let ng=[...green];
      if(inUrban&&!isGreen){
        nu=urban.map((v:any)=>v.im===im?upd(v):v);
      }else if(inGreen&&isGreen){
        ng=green.map((v:any)=>v.im===im?upd(v):v);
      }else if(inUrban&&isGreen){
        // Car is in urban but societe changed to green — move it
        nu=urban.filter((v:any)=>v.im!==im);
        ng=[...green,upd(inUrban)];
      }else if(inGreen&&!isGreen){
        // Car is in green but societe changed to urban — move it
        ng=green.filter((v:any)=>v.im!==im);
        nu=[...urban,upd(inGreen)];
      }
      setUrban(nu);setGreen(ng);
      sv({[k]:n,u:nu,g:ng});
    } else { sv({[k]:n}); }
  };
  const del=(type:string,id:any,isIdx?:boolean)=>{
    if(isHistorical) return;
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"]};
    const[arr,set,k]=m[type];
    const item=isIdx?arr[id]:arr.find((d:any)=>d.id===id);
    // Archive before deleting
    if(item) fetch('/api/archive',{method:'POST',headers,body:JSON.stringify({section:type,item})}).catch(()=>{});
    const n=isIdx?arr.filter((_:any,i:number)=>i!==id):arr.filter((d:any)=>d.id!==id);
    set(n);
    
    // Auto-add to dispo when deleting depart, auto-remove from dispo when deleting retour
    if(type==="deps"&&item?.im&&!disp.find((d:any)=>d.im===item.im.toUpperCase().trim())){
      const im=item.im.toUpperCase().trim();
      const veh=[...urban,...green].find((v:any)=>v.im===im);
      const nd=[...disp,{soc:item.soc,im,mo:item.mo||veh?.mo||"",no:item.no||"",id:uid()}];
      // Remettre chauffeur à BUREAU et IMMO dans la flotte
      const nu=urban.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
      const ng=green.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"BUREAU"}:v);
      setUrban(nu);setGreen(ng);setDisp(nd);
      sv({u:nu,g:ng,dep:n,di:nd});
    }else if(type==="rets"&&item?.im){
      const nd=disp.filter((d:any)=>d.im!==item.im.toUpperCase().trim());
      setDisp(nd);sv({ret:n,di:nd});
    }else if(type==="vacs"&&item?.ch){
      // Suppression vacances → on libère le chauffeur. La voiture reste dans le pool dispo,
      // disponible pour être réassignée à n'importe qui via un nouveau départ.
      // Le lien chauffeur ↔ voiture est porté par les départs, pas par cette ancienne attribution.
      const chName=item.ch.toUpperCase().trim();
      const dispItem=disp.find((d:any)=>d.ch&&d.ch.toUpperCase().trim()===chName&&d.no&&d.no.includes("VACANCES"));
      if(dispItem){
        // Nettoyer la marque "VACANCES" sur la voiture en dispo + repasser sa fiche flotte à BUREAU
        const im=dispItem.im;
        const nd=disp.map((d:any)=>d.im===im?{...d,ch:"",no:""}:d);
        const nu=urban.map((v:any)=>v.im===im?{...v,ch:"BUREAU"}:v);
        const ng=green.map((v:any)=>v.im===im?{...v,ch:"BUREAU"}:v);
        setUrban(nu);setGreen(ng);setDisp(nd);
        sv({u:nu,g:ng,[k]:n,di:nd});
      }else{
        // La voiture a déjà été réassignée ailleurs, on ne touche à rien
        sv({[k]:n});
      }
    }else if(type==="garage"&&item?.im){
      // Sortie du garage → ajouter en dispo + garder IMMO dans la flotte
      const im=item.im.toUpperCase().trim();
      if(!disp.find((d:any)=>d.im===im)){
        const veh=[...urban,...green].find((v:any)=>v.im===im);
        const nd=[...disp,{soc:item.soc,im,mo:veh?.mo||"",no:`Sortie garage ${item.gar||""}`.trim(),id:uid()}];
        setDisp(nd);sv({[k]:n,di:nd});
      }else{sv({[k]:n});}
    }else{
      sv({[k]:n});
    }
    setDelC(null);
  };
  // Confirme un "depart à prévoir" / "retour à prévoir" : le déplace dans deps/rets via add() puis le retire de dpvs/rpvs
  const confirmPrevu=(type:"dpvs"|"rpvs",id:any)=>{
    const arr=type==="dpvs"?dpvs:rpvs;
    const setArr=type==="dpvs"?setDpvs:setRpvs;
    const k=type==="dpvs"?"dpv":"rpv";
    const item=arr.find((d:any)=>d.id===id);
    if(!item){return;}
    const required=type==="dpvs"
      ?[["soc","Societe"],["im","Immat"],["mo","Modele"],["le","Leaser"],["ch","Chauffeur"],["dt","Date"],["no","Note"]]
      :[["soc","Societe"],["im","Immat"],["ch","Chauffeur"],["dt","Date"],["no","Note"]];
    const missing=required.filter(([f])=>!item[f]?.toString().trim()).map(([,l])=>l);
    if(missing.length){setToast({msg:`Champs manquants : ${missing.join(", ")}`,type:"err"});return;}
    // Concatene la note et le commentaire (le champ "co" n'existe pas dans deps/rets)
    const noteCombined=[item.no,item.co].filter(Boolean).join(" | ");
    const target={soc:item.soc||"URBAN NEO",im:item.im.toUpperCase().trim(),mo:item.mo||"",le:item.le||"",ch:item.ch||"",dt:item.dt||"",no:noteCombined};
    // Retire d'abord de la liste à prévoir, puis délègue à add() en propageant l'override dpv/rpv
    const newArr=arr.filter((d:any)=>d.id!==id);
    setArr(newArr);
    add(type==="dpvs"?"deps":"rets",target,{[k]:newArr});
  };

  const tog=(im:string)=>{
    if(isHistorical){setToast({msg:"Lecture seule — retournez en direct pour modifier",type:"err"});return;}
    const up=(l:any[])=>l.map(v=>v.im===im?{...v,st:v.st==="ACTIF"?"IMMO":"ACTIF"}:v);
    if(fTab==="urban"){const n=up(urban);setUrban(n);sv({u:n});}
    else{const n=up(green);setGreen(n);sv({g:n});}
  };

  const sendM=()=>{
    if(isHistorical){setToast({msg:"Lecture seule — retournez en direct pour envoyer",type:"err"});return;}
    if(!newMsg.trim())return;
    const msg = {id:uid(),fr:user.displayName,po:user.pole,to:msgTo,tx:newMsg,ti:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),ur:false};
    const updated=[...msgs,msg];
    setMsgs(updated);
    sv({msgs:updated});
    setNewMsg("");
  };

  const TABS=[{k:"diffusion",l:"Diffusion"},{k:"vehicules",l:"Vehicules"},{k:"flotte",l:"Flotte"},{k:"departs",l:"Departs"},{k:"retours",l:"Retours"},{k:"dispo",l:"VH Dispo"},{k:"garage",l:"Garage"},{k:"historique",l:"Historique"},{k:"vacances",l:"Vacances"},{k:"messagerie",l:"Messagerie"}];
  if(user.role !== 'lecteur') TABS.push({k:"utilisateurs",l:"Comptes"});
  const go=async(t:string)=>{setTab(t);setShowAdd(null);setDelC(null);setSearch("");if(t==="historique"){try{const r=await fetch('/api/history',{headers});if(r.ok)setHistory(await r.json());}catch{}};};

  const MiniTbl=({title,titleBg,count,countBad,heads,cols,data,renderRow,maxH=200}:any)=>(
    <div className="diff-block" style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div className="diff-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:titleBg||"#F5F5F3",borderBottom:"1px solid #E5E5E3"}}>
        <span style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>{title}</span>
        <div style={{display:"flex",gap:6}}>
          <span style={{fontSize:11,fontWeight:600,color:"#666"}}>{count}</span>
          {countBad&&<span style={{fontSize:10,fontWeight:700,color:"#C0392B",background:"#FDECEC",padding:"1px 6px",borderRadius:4}}>{countBad}</span>}
        </div>
      </div>
      <div className="diff-head" style={{display:"grid",gridTemplateColumns:cols,padding:"6px 12px",background:"#FAFAF8",borderBottom:"1px solid #EDEDEB",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
        {heads.map((h:string,i:number)=><span key={i}>{h}</span>)}
      </div>
      <div style={{maxHeight:maxH,overflowY:"auto"}}>
        {data.length===0?<div style={{padding:14,textAlign:"center",color:"#DDD",fontSize:11}}>Aucun element</div>:
        data.map((d:any,i:number)=><div key={d.id??d.im??i} className="diff-row" style={{display:"grid",gridTemplateColumns:cols,padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>{renderRow(d,i)}</div>)}
      </div>
    </div>
  );

  return(
    <div className="app-shell" style={{minHeight:"100vh",background:"#F3F3F1",color:"#333",fontFamily:"'Outfit',system-ui,sans-serif",fontSize:13}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {saving&&<div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"#E8633A",zIndex:9998,animation:"fi .2s ease both"}}/>}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.ani{animation:fi .2s ease both}
        .rw:hover{background:#F7F7F5!important}.tb:hover{background:#EAEAE8!important}input:focus,select:focus{outline:none;border-color:#E8633A!important}.dl:hover{background:#FEE!important;color:#C0392B!important}
        @media(max-width:768px){
          .hide-mobile{display:none!important}
          .grid-mobile{grid-template-columns:1fr!important}
          .header-pills{display:none!important}
          .nav-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap!important}
          .nav-scroll::-webkit-scrollbar{display:none}
        }
        @media(min-width:1920px){
          body{zoom:1.25}
        }
        @media(min-width:2560px){
          body{zoom:1.5}
        }
      `}</style>

      <header className="app-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:"#fff",borderBottom:"1px solid #E5E5E3",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="logo-icon" style={{width:30,height:30,borderRadius:7,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",fontFamily:"'IBM Plex Mono',monospace"}}>O</div>
          <div><div className="logo-text" style={{fontSize:13,fontWeight:800,letterSpacing:2,color:"#1A1A1A"}}>OPPORTIX</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span className="header-pills" style={{display:"flex",gap:6}}><Pill c="#1A1A1A" t={`${all.length} VH`}/><Pill c="#2FAA6B" t={`${nUA+nGA} actifs`}/><Pill c="#7B61FF" t={`${nCh} chauffeurs`}/></span>
          <div className="hide-mobile" style={{width:1,height:16,background:"#E5E5E3",margin:"0 4px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div className="user-avatar" style={{width:24,height:24,borderRadius:"50%",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{user.displayName.charAt(0)}</div>
            <span className="user-name" style={{fontSize:11,fontWeight:600,color:"#444"}}>{user.displayName}</span>
            <span className="user-role" style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:4,background:"#F0F0EE",color:"#777"}}>{user.role}</span>
            <button onClick={async()=>{const s=tab==="departs"?"departs":tab==="retours"?"retours":tab==="garage"?"garage":tab==="dispo"?"dispo":tab==="vacances"?"vacances":"vehicles";const wp=viewWeek?`&week=${viewWeek}`:"";try{const res=await fetch(`/api/export/csv?section=${s}${wp}`,{headers});if(!res.ok){setToast({msg:"Erreur export",type:"err"});return;}const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`opportix_${s}_${viewWeek||new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);setToast({msg:"Export CSV téléchargé",type:"ok"});}catch{setToast({msg:"Erreur export",type:"err"});}}} style={{marginLeft:4,padding:"3px 10px",borderRadius:5,border:"1px solid #E0E0DE",background:"#fff",color:"#999",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Export CSV</button>
            {user.role==="admin"&&<button onClick={async()=>{try{const res=await fetch('/api/export/csv/monthly',{headers});if(!res.ok){setToast({msg:"Erreur export hebdo",type:"err"});return;}const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`opportix_hebdo_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);setToast({msg:"Export hebdo téléchargé",type:"ok"});}catch{setToast({msg:"Erreur export hebdo",type:"err"});}}} style={{marginLeft:4,padding:"3px 10px",borderRadius:5,border:"1px solid #2FAA6B",background:"#fff",color:"#2FAA6B",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Export hebdo</button>}
            <button onClick={onLogout} style={{marginLeft:4,padding:"3px 10px",borderRadius:5,border:"1px solid #E0E0DE",background:"#fff",color:"#999",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Déconnexion</button>
          </div>
        </div>
      </header>

      <nav className="nav-scroll" style={{display:"flex",gap:2,padding:"6px 20px",background:"#F3F3F1",borderBottom:"1px solid #E5E5E3",flexWrap:"wrap",overflowX:"auto"}}>
        {TABS.map(t=><button key={t.k} className="tb" onClick={()=>go(t.k)} style={{padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",background:tab===t.k?"#fff":"transparent",color:tab===t.k?"#1A1A1A":"#999",boxShadow:tab===t.k?"0 1px 2px rgba(0,0,0,0.05)":"none",transition:"all .15s"}}>{t.l}</button>)}
      </nav>

      {/* ═══ WEEK SELECTOR BAR ═══ */}
      {(()=>{
        const currentWeek=getISOWeekLabel();
        const currentRange=weekDateRange(currentWeek);
        const displayWeek=viewWeek||currentWeek;
        const displayRange=isHistorical&&snapshotData?{from:snapshotData.from,to:snapshotData.to}:(viewWeek?weekDateRange(viewWeek):currentRange);
        const displayNum=displayWeek.split('-W')[1];
        const canGoPrev=isHistorical?snapshots.findIndex(s=>s.weekLabel===viewWeek)<snapshots.length-1:snapshots.some(s=>s.weekLabel!==currentWeek);
        const canGoNext=isHistorical&&viewWeek!==currentWeek;
        return(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 20px",background:isHistorical?"#FFF8F0":"#FAFAF8",borderBottom:`1px solid ${isHistorical?"#F5D9A8":"#E5E5E3"}`,fontSize:11,flexWrap:"wrap"}}>
          <span style={{fontWeight:700,color:"#888",fontSize:9,letterSpacing:.5}}>SEMAINE</span>
          <button onClick={()=>{if(!isHistorical){const firstPast=snapshots.find(s=>s.weekLabel!==currentWeek);if(firstPast)loadWeek(firstPast.weekLabel);return;}const idx=snapshots.findIndex(s=>s.weekLabel===viewWeek);const prev=snapshots[idx+1];if(prev)loadWeek(prev.weekLabel);}} disabled={!canGoPrev} style={{padding:"2px 8px",borderRadius:4,border:"1px solid #E0E0DE",background:"#fff",color:canGoPrev?"#555":"#CCC",fontSize:11,cursor:canGoPrev?"pointer":"default",fontFamily:"inherit"}}>&#9664;</button>
          <span style={{fontWeight:600,color:isHistorical?"#E8633A":"#1A1A1A",minWidth:220,textAlign:"center",fontSize:11}}>
            Sem. {displayNum} — {displayRange.from} au {displayRange.to}{!isHistorical?" (en direct)":""}
          </span>
          <button onClick={()=>{if(!isHistorical)return;const idx=snapshots.findIndex(s=>s.weekLabel===viewWeek);if(idx<=0||snapshots[idx-1].weekLabel===currentWeek)loadWeek(null);else loadWeek(snapshots[idx-1].weekLabel);}} disabled={!canGoNext} style={{padding:"2px 8px",borderRadius:4,border:"1px solid #E0E0DE",background:"#fff",color:canGoNext?"#555":"#CCC",fontSize:11,cursor:canGoNext?"pointer":"default",fontFamily:"inherit"}}>&#9654;</button>
          {isHistorical&&<button onClick={()=>loadWeek(null)} style={{marginLeft:4,padding:"3px 10px",borderRadius:5,border:"1px solid #2FAA6B",background:"#fff",color:"#2FAA6B",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>&#9679; Retour en direct</button>}
        </div>);
      })()}

      {isHistorical&&<div style={{padding:"6px 20px",background:"#FFF3E0",borderBottom:"1px solid #F5D9A8",fontSize:11,fontWeight:600,color:"#E8633A",textAlign:"center"}}>Vous consultez les donnees de la semaine {viewWeek} — mode lecture seule</div>}

      <main className="app-main" style={{padding:"14px 20px",maxWidth:1300,margin:"0 auto"}}>

        {tab==="diffusion"&&(
          <div className="ani" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
              {[
                {l:"TOTAL VOITURES",v:all.length,c:"#1A1A1A"},
                {l:"URBAN NEO",v:dUrban.length,c:"#3A9BD5",a:nUA,
                  dispo:dUrban.filter(v=>dDisp.find((d:any)=>d.im===v.im)).length,
                  gar:dUrban.filter(v=>dGarage.find((g:any)=>g.im===v.im)).length},
                {l:"GREEN",v:dGreen.length,c:"#2FAA6B",a:nGA,
                  dispo:dGreen.filter(v=>dDisp.find((d:any)=>d.im===v.im)).length,
                  gar:dGreen.filter(v=>dGarage.find((g:any)=>g.im===v.im)).length},
                {l:"CHAUFFEURS ACTIFS",v:nCh,c:"#7B61FF",immo:nUI+nGI},
              ].map((k:any,i:number)=>(
                <div key={i} className="stat-card" style={{background:"#fff",borderRadius:8,padding:"10px 14px",borderLeft:`3px solid ${k.c}`,border:"1px solid #E5E5E3"}}>
                  <div className="stat-label" style={{fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,marginBottom:4}}>{k.l}</div>
                  {k.a!==undefined?(
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div className="stat-value" style={{fontSize:32,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{k.v}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:2,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.1}}>
                        <div style={{fontSize:15,fontWeight:800,color:"#1E8A52"}}>{k.a} ACTIF{k.a>1?"S":""}</div>
                        <div style={{fontSize:13,fontWeight:800,color:"#3A9BD5"}}>{k.dispo} DISPO</div>
                        <div style={{fontSize:13,fontWeight:800,color:"#C0392B"}}>{k.gar} GARAGE</div>
                      </div>
                    </div>
                  ):k.immo!==undefined?(
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div className="stat-value" style={{fontSize:32,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{k.v}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:2,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.1}}>
                        <div style={{fontSize:15,fontWeight:800,color:"#C0392B"}}>{k.immo} IMMO</div>
                      </div>
                    </div>
                  ):(
                    <div className="stat-value" style={{fontSize:32,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{k.v}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid-mobile" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <DiffBlock title="DEPARTS À PRÉVOIR" titleBg="#FDECEA" color="#D94F3B" count={dDpvs.length}
                heads={["SOC","IMMAT","MODELE","CHAUFFEUR","DATE","COMMENTAIRE"]} cols="55px 80px 60px 1fr 50px 1fr" data={dDpvs} maxH={180}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im||"—"}</span><span style={{color:"#666",fontSize:10}}>{d.mo||"—"}</span><span style={{color:"#444"}}>{d.ch||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.co||d.no||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat","XX-000-XX"],["mo","Modele","BYD SEAL"],["le","Leaser","ELPIS"],["ch","Chauffeur","Nom"],["dt","Date","JJ/MM"],["no","Note","..."],["co","Commentaire","..."]]}
                onAdd={(f:any)=>{add("dpvs",{...f,im:(f.im||"").toUpperCase().trim()});}}
                onDel={(id:any)=>del("dpvs",id)}
                onEdit={(id:any,updated:any)=>edit("dpvs",id,updated)}
                onConfirm={(id:any)=>confirmPrevu("dpvs",id)}
                user={displayUser}
              />
              <DiffBlock title="RETOURS À PRÉVOIR" titleBg="#D4F0E0" color="#2FAA6B" count={dRpvs.length}
                heads={["SOC","IMMAT","CHAUFFEUR","DATE","COMMENTAIRE"]} cols="55px 80px 1fr 50px 1fr" data={dRpvs} maxH={180}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im||"—"}</span><span style={{color:"#444"}}>{d.ch||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.co||d.no||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat","XX-000-XX"],["ch","Chauffeur","Nom"],["dt","Date","JJ/MM"],["no","Note","..."],["co","Commentaire","..."]]}
                onAdd={(f:any)=>{add("rpvs",{...f,im:(f.im||"").toUpperCase().trim()});}}
                onDel={(id:any)=>del("rpvs",id)}
                onEdit={(id:any,updated:any)=>edit("rpvs",id,updated)}
                onConfirm={(id:any)=>confirmPrevu("rpvs",id)}
                user={displayUser}
              />
              <DiffBlock title="VOITURES DISPO" titleBg="#D6E9F8" color="#3A9BD5" count={`${dDisp.filter((d:any)=>d.soc==="URBAN NEO").length} Urb · ${dDisp.filter((d:any)=>d.soc==="GREEN").length} Grn`}
                heads={["SOCIETE","IMMAT","MODELE","NOTE"]} cols="65px 90px 1fr 1fr" data={dDisp} maxH={160}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.no||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["mo","Modele","KONA..."],["no","Note","..."]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("disp",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("disp",id)}
                onEdit={(id:any,updated:any)=>edit("disp",id,updated)}
                user={displayUser}
              />
              <DiffBlock title="GARAGE URBAN" titleBg="#FDF4E3" color="#D4A027" count={`${dGarage.filter((g:any)=>g.soc==="URBAN NEO").length} VH`}
                heads={["IMMAT","MODELE","GARAGE","ENTREE","SORTIE"]} cols="85px 70px 1fr 55px 55px" data={dGarage.filter((g:any)=>g.soc==="URBAN NEO")} maxH={160}
                renderRow={(g:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{g.im}</span><span style={{color:"#666",fontSize:10}}>{g.mo||"—"}</span><span style={{color:"#444"}}>{g.gar||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.de||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.ds||"—"}</span></>}
                formFields={[["im","Immat *","XX-000-XX"],["mo","Modele","KONA..."],["gar","Garage","Nom"],["de","Entree","JJ/MM"],["ds","Sortie","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("garage",{...f,soc:"URBAN NEO",im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("garage",id)}
                onEdit={(id:any,updated:any)=>edit("garage",id,updated)}
                onExit={(id:any)=>del("garage",id)}
                user={displayUser}
              />
              <DiffBlock title="GARAGE GREEN" titleBg="#FDF4E3" color="#D4A027" count={`${dGarage.filter((g:any)=>g.soc==="GREEN").length} VH`}
                heads={["IMMAT","MODELE","GARAGE","ENTREE","SORTIE"]} cols="85px 70px 1fr 55px 55px" data={dGarage.filter((g:any)=>g.soc==="GREEN")} maxH={160}
                renderRow={(g:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{g.im}</span><span style={{color:"#666",fontSize:10}}>{g.mo||"—"}</span><span style={{color:"#444"}}>{g.gar||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.de||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.ds||"—"}</span></>}
                formFields={[["im","Immat *","XX-000-XX"],["mo","Modele","KONA..."],["gar","Garage","Nom"],["de","Entree","JJ/MM"],["ds","Sortie","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("garage",{...f,soc:"GREEN",im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("garage",id)}
                onEdit={(id:any,updated:any)=>edit("garage",id,updated)}
                onExit={(id:any)=>del("garage",id)}
                user={displayUser}
              />
              <DiffBlock title="VACANCES CHAUFFEURS" titleBg="#EDE8FA" color="#7B61FF" count={dVacs.length}
                heads={["CHAUFFEUR","SOCIETE","DEBUT","FIN"]} cols="1fr 65px 70px 70px" data={dVacs} maxH={160}
                renderRow={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><SocBadge s={v.soc}/><span style={{color:"#777",fontSize:10}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:10}}>{v.fin||"—"}</span></>}
                formFields={[["ch","Chauffeur *","Nom"],["soc","Societe",null,["URBAN NEO","GREEN"]],["deb","Debut","JJ/MM"],["fin","Fin","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.ch?.trim())return;add("vacs",f);}}
                onDel={(id:any)=>del("vacs",id)}
                onEdit={(id:any,updated:any)=>edit("vacs",id,updated)}
                user={displayUser}
              />
            </div>
          </div>
        )}

        {tab==="vehicules"&&(
          <div className="ani" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>Vehicules</div>
              <div style={{display:"flex",gap:6}}>
                <Pill c="#3A9BD5" t={`${dUrban.length} Urban Neo`}/><Pill c="#2FAA6B" t={`${dGreen.length} Green`}/><Pill c="#1A1A1A" t={`${all.length} total`}/>
              </div>
            </div>
            <div className="grid-mobile" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <MiniTbl title="VEHICULES URBAN NEO" titleBg="#D6E9F8" count={`${urban.length} voitures`} countBad={nUI>0?`${nUI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","LEASER","STATUT","CHAUFFEUR"]} cols="85px 55px 65px 55px 45px 1fr" data={urban} maxH={500}
                renderRow={(v:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1A1A1A",fontSize:10}}>{v.im}</span><span style={{color:"#666"}}>{v.mq}</span><span style={{color:"#666"}}>{v.mo}</span><span style={{color:"#999",fontSize:10}}>{v.le||"—"}</span><StBadge s={v.st}/><span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span></>}
              />
              <MiniTbl title="VEHICULES GREEN" titleBg="#D4F0E0" count={`${green.length} voitures`} countBad={nGI>0?`${nGI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","LEASER","STATUT","CHAUFFEUR"]} cols="85px 55px 65px 55px 45px 1fr" data={green} maxH={500}
                renderRow={(v:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1A1A1A",fontSize:10}}>{v.im}</span><span style={{color:"#666"}}>{v.mq}</span><span style={{color:"#666"}}>{v.mo}</span><span style={{color:"#999",fontSize:10}}>{v.le||"—"}</span><StBadge s={v.st}/><span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span></>}
              />
            </div>
          </div>
        )}

        {tab==="flotte"&&(
          <div className="ani">
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[{k:"urban",l:"Urban Neo",n:urban.length,c:"#3A9BD5"},{k:"green",l:"Green",n:green.length,c:"#2FAA6B"}].map(t=>(
                <button key={t.k} className="tb" onClick={()=>{setFTab(t.k);setShowAdd(null);setDelC(null);setSearch("");}} style={{padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:fTab===t.k?"#fff":"transparent",color:fTab===t.k?"#1A1A1A":"#999",boxShadow:fTab===t.k?"0 1px 2px rgba(0,0,0,0.05)":"none"}}>
                  {t.l} <span style={{padding:"1px 6px",borderRadius:6,fontSize:9,fontWeight:700,background:fTab===t.k?t.c:"#ddd",color:fTab===t.k?"#fff":"#999",marginLeft:3}}>{t.n}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{...iS,width:220}}/>
              {displayUser.role!=='lecteur' && <button onClick={()=>showAdd==="fleet"?setShowAdd(null):setShowAdd("fleet")} style={oBtn("#E8633A",showAdd==="fleet")}>{showAdd==="fleet"?"Annuler":"+ Ajouter"}</button>}
            </div>
            {showAdd==="fleet"&&<AddBox fields={[["Immat *","im","XX-000-XX"],["Marque","mq","HYUNDAI"],["Modele","mo","KONA"],["Leaser","le","ELPIS"],["Chauffeur","ch","Nom"]]} form={form} setForm={setForm} onAdd={()=>{if(!form.im?.trim())return;add(fTab,{...form,im:form.im.toUpperCase().trim(),mq:(form.mq||"").toUpperCase().trim(),st:form.st||"ACTIF"});}} extra={<Sel l="Statut" v={form.st||"ACTIF"} set={(v:string)=>setForm({...form,st:v})} opts={["ACTIF","IMMO"]}/>}/>}
            <div style={{fontSize:11,color:"#AAA",marginBottom:6}}>{filt.length} VH</div>
            <div className="diff-block" style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
              <div className="diff-head" style={{display:"grid",gridTemplateColumns:"100px 1fr 70px 90px 75px 60px 110px",padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
                <span>IMMAT</span><span>CHAUFFEUR</span><span>MARQUE</span><span>MODELE</span><span>LEASER</span><span>STATUT</span><span style={{textAlign:"right"}}></span>
              </div>
              <div style={{maxHeight:480,overflowY:"auto"}}>
                {filt.map((v,i)=>{
                  const isEditing=editFleetIm===v.im;
                  const saveFleet=()=>{
                    const idx=fTab==="urban"?urban.indexOf(v):green.indexOf(v);
                    const arr=fTab==="urban"?urban:green;
                    const setArr=fTab==="urban"?setUrban:setGreen;
                    const k=fTab==="urban"?"u":"g";
                    const upd={...v,...editFleetF,im:(editFleetF.im||v.im).toUpperCase().trim(),mq:(editFleetF.mq??v.mq??"").toUpperCase().trim()};
                    const n=arr.map((x:any,j:number)=>j===idx?upd:x);
                    setArr(n);sv({[k]:n});
                    setEditFleetIm(null);setEditFleetF({});
                  };
                  return (
                  <div key={v.im+i} className="rw" style={{display:"grid",gridTemplateColumns:"100px 1fr 70px 90px 75px 60px 110px",padding:"7px 12px",borderBottom:"1px solid #F5F5F3",alignItems:"center",fontSize:12}}>
                    {isEditing?<>
                      <input value={editFleetF.im??v.im} onChange={e=>setEditFleetF({...editFleetF,im:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}/>
                      <input value={editFleetF.ch??v.ch??""} onChange={e=>setEditFleetF({...editFleetF,ch:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}/>
                      <input value={editFleetF.mq??v.mq??""} onChange={e=>setEditFleetF({...editFleetF,mq:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}/>
                      <input value={editFleetF.mo??v.mo??""} onChange={e=>setEditFleetF({...editFleetF,mo:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}/>
                      <input value={editFleetF.le??v.le??""} onChange={e=>setEditFleetF({...editFleetF,le:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}/>
                      <select value={editFleetF.st??v.st} onChange={e=>setEditFleetF({...editFleetF,st:e.target.value})} style={{...iS,width:"95%",fontSize:10,padding:"3px 5px"}}><option value="ACTIF">ACTIF</option><option value="IMMO">IMMO</option></select>
                      <span style={{textAlign:"right",display:"inline-flex",gap:2,justifyContent:"flex-end"}}>
                        <button onClick={saveFleet} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#1E8A52",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>OK</button>
                        <button onClick={()=>{setEditFleetIm(null);setEditFleetF({});}} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>X</button>
                      </span>
                    </>:<>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:"#1A1A1A"}}>{v.im}</span>
                      <span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span>
                      <span style={{color:"#777",fontSize:11}}>{v.mq}</span>
                      <span style={{color:"#777",fontSize:11}}>{v.mo}</span>
                      <span style={{color:"#AAA",fontSize:10}}>{v.le}</span>
                      <span>{displayUser.role!=='lecteur'?<button onClick={()=>tog(v.im)} style={{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",background:v.st==="ACTIF"?"#E8F8F0":"#FDECEC",color:v.st==="ACTIF"?"#1E8A52":"#C0392B"}}>{v.st}</button>:<span style={{fontSize:9,fontWeight:700,color:v.st==="ACTIF"?"#1E8A52":"#C0392B"}}>{v.st}</span>}</span>
                      <span style={{textAlign:"right",display:"inline-flex",gap:2,justifyContent:"flex-end"}}>
                        {delC===v.im?<><button onClick={()=>del(fTab,fTab==="urban"?urban.indexOf(v):green.indexOf(v),true)} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#C0392B",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Oui</button><button onClick={()=>setDelC(null)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Non</button></>:displayUser.role!=='lecteur'&&<><button className="dl" onClick={()=>{setEditFleetIm(v.im);setEditFleetF({});}} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#3A9BD5",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Editer</button><button className="dl" onClick={()=>setDelC(v.im)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#BBB",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Suppr</button></>}
                      </span>
                    </>}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab==="departs"&&<CrudP title="Departs" color="#D94F3B" data={dDeps} type="deps" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Modele","mo","BYD SEAL"],["Leaser","le","ELPIS"],["Chauffeur","ch","Nom"],["Date","dt","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} user={displayUser}
          cols="80px 100px 80px 70px 1fr 70px 1fr 90px" heads={["SOCIETE","IMMAT","MODELE","LEASER","CHAUFFEUR","DATE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#666",fontSize:11}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.le||"—"}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#777",fontSize:11}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="retours"&&<CrudP title="Retours" color="#2FAA6B" data={dRets} type="rets" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Chauffeur","ch","Nom"],["Date","dt","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} user={displayUser}
          cols="80px 100px 1fr 80px 1fr 60px" heads={["SOCIETE","IMMAT","CHAUFFEUR","DATE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#777",fontSize:11}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="dispo"&&<CrudP title="Vehicules disponibles" color="#3A9BD5" data={dDisp} type="disp" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Modele","mo","KONA..."],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} user={displayUser}
          cols="80px 100px 1fr 1fr 60px" heads={["SOCIETE","IMMAT","MODELE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="garage"&&<CrudP title="Garage" color="#D4A027" data={dGarage} type="garage" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Modele","mo","KONA..."],["Garage","gar","Nom"],["Entree","de","JJ/MM"],["Sortie","ds","JJ/MM"],["Jours","ji","0"]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} exitItem={(t:string,id:any)=>del(t,id)} user={displayUser}
          cols="80px 100px 90px 1fr 70px 70px 50px 110px" heads={["SOCIETE","IMMAT","MODELE","GARAGE","ENTREE","SORTIE","JOURS",""]}
          rr={(g:any)=><><span><SocBadge s={g.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{g.im}</span><span style={{color:"#666",fontSize:11}}>{g.mo||"—"}</span><span style={{color:"#444"}}>{g.gar||"—"}</span><span style={{color:"#777",fontSize:11}}>{g.de||"—"}</span><span style={{color:"#777",fontSize:11}}>{g.ds||"—"}</span><span style={{color:"#999",fontSize:11}}>{g.ji||"—"}</span></>}
        />}
        {tab==="historique"&&(
          <div className="ani" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>Historique conducteurs</div>
              <button onClick={async()=>{try{const r=await fetch('/api/history',{headers});if(r.ok)setHistory(await r.json());}catch{}}} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #E0E0DE",background:"#fff",color:"#555",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Rafraichir</button>
            </div>
            <input value={histSearch} onChange={e=>setHistSearch(e.target.value)} placeholder="Rechercher un conducteur..." style={{...iS,width:300}}/>
            {Object.keys(history).length===0?<div style={{padding:30,textAlign:"center",color:"#BBB",fontSize:12}}>Cliquez sur "Rafraichir" pour charger l'historique</div>:
            Object.entries(history).filter(([name])=>!histSearch||(name as string).toLowerCase().includes(histSearch.toLowerCase())).sort(([a],[b])=>(a as string).localeCompare(b as string)).map(([name,events]:any)=>(
              <div key={name} style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
                <div style={{padding:"8px 12px",background:"#F5F5F3",borderBottom:"1px solid #E5E5E3",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>{name}</span>
                  <span style={{fontSize:10,color:"#999"}}>{events.length} evenement{events.length>1?"s":""}</span>
                </div>
                <div style={{maxHeight:200,overflowY:"auto"}}>
                  {events.map((e:any,i:number)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"90px 70px 100px 80px 60px 1fr",padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>
                      <span style={{fontWeight:600,color:e.type==="depart"?"#D94F3B":e.type==="retour"?"#2FAA6B":"#3A9BD5",fontSize:10}}>
                        {e.type==="vehicule_actuel"?"VH ACTUEL":e.type==="depart"?"DEPART":"RETOUR"}
                      </span>
                      <span><SocBadge s={e.soc}/></span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{e.im}</span>
                      <span style={{color:"#666",fontSize:10}}>{e.mo||(e.mq?`${e.mq} ${e.mo}`:"")||"—"}</span>
                      <span style={{color:"#999",fontSize:10}}>{e.dt||e.st||"—"}</span>
                      <span style={{color:"#AAA",fontSize:10}}>{e.no||e.le||""}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="vacances"&&<CrudP title="Vacances chauffeurs" color="#7B61FF" data={dVacs} type="vacs" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Chauffeur *","ch","Nom"],["Societe","soc",null,["URBAN NEO","GREEN"]],["Debut","deb","JJ/MM"],["Fin","fin","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} user={displayUser}
          cols="1fr 80px 80px 80px 1fr 60px" heads={["CHAUFFEUR","SOCIETE","DEBUT","FIN","NOTE",""]}
          rr={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><span><SocBadge s={v.soc}/></span><span style={{color:"#777",fontSize:11}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:11}}>{v.fin||"—"}</span><span style={{color:"#999",fontSize:11}}>{v.no||"—"}</span></>}
        />}
        {tab==="messagerie"&&(
          <div className="ani">
            <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginBottom:10}}>Messagerie inter-poles</div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
              <div style={{padding:12,maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
                {dMsgs.map(m=>(
                  <div key={m.id} style={{display:"flex",gap:8,alignItems:"flex-start",padding:6,borderRadius:6,background:m.ur?"#FFF8F6":"transparent"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:(POLES as any)[m.po]?.c||"#999",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{m.fr.charAt(0)}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,flexWrap:"wrap"}}>
                        <span style={{fontWeight:600,color:"#1A1A1A"}}>{m.fr}</span>
                        <span style={{color:(POLES as any)[m.po]?.c,fontSize:10}}>{(POLES as any)[m.po]?.n}</span>
                        <span style={{color:"#CCC",fontSize:10}}>{"→"} {m.to==="all"?"Tous":(POLES as any)[m.to]?.n}</span>
                        <span style={{color:"#BBB",fontSize:9,marginLeft:"auto"}}>{m.ti}</span>
                      </div>
                      <div style={{color:"#444",lineHeight:1.4,fontSize:12}}>{m.tx}</div>
                      {m.ur&&<span style={{fontSize:9,fontWeight:700,color:"#C0392B"}}>URGENT</span>}
                    </div>
                  </div>
                ))}
                <div ref={ce}/>
              </div>
              {!isHistorical&&<div style={{display:"flex",gap:6,padding:"8px 12px",borderTop:"1px solid #E5E5E3",background:"#FAFAF8",flexWrap:"wrap"}}>
                <select value={msgTo} onChange={e=>setMsgTo(e.target.value)} style={{...iS,width:120,fontSize:11}}><option value="all">Tous</option><option value="activite">Activite</option><option value="parc">Parc</option><option value="commercial">Commercial</option></select>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendM()} placeholder="Message..." style={{...iS,flex:1}}/>
                <button onClick={sendM} style={{padding:"7px 16px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Envoyer</button>
              </div>}
            </div>
          </div>
        )}
      
  {tab==="utilisateurs"&&(
    <div className="ani">
      <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginBottom:10}}>Gestion des Comptes</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap"}}>
        <CrudP title="Comptes enregistrés" color="#1A1A1A" data={usersList} type="users" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Identifiant *","username","login"],["Nom d'affichage *","displayName","Ex: Jean D."],
            ["Role","role",null, user.role==='admin' ? ["lecteur","editeur","admin"]: ["lecteur","editeur"]],
            ["Pole","pole",null,["activite","parc","commercial","all"]],
            ["Mot de passe","password","Vide = opportix2025"]]}
          form={form} setForm={setForm}
          addItem={async(type:string, f:any)=>{
            if(!f.username?.trim() || !f.displayName?.trim()) return;
            const res = await fetch('/api/users', {method:'POST',headers,body:JSON.stringify(f)});
            if(res.ok){
              const neu = await res.json();
              setUsersList([...usersList, neu]);
              setShowAdd(null);setForm({});
            } else { alert((await res.json()).error); }
          }}
          delItem={async(type:string, id:any)=>{
             const res = await fetch('/api/users/'+id, {method:'DELETE',headers});
             if(res.ok) { setUsersList(usersList.filter((u:any)=>u.id!==id)); }
             else { alert((await res.json()).error); }
          }}
          cols={user.role==='admin'?"30px 100px 150px 100px 100px 90px 80px":"30px 100px 150px 100px 100px 80px"} heads={user.role==='admin'?["","IDENTIFIANT","NOM","RÔLE","PÔLE","ACTION",""]:["","IDENTIFIANT","NOM","RÔLE","PÔLE",""]}
          rr={(u:any)=><><span style={{fontWeight:800}}>{u.role==='admin'?'🛡️':'👤'}</span><span style={{fontWeight:600}}>{u.username}</span><span>{u.displayName}</span><span>{u.role}</span><span>{u.pole}</span>{user.role==='admin'&&<span>{u.role!=='admin'?<button onClick={async()=>{const nr=u.role==='lecteur'?'editeur':'lecteur';const res=await fetch('/api/users/'+u.id+'/role',{method:'PUT',headers,body:JSON.stringify({role:nr})});if(res.ok){setUsersList(usersList.map((x:any)=>x.id===u.id?{...x,role:nr}:x));}else{alert((await res.json()).error);}}} style={{padding:"2px 8px",borderRadius:4,border:"1px solid #E0E0DE",background:u.role==='editeur'?"#E8F8F0":"#FDF4E3",color:u.role==='editeur'?"#1E8A52":"#B7791F",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{u.role==='lecteur'?'→ Editeur':'→ Lecteur'}</button>:<span style={{fontSize:9,color:"#AAA"}}>—</span>}</span>}</>}
          user={{...user, role: user.role==='admin'?'admin':'lecteur'}}
        />
      </div>
    </div>
  )}

      </main>
    </div>
  );
}

