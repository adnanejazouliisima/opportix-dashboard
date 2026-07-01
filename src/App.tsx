import { useState, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";
import { Toast, Pill, Sel, StBadge, SocBadge, DiffBlock, AddBox, CrudP, iS, oBtn } from "./components";
import logoUrl from "./assets/logo.jpeg";

/* ═══ INVITE D'INSTALLATION PWA ═══ */
function InstallPrompt(){
  const [visible,setVisible]=useState(false);
  const [deferred,setDeferred]=useState<any>(null);
  const [ios,setIos]=useState(false);
  useEffect(()=>{
    const standalone=window.matchMedia?.("(display-mode: standalone)").matches||(navigator as any).standalone===true;
    if(standalone||localStorage.getItem("opx-install-hide")) return;
    // N'afficher l'invite que sur téléphone/tablette, jamais sur le site en version ordinateur.
    if(!/android|iphone|ipad|ipod|mobile|silk/i.test(navigator.userAgent)) return;
    if(/iphone|ipad|ipod/i.test(navigator.userAgent)){setIos(true);setVisible(true);return;}
    const existing=(window as any).__deferredInstallPrompt;
    if(existing){setDeferred(existing);setVisible(true);}
    const onReady=()=>{setDeferred((window as any).__deferredInstallPrompt);setVisible(true);};
    const onBip=(e:any)=>{e.preventDefault();setDeferred(e);setVisible(true);};
    const onDone=()=>{setVisible(false);localStorage.setItem("opx-install-hide","1");};
    window.addEventListener("pwa-installable",onReady);
    window.addEventListener("beforeinstallprompt",onBip);
    window.addEventListener("appinstalled",onDone);
    return ()=>{window.removeEventListener("pwa-installable",onReady);window.removeEventListener("beforeinstallprompt",onBip);window.removeEventListener("appinstalled",onDone);};
  },[]);
  if(!visible) return null;
  const hide=()=>{setVisible(false);localStorage.setItem("opx-install-hide","1");};
  const doInstall=async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice;}catch{}setDeferred(null);setVisible(false);};
  return (
    <div style={{position:"fixed",left:12,right:12,bottom:12,zIndex:9997,background:"#1A1A1A",color:"#fff",borderRadius:12,padding:"11px 13px",boxShadow:"0 6px 24px rgba(0,0,0,0.28)",display:"flex",alignItems:"center",gap:11,maxWidth:520,margin:"0 auto"}}>
      <div style={{width:34,height:34,borderRadius:8,background:"#E8633A",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,fontFamily:"'IBM Plex Mono',monospace",flexShrink:0}}>O</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700}}>Installer Opportix</div>
        <div style={{fontSize:10,color:"#BBB",marginTop:2,lineHeight:1.3}}>{ios?"Touchez « Partager » puis « Sur l'écran d'accueil »":"Accès rapide en plein écran, comme une vraie appli."}</div>
      </div>
      {!ios&&<button onClick={doInstall} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#E8633A",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Installer</button>}
      <button onClick={hide} title="Masquer" style={{padding:"6px 9px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#BBB",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
    </div>
  );
}

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

const API_URL = "";
const uid=()=>crypto.randomUUID();
// Convertit une clé VAPID base64url en Uint8Array pour pushManager.subscribe.
function urlB64ToU8(base64String:string){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64);const arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
  return arr;
}
const pushSupported=typeof window!=='undefined'&&'Notification'in window&&'serviceWorker'in navigator&&'PushManager'in window;

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
// "DD/MM" ou "DD/MM/YYYY" → cle mois*100+jour pour comparaison.
const dmKey=(s?:string)=>{if(!s)return null;const p=s.trim().split("/").map(Number);return p[0]&&p[1]?p[1]*100+p[0]:null;};
// Une vacance a commence si sa date de debut est atteinte. Sans date valide → consideree
// commencee (comportement historique). Accepte DD/MM, DD/MM/YY et DD/MM/YYYY : avec annee
// la comparaison est exacte ; sans annee, la fenetre de 6 mois gere le passage d'annee
// (un debut en janvier saisi en decembre est bien futur, pas "passe depuis 11 mois").
const vacStarted=(deb?:string)=>{
  if(!deb) return true;
  const p=deb.trim().split("/").map(Number);
  if(!p[0]||!p[1]) return true;
  const t=new Date();
  if(p[2]){
    const y=p[2]<100?2000+p[2]:p[2];
    return new Date(y,p[1]-1,p[0]).getTime()<=new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime();
  }
  const kd=p[1]*100+p[0];
  const today=(t.getMonth()+1)*100+t.getDate();
  return kd<=today?today-kd<600:kd-today>600;
};
// Tri vehicules : IMMO toujours en haut, puis par marque+modele (memes modeles groupes), puis immat.
const sortVeh=(a:any[])=>[...a].sort((x:any,y:any)=>{
  const xi=x.st==="IMMO"?0:1,yi=y.st==="IMMO"?0:1;
  if(xi!==yi) return xi-yi;
  return `${x.mq||""} ${x.mo||""}`.trim().localeCompare(`${y.mq||""} ${y.mo||""}`.trim())||(x.im||"").localeCompare(y.im||"");
});

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
  const [vp,setVp]=useState<number>(0);
  const [editingVp,setEditingVp]=useState(false);
  const [vpDraft,setVpDraft]=useState("0");
  const [suivis,setSuivis]=useState<any[]>([]);
  const [suiviOpen,setSuiviOpen]=useState(false);
  const [markingSuivi,setMarkingSuivi]=useState<string|null>(null);
  const [suiviDateDraft,setSuiviDateDraft]=useState("");
  const [suiviTypeDraft,setSuiviTypeDraft]=useState<"SUIVI"|"IMPACTAGE">("SUIVI");
  const [suiviCommentDraft,setSuiviCommentDraft]=useState("");
  const [suiviPrixDraft,setSuiviPrixDraft]=useState("");
  const [suiviSearch,setSuiviSearch]=useState("");
  // Onglet Suivis remanié : split par societe, liste par vehicule + grille 6 mois depliable.
  const [suiviTab,setSuiviTab]=useState<"urban"|"green">("urban");
  const [suiviOpenIm,setSuiviOpenIm]=useState<string|null>(null);
  const [chkForm,setChkForm]=useState<any>({type:"SUIVI"});
  const [chkDel,setChkDel]=useState<string|null>(null);
  const [chkEditCh,setChkEditCh]=useState<string|null>(null);
  const [chkChDraft,setChkChDraft]=useState("");
  const [chkEditId,setChkEditId]=useState<string|null>(null);
  const [chkEditF,setChkEditF]=useState<any>({});
  const [importing,setImporting]=useState(false);
  const [showAdd,setShowAdd]=useState<string|null>(null);
  const [form,setForm]=useState<any>({});
  const [fTab,setFTab]=useState("urban");
  const [search,setSearch]=useState("");
  const [delC,setDelC]=useState<string|null>(null);
  const [editFleetIm,setEditFleetIm]=useState<string|null>(null);
  const [editFleetF,setEditFleetF]=useState<any>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [history,setHistory]=useState<any>({});
  const [histSearch,setHistSearch]=useState("");
  const savingRef=useRef(false);
  // Incremented on every save start. Un GET en vol qui termine apres un save voit son
  // generation perimee et n'applique pas son resultat (sinon il ecraserait la modif locale).
  const saveGenRef=useRef(0);
  const [toast,setToast]=useState<{msg:string,type:"ok"|"err"}|null>(null);
  const [saving,setSaving]=useState(false);
  const [online,setOnline]=useState<boolean>(typeof navigator!=='undefined'?navigator.onLine:true);
  const [pushOn,setPushOn]=useState(false);
  const [pushBusy,setPushBusy]=useState(false);
  const [snapshots,setSnapshots]=useState<{weekLabel:string,from:string,to:string,createdAt:string}[]>([]);
  const [viewWeek,setViewWeek]=useState<string|null>(null);
  const [snapshotData,setSnapshotData]=useState<any>(null);
  const isHistorical=viewWeek!==null;
  // Force read-only role when viewing a past week so child components hide write buttons.
  const displayUser=isHistorical?{...user,role:"lecteur"}:user;

  // Charge les données depuis l'API
  const loadDataFromAPI=async()=>{
    if(savingRef.current) return;
    const genAtStart=saveGenRef.current;
    try{
      const res=await fetch(`${API_URL}/api/data`,{
        headers:{"Authorization":`Bearer ${userToken}`}
      });
      // Si un save a demarre pendant ce GET, ses donnees sont peut-etre obsoletes — on jette.
      if(saveGenRef.current!==genAtStart||savingRef.current) return;
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
        // Sync modele/leaser des departs vers la flotte si manquants — mais NE PAS recreer
        // les vehicules supprimes (sinon une suppression dans Vehicules est annulee par le
        // depart qui pointe encore vers la plaque).
        depList.forEach((d:any)=>{
          if(!d.im) return;
          const im=d.im.toUpperCase().trim();
          const exists=[...u,...g].find((v:any)=>v.im===im);
          if(!exists) return;
          const pm=d.mo?parseMo(d.mo):{mq:"",mo:""};
          const le=(d.le||"").toUpperCase().trim();
          const needSync=(d.mo&&!exists.mo)||(le&&!exists.le);
          if(needSync){
            const upd=(v:any)=>v.im===im?{...v,mq:pm.mq||v.mq,mo:pm.mo||v.mo,le:le||v.le}:v;
            if(u.find((v:any)=>v.im===im)) u=u.map(upd);
            if(g.find((v:any)=>v.im===im)) g=g.map(upd);
            changed=true;
          }
        });
        // Vacances a debut differe : la voiture n'est liberee (IMMO/VACANCES + dispo) qu'une
        // fois la date de debut atteinte. Le flag `applied` evite de rejouer la transition
        // (sinon une voiture reassignee apres les vacances serait re-liberee a chaque reload).
        let va=data.va||[],di=data.di||[];
        let vaChanged=false;
        va=va.map((vac:any)=>{
          if(vac.applied||!vac.ch||!vacStarted(vac.deb)) return vac;
          vaChanged=true;
          // Vacance deja terminee (entrees historiques sans flag) : ne pas voler la voiture
          // que le chauffeur a pu reprendre depuis — on flague sans rien toucher.
          const kf=dmKey(vac.fin);
          const t=new Date();const todayKey=(t.getMonth()+1)*100+t.getDate();
          if(kf!==null&&kf!==todayKey&&vacStarted(vac.fin)) return {...vac,applied:true};
          const chName=vac.ch.toUpperCase().trim();
          const veh=[...u,...g].find((v:any)=>v.ch&&v.ch.toUpperCase().trim()===chName);
          if(veh){
            const im=veh.im;
            const inU=!!u.find((v:any)=>v.im===im);
            const vehUpd={...veh,st:"IMMO",ch:"VACANCES"};
            if(vac.soc==="GREEN"){u=u.filter((v:any)=>v.im!==im);g=g.find((v:any)=>v.im===im)?g.map((v:any)=>v.im===im?vehUpd:v):[...g,vehUpd];}
            else if(vac.soc==="URBAN NEO"){g=g.filter((v:any)=>v.im!==im);u=inU?u.map((v:any)=>v.im===im?vehUpd:v):[...u,vehUpd];}
            else{u=u.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"VACANCES"}:v);g=g.map((v:any)=>v.im===im?{...v,st:"IMMO",ch:"VACANCES"}:v);}
            if(!di.find((d:any)=>d.im===im)) di=[...di,{im,soc:vac.soc||(inU?"URBAN NEO":"GREEN"),mo:veh.mo||"",ch:chName,no:`VACANCES ${vac.deb||""}-${vac.fin||""}`.trim(),id:uid()}];
          }
          return {...vac,applied:true};
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
        if(data.di||vaChanged) setDisp(di);
        if(data.va||vaChanged) setVacs(va);
        if(data.pr) setPros(data.pr);
        if(data.dpv) setDpvs(data.dpv);
        if(data.rpv) setRpvs(data.rpv);
        if(typeof data.vp==='number') setVp(data.vp);
        if(data.suivis) setSuivis(data.suivis);
        // Save synced fleet if vehicles were added or a vacation transition was applied
        if((changed||vaChanged)&&user.role!=='lecteur'){
          savingRef.current=true;setSaving(true);
          try{
            await fetch(`${API_URL}/api/data`,{method:'PUT',headers,body:JSON.stringify({u,g,dep:data.dep,ret:data.ret,di,ga:data.ga,va,pr:data.pr})});
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

  // Détection hors-ligne : bannière + rechargement des données au retour du réseau.
  useEffect(()=>{
    const on=()=>{setOnline(true);loadDataFromAPI();},off=()=>setOnline(false);
    window.addEventListener('online',on);window.addEventListener('offline',off);
    return ()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  // Notifications push : détecte un abonnement déjà actif.
  useEffect(()=>{
    if(!pushSupported) return;
    navigator.serviceWorker.ready.then(reg=>reg.pushManager.getSubscription()).then(sub=>{if(sub&&Notification.permission==='granted')setPushOn(true);}).catch(()=>{});
  },[]);
  const enablePush=async()=>{
    const standalone=window.matchMedia?.("(display-mode: standalone)").matches||(navigator as any).standalone===true;
    const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
    if(isIos&&!standalone){setToast({msg:"iPhone : installez d'abord l'app (Partager → Sur l'écran d'accueil), puis activez les notifications depuis l'app installée",type:"err"});return;}
    if(!pushSupported){setToast({msg:"Notifications non supportées sur cet appareil",type:"err"});return;}
    setPushBusy(true);
    try{
      const r=await fetch('/api/push/vapid',{headers});const {publicKey,enabled}=await r.json();
      if(!enabled||!publicKey){setToast({msg:"Notifications pas encore configurées sur le serveur (variables VAPID)",type:"err"});return;}
      const perm=await Notification.requestPermission();
      if(perm!=='granted'){setToast({msg:"Autorisation des notifications refusée",type:"err"});return;}
      const reg=await navigator.serviceWorker.ready;
      const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64ToU8(publicKey)});
      const res=await fetch('/api/push/subscribe',{method:'POST',headers,body:JSON.stringify({subscription:sub})});
      if(res.ok){setPushOn(true);setToast({msg:"Notifications de suivi activées ✓",type:"ok"});}
      else setToast({msg:"Échec de l'abonnement",type:"err"});
    }catch(e){setToast({msg:"Erreur lors de l'activation des notifications",type:"err"});console.error("Push error:",e);}
    finally{setPushBusy(false);}
  };
  const testPush=async()=>{
    try{const r=await fetch('/api/push/test',{method:'POST',headers});const d=await r.json().catch(()=>({}));
      setToast({msg:r.ok?`Notification envoyée (${d.sent??0} appareil${(d.sent??0)>1?"s":""})`:(d.error||"Erreur d'envoi"),type:r.ok?"ok":"err"});
    }catch{setToast({msg:"Erreur lors du test",type:"err"});}
  };

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
    // Patch save: n'envoyer QUE les cles explicitement passees pour eviter d'ecraser
    // les modifications faites par d'autres utilisateurs (le serveur fait un $set partiel).
    const validKeys=['u','g','ga','dep','ret','di','va','pr','dpv','rpv','vp','suivis'] as const;
    const d:any={};
    for(const k of validKeys){ if(k in o) d[k]=o[k]; }
    if(Object.keys(d).length===0) return;
    // Snapshot previous state for rollback (uniquement les cles modifiees).
    const prev:any={};
    const cur:any={u:urban,g:green,ga:garage,dep:deps,ret:rets,di:disp,va:vacs,pr:pros,dpv:dpvs,rpv:rpvs,vp,suivis};
    for(const k of Object.keys(d)) prev[k]=cur[k];
    savingRef.current=true;setSaving(true);saveGenRef.current++;
    const setters:any={u:setUrban,g:setGreen,ga:setGarage,dep:setDeps,ret:setRets,di:setDisp,va:setVacs,pr:setPros,dpv:setDpvs,rpv:setRpvs,vp:setVp,suivis:setSuivis};
    const rollback=()=>{for(const k of Object.keys(prev)) setters[k](prev[k]);};
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
  // Tri vacances par date de fin croissante (la plus proche en haut). Sans fin → tout en bas.
  const dVacs=(()=>{
    const src=isHistorical?(snapshotData?.va||[]):vacs;
    const p=(d:string)=>{if(!d)return Infinity;const[j,m]=d.split("/").map(Number);return(m||0)*100+(j||0);};
    return [...src].sort((x:any,y:any)=>p(x.fin)-p(y.fin));
  })();
  const dPros=isHistorical?(snapshotData?.pr||[]):pros;
  const dVp=isHistorical?(typeof snapshotData?.vp==='number'?snapshotData.vp:0):vp;
  const dSuivis=isHistorical?(snapshotData?.suivis||[]):suivis;
  const dDpvs=isHistorical?(snapshotData?.dpv||[]):dpvs;
  const dRpvs=isHistorical?(snapshotData?.rpv||[]):rpvs;

  const all=[...dUrban.map(v=>({...v,soc:"URBAN NEO"})),...dGreen.map(v=>({...v,soc:"GREEN"}))];
  const nUA=dUrban.filter(v=>v.st==="ACTIF").length, nUI=dUrban.filter(v=>v.st==="IMMO").length;
  const nGA=dGreen.filter(v=>v.st==="ACTIF").length, nGI=dGreen.filter(v=>v.st==="IMMO").length;
  const nCh=all.filter(v=>v.st==="ACTIF").length;

  // Suivi: chaque entree dans `suivis` est {id,im,date,type,co,prix,...}.
  // La derniere date pour un immatricule = date du suivi le plus recent (fallback sur v.vs legacy).
  // Apres 30 jours sans suivi, le vehicule apparait dans la cloche avec son nb de jours de retard.
  const todayISO=new Date().toISOString().slice(0,10);
  const daysSince=(date?:string)=>{
    if(!date) return Infinity;
    const d=new Date(date);
    if(isNaN(d.getTime())) return Infinity;
    return Math.floor((new Date(todayISO).getTime()-d.getTime())/86400000);
  };
  // Accepte YYYY-MM-DD, DD/MM/YYYY, DD/MM/YY, DD/MM. Renvoie ISO YYYY-MM-DD ou la chaine brute si non reconnue.
  const normalizeDate=(s?:string):string=>{
    if(!s) return "";
    const t=s.trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    let m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
    m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if(m) return `20${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
    m=t.match(/^(\d{1,2})\/(\d{1,2})$/);
    if(m){const y=new Date().getFullYear();return `${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;}
    return t;
  };
  const lastSuiviDate=(im:string,fallback?:string)=>{
    let maxIso:string|undefined=undefined;
    for(const s of suivis){
      if(s.im!==im||!s.date) continue;
      const iso=normalizeDate(s.date);
      if(!maxIso||iso>maxIso) maxIso=iso;
    }
    return maxIso||(fallback?normalizeDate(fallback):undefined);
  };
  // Liste basee sur les donnees LIVE (jamais les snapshots) pour que la cloche reflete l'etat actuel.
  const liveAll=[...urban.map(v=>({...v,soc:"URBAN NEO",_last:lastSuiviDate(v.im,v.vs)})),...green.map(v=>({...v,soc:"GREEN",_last:lastSuiviDate(v.im,v.vs)}))];
  const overdueList=liveAll.filter(v=>daysSince(v._last)>30).sort((a,b)=>daysSince(b._last)-daysSince(a._last));
  const overdueCount=overdueList.length;
  const markSuivi=(im:string,date:string,type:"SUIVI"|"IMPACTAGE",comment:string,prix:number)=>{
    if(isHistorical) return;
    const inU=urban.find((v:any)=>v.im===im);
    const veh=inU||green.find((v:any)=>v.im===im);
    const entry={id:uid(),im,soc:inU?"URBAN NEO":"GREEN",ch:veh?.ch||"",mo:veh?.mo||"",date,type,co:comment||"",prix:type==="IMPACTAGE"?prix:0};
    const newSuivis=[...suivis,entry];
    setSuivis(newSuivis);
    sv({suivis:newSuivis});
    setMarkingSuivi(null);setSuiviDateDraft("");setSuiviTypeDraft("SUIVI");setSuiviCommentDraft("");setSuiviPrixDraft("");
  };

  const cur=fTab==="urban"?dUrban:dGreen;
  const filt=useMemo(()=>cur.filter(v=>{
    if(search){const s=search.toLowerCase();return (v.im||"").toLowerCase().includes(s)||(v.ch||"").toLowerCase().includes(s)||(v.mq||"").toLowerCase().includes(s)||(v.mo||"").toLowerCase().includes(s)||(v.le||"").toLowerCase().includes(s);}
    return true;
  }),[cur,search,fTab]);

  const add=(type:string,entry:any,extra:any={})=>{
    if(isHistorical) return;
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"],suivis:[suivis,setSuivis,"suivis"]};
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
      // Retour auto du chauffeur precedent : si la voiture etait deja chez un vrai chauffeur
      // (different du nouveau), on cree un retour editable dans l'onglet Retours.
      const prevCh=(exists?.ch||"").trim();
      const newCh=(entry.ch||"").trim();
      const realDriver=(c:string)=>{const u=c.toUpperCase();return !!c&&u!=="BUREAU"&&u!=="VACANCES"&&!u.startsWith("GARAGE");};
      let nr=rets;
      if(exists&&realDriver(prevCh)&&newCh&&prevCh.toUpperCase()!==newCh.toUpperCase()){
        const tt=new Date();const todayDM=`${String(tt.getDate()).padStart(2,"0")}/${String(tt.getMonth()+1).padStart(2,"0")}`;
        const rsoc=urban.find((v:any)=>v.im===im)?"URBAN NEO":green.find((v:any)=>v.im===im)?"GREEN":(entry.soc||"");
        const retEntry={id:uid(),soc:rsoc,im,mo:entry.mo||exists.mo||"",ch:prevCh,dt:entry.dt||todayDM,no:`Retour auto (départ ${newCh})`};
        nr=sortByDate([...rets,retEntry]);
        setRets(nr);
      }
      setUrban(nu);setGreen(ng);setDisp(nd);
      sv({u:nu,g:ng,dep:n,di:nd,ga:nGa,va:nv,...(nr!==rets?{ret:nr}:{}),...extra});
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
      // Debut dans le futur → la voiture reste au chauffeur ; loadDataFromAPI la liberera
      // a la date de debut (voir flag `applied`).
      if(!vacStarted(entry.deb)){
        sv({[k]:n,...extra});
      }else{
      // Vacances → trouver la voiture du chauffeur, la déplacer dans la flotte choisie, la mettre en dispo
      const n2=n.map((it:any,i:number)=>i===n.length-1?{...it,applied:true}:it);
      set(n2);
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
        sv({u:nu,g:ng,[k]:n2,di:nd,...extra});
      }else{sv({[k]:n2,...extra});}
      }
    }else if(type==="suivis"&&entry.im){
      // Enrichir la nouvelle entree avec soc/ch/mo du vehicule + normaliser type/prix/date
      const im=entry.im.toUpperCase().trim();
      const inU=urban.find((v:any)=>v.im===im);
      const inG=green.find((v:any)=>v.im===im);
      const veh=inU||inG;
      if(!veh){setToast({msg:`Vehicule ${im} introuvable dans la flotte`,type:"err"});setShowAdd(null);setForm({});return;}
      const lastIdx=n.length-1;
      const norm={...n[lastIdx],im,soc:inU?"URBAN NEO":"GREEN",ch:(n[lastIdx].ch??veh.ch??""),mo:n[lastIdx].mo||veh.mo||"",date:normalizeDate(n[lastIdx].date),prix:parseFloat(String(n[lastIdx].prix||0))||0,type:(n[lastIdx].type||"SUIVI").toUpperCase()};
      if(norm.type!=="IMPACTAGE") norm.prix=0;
      const fixed=[...n.slice(0,lastIdx),norm];
      set(fixed);
      sv({[k]:fixed,...extra});
    }else{
      sv({[k]:n,...extra});
    }
    setShowAdd(null);setForm({});
  };
  const edit=(type:string,id:any,updated:any)=>{
    if(isHistorical) return;
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"],suivis:[suivis,setSuivis,"suivis"]};
    const[arr,set,k]=m[type];
    const sortByDate=(a:any)=>[...a].sort((x:any,y:any)=>{const p=(d:string)=>{if(!d)return-1;const[j,mm]=d.split("/").map(Number);return(mm||0)*100+(j||0);};return p(y.dt)-p(x.dt);});
    const n=arr.map((d:any)=>{
      if(d.id!==id) return d;
      const merged:any={...d,...updated,im:updated.im?.toUpperCase().trim()||d.im};
      if(type==="suivis"){
        if(merged.date) merged.date=normalizeDate(merged.date);
        if(merged.type) merged.type=String(merged.type).toUpperCase();
        merged.prix=merged.type==="IMPACTAGE"?(parseFloat(String(merged.prix||0))||0):0;
      }
      return merged;
    });
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
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"],dpvs:[dpvs,setDpvs,"dpv"],rpvs:[rpvs,setRpvs,"rpv"],suivis:[suivis,setSuivis,"suivis"]};
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

  // Marqueur visuel "réservé" sur une voiture dispo (drapeau rsv). Purement cosmetique :
  // la voiture reste en dispo, aucun statut ni cascade metier n'est touche. Match par
  // reference (les items dispo legacy n'ont pas tous d'id).
  const toggleReserve=(item:any)=>{
    if(isHistorical||displayUser.role==='lecteur') return;
    const n=disp.map((d:any)=>d===item?{...d,rsv:!d.rsv}:d);
    setDisp(n);sv({di:n});
  };

  // Import initial des suivis depuis un fichier Excel. Les feuilles "Suivi" ET "Départ" sont
  // injectees dans l'onglet Suivis (un depart compte comme un suivi) — rien dans l'onglet Departs.
  // Le montant d'impactage est auto-detecte dans la colonne Obs (ex "200€"). Dedoublonnage sur
  // immat+date+chauffeur pour permettre un re-import sans creer de doublons. Admin uniquement.
  const importSuivisExcel=async(file:File)=>{
    if(displayUser.role!=='admin'){setToast({msg:"Import réservé aux administrateurs",type:"err"});return;}
    setImporting(true);
    try{
      const XLSX:any=await import('xlsx');
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf,{type:'array'});
      const rowsOf=(name:string)=>wb.Sheets[name]?XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:"",raw:false}):[];
      const all=[...rowsOf('Suivi'),...rowsOf('Départ')];
      const socOf=(e:string)=>{const s=(e||"").toLowerCase();return s.includes('green')?"GREEN":s.includes('urban')?"URBAN NEO":"";};
      const socFromFleet=(im:string)=>urban.find((v:any)=>v.im===im)?"URBAN NEO":green.find((v:any)=>v.im===im)?"GREEN":"";
      const amtOf=(o:string)=>{const m=(o||"").match(/(\d+(?:[.,]\d+)?)\s*€/);return m?(parseFloat(m[1].replace(',','.'))||0):0;};
      const keyOf=(im:string,date:string,ch:string)=>`${im}|${normalizeDate(date)}|${(ch||"").toUpperCase().trim()}`;
      const seen=new Set(suivis.map((s:any)=>keyOf(s.im,s.date,s.ch)));
      let added=0,skipped=0;const news:any[]=[];
      for(const r of all){
        const date=String((r as any)['Date']||"").trim();
        const im=String((r as any)['Plaque']||"").toUpperCase().trim();
        if(!im||!date){skipped++;continue;}
        const ch=String((r as any)['Chauffeur']||"").trim();
        const k=keyOf(im,date,ch);
        if(seen.has(k)){skipped++;continue;}
        seen.add(k);
        const obs=String((r as any)['Obs']||"").trim();
        const prix=amtOf(obs);
        news.push({id:uid(),im,soc:socOf(String((r as any)['Entité']||""))||socFromFleet(im),ch,mo:String((r as any)['Véhicule']||"").trim(),date:normalizeDate(date),type:prix>0?"IMPACTAGE":"SUIVI",prix,co:obs});
        added++;
      }
      if(news.length){const n=[...suivis,...news];setSuivis(n);await sv({suivis:n});}
      setToast({msg:`${added} suivi(s) importé(s)${skipped?`, ${skipped} ignoré(s)`:""}`,type:"ok"});
    }catch(e){setToast({msg:"Échec de l'import — vérifiez le fichier Excel",type:"err"});console.error("Import error:",e);}
    finally{setImporting(false);}
  };

  const TABS=[{k:"diffusion",l:"Diffusion"},{k:"vehicules",l:"Vehicules"},{k:"flotte",l:"Flotte"},{k:"departs",l:"Departs"},{k:"retours",l:"Retours"},{k:"dispo",l:"VH Dispo"},{k:"garage",l:"Garage"},{k:"historique",l:"Historique"},{k:"vacances",l:"Vacances"},{k:"suivis",l:"Suivis"}];
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
      <div className="tblx"><div className="tbli">
      <div className="diff-head" style={{display:"grid",gridTemplateColumns:cols,padding:"6px 12px",background:"#FAFAF8",borderBottom:"1px solid #EDEDEB",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
        {heads.map((h:string,i:number)=><span key={i}>{h}</span>)}
      </div>
      <div className="tblrows" style={{maxHeight:maxH,overflowY:"auto"}}>
        {data.length===0?<div style={{padding:14,textAlign:"center",color:"#DDD",fontSize:11}}>Aucun element</div>:
        data.map((d:any,i:number)=><div key={d.id??d.im??i} className="diff-row" style={{display:"grid",gridTemplateColumns:cols,padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>{renderRow(d,i)}</div>)}
      </div>
      </div></div>
    </div>
  );

  return(
    <div className="app-shell" style={{minHeight:"100vh",background:"#F3F3F1",color:"#333",fontFamily:"'Outfit',system-ui,sans-serif",fontSize:13}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {saving&&<div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"#E8633A",zIndex:9998,animation:"fi .2s ease both"}}/>}
      <InstallPrompt/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
        .tblx{overflow-x:auto;-webkit-overflow-scrolling:touch}
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.ani{animation:fi .2s ease both}
        .rw:hover{background:#F7F7F5!important}.tb:hover{background:#EAEAE8!important}input:focus,select:focus{outline:none;border-color:#E8633A!important}.dl:hover{background:#FEE!important;color:#C0392B!important}
        @media(max-width:768px){
          .hide-mobile{display:none!important}
          .grid-mobile{grid-template-columns:1fr!important}
          .header-pills{display:none!important}
          .nav-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap!important;padding:6px 10px!important}
          .nav-scroll::-webkit-scrollbar{display:none}
          .app-header{padding:calc(8px + env(safe-area-inset-top, 0px)) 12px 8px 12px!important}
          .app-main{padding:10px 10px!important}
          /* Tables denses : largeur lisible + défilement horizontal (en-tête et lignes alignés dans le même conteneur .tbli). */
          .tbli{min-width:600px}
          .diff-block .diff-head>span,.diff-block .diff-row>span,.diff-block .rw>span{min-width:0;overflow:hidden;text-overflow:ellipsis}
          /* Menu de la cloche : pleine largeur sous l'en-tête au lieu de déborder hors de l'écran */
          .bell-pop{position:fixed!important;left:8px!important;right:8px!important;top:calc(56px + env(safe-area-inset-top,0px))!important;width:auto!important;max-height:75vh!important}
          .tb{padding:7px 12px!important}
          .app-shell{padding-bottom:80px}
        }
        @media(min-width:1920px){
          body{zoom:1.25}
        }
        @media(min-width:2560px){
          body{zoom:1.5}
        }
      `}</style>

      <header className="app-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",paddingTop:"calc(10px + env(safe-area-inset-top, 0px))",background:"#fff",borderBottom:"1px solid #E5E5E3",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img className="logo-icon" src={logoUrl} alt="Opportix" style={{width:30,height:30,borderRadius:7,objectFit:"cover",display:"block"}}/>
          <div><div className="logo-text" style={{fontSize:13,fontWeight:800,letterSpacing:2,color:"#1A1A1A"}}>OPPORTIX</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span className="header-pills" style={{display:"flex",gap:6}}><Pill c="#1A1A1A" t={`${all.length} VH`}/><Pill c="#2FAA6B" t={`${nUA+nGA} actifs`}/><Pill c="#7B61FF" t={`${nCh} chauffeurs`}/></span>
          <div style={{position:"relative"}}>
            <button onClick={()=>setSuiviOpen(o=>!o)} title={`${overdueCount} vehicule${overdueCount>1?"s":""} en retard de suivi`} style={{position:"relative",padding:"5px 7px",borderRadius:6,border:"1px solid #E0E0DE",background:"#fff",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",color:overdueCount>0?"#C0392B":"#777"}}>
              <Bell size={16}/>
              {overdueCount>0&&<span style={{position:"absolute",top:-5,right:-5,minWidth:16,height:16,padding:"0 4px",borderRadius:8,background:"#C0392B",color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace"}}>{overdueCount}</span>}
            </button>
            {suiviOpen&&(<>
              <div onClick={()=>{setSuiviOpen(false);setMarkingSuivi(null);}} style={{position:"fixed",inset:0,zIndex:9990}}/>
              <div className="bell-pop" style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:380,maxHeight:480,overflowY:"auto",background:"#fff",border:"1px solid #E5E5E3",borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.12)",zIndex:9991}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #EDEDEB",background:"#FAFAF8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>Suivis en retard</div>
                    <div style={{fontSize:10,color:"#888",marginTop:2}}>Vehicules sans suivi depuis &gt; 30 jours</div>
                  </div>
                  <button onClick={()=>{setSuiviOpen(false);setMarkingSuivi(null);setSuiviSearch("");}} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>X</button>
                </div>
                {pushSupported&&<div style={{padding:"8px 14px",borderBottom:"1px solid #EDEDEB",background:"#fff",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  {pushOn
                    ?<><span style={{fontSize:10,fontWeight:700,color:"#1E8A52"}}>🔔 Notifications activées</span><button onClick={testPush} style={{padding:"3px 10px",borderRadius:5,border:"1px solid #E0E0DE",background:"#fff",color:"#555",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Tester</button></>
                    :<><span style={{fontSize:10,color:"#888",flex:1,minWidth:120}}>Être notifié des suivis en retard, même app fermée</span><button onClick={enablePush} disabled={pushBusy} style={{padding:"4px 12px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontSize:10,fontWeight:700,cursor:pushBusy?"default":"pointer",fontFamily:"inherit",opacity:pushBusy?.6:1}}>{pushBusy?"…":"🔔 Activer"}</button></>}
                </div>}
                <div style={{padding:"8px 14px",borderBottom:"1px solid #EDEDEB",background:"#fff"}}>
                  <input value={suiviSearch} onChange={e=>setSuiviSearch(e.target.value)} placeholder="Rechercher (immat, chauffeur, modele...)" style={{...iS,width:"100%",fontSize:11,padding:"5px 8px"}}/>
                </div>
                {(()=>{
                  const q=suiviSearch.trim().toLowerCase();
                  const filtered=q?overdueList.filter((v:any)=>(v.im||"").toLowerCase().includes(q)||(v.ch||"").toLowerCase().includes(q)||(v.mq||"").toLowerCase().includes(q)||(v.mo||"").toLowerCase().includes(q)||(v.le||"").toLowerCase().includes(q)):overdueList;
                  if(overdueList.length===0) return <div style={{padding:30,textAlign:"center",color:"#BBB",fontSize:11}}>Aucun vehicule en retard 🎉</div>;
                  if(filtered.length===0) return <div style={{padding:20,textAlign:"center",color:"#BBB",fontSize:11}}>Aucun resultat pour "{suiviSearch}"</div>;
                  return filtered.map((v:any)=>{
                  const ds=daysSince(v._last);
                  const isMarking=markingSuivi===v.im;
                  const lateDays=ds===Infinity?null:Math.max(0,ds-30);
                  return (
                    <div key={v.im} style={{borderBottom:"1px solid #F5F5F3"}}>
                      <div style={{padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <SocBadge s={v.soc}/>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,color:"#1A1A1A"}}>{v.im}</span>
                          </div>
                          <div style={{fontSize:10,color:"#666",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch||"—"} · {v.mo||"—"}</div>
                          <div style={{fontSize:10,fontWeight:700,color:"#C0392B",marginTop:2}}>
                            {ds===Infinity?"Jamais suivi":`${lateDays} jour${lateDays&&lateDays>1?"s":""} de retard`}
                          </div>
                        </div>
                        {!isHistorical&&displayUser.role!=='lecteur'&&!isMarking&&(
                          <button onClick={()=>{setMarkingSuivi(v.im);setSuiviDateDraft(todayISO);setSuiviTypeDraft("SUIVI");setSuiviCommentDraft("");setSuiviPrixDraft("");}} style={{padding:"4px 8px",borderRadius:5,border:"1px solid #2FAA6B",background:"#fff",color:"#2FAA6B",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Marquer suivi</button>
                        )}
                      </div>
                      {isMarking&&(
                        <div style={{padding:"8px 14px 12px",background:"#FAFAF8",display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{fontSize:9,fontWeight:700,color:"#888",width:60}}>TYPE</span>
                            <button onClick={()=>setSuiviTypeDraft("SUIVI")} style={{padding:"3px 10px",borderRadius:4,border:`1px solid ${suiviTypeDraft==="SUIVI"?"#2FAA6B":"#E0E0DE"}`,background:suiviTypeDraft==="SUIVI"?"#2FAA6B":"#fff",color:suiviTypeDraft==="SUIVI"?"#fff":"#666",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Suivi</button>
                            <button onClick={()=>setSuiviTypeDraft("IMPACTAGE")} style={{padding:"3px 10px",borderRadius:4,border:`1px solid ${suiviTypeDraft==="IMPACTAGE"?"#C0392B":"#E0E0DE"}`,background:suiviTypeDraft==="IMPACTAGE"?"#C0392B":"#fff",color:suiviTypeDraft==="IMPACTAGE"?"#fff":"#666",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Impactage</button>
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{fontSize:9,fontWeight:700,color:"#888",width:60}}>DATE</span>
                            <input type="date" value={suiviDateDraft} onChange={e=>setSuiviDateDraft(e.target.value)} style={{...iS,fontSize:10,padding:"3px 5px",flex:1}}/>
                          </div>
                          {suiviTypeDraft==="IMPACTAGE"&&(
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{fontSize:9,fontWeight:700,color:"#888",width:60}}>PRIX (€)</span>
                              <input type="number" min={0} step="0.01" value={suiviPrixDraft} onChange={e=>setSuiviPrixDraft(e.target.value)} placeholder="0" style={{...iS,fontSize:10,padding:"3px 5px",flex:1}}/>
                            </div>
                          )}
                          <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                            <span style={{fontSize:9,fontWeight:700,color:"#888",width:60,marginTop:4}}>COMMENT</span>
                            <textarea value={suiviCommentDraft} onChange={e=>setSuiviCommentDraft(e.target.value)} placeholder="Commentaire optionnel" rows={2} style={{...iS,fontSize:10,padding:"3px 5px",flex:1,fontFamily:"inherit",resize:"vertical"}}/>
                          </div>
                          <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:2}}>
                            <button onClick={()=>{setMarkingSuivi(null);setSuiviDateDraft("");setSuiviCommentDraft("");setSuiviPrixDraft("");setSuiviTypeDraft("SUIVI");}} style={{padding:"4px 10px",borderRadius:5,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                            <button onClick={()=>{if(!suiviDateDraft)return;const px=parseFloat(suiviPrixDraft)||0;markSuivi(v.im,suiviDateDraft,suiviTypeDraft,suiviCommentDraft.trim(),px);}} style={{padding:"4px 12px",borderRadius:5,border:"none",background:"#1E8A52",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Enregistrer</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
                })()}
              </div>
            </>)}
          </div>
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

      {!online&&<div style={{padding:"6px 20px",background:"#FDECEC",borderBottom:"1px solid #F5C6C6",fontSize:11,fontWeight:600,color:"#C0392B",textAlign:"center"}}>Hors-ligne — affichage des dernières données en cache, modifications indisponibles jusqu'au retour du réseau</div>}

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
                {l:"CHAUFFEURS ACTIFS",v:nCh,c:"#7B61FF",
                  dispoT:all.filter(v=>dDisp.find((d:any)=>d.im===v.im)).length,
                  garT:all.filter(v=>dGarage.find((g:any)=>g.im===v.im)).length},
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
                  ):k.dispoT!==undefined?(
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div className="stat-value" style={{fontSize:32,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{k.v}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:2,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.1}}>
                        <div style={{fontSize:15,fontWeight:800,color:"#3A9BD5"}}>{k.dispoT} DISPO</div>
                        <div style={{fontSize:13,fontWeight:800,color:"#C0392B"}}>{k.garT} GARAGE</div>
                      </div>
                    </div>
                  ):(
                    <div className="stat-value" style={{fontSize:32,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{k.v}</div>
                  )}
                </div>
              ))}
              {(()=>{
                const canEditVp=!isHistorical && displayUser.role!=='lecteur';
                const saveVp=()=>{
                  const n=parseInt(vpDraft,10);
                  const final=Number.isFinite(n)&&n>=0?n:0;
                  setVp(final);setEditingVp(false);
                  sv({vp:final});
                };
                return (
                  <div className="stat-card" style={{background:"#fff",borderRadius:8,padding:"10px 14px",borderLeft:"3px solid #E8633A",border:"1px solid #E5E5E3"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div className="stat-label" style={{fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8}}>VP (VEHICULES PERSO)</div>
                      {canEditVp&&!editingVp&&<button onClick={()=>{setVpDraft(String(dVp));setEditingVp(true);}} style={{padding:"1px 7px",borderRadius:4,border:"1px solid #E0E0DE",background:"#fff",color:"#999",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Modifier</button>}
                    </div>
                    {editingVp?(
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <input type="number" min={0} value={vpDraft} onChange={e=>setVpDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveVp();if(e.key==='Escape')setEditingVp(false);}} autoFocus style={{width:80,fontSize:24,fontWeight:800,color:"#E8633A",fontFamily:"'IBM Plex Mono',monospace",padding:"2px 6px",border:"1px solid #E8633A",borderRadius:5,outline:"none"}}/>
                        <button onClick={saveVp} style={{padding:"4px 10px",borderRadius:5,border:"none",background:"#1E8A52",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>OK</button>
                        <button onClick={()=>setEditingVp(false)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>X</button>
                      </div>
                    ):(
                      <div className="stat-value" style={{fontSize:32,fontWeight:800,color:"#E8633A",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{dVp}</div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="grid-mobile" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <DiffBlock title="VOITURES DISPO" titleBg="#D6E9F8" color="#3A9BD5" count={`${dDisp.filter((d:any)=>d.soc==="URBAN NEO").length} Urb · ${dDisp.filter((d:any)=>d.soc==="GREEN").length} Grn`}
                heads={["SOCIETE","IMMAT","MODELE","NOTE","RÉSERVÉ"]} cols="55px 80px 1fr 1fr 74px" data={dDisp} maxH={160}
                renderRow={(d:any)=>{const reserved=!!d.rsv;const canToggle=!isHistorical&&displayUser.role!=='lecteur';return <><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,color:reserved?"#C0392B":undefined}}>{reserved?"● ":""}{d.im}</span><span style={{color:"#444"}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.no||"—"}</span><span>{reserved?(canToggle?<button onClick={()=>toggleReserve(d)} title="Cliquer pour libérer la réservation" style={{padding:"1px 6px",borderRadius:4,border:"none",background:"#C0392B",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>RÉSERVÉ</button>:<span style={{padding:"1px 6px",borderRadius:4,background:"#C0392B",color:"#fff",fontSize:9,fontWeight:700}}>RÉSERVÉ</span>):(canToggle?<button onClick={()=>toggleReserve(d)} title="Marquer comme réservée à un chauffeur" style={{padding:"1px 6px",borderRadius:4,border:"1px solid #E0C68A",background:"#fff",color:"#B7791F",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Réserver</button>:<span style={{color:"#CCC",fontSize:9}}>—</span>)}</span></>;}}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["mo","Modele","KONA..."],["no","Note","..."]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("disp",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("disp",id)}
                onEdit={(id:any,updated:any)=>edit("disp",id,updated)}
                user={displayUser}
              />
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
                heads={["CHAUFFEUR","SOCIETE","MODELE","DEBUT","FIN"]} cols="1fr 65px 75px 60px 60px" data={dVacs} maxH={160}
                renderRow={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><SocBadge s={v.soc}/><span style={{color:"#666",fontSize:10}}>{v.mo||"—"}</span><span style={{color:"#777",fontSize:10}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:10}}>{v.fin||"—"}</span></>}
                formFields={[["ch","Chauffeur *","Nom"],["soc","Societe",null,["URBAN NEO","GREEN"]],["mo","Modele","KONA..."],["deb","Debut","JJ/MM"],["fin","Fin","JJ/MM"]]}
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
              <MiniTbl title="VEHICULES URBAN NEO" titleBg="#D6E9F8" count={`${dUrban.length} voitures`} countBad={nUI>0?`${nUI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","LEASER","STATUT","CHAUFFEUR"]} cols="85px 55px 65px 55px 45px 1fr" data={sortVeh(dUrban)} maxH={500}
                renderRow={(v:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1A1A1A",fontSize:10}}>{v.im}</span><span style={{color:"#666"}}>{v.mq}</span><span style={{color:"#666"}}>{v.mo}</span><span style={{color:"#999",fontSize:10}}>{v.le||"—"}</span><StBadge s={v.st}/><span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span></>}
              />
              <MiniTbl title="VEHICULES GREEN" titleBg="#D4F0E0" count={`${dGreen.length} voitures`} countBad={nGI>0?`${nGI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","LEASER","STATUT","CHAUFFEUR"]} cols="85px 55px 65px 55px 45px 1fr" data={sortVeh(dGreen)} maxH={500}
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
          fields={[["Chauffeur *","ch","Nom"],["Societe","soc",null,["URBAN NEO","GREEN"]],["Modele","mo","KONA..."],["Debut","deb","JJ/MM"],["Fin","fin","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del} editItem={edit} user={displayUser}
          cols="1fr 80px 90px 80px 80px 1fr 60px" heads={["CHAUFFEUR","SOCIETE","MODELE","DEBUT","FIN","NOTE",""]}
          rr={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><span><SocBadge s={v.soc}/></span><span style={{color:"#666",fontSize:11}}>{v.mo||"—"}</span><span style={{color:"#777",fontSize:11}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:11}}>{v.fin||"—"}</span><span style={{color:"#999",fontSize:11}}>{v.no||"—"}</span></>}
        />}
        {tab==="suivis"&&(()=>{
          const FR_MONTHS=["JAN","FÉV","MAR","AVR","MAI","JUN","JUL","AOÛ","SEP","OCT","NOV","DÉC"];
          const isoToFr=(iso?:string)=>{const m=(iso||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:(iso||"—");};
          const monthKeyOf=(s?:string)=>{const m=normalizeDate(s).match(/^(\d{4})-(\d{2})/);return m?`${m[1]}-${m[2]}`:"";};
          const addMonthsIso=(iso:string,n:number)=>{const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return"";const d=new Date(Number(m[1]),Number(m[2])-1+n,Number(m[3]));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
          const now=new Date();
          // Fenetre glissante : 3 mois passes + mois courant + 2 a venir (6 colonnes).
          const months=[-3,-2,-1,0,1,2].map(off=>{const d=new Date(now.getFullYear(),now.getMonth()+off,1);return{key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,label:FR_MONTHS[d.getMonth()],yr:String(d.getFullYear()).slice(2),cur:off===0};});
          const todayLocal=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
          const fleet=suiviTab==="urban"?dUrban:dGreen;
          const soc=suiviTab==="urban"?"URBAN NEO":"GREEN";
          const q=search.trim().toLowerCase();
          const checksAll=dSuivis.filter((s:any)=>s.soc===soc);
          const totalImpactage=checksAll.filter((s:any)=>s.type==="IMPACTAGE").reduce((a:number,s:any)=>a+(Number(s.prix)||0),0);
          const nbImpactage=checksAll.filter((s:any)=>s.type==="IMPACTAGE").length;
          const canEditChk=!isHistorical&&displayUser.role!=='lecteur';
          const GRID="95px 110px 1fr 105px 70px 90px 90px 90px 34px";
          const rows=fleet
            .filter((v:any)=>!q||(v.im||"").toLowerCase().includes(q)||(v.ch||"").toLowerCase().includes(q))
            .map((v:any)=>{
              const ch=dSuivis.filter((s:any)=>s.im===v.im).map((s:any)=>({...s,_iso:normalizeDate(s.date)})).sort((a:any,b:any)=>(b._iso||"").localeCompare(a._iso||""));
              const last=ch[0];
              const lastIso=last?last._iso:"";
              const nextIso=last?addMonthsIso(lastIso,1):"";
              return {v,ch,last,lastIso,nextIso,overdue:!!nextIso&&nextIso<todayLocal};
            })
            .sort((a:any,b:any)=>(a.lastIso||"").localeCompare(b.lastIso||""));
          const lblS:React.CSSProperties={fontSize:8,fontWeight:700,color:"#999",letterSpacing:.5,marginBottom:2};
          return (
            <div className="ani" style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:6}}>
                {[{k:"urban",l:"Urban Neo",n:dUrban.length,c:"#3A9BD5"},{k:"green",l:"Green",n:dGreen.length,c:"#2FAA6B"}].map((t:any)=>(
                  <button key={t.k} className="tb" onClick={()=>{setSuiviTab(t.k);setSuiviOpenIm(null);setSearch("");}} style={{padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:suiviTab===t.k?"#fff":"transparent",color:suiviTab===t.k?"#1A1A1A":"#999",boxShadow:suiviTab===t.k?"0 1px 2px rgba(0,0,0,0.05)":"none"}}>
                    {t.l} <span style={{padding:"1px 6px",borderRadius:6,fontSize:9,fontWeight:700,background:suiviTab===t.k?t.c:"#ddd",color:suiviTab===t.k?"#fff":"#999",marginLeft:3}}>{t.n}</span>
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher (chauffeur, immat)..." style={{...iS,width:240}}/>
                <Pill c="#C0392B" t={`${nbImpactage} impacté${nbImpactage>1?"s":""}`}/>
                <Pill c="#E8633A" t={`${totalImpactage.toFixed(2)} € total impacté`}/>
                {!isHistorical&&displayUser.role==='admin'&&<label title="Importer les suivis depuis un fichier Excel (feuilles Suivi + Départ)" style={{marginLeft:"auto",padding:"6px 12px",borderRadius:6,border:"1px solid #3A9BD5",background:"#fff",color:"#3A9BD5",fontSize:11,fontWeight:600,cursor:importing?"default":"pointer",fontFamily:"inherit",opacity:importing?.6:1}}>{importing?"Import en cours…":"Importer Excel"}<input type="file" accept=".xlsx,.xls" disabled={importing} style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)importSuivisExcel(f);e.currentTarget.value="";}}/></label>}
              </div>
              <div className="diff-block" style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
                <div className="diff-head" style={{display:"grid",gridTemplateColumns:GRID,padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
                  <span>IMMAT</span><span>MODÈLE</span><span>CHAUFFEUR</span><span>TÉL</span><span>KM</span><span>DERNIÈRE</span><span>PROCHAINE</span><span>DERNIER</span><span></span>
                </div>
                <div style={{maxHeight:520,overflowY:"auto"}}>
                  {rows.length===0&&<div style={{padding:24,textAlign:"center",color:"#CCC",fontSize:11}}>Aucun vehicule</div>}
                  {rows.map(({v,ch,last,lastIso,nextIso,overdue}:any)=>{
                    const open=suiviOpenIm===v.im;
                    return (
                    <div key={v.im} style={{borderBottom:"1px solid #F5F5F3"}}>
                      <div className="rw" onClick={()=>{const o=suiviOpenIm===v.im;setSuiviOpenIm(o?null:v.im);setChkForm({type:"SUIVI",date:todayLocal,ch:v.ch||""});setChkDel(null);setChkEditCh(null);}} style={{display:"grid",gridTemplateColumns:GRID,padding:"7px 12px",alignItems:"center",fontSize:12,cursor:"pointer"}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{v.im}</span>
                        <span style={{color:"#666",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{[v.mq,v.mo].filter(Boolean).join(" ")||"—"}</span>
                        <span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch||"—"}</span>
                        <span style={{color:"#666",fontSize:10,fontFamily:"'IBM Plex Mono',monospace"}}>{last?.tel||"—"}</span>
                        <span style={{color:"#666",fontSize:10}}>{last?.km||"—"}</span>
                        <span style={{color:"#777",fontSize:10}}>{lastIso?isoToFr(lastIso):"—"}</span>
                        <span style={{fontSize:10,fontWeight:700,color:nextIso?(overdue?"#C0392B":"#1E8A52"):"#CCC"}}>{nextIso?isoToFr(nextIso):"—"}</span>
                        <span>{last?<span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:4,background:last.type==="IMPACTAGE"?"#FDECEC":"#E8F8F0",color:last.type==="IMPACTAGE"?"#C0392B":"#1E8A52"}}>{last.type==="IMPACTAGE"?`I ${Number(last.prix||0).toFixed(0)}€`:"S"}</span>:<span style={{fontSize:9,color:"#CCC"}}>—</span>}</span>
                        <span style={{textAlign:"right",color:"#BBB",fontSize:11}}>{open?"▾":"▸"}</span>
                      </div>
                      {open&&(
                        <div style={{padding:"10px 12px",background:"#FAFAF8",borderTop:"1px solid #EFEFED"}}>
                          <div className="grid-mobile" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:10}}>
                            {months.map((m:any)=>{
                              const cks=ch.filter((s:any)=>monthKeyOf(s.date)===m.key);
                              return (
                                <div key={m.key} style={{border:`1px solid ${m.cur?"#E8633A":"#E5E5E3"}`,borderRadius:6,background:m.cur?"#FFF6F0":"#fff",minHeight:62,padding:"4px 6px"}}>
                                  <div style={{fontSize:8,fontWeight:800,letterSpacing:.5,color:m.cur?"#E8633A":"#AAA"}}>{m.label} {m.yr}</div>
                                  {cks.length===0?<div style={{fontSize:11,color:"#DDD",marginTop:6,textAlign:"center"}}>·</div>:cks.map((s:any)=>(
                                    <div key={s.id} style={{marginTop:4,paddingTop:3,borderTop:"1px dashed #EEE"}} title={s.co||""}>
                                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:3}}>
                                        <span style={{fontSize:9,fontWeight:700,color:s.type==="IMPACTAGE"?"#C0392B":"#1E8A52"}}>{s.type==="IMPACTAGE"?`I ${Number(s.prix||0).toFixed(0)}€`:"S"}</span>
                                        {canEditChk&&(chkDel===s.id
                                          ?<span style={{display:"inline-flex",gap:2}}><button onClick={(e)=>{e.stopPropagation();del("suivis",s.id);setChkDel(null);}} style={{padding:"0 4px",borderRadius:3,border:"none",background:"#C0392B",color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>oui</button><button onClick={(e)=>{e.stopPropagation();setChkDel(null);}} style={{padding:"0 4px",borderRadius:3,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>×</button></span>
                                          :<button title="Supprimer ce check" onClick={(e)=>{e.stopPropagation();setChkDel(s.id);setChkEditCh(null);}} style={{padding:"0 4px",borderRadius:3,border:"1px solid #E8E8E5",background:"#fff",color:"#CCC",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>×</button>)}
                                      </div>
                                      {chkEditCh===s.id
                                        ?<div style={{display:"flex",gap:2,marginTop:2}} onClick={(e)=>e.stopPropagation()}><input autoFocus value={chkChDraft} onChange={e=>setChkChDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){edit("suivis",s.id,{ch:chkChDraft.trim()});setChkEditCh(null);}if(e.key==='Escape')setChkEditCh(null);}} placeholder="chauffeur" style={{...iS,fontSize:9,padding:"2px 4px",width:"100%"}}/><button onClick={(e)=>{e.stopPropagation();edit("suivis",s.id,{ch:chkChDraft.trim()});setChkEditCh(null);}} style={{padding:"0 5px",borderRadius:3,border:"none",background:"#1E8A52",color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>ok</button></div>
                                        :<div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}><span style={{fontSize:9,color:s.ch?"#555":"#CCC",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.ch||"— aucun chauffeur"}</span>{canEditChk&&<button title="Modifier / retirer le chauffeur" onClick={(e)=>{e.stopPropagation();setChkEditCh(s.id);setChkChDraft(s.ch||"");setChkDel(null);}} style={{padding:"0 3px",borderRadius:3,border:"none",background:"transparent",color:"#3A9BD5",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>}</div>}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                          {/* Détail complet et éditable de chaque check, tous mois confondus */}
                          {(()=>{
                          const DCOLS="78px 92px 60px 64px 90px 1fr 1.4fr 92px";
                          return (
                          <div style={{marginBottom:10}} onClick={(e)=>e.stopPropagation()}>
                            <div style={{fontSize:9,fontWeight:700,color:"#999",letterSpacing:.5,marginBottom:4}}>DÉTAIL DES CHECKS ({ch.length})</div>
                            {ch.length===0?<div style={{fontSize:11,color:"#CCC",padding:"4px 0"}}>Aucun check enregistré pour ce véhicule.</div>:(
                              <div style={{border:"1px solid #EDEDEB",borderRadius:6,overflow:"hidden",background:"#fff"}}>
                                <div className="hide-mobile" style={{display:"grid",gridTemplateColumns:DCOLS,padding:"5px 8px",background:"#F5F5F3",fontSize:8,fontWeight:700,color:"#AAA",letterSpacing:.5,textTransform:"uppercase"}}>
                                  <span>DATE</span><span>TYPE</span><span>PRIX</span><span>KM</span><span>TÉL</span><span>CHAUFFEUR</span><span>COMMENTAIRE</span><span></span>
                                </div>
                                {ch.map((s:any)=>(
                                  chkEditId===s.id?(
                                  <div key={s.id} className="grid-mobile" style={{display:"grid",gridTemplateColumns:DCOLS,gap:3,padding:"5px 8px",borderTop:"1px solid #F5F5F3",fontSize:10,alignItems:"center",background:"#FAFAF8"}}>
                                    <input type="date" value={chkEditF.date||""} onChange={e=>setChkEditF({...chkEditF,date:e.target.value})} style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <select value={chkEditF.type||"SUIVI"} onChange={e=>setChkEditF({...chkEditF,type:e.target.value})} style={{...iS,fontSize:9,padding:"2px 3px"}}><option value="SUIVI">SUIVI</option><option value="IMPACTAGE">IMPACTAGE</option></select>
                                    <input value={chkEditF.prix??""} onChange={e=>setChkEditF({...chkEditF,prix:e.target.value})} placeholder="0" disabled={chkEditF.type!=="IMPACTAGE"} style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <input value={chkEditF.km??""} onChange={e=>setChkEditF({...chkEditF,km:e.target.value})} placeholder="km" style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <input value={chkEditF.tel??""} onChange={e=>setChkEditF({...chkEditF,tel:e.target.value})} placeholder="tél" style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <input value={chkEditF.ch??""} onChange={e=>setChkEditF({...chkEditF,ch:e.target.value})} placeholder="chauffeur" style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <input value={chkEditF.co??""} onChange={e=>setChkEditF({...chkEditF,co:e.target.value})} placeholder="commentaire" style={{...iS,fontSize:9,padding:"2px 3px"}}/>
                                    <span style={{display:"inline-flex",gap:3,justifyContent:"flex-end"}}>
                                      <button onClick={()=>{edit("suivis",s.id,{date:chkEditF.date,type:chkEditF.type,prix:chkEditF.prix||0,km:(chkEditF.km||"").trim(),tel:(chkEditF.tel||"").trim(),ch:(chkEditF.ch||"").trim(),co:chkEditF.co||""});setChkEditId(null);}} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#1E8A52",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>OK</button>
                                      <button onClick={()=>setChkEditId(null)} style={{padding:"2px 6px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>×</button>
                                    </span>
                                  </div>
                                  ):(
                                  <div key={s.id} className="grid-mobile" style={{display:"grid",gridTemplateColumns:DCOLS,padding:"5px 8px",borderTop:"1px solid #F5F5F3",fontSize:10,alignItems:"center"}}>
                                    <span style={{color:"#777",fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{isoToFr(s._iso)}</span>
                                    <span><span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:4,background:s.type==="IMPACTAGE"?"#FDECEC":"#E8F8F0",color:s.type==="IMPACTAGE"?"#C0392B":"#1E8A52"}}>{s.type==="IMPACTAGE"?"IMPACTAGE":"SUIVI"}</span></span>
                                    <span style={{color:s.type==="IMPACTAGE"?"#C0392B":"#BBB",fontWeight:s.type==="IMPACTAGE"?700:400}}>{s.type==="IMPACTAGE"?`${Number(s.prix||0).toFixed(2)}€`:"—"}</span>
                                    <span style={{color:"#666"}}>{s.km||"—"}</span>
                                    <span style={{color:"#666",fontFamily:"'IBM Plex Mono',monospace",fontSize:9}}>{s.tel||"—"}</span>
                                    <span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.ch||"—"}</span>
                                    <span style={{color:"#888",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={s.co||""}>{s.co||"—"}</span>
                                    <span style={{display:"inline-flex",gap:3,justifyContent:"flex-end"}}>
                                      {canEditChk&&(chkDel===s.id
                                        ?<><button onClick={()=>{del("suivis",s.id);setChkDel(null);}} style={{padding:"2px 6px",borderRadius:4,border:"none",background:"#C0392B",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Oui</button><button onClick={()=>setChkDel(null)} style={{padding:"2px 6px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>×</button></>
                                        :<><button title="Éditer ce check" onClick={()=>{setChkEditId(s.id);setChkEditF({date:s._iso,type:s.type||"SUIVI",prix:s.prix||"",km:s.km||"",tel:s.tel||"",ch:s.ch||"",co:s.co||""});setChkDel(null);}} style={{padding:"2px 6px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#3A9BD5",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Éditer</button><button title="Supprimer" onClick={()=>{setChkDel(s.id);setChkEditId(null);}} style={{padding:"2px 6px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#BBB",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>×</button></>)}
                                    </span>
                                  </div>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                          );})()}
                          {canEditChk?(
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}} onClick={(e)=>e.stopPropagation()}>
                              <div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>DATE</span><input type="date" value={chkForm.date||""} onChange={e=>setChkForm({...chkForm,date:e.target.value})} style={{...iS,fontSize:10,padding:"4px 6px"}}/></div>
                              <div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>CHAUFFEUR</span><input value={chkForm.ch??""} onChange={e=>setChkForm({...chkForm,ch:e.target.value})} placeholder="Nom" style={{...iS,fontSize:10,padding:"4px 6px",width:150}}/></div>
                              <div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>TYPE</span><select value={chkForm.type||"SUIVI"} onChange={e=>setChkForm({...chkForm,type:e.target.value})} style={{...iS,fontSize:10,padding:"4px 6px"}}><option value="SUIVI">Suivi</option><option value="IMPACTAGE">Impactage</option></select></div>
                              <div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>KM</span><input value={chkForm.km||""} onChange={e=>setChkForm({...chkForm,km:e.target.value})} placeholder="84000" style={{...iS,fontSize:10,padding:"4px 6px",width:80}}/></div>
                              <div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>TÉL</span><input value={chkForm.tel||""} onChange={e=>setChkForm({...chkForm,tel:e.target.value})} placeholder="06..." style={{...iS,fontSize:10,padding:"4px 6px",width:100}}/></div>
                              {chkForm.type==="IMPACTAGE"&&<div style={{display:"flex",flexDirection:"column"}}><span style={lblS}>PRIX (€)</span><input type="number" min={0} value={chkForm.prix||""} onChange={e=>setChkForm({...chkForm,prix:e.target.value})} placeholder="0" style={{...iS,fontSize:10,padding:"4px 6px",width:80}}/></div>}
                              <div style={{display:"flex",flexDirection:"column",flex:"1 1 120px"}}><span style={lblS}>COMMENTAIRE</span><input value={chkForm.co||""} onChange={e=>setChkForm({...chkForm,co:e.target.value})} placeholder="..." style={{...iS,fontSize:10,padding:"4px 6px",width:"100%"}}/></div>
                              <button onClick={()=>{if(!chkForm.date){setToast({msg:"Date requise",type:"err"});return;}add("suivis",{im:v.im,date:chkForm.date,ch:(chkForm.ch||"").trim(),type:chkForm.type||"SUIVI",prix:chkForm.prix||0,co:chkForm.co||"",km:(chkForm.km||"").trim(),tel:(chkForm.tel||"").trim()});setChkForm({type:"SUIVI",date:todayLocal,ch:v.ch||""});}} style={{padding:"6px 14px",borderRadius:6,border:"none",background:"#1E8A52",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",height:30}}>+ Check</button>
                            </div>
                          ):<div style={{fontSize:10,color:"#BBB"}}>Lecture seule</div>}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
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