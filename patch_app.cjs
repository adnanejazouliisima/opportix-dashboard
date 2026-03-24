const fs = require('fs');
const code = fs.readFileSync('workspace/artifacts/network/src/App.tsx', 'utf-8');

let newCode = code;

// 1. Remove hardcoded USERS and I_U etc. We'll fetch them. We'll leave I_U... as initial empty states or keep them as fallback?
// Let's just remove USERS array.
newCode = newCode.replace(/const USERS = \[[\s\S]*?\];\n/, '');

// 2. Update LoginPage submit
newCode = newCode.replace(
  /const submit=\(e:React\.FormEvent\)=>\{[\s\S]*?};\n/m,
  `const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    try {
        const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pwd})});
        const data=await res.json();
        if(res.ok){setErr("");onLogin(data.user, data.token);}
        else{setErr(data.error||"Identifiant incorrect.");}
    } catch(err) {
        setErr("Erreur de connexion serveur.");
    }
  };\n`
);
newCode = newCode.replace(/function LoginPage\(\{onLogin\}:\{onLogin:\(u:typeof USERS\[0\]\)=>void\}\)/, 'function LoginPage({onLogin}:any)');

// 3. Update App component with session token
newCode = newCode.replace(
  /export default function App\(\)\{[\s\S]*?\}\n/m,
  `export default function App(){
  const [session,setSession]=useState<any>(()=>{
    try{const s=localStorage.getItem("net-session");return s?JSON.parse(s):null;}catch{return null;}
  });
  const login=(u:any, token:string)=>{
    const s={user:u,token};
    localStorage.setItem("net-session",JSON.stringify(s));setSession(s);
  };
  const logout=()=>{localStorage.removeItem("net-session");setSession(null);};
  if(!session) return <LoginPage onLogin={login}/>;
  return <Dashboard session={session} onLogout={logout}/>;
}\n`
);

// 4. Update Dashboard definition and fetch
newCode = newCode.replace(/function Dashboard\(\{user,onLogout\}:\{user:typeof USERS\[0\],onLogout:\(\)=>void\}\){/m, 
`function Dashboard({session,onLogout}:any){
  const user = session.user;
  const token = session.token;
  const headers = { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' };
`);

newCode = newCode.replace(/const \[urban,setUrban\]=useState\(I_U\);/, 'const [urban,setUrban]=useState<any[]>([]);');
newCode = newCode.replace(/const \[green,setGreen\]=useState\(I_G\);/, 'const [green,setGreen]=useState<any[]>([]);');
newCode = newCode.replace(/const \[garage,setGarage\]=useState\(I_GA\);/, 'const [garage,setGarage]=useState<any[]>([]);');
newCode = newCode.replace(/const \[msgs,setMsgs\]=useState\(I_M\);/, 'const [msgs,setMsgs]=useState<any[]>([]);');
newCode = newCode.replace(/const \[usersList,setUsersList\]=useState<any\[\]>\(\[\]\);/, '');

newCode = newCode.replace(
  /useEffect\(\(\)=>\{\s*\(\s*async\(\)=>\{[\s\S]*?\}\)\(\);\s*\},\[\]\);/m,
  `const [usersList,setUsersList]=useState<any[]>([]);
  useEffect(()=>{
    (async()=>{
      try{
        const res = await fetch('/api/data', { headers });
        if(res.ok) {
           const d = await res.json();
           if(d.u) setUrban(d.u);
           if(d.g) setGreen(d.g);
           if(d.ga) setGarage(d.ga);
           if(d.dep) setDeps(d.dep);
           if(d.ret) setRets(d.ret);
           if(d.di) setDisp(d.di);
           if(d.va) setVacs(d.va);
           if(d.pr) setPros(d.pr);
           if(d.msgs) setMsgs(d.msgs);
        }
        if(user.role !== 'lecteur') {
           const uRes = await fetch('/api/users', { headers });
           if(uRes.ok) setUsersList(await uRes.json());
        }
      }catch(e){}
    })();
  },[]);`
);

// 5. Update sv function to save to API
newCode = newCode.replace(
  /const sv=\(o:any=\{\}\)=>\{[\s\S]*?try\{localStorage\.setItem.*?;\}catch\(e\)\{\}\s*\};/m,
  `const sv=async(o:any={})=>{
    const d={
      u:o.u??urban,g:o.g??green,ga:o.ga??garage,
      dep:o.dep??deps,ret:o.ret??rets,
      di:o.di??disp,va:o.va??vacs,pr:o.pr??pros,msgs:o.msgs??msgs
    };
    try{await fetch('/api/data', { method:'PUT', headers, body: JSON.stringify(d) });}catch(e){}
  };`
);

// 6. Update message send
newCode = newCode.replace(
  /setMsgs\(p=>\[\.\.\.p,\{id:Date.now\(\),fr:"Vous"[\s\S]*?\}\]\);/m,
  `const msg = {id:Date.now(),fr:user.displayName,po:user.pole,to:msgTo,tx:newMsg,ti:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),ur:false};
   setMsgs(p=>[...p,msg]);
   sv({msgs: [...msgs, msg]});
  `
);

// 7. Update TABS
newCode = newCode.replace(
  /const TABS=\[\{k:"diffusion",l:"Diffusion"\},[\s\S]*?\{k:"messagerie",l:"Messagerie"\}\];/m,
  `const TABS=[{k:"diffusion",l:"Diffusion"},{k:"vehicules",l:"Vehicules"},{k:"flotte",l:"Flotte"},{k:"departs",l:"Departs"},{k:"retours",l:"Retours"},{k:"dispo",l:"VH Dispo"},{k:"garage",l:"Garage"},{k:"vacances",l:"Vacances"},{k:"prospects",l:"Prospects"},{k:"messagerie",l:"Messagerie"}];
  if(user.role !== 'lecteur') TABS.push({k:"utilisateurs",l:"Comptes"});`
);

// 8. Add user management UI
// We will inject a Users tab block right before the </main>
const usersTabHtml = `
  {tab==="utilisateurs"&&(
    <div className="ani">
      <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginBottom:10}}>Gestion des Comptes</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap"}}>
        <CrudP title="Comptes enregistrés" color="#1A1A1A" data={usersList} type="users" showAdd={showAdd} setShowAdd={setShowAdd}
          fields={[["Identifiant *","username","login"],["Nom d'affichage *","displayName","Ex: Jean D."],
            ["Role","role",null, user.role==='admin' ? ["lecteur","editeur","admin"]: ["lecteur","editeur"]],
            ["Pole","pole",null,["activite","parc","commercial","all"]],
            ["Mot de passe","password","Vide = network2024"]]}
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
          cols="30px 100px 150px 100px 100px 80px" heads={["","IDENTIFIANT","NOM","RÔLE","PÔLE",""]}
          rr={(u:any)=><><span style={{fontWeight:800}}>{u.role==='admin'?'🛡️':'👤'}</span><span style={{fontWeight:600}}>{u.username}</span><span>{u.displayName}</span><span>{u.role}</span><span>{u.pole}</span></>}
        />
      </div>
    </div>
  )}
`;
newCode = newCode.replace(/<\/main>/m, usersTabHtml + '\n      </main>');

// 9. Hide + Ajouter buttons for lecteur
// We'll wrap all render parts that use `showAdd` and `+ Ajouter` with `user.role !== 'lecteur'`
newCode = newCode.replace(
  /<button onClick=\{\(\)=>showAdd==="fleet"\?setShowAdd\(null\):setShowAdd\("fleet"\)\}/g,
  `{user.role!=='lecteur'&&<button onClick={()=>showAdd==="fleet"?setShowAdd(null):setShowAdd("fleet")}`
);
newCode = newCode.replace(
  /<button onClick=\{\(\)=>\{open\?setShowAdd\(null\):setShowAdd\(type\);setForm\(\{\}\);\}\}/g,
  `{user.role!=='lecteur'&&<button onClick={()=>{open?setShowAdd(null):setShowAdd(type);setForm({});}}`
);
// Also close the conditionally rendered tag correctly. The original ends with <button ...>...</button>
newCode = newCode.replace(
  /(<button onClick=\{\(\)=>showAdd==="fleet"\?setShowAdd\(null\):setShowAdd\("fleet"\)\} style=\{oBtn\("#E8633A",showAdd==="fleet"\)\}>\{showAdd==="fleet"\?"Annuler":"\+ Ajouter"\}<\/button>)/g,
  `{user.role!=='lecteur' && $1}`
);
newCode = newCode.replace(
  /(<button onClick=\{\(\)=>\{open\?setShowAdd\(null\):setShowAdd\(type\);setForm\(\{\}\);\}\} style=\{oBtn\(color,open\)\}>\{open\?"Annuler":"\+ Ajouter"\}<\/button>)/g,
  `{user.role!=='lecteur' && $1}`
);

// 10. Hide action buttons (+ button in DiffBlock)
newCode = newCode.replace(
  /<button onClick=\{\(\)=>\{setOpen\(!open\);setF\(\{\}\);\}\} style=\{\{padding:"2px 8px"/g,
  `{user.role!=='lecteur'&&<button onClick={()=>{setOpen(!open);setF({});}} style={{padding:"2px 8px"`
);
newCode = newCode.replace(
  /(<button onClick=\{\(\)=>\{setOpen\(!open\);setF\(\{\}\);\}\} [\s\S]*?<\/button>)/,
  `{user.role !== 'lecteur' && $1}`
);

fs.writeFileSync('src/App.tsx', newCode);
console.log('App patched successfully!');
