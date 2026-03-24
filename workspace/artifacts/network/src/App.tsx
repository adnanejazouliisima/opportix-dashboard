import { useState, useEffect, useMemo, useRef } from "react";

/* ═══ AUTH ═══ */
const USERS = [
  {login:"admin",    pwd:"opportix2025", nom:"Administrateur", role:"Admin",       pole:"activite"},
  {login:"swella",   pwd:"swella2025",   nom:"Swella",         role:"Commercial",  pole:"commercial"},
  {login:"shirine",  pwd:"shirine2025",  nom:"Shirine",        role:"Commercial",  pole:"commercial"},
  {login:"foued",    pwd:"foued2025",    nom:"Foued",          role:"Parc",        pole:"parc"},
  {login:"amel",     pwd:"amel2025",     nom:"Amel",           role:"Parc",        pole:"parc"},
  {login:"yannis",   pwd:"yannis2025",   nom:"Yannis",         role:"Activite",    pole:"activite"},
  {login:"mohamed",  pwd:"moh2025",      nom:"Mohamed",        role:"Activite",    pole:"activite"},
];

function LoginPage({onLogin}:{onLogin:(u:typeof USERS[0])=>void}){
  const [login,setLogin]=useState("");
  const [pwd,setPwd]=useState("");
  const [err,setErr]=useState("");
  const [show,setShow]=useState(false);
  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    const u=USERS.find(u=>u.login===login.trim().toLowerCase()&&u.pwd===pwd);
    if(u){setErr("");onLogin(u);}
    else{setErr("Identifiant ou mot de passe incorrect.");}
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
const I_U=[
  {im:"HE-826-YX",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"IMMO",ch:"Sidy Diagne"},
  {im:"HE-246-YW",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Florin Constantinescu"},
  {im:"HF-314-JN",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Nguyen Thantni"},
  {im:"HD-413-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Sadeed Hussain"},
  {im:"HE-372-TA",mq:"KIA",mo:"EV3",le:"ELPIS",st:"ACTIF",ch:"Abdelkader El Arrami"},
  {im:"HC-446-BB",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Youssouf El Matiar"},
  {im:"HF-507-ZL",mq:"KIA",mo:"EV3",le:"ELPIS",st:"ACTIF",ch:"Amine Nejjari"},
  {im:"HF-166-ZL",mq:"KIA",mo:"EV3",le:"ELPIS",st:"ACTIF",ch:"Bilel Benghezala"},
  {im:"GS-285-QW",mq:"TOYOTA",mo:"BZ4X ORIGIN",le:"ELPIS",st:"ACTIF",ch:"Bachir Maaref"},
  {im:"HD-722-ZQ",mq:"KIA",mo:"EV6",le:"ELPIS",st:"ACTIF",ch:"Jattari Abdelrahman"},
  {im:"HF-190-ZK",mq:"KIA",mo:"EV3",le:"ELPIS",st:"IMMO",ch:"Garage Adama Carrosserie"},
  {im:"HD-961-VC",mq:"KIA",mo:"EV6",le:"ELPIS",st:"ACTIF",ch:"Abdoulay Diaby"},
  {im:"HD-482-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Zakaria Leghifir"},
  {im:"HD-230-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Hasnad Mohamed"},
  {im:"GX-967-NE",mq:"TOYOTA",mo:"CAMRY",le:"ELPIS",st:"ACTIF",ch:"Abdou Ndao"},
  {im:"HD-922-BP",mq:"TOYOTA",mo:"BZ4X ORIGIN",le:"ELPIS",st:"ACTIF",ch:"Mourad Amezian"},
  {im:"HC-345-JZ",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Takfarinas Bounou"},
  {im:"GX-731-TZ",mq:"TESLA",mo:"MODEL Y",le:"ELPIS",st:"ACTIF",ch:"Mani Ryan"},
  {im:"HC-546-BB",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Fares El Haddad"},
  {im:"HC-261-JZ",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Ali Neji"},
  {im:"HE-191-BV",mq:"TOYOTA",mo:"BZ4X ORIGIN",le:"ELPIS",st:"ACTIF",ch:"Nadia Ichmaouin"},
  {im:"GX-118-JS",mq:"TOYOTA",mo:"CAMRY",le:"ELPIS",st:"ACTIF",ch:"Abdelhak Ben Hamed"},
  {im:"GN-113-NJ",mq:"TESLA",mo:"MODEL Y",le:"ELPIS",st:"ACTIF",ch:"Yassine Imzilen"},
  {im:"GP-867-YC",mq:"SUZUKI",mo:"SWACE PACK",le:"ELPIS",st:"ACTIF",ch:"Leopold Tabbougie"},
  {im:"HD-494-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Euloge Claudine"},
  {im:"HD-373-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Soufiane El Jay"},
  {im:"GX-842-EY",mq:"TOYOTA",mo:"CAMRY",le:"ELPIS",st:"ACTIF",ch:"Myriam Lazreg"},
  {im:"HD-408-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Yao Ekouame Elizee"},
  {im:"HG-773-AP",mq:"KIA",mo:"EV3",le:"GLOBAL RENT",st:"ACTIF",ch:"Fayz Coulibaly"},
  {im:"HG-786-AH",mq:"KIA",mo:"EV3",le:"GLOBAL RENT",st:"ACTIF",ch:"Lies Mebarki"},
  {im:"HF-761-MG",mq:"KIA",mo:"EV3",le:"GLOBAL RENT",st:"ACTIF",ch:"Kamel Zibouche"},
  {im:"HG-835-AJ",mq:"KIA",mo:"EV3",le:"GLOBAL RENT",st:"ACTIF",ch:"Elghazi Chawani"},
  {im:"HF-543-MJ",mq:"KIA",mo:"EV3",le:"GLOBAL RENT",st:"ACTIF",ch:"Sega Diallo"},
  {im:"HD-613-MT",mq:"TESLA",mo:"MODEL 3",le:"CLICAR",st:"ACTIF",ch:"Oumar Bouchia"},
  {im:"HF-949-QD",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Mohamed Benderdour"},
  {im:"HF-319-QF",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Jackson Mampana"},
  {im:"HF-049-QF",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Zidane Lamaourek"},
  {im:"HF-201-QE",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Ridar Khaalp"},
  {im:"HF-622-QE",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Massila Coulibally"},
  {im:"HF-465-QF",mq:"BYD",mo:"SEAL",le:"CLICAR",st:"ACTIF",ch:"Soufiane Essaber"},
  {im:"GS-426-QY",mq:"TOYOTA",mo:"BZ4X ORIGIN",le:"ELPIS",st:"ACTIF",ch:"Gouin Jeanluc"},
  {im:"HH-068-JH",mq:"HYUNDAI",mo:"STARIA",le:"ELPIS",st:"ACTIF",ch:"Thiery Barbet"},
  {im:"GZ-917-QJ",mq:"TOYOTA",mo:"BZ4X ORIGIN",le:"ELPIS",st:"ACTIF",ch:"Nacim Bekir"},
  {im:"HF-216-BP",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"IMMO",ch:"Yono Dibert Bekoy"},
];
const I_G=[
  {im:"HC-397-GT",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Amokrane Souissi"},
  {im:"HC-786-BA",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"IMMO",ch:"Bureau"},
  {im:"HF-491-AD",mq:"TOYOTA",mo:"BZ4X",le:"ELPIS",st:"ACTIF",ch:"Benjebara Boumediene"},
  {im:"HE-234-YW",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Micakel Habran"},
  {im:"HF-848-JQ",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Bourger Olivier"},
  {im:"HC-334-SX",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Dylan Marigo"},
  {im:"HE-214-YW",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"William Deduytesche"},
  {im:"GW-796-SP",mq:"TESLA",mo:"MODEL Y",le:"ELPIS",st:"ACTIF",ch:"Gohou Abdel Naki"},
  {im:"HD-227-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"IMMO",ch:"Bureau Accidente"},
  {im:"GK-642-TS",mq:"TESLA",mo:"MODEL Y",le:"ELPIS",st:"ACTIF",ch:"Beyene Marc"},
  {im:"HC-638-SX",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Lucas Menendez"},
  {im:"HF-328-ZH",mq:"KIA",mo:"EV3",le:"ELPIS",st:"IMMO",ch:"Garage Auto+ Montmagny"},
  {im:"HC-022-NA",mq:"HYUNDAI",mo:"KONA",le:"ELPIS",st:"ACTIF",ch:"Zouhair Zaghouan"},
  {im:"HD-906-CS",mq:"TOYOTA",mo:"BZ4X",le:"ELPIS",st:"ACTIF",ch:"Diaby Karamba"},
  {im:"HF-833-ZK",mq:"KIA",mo:"EV3",le:"ELPIS",st:"ACTIF",ch:"Maela Tessono"},
  {im:"GT-970-AQ",mq:"TOYOTA",mo:"BZ4X",le:"ELPIS",st:"ACTIF",ch:"Bislan Tcholaev"},
  {im:"HD-240-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Sebastien Lesel"},
  {im:"HE-069-BV",mq:"TOYOTA",mo:"BZ4X",le:"ELPIS",st:"ACTIF",ch:"Attik El Diama"},
  {im:"HD-251-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Nguessan Kevin"},
  {im:"HD-488-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Jacque Prince"},
  {im:"HD-502-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Hergeuy Sergiu"},
  {im:"HD-460-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Riane Mourad"},
  {im:"HD-508-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Diallo Mamadou"},
  {im:"GX-213-RK",mq:"TESLA",mo:"MODEL 3",le:"DRIVE ONE",st:"ACTIF",ch:"Khaled Safta"},
  {im:"GK-429-XB",mq:"TESLA",mo:"MODEL 3",le:"DRIVE ONE",st:"ACTIF",ch:"Verfel Lelo"},
  {im:"HA-768-GT",mq:"TESLA",mo:"MODEL Y",le:"DRIVE ONE",st:"ACTIF",ch:"El Jattari Ahmed"},
  {im:"HF-768-BN",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Yahcine Belliil"},
  {im:"HD-511-HZ",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"IMMO",ch:"Bureau"},
  {im:"HF-899-BN",mq:"BYD",mo:"SEAL",le:"ELPIS",st:"ACTIF",ch:"Ababii Boris"},
];
const I_GA=[{soc:"URBAN NEO",im:"HF-190-ZK",gar:"Adama Carrosserie",de:"",ds:"",ji:""}];

const POLES={activite:{n:"Activite",c:"#E8633A"},parc:{n:"Parc",c:"#3A9BD5"},commercial:{n:"Commercial",c:"#2FAA6B"}};
const I_M=[
  {id:1,fr:"Marc T.",po:"parc",to:"all",tx:"HF-190-ZK immobilise chez Adama Carrosserie — besoin remplacement",ti:"08:42",ur:true},
  {id:2,fr:"Karim B.",po:"activite",to:"parc",tx:"Chauffeur reaffecte. ETA retour vehicule ?",ti:"08:55",ur:false},
  {id:3,fr:"Amelie F.",po:"commercial",to:"activite",tx:"Client attend livraison — Sidy Diagne disponible ?",ti:"09:10",ur:false},
];

export default function App(){
  const [user,setUser]=useState<typeof USERS[0]|null>(()=>{
    try{const s=localStorage.getItem("opportix-session");return s?JSON.parse(s):null;}catch{return null;}
  });
  const login=(u:typeof USERS[0])=>{localStorage.setItem("opportix-session",JSON.stringify(u));setUser(u);};
  const logout=()=>{localStorage.removeItem("opportix-session");setUser(null);};
  if(!user) return <LoginPage onLogin={login}/>;
  return <Dashboard user={user} onLogout={logout}/>;
}

function Dashboard({user,onLogout}:{user:typeof USERS[0],onLogout:()=>void}){
  const [tab,setTab]=useState("diffusion");
  const [urban,setUrban]=useState(I_U);
  const [green,setGreen]=useState(I_G);
  const [garage,setGarage]=useState(I_GA);
  const [deps,setDeps]=useState<any[]>([]);
  const [rets,setRets]=useState<any[]>([]);
  const [disp,setDisp]=useState<any[]>([]);
  const [vacs,setVacs]=useState<any[]>([]);
  const [pros,setPros]=useState<any[]>([]);
  const [msgs,setMsgs]=useState(I_M);
  const [showAdd,setShowAdd]=useState<string|null>(null);
  const [form,setForm]=useState<any>({});
  const [newMsg,setNewMsg]=useState("");
  const [msgTo,setMsgTo]=useState("all");
  const [fTab,setFTab]=useState("urban");
  const [search,setSearch]=useState("");
  const [delC,setDelC]=useState<string|null>(null);
  const ce=useRef<HTMLDivElement>(null);

  useEffect(()=>{ce.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{
    (async()=>{
      try{
        const raw=localStorage.getItem("net-v5");
        if(raw){
          const d=JSON.parse(raw);
          if(d.u) setUrban(d.u);
          if(d.g) setGreen(d.g);
          if(d.ga) setGarage(d.ga);
          if(d.dep) setDeps(d.dep);
          if(d.ret) setRets(d.ret);
          if(d.di) setDisp(d.di);
          if(d.va) setVacs(d.va);
          if(d.pr) setPros(d.pr);
        }
      }catch(e){}
    })();
  },[]);

  const sv=(o:any={})=>{
    const d={
      u:o.u??urban,g:o.g??green,ga:o.ga??garage,
      dep:o.dep??deps,ret:o.ret??rets,
      di:o.di??disp,va:o.va??vacs,pr:o.pr??pros
    };
    try{localStorage.setItem("net-v5",JSON.stringify(d));}catch(e){}
  };

  const all=[...urban.map(v=>({...v,soc:"URBAN NEO"})),...green.map(v=>({...v,soc:"GREEN"}))];
  const nUA=urban.filter(v=>v.st==="ACTIF").length, nUI=urban.filter(v=>v.st==="IMMO").length;
  const nGA=green.filter(v=>v.st==="ACTIF").length, nGI=green.filter(v=>v.st==="IMMO").length;
  const nCh=all.filter(v=>v.st==="ACTIF"&&!v.ch.toLowerCase().includes("garage")&&!v.ch.toLowerCase().includes("bureau")).length;

  const cur=fTab==="urban"?urban:green;
  const filt=useMemo(()=>cur.filter(v=>{
    if(search){const s=search.toLowerCase();return v.im.toLowerCase().includes(s)||v.ch.toLowerCase().includes(s)||v.mq.toLowerCase().includes(s);}
    return true;
  }),[cur,search,fTab]);

  const add=(type:string,entry:any)=>{
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"]};
    const[arr,set,k]=m[type];
    const n=[...arr,{...entry,id:Date.now()}];
    set(n);sv({[k]:n});setShowAdd(null);setForm({});
  };
  const del=(type:string,id:any,isIdx?:boolean)=>{
    const m:any={urban:[urban,setUrban,"u"],green:[green,setGreen,"g"],garage:[garage,setGarage,"ga"],deps:[deps,setDeps,"dep"],rets:[rets,setRets,"ret"],disp:[disp,setDisp,"di"],vacs:[vacs,setVacs,"va"],pros:[pros,setPros,"pr"]};
    const[arr,set,k]=m[type];
    const n=isIdx?arr.filter((_:any,i:number)=>i!==id):arr.filter((d:any)=>d.id!==id);
    set(n);sv({[k]:n});setDelC(null);
  };
  const tog=(im:string)=>{
    const up=(l:any[])=>l.map(v=>v.im===im?{...v,st:v.st==="ACTIF"?"IMMO":"ACTIF"}:v);
    if(fTab==="urban"){const n=up(urban);setUrban(n);sv({u:n});}
    else{const n=up(green);setGreen(n);sv({g:n});}
  };

  const sendM=()=>{
    if(!newMsg.trim())return;
    setMsgs(p=>[...p,{id:Date.now(),fr:"Vous",po:"activite",to:msgTo,tx:newMsg,ti:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),ur:false}]);
    setNewMsg("");
  };

  const TABS=[{k:"diffusion",l:"Diffusion"},{k:"vehicules",l:"Vehicules"},{k:"flotte",l:"Flotte"},{k:"departs",l:"Departs"},{k:"retours",l:"Retours"},{k:"dispo",l:"VH Dispo"},{k:"garage",l:"Garage"},{k:"vacances",l:"Vacances"},{k:"prospects",l:"Prospects"},{k:"messagerie",l:"Messagerie"}];
  const go=(t:string)=>{setTab(t);setShowAdd(null);setDelC(null);setSearch("");};

  const MiniTbl=({title,titleBg,count,countBad,heads,cols,data,renderRow,maxH=200}:any)=>(
    <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:titleBg||"#F5F5F3",borderBottom:"1px solid #E5E5E3"}}>
        <span style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>{title}</span>
        <div style={{display:"flex",gap:6}}>
          <span style={{fontSize:11,fontWeight:600,color:"#666"}}>{count}</span>
          {countBad&&<span style={{fontSize:10,fontWeight:700,color:"#C0392B",background:"#FDECEC",padding:"1px 6px",borderRadius:4}}>{countBad}</span>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:cols,padding:"6px 12px",background:"#FAFAF8",borderBottom:"1px solid #EDEDEB",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
        {heads.map((h:string,i:number)=><span key={i}>{h}</span>)}
      </div>
      <div style={{maxHeight:maxH,overflowY:"auto"}}>
        {data.length===0?<div style={{padding:14,textAlign:"center",color:"#DDD",fontSize:11}}>Aucun element</div>:
        data.map((d:any,i:number)=><div key={d.id??d.im??i} style={{display:"grid",gridTemplateColumns:cols,padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>{renderRow(d,i)}</div>)}
      </div>
    </div>
  );

  const StBadge=({s}:{s:string})=><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:s==="ACTIF"?"#E8F8F0":"#FDECEC",color:s==="ACTIF"?"#1E8A52":"#C0392B"}}>{s}</span>;
  const SocBadge=({s}:{s:string})=><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:600,background:s==="URBAN NEO"?"#E0EDFA":"#E0F5EA",color:s==="URBAN NEO"?"#2874A6":"#1E8A52"}}>{s==="URBAN NEO"?"URBAN":"GREEN"}</span>;

  return(
    <div style={{minHeight:"100vh",background:"#F3F3F1",color:"#333",fontFamily:"'Outfit',system-ui,sans-serif",fontSize:13}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.ani{animation:fi .2s ease both}
        .rw:hover{background:#F7F7F5!important}.tb:hover{background:#EAEAE8!important}input:focus,select:focus{outline:none;border-color:#E8633A!important}.dl:hover{background:#FEE!important;color:#C0392B!important}
      `}</style>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:"#fff",borderBottom:"1px solid #E5E5E3",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:7,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",fontFamily:"'IBM Plex Mono',monospace"}}>O</div>
          <div><div style={{fontSize:13,fontWeight:800,letterSpacing:2,color:"#1A1A1A"}}>OPPORTIX</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Pill c="#1A1A1A" t={`${all.length} VH`}/><Pill c="#2FAA6B" t={`${nUA+nGA} actifs`}/><Pill c="#C0392B" t={`${nUI+nGI} immo`}/><Pill c="#7B61FF" t={`${nCh} chauffeurs`}/>
          <div style={{width:1,height:16,background:"#E5E5E3",margin:"0 4px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{user.nom.charAt(0)}</div>
            <span style={{fontSize:11,fontWeight:600,color:"#444"}}>{user.nom}</span>
            <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:4,background:"#F0F0EE",color:"#777"}}>{user.role}</span>
            <button onClick={onLogout} style={{marginLeft:4,padding:"3px 10px",borderRadius:5,border:"1px solid #E0E0DE",background:"#fff",color:"#999",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Déconnexion</button>
          </div>
        </div>
      </header>

      <nav style={{display:"flex",gap:2,padding:"6px 20px",background:"#F3F3F1",borderBottom:"1px solid #E5E5E3",flexWrap:"wrap",overflowX:"auto"}}>
        {TABS.map(t=><button key={t.k} className="tb" onClick={()=>go(t.k)} style={{padding:"6px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",background:tab===t.k?"#fff":"transparent",color:tab===t.k?"#1A1A1A":"#999",boxShadow:tab===t.k?"0 1px 2px rgba(0,0,0,0.05)":"none",transition:"all .15s"}}>{t.l}</button>)}
      </nav>

      <main style={{padding:"14px 20px",maxWidth:1300,margin:"0 auto"}}>

        {tab==="diffusion"&&(
          <div className="ani" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
              {[
                {l:"TOTAL VOITURES",v:all.length,c:"#1A1A1A"},
                {l:"URBAN NEO",v:urban.length,c:"#3A9BD5",s:`${nUA} actifs · ${nUI} immo`},
                {l:"GREEN",v:green.length,c:"#2FAA6B",s:`${nGA} actifs · ${nGI} immo`},
                {l:"CHAUFFEURS ACTIFS",v:nCh,c:"#7B61FF"},
                {l:"NB VP",v:all.length,c:"#E8633A"},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${k.c}`,border:"1px solid #E5E5E3"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8}}>{k.l}</div>
                  <div style={{fontSize:24,fontWeight:800,color:k.c,fontFamily:"'IBM Plex Mono',monospace"}}>{k.v}</div>
                  {k.s&&<div style={{fontSize:9,color:"#BBB"}}>{k.s}</div>}
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <DiffBlock title="DEPARTS" titleBg="#FDECEA" color="#D94F3B" count={deps.length}
                heads={["SOCIETE","IMMAT","CHAUFFEUR","DATE"]} cols="65px 90px 1fr 70px" data={deps} maxH={160}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#999",fontSize:10}}>{d.dt||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["ch","Chauffeur","Nom"],["dt","Date","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("deps",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("deps",id)}
              />
              <DiffBlock title="RETOURS" titleBg="#D4F0E0" color="#2FAA6B" count={rets.length}
                heads={["SOCIETE","IMMAT","CHAUFFEUR","DATE"]} cols="65px 90px 1fr 70px" data={rets} maxH={160}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#999",fontSize:10}}>{d.dt||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["ch","Chauffeur","Nom"],["dt","Date","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("rets",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("rets",id)}
              />
              <DiffBlock title="VOITURES DISPO" titleBg="#D6E9F8" color="#3A9BD5" count={`${disp.filter((d:any)=>d.soc==="URBAN NEO").length} Urb · ${disp.filter((d:any)=>d.soc==="GREEN").length} Grn`}
                heads={["SOCIETE","IMMAT","MODELE","NOTE"]} cols="65px 90px 1fr 1fr" data={disp} maxH={160}
                renderRow={(d:any)=><><SocBadge s={d.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:10}}>{d.no||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["mo","Modele","KONA..."],["no","Note","..."]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("disp",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("disp",id)}
              />
              <DiffBlock title="GARAGE" titleBg="#FDF4E3" color="#D4A027" count={`${garage.filter((g:any)=>g.soc==="URBAN NEO").length} Urb · ${garage.filter((g:any)=>g.soc==="GREEN").length} Grn`}
                heads={["SOCIETE","IMMAT","GARAGE","ENTREE","SORTIE"]} cols="65px 90px 1fr 60px 60px" data={garage} maxH={160}
                renderRow={(g:any)=><><SocBadge s={g.soc}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{g.im}</span><span style={{color:"#444"}}>{g.gar||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.de||"—"}</span><span style={{color:"#999",fontSize:10}}>{g.ds||"—"}</span></>}
                formFields={[["soc","Societe",null,["URBAN NEO","GREEN"]],["im","Immat *","XX-000-XX"],["gar","Garage","Nom"],["de","Entree","JJ/MM"],["ds","Sortie","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.im?.trim())return;add("garage",{...f,im:f.im.toUpperCase().trim()});}}
                onDel={(id:any)=>del("garage",id,true)}
                useIdx
              />
              <DiffBlock title="VACANCES CHAUFFEURS" titleBg="#EDE8FA" color="#7B61FF" count={vacs.length}
                heads={["CHAUFFEUR","SOCIETE","DEBUT","FIN"]} cols="1fr 65px 70px 70px" data={vacs} maxH={160}
                renderRow={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><SocBadge s={v.soc}/><span style={{color:"#777",fontSize:10}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:10}}>{v.fin||"—"}</span></>}
                formFields={[["ch","Chauffeur *","Nom"],["soc","Societe",null,["URBAN NEO","GREEN"]],["deb","Debut","JJ/MM"],["fin","Fin","JJ/MM"]]}
                onAdd={(f:any)=>{if(!f.ch?.trim())return;add("vacs",f);}}
                onDel={(id:any)=>del("vacs",id)}
              />
              <DiffBlock title="PROSPECTS" titleBg="#D4F0E0" color="#2FAA6B" count={pros.length}
                heads={["NOM","CONTACT","BESOIN","STATUT"]} cols="1fr 1fr 1fr 70px" data={pros} maxH={160}
                renderRow={(p:any)=><><span style={{fontWeight:600,color:"#333"}}>{p.nom}</span><span style={{color:"#666"}}>{p.ct||"—"}</span><span style={{color:"#666"}}>{p.bs||"—"}</span><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:p.stu==="SIGNE"?"#E8F8F0":p.stu==="PERDU"?"#FDECEC":"#FDF4E3",color:p.stu==="SIGNE"?"#1E8A52":p.stu==="PERDU"?"#C0392B":"#B7791F"}}>{p.stu}</span></>}
                formFields={[["nom","Nom *","Entreprise"],["ct","Contact","Tel/Email"],["bs","Besoin","Type"],["stu","Statut",null,["EN COURS","SIGNE","PERDU"]]]}
                onAdd={(f:any)=>{if(!f.nom?.trim())return;add("pros",f);}}
                onDel={(id:any)=>del("pros",id)}
              />
            </div>
          </div>
        )}

        {tab==="vehicules"&&(
          <div className="ani" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>Vehicules</div>
              <div style={{display:"flex",gap:6}}>
                <Pill c="#3A9BD5" t={`${urban.length} Urban Neo`}/><Pill c="#2FAA6B" t={`${green.length} Green`}/><Pill c="#1A1A1A" t={`${all.length} total`}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <MiniTbl title="VEHICULES URBAN NEO" titleBg="#D6E9F8" count={`${urban.length} voitures`} countBad={nUI>0?`${nUI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","STATUT","CHAUFFEUR"]} cols="85px 60px 70px 45px 1fr" data={urban} maxH={500}
                renderRow={(v:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1A1A1A",fontSize:10}}>{v.im}</span><span style={{color:"#666"}}>{v.mq}</span><span style={{color:"#666"}}>{v.mo}</span><StBadge s={v.st}/><span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span></>}
              />
              <MiniTbl title="VEHICULES GREEN" titleBg="#D4F0E0" count={`${green.length} voitures`} countBad={nGI>0?`${nGI} a l'arret`:null}
                heads={["IMMAT","MARQUE","MODELE","STATUT","CHAUFFEUR"]} cols="85px 60px 70px 45px 1fr" data={green} maxH={500}
                renderRow={(v:any)=><><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1A1A1A",fontSize:10}}>{v.im}</span><span style={{color:"#666"}}>{v.mq}</span><span style={{color:"#666"}}>{v.mo}</span><StBadge s={v.st}/><span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span></>}
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
              <button onClick={()=>showAdd==="fleet"?setShowAdd(null):setShowAdd("fleet")} style={oBtn("#E8633A",showAdd==="fleet")}>{showAdd==="fleet"?"Annuler":"+ Ajouter"}</button>
            </div>
            {showAdd==="fleet"&&<AddBox fields={[["Immat *","im","XX-000-XX"],["Marque","mq","HYUNDAI"],["Modele","mo","KONA"],["Leaser","le","ELPIS"],["Chauffeur","ch","Nom"]]} form={form} setForm={setForm} onAdd={()=>{if(!form.im?.trim())return;add(fTab,{...form,im:form.im.toUpperCase().trim(),mq:(form.mq||"").toUpperCase().trim(),st:form.st||"ACTIF"});}} extra={<Sel l="Statut" v={form.st||"ACTIF"} set={(v:string)=>setForm({...form,st:v})} opts={["ACTIF","IMMO"]}/>}/>}
            <div style={{fontSize:11,color:"#AAA",marginBottom:6}}>{filt.length} VH</div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"100px 1fr 70px 90px 75px 60px 80px",padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
                <span>IMMAT</span><span>CHAUFFEUR</span><span>MARQUE</span><span>MODELE</span><span>LEASER</span><span>STATUT</span><span style={{textAlign:"right"}}></span>
              </div>
              <div style={{maxHeight:480,overflowY:"auto"}}>
                {filt.map((v,i)=>(
                  <div key={v.im+i} className="rw" style={{display:"grid",gridTemplateColumns:"100px 1fr 70px 90px 75px 60px 80px",padding:"7px 12px",borderBottom:"1px solid #F5F5F3",alignItems:"center",fontSize:12}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:"#1A1A1A"}}>{v.im}</span>
                    <span style={{color:"#444",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ch}</span>
                    <span style={{color:"#777",fontSize:11}}>{v.mq}</span>
                    <span style={{color:"#777",fontSize:11}}>{v.mo}</span>
                    <span style={{color:"#AAA",fontSize:10}}>{v.le}</span>
                    <span><button onClick={()=>tog(v.im)} style={{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",background:v.st==="ACTIF"?"#E8F8F0":"#FDECEC",color:v.st==="ACTIF"?"#1E8A52":"#C0392B"}}>{v.st}</button></span>
                    <span style={{textAlign:"right"}}>{delC===v.im?<span style={{display:"inline-flex",gap:2}}><button onClick={()=>del(fTab,fTab==="urban"?urban.indexOf(v):green.indexOf(v),true)} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#C0392B",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Oui</button><button onClick={()=>setDelC(null)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Non</button></span>:<button className="dl" onClick={()=>setDelC(v.im)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#BBB",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Suppr</button>}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="departs"&&<CrudP title="Departs" color="#D94F3B" data={deps} type="deps" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Chauffeur","ch","Nom"],["Date","dt","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="80px 100px 1fr 80px 1fr 60px" heads={["SOCIETE","IMMAT","CHAUFFEUR","DATE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#777",fontSize:11}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="retours"&&<CrudP title="Retours" color="#2FAA6B" data={rets} type="rets" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Chauffeur","ch","Nom"],["Date","dt","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="80px 100px 1fr 80px 1fr 60px" heads={["SOCIETE","IMMAT","CHAUFFEUR","DATE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.ch}</span><span style={{color:"#777",fontSize:11}}>{d.dt||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="dispo"&&<CrudP title="Vehicules disponibles" color="#3A9BD5" data={disp} type="disp" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Modele","mo","KONA..."],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="80px 100px 1fr 1fr 60px" heads={["SOCIETE","IMMAT","MODELE","NOTE",""]}
          rr={(d:any)=><><span><SocBadge s={d.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{d.im}</span><span style={{color:"#444"}}>{d.mo||"—"}</span><span style={{color:"#999",fontSize:11}}>{d.no||"—"}</span></>}
        />}
        {tab==="garage"&&<CrudP title="Garage" color="#D4A027" data={garage} type="garage" showAdd={showAdd} setShowAdd={setShowAdd} useIdx
          fields={[["Societe","soc",null,["URBAN NEO","GREEN"]],["Immat *","im","XX-000-XX"],["Garage","gar","Nom"],["Entree","de","JJ/MM"],["Sortie","ds","JJ/MM"],["Jours","ji","0"]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="80px 100px 1fr 70px 70px 50px 60px" heads={["SOCIETE","IMMAT","GARAGE","ENTREE","SORTIE","JOURS",""]}
          rr={(g:any)=><><span><SocBadge s={g.soc}/></span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{g.im}</span><span style={{color:"#444"}}>{g.gar||"—"}</span><span style={{color:"#777",fontSize:11}}>{g.de||"—"}</span><span style={{color:"#777",fontSize:11}}>{g.ds||"—"}</span><span style={{color:"#999",fontSize:11}}>{g.ji||"—"}</span></>}
        />}
        {tab==="vacances"&&<CrudP title="Vacances chauffeurs" color="#7B61FF" data={vacs} type="vacs" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Chauffeur *","ch","Nom"],["Societe","soc",null,["URBAN NEO","GREEN"]],["Debut","deb","JJ/MM"],["Fin","fin","JJ/MM"],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="1fr 80px 80px 80px 1fr 60px" heads={["CHAUFFEUR","SOCIETE","DEBUT","FIN","NOTE",""]}
          rr={(v:any)=><><span style={{fontWeight:600,color:"#333"}}>{v.ch}</span><span><SocBadge s={v.soc}/></span><span style={{color:"#777",fontSize:11}}>{v.deb||"—"}</span><span style={{color:"#777",fontSize:11}}>{v.fin||"—"}</span><span style={{color:"#999",fontSize:11}}>{v.no||"—"}</span></>}
        />}
        {tab==="prospects"&&<CrudP title="Prospects" color="#2FAA6B" data={pros} type="pros" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Nom *","nom","Entreprise"],["Contact","ct","Tel/Email"],["Besoin","bs","Type"],["Statut","stu",null,["EN COURS","SIGNE","PERDU"]],["Note","no","..."]]}
          form={form} setForm={setForm} addItem={add} delItem={del}
          cols="1fr 1fr 1fr 75px 1fr 60px" heads={["NOM","CONTACT","BESOIN","STATUT","NOTE",""]}
          rr={(p:any)=><><span style={{fontWeight:600,color:"#333"}}>{p.nom}</span><span style={{color:"#666"}}>{p.ct||"—"}</span><span style={{color:"#666"}}>{p.bs||"—"}</span><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:p.stu==="SIGNE"?"#E8F8F0":p.stu==="PERDU"?"#FDECEC":"#FDF4E3",color:p.stu==="SIGNE"?"#1E8A52":p.stu==="PERDU"?"#C0392B":"#B7791F"}}>{p.stu}</span><span style={{color:"#999",fontSize:11}}>{p.no||"—"}</span></>}
        />}

        {tab==="messagerie"&&(
          <div className="ani">
            <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginBottom:10}}>Messagerie inter-poles</div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
              <div style={{padding:12,maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
                {msgs.map(m=>(
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
              <div style={{display:"flex",gap:6,padding:"8px 12px",borderTop:"1px solid #E5E5E3",background:"#FAFAF8",flexWrap:"wrap"}}>
                <select value={msgTo} onChange={e=>setMsgTo(e.target.value)} style={{...iS,width:120,fontSize:11}}><option value="all">Tous</option><option value="activite">Activite</option><option value="parc">Parc</option><option value="commercial">Commercial</option></select>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendM()} placeholder="Message..." style={{...iS,flex:1}}/>
                <button onClick={sendM} style={{padding:"7px 16px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Envoyer</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══ SHARED ═══ */
const iS:React.CSSProperties={padding:"7px 10px",borderRadius:6,border:"1px solid #E0E0DE",background:"#fff",color:"#333",fontSize:12,fontFamily:"inherit"};
const oBtn=(c:string,a:boolean):React.CSSProperties=>({padding:"6px 12px",borderRadius:6,border:`1px solid ${c}`,background:a?c:"#fff",color:a?"#fff":c,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"});
function Pill({c,t}:{c:string,t:string|number}){return <span style={{padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,color:c,background:c+"0D",border:`1px solid ${c}22`}}>{t}</span>;}
function Sel({l,v,set,opts}:{l:string,v:string,set:(v:string)=>void,opts:string[]}){return <div><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div><select value={v} onChange={e=>set(e.target.value)} style={{...iS,width:"100%",background:"#FAFAF8"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;}

function DiffBlock({title,titleBg,color,count,heads,cols,data,maxH=160,renderRow,formFields,onAdd,onDel,useIdx}:any){
  const [open,setOpen]=useState(false);
  const [f,setF]=useState<any>({});
  const [delId,setDelId]=useState<any>(null);
  const doAdd=()=>{onAdd(f);setF({});setOpen(false);};
  return(
    <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:titleBg||"#F5F5F3",borderBottom:"1px solid #E5E5E3"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>{title}</span>
          <span style={{fontSize:10,fontWeight:600,color:"#666"}}>{count}</span>
        </div>
        <button onClick={()=>{setOpen(!open);setF({});}} style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${color}`,background:open?color:"transparent",color:open?"#fff":color,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{open?"Annuler":"+"}</button>
      </div>
      {open&&(
        <div style={{padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
            {formFields.map(([k,l,p,opts]:any)=>(
              <div key={k} style={{flex:"1 1 80px",minWidth:70}}>
                <div style={{fontSize:9,fontWeight:600,color:"#888",marginBottom:2}}>{l}</div>
                {opts
                  ?<select value={f[k]||opts[0]} onChange={e=>setF({...f,[k]:e.target.value})} style={{...iS,width:"100%",fontSize:10,padding:"5px 6px",background:"#fff"}}>{opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>
                  :<input value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})} placeholder={p} style={{...iS,width:"100%",fontSize:10,padding:"5px 6px",background:"#fff"}}/>
                }
              </div>
            ))}
            <button onClick={doAdd} style={{padding:"5px 12px",borderRadius:5,border:"none",background:"#1A1A1A",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",height:28}}>OK</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:cols+" 30px",padding:"6px 12px",background:"#FAFAF8",borderBottom:"1px solid #EDEDEB",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
        {heads.map((h:string,i:number)=><span key={i}>{h}</span>)}<span></span>
      </div>
      <div style={{maxHeight:maxH,overflowY:"auto"}}>
        {data.length===0?<div style={{padding:14,textAlign:"center",color:"#DDD",fontSize:11}}>Aucun element</div>:
        data.map((d:any,i:number)=>(
          <div key={d.id??d.im??i} style={{display:"grid",gridTemplateColumns:cols+" 30px",padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>
            {renderRow(d,i)}
            <span style={{textAlign:"right"}}>
              {delId===(useIdx?i:d.id)
                ?<button onClick={()=>{onDel(useIdx?i:d.id);setDelId(null);}} style={{padding:"1px 5px",borderRadius:3,border:"none",background:"#C0392B",color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Oui</button>
                :<button onClick={()=>setDelId(useIdx?i:d.id)} style={{padding:"1px 5px",borderRadius:3,border:"1px solid #E8E8E5",background:"#fff",color:"#CCC",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>×</button>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddBox({fields,form,setForm,onAdd,extra}:any){
  return <div className="ani" style={{background:"#fff",borderRadius:8,padding:14,border:"1px solid #E5E5E3",marginBottom:10}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
      {fields.map(([l,k,p]:any)=><div key={k}><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div><input value={form[k]||""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[k]:e.target.value})} placeholder={p} style={{...iS,width:"100%",background:"#FAFAF8"}}/></div>)}
      {extra}
    </div>
    <button onClick={onAdd} style={{marginTop:10,padding:"7px 18px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Ajouter</button>
  </div>;
}

function CrudP({title,color,data,type,showAdd,setShowAdd,fields,form,setForm,addItem,delItem,cols,heads,rr,useIdx}:any){
  const open=showAdd===type;
  return <div className="ani">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A"}}>{title} <span style={{fontSize:11,color:"#BBB",fontWeight:400}}>{data.length}</span></div>
      <button onClick={()=>{open?setShowAdd(null):setShowAdd(type);setForm({});}} style={oBtn(color,open)}>{open?"Annuler":"+ Ajouter"}</button>
    </div>
    {open&&<div className="ani" style={{background:"#fff",borderRadius:8,padding:14,border:"1px solid #E5E5E3",marginBottom:10}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
        {fields.map(([l,k,p,opts]:any)=><div key={k}><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div>
          {opts?<select value={form[k]||opts[0]} onChange={(e:React.ChangeEvent<HTMLSelectElement>)=>setForm({...form,[k]:e.target.value})} style={{...iS,width:"100%",background:"#FAFAF8"}}>{opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>
          :<input value={form[k]||""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[k]:e.target.value})} placeholder={p} style={{...iS,width:"100%",background:"#FAFAF8"}}/>}
        </div>)}
      </div>
      <button onClick={()=>{const req=type==="vacs"?form.ch:type==="pros"?form.nom:form.im;if(!req?.trim())return;addItem(type,{...form,im:form.im?.toUpperCase().trim()});}} style={{marginTop:10,padding:"7px 18px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Ajouter</button>
    </div>}
    <div style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:cols,padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>{heads.map((h:string,i:number)=><span key={i}>{h}</span>)}</div>
      <div style={{maxHeight:420,overflowY:"auto"}}>
        {data.map((d:any,i:number)=><div key={useIdx?i:d.id} className="rw" style={{display:"grid",gridTemplateColumns:cols,padding:"7px 12px",borderBottom:"1px solid #F5F5F3",alignItems:"center",fontSize:12}}>
          {rr(d)}
          <span style={{textAlign:"right"}}><button className="dl" onClick={()=>delItem(type,useIdx?i:d.id,useIdx)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#BBB",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retirer</button></span>
        </div>)}
        {data.length===0&&<div style={{padding:24,textAlign:"center",color:"#CCC",fontSize:11}}>Aucun element</div>}
      </div>
    </div>
  </div>;
}
