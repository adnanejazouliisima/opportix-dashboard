import { useState, useEffect } from "react";
/* ═══ STYLES ═══ */
export const iS:React.CSSProperties={padding:"7px 10px",borderRadius:6,border:"1px solid #E0E0DE",background:"#fff",color:"#333",fontSize:12,fontFamily:"inherit"};
export const oBtn=(c:string,a:boolean):React.CSSProperties=>({padding:"6px 12px",borderRadius:6,border:`1px solid ${c}`,background:a?c:"#fff",color:a?"#fff":c,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"});

/* ═══ TOAST ═══ */
export function Toast({msg,type,onClose}:{msg:string,type:"ok"|"err",onClose:()=>void}){
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[onClose]);
  return <div style={{position:"fixed",top:16,right:16,zIndex:9999,padding:"10px 18px",borderRadius:8,fontSize:12,fontWeight:600,color:"#fff",background:type==="ok"?"#1E8A52":"#C0392B",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",animation:"fi .2s ease both",cursor:"pointer"}} onClick={onClose}>{msg}</div>;
}

/* ═══ SMALL COMPONENTS ═══ */
export function Pill({c,t}:{c:string,t:string|number}){return <span style={{padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,color:c,background:c+"0D",border:`1px solid ${c}22`}}>{t}</span>;}
export function Sel({l,v,set,opts}:{l:string,v:string,set:(v:string)=>void,opts:string[]}){return <div><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div><select value={v} onChange={e=>set(e.target.value)} style={{...iS,width:"100%",background:"#FAFAF8"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;}
export function StBadge({s}:{s:string}){return <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:s==="ACTIF"?"#E8F8F0":"#FDECEC",color:s==="ACTIF"?"#1E8A52":"#C0392B"}}>{s}</span>;}
export function SocBadge({s}:{s:string}){return <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:600,background:s==="URBAN NEO"?"#E0EDFA":"#E0F5EA",color:s==="URBAN NEO"?"#2874A6":"#1E8A52"}}>{s==="URBAN NEO"?"URBAN":"GREEN"}</span>;}

/* ═══ DIFFBLOCK ═══ */
export function DiffBlock({title,titleBg,color,count,heads,cols,data,maxH=160,renderRow,formFields,onAdd,onDel,onEdit,onConfirm,onExit,useIdx,user}:any){
  const [open,setOpen]=useState(false);
  const initForm=()=>{const o:any={};formFields.forEach(([k,,, opts]:any)=>{if(opts)o[k]=opts[0];});return o;};
  const [f,setF]=useState<any>(initForm);
  const [delId,setDelId]=useState<any>(null);
  const [editId,setEditId]=useState<any>(null);
  const [editF,setEditF]=useState<any>({});
  const doAdd=()=>{onAdd(f);setF(initForm);setOpen(false);};
  const startEdit=(d:any)=>{const o:any={};formFields.forEach(([k]:any)=>{o[k]=d[k]||"";});setEditF(o);setEditId(d.id);};
  const saveEdit=()=>{if(onEdit)onEdit(editId,editF);setEditId(null);setEditF({});};
  const actCol=onExit?"95px":(onConfirm?"82px":(onEdit?"60px":"30px"));
  return(
    <div className="diff-block" style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div className="diff-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:titleBg||"#F5F5F3",borderBottom:"1px solid #E5E5E3"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,fontWeight:700,color:"#1A1A1A"}}>{title}</span>
          <span style={{fontSize:10,fontWeight:600,color:"#666"}}>{count}</span>
        </div>
        {user.role !== 'lecteur' && <button onClick={()=>{setOpen(!open);setF(initForm);}} style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${color}`,background:open?color:"transparent",color:open?"#fff":color,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{open?"Annuler":"+"}</button>}
      </div>
      {open&&(
        <div className="diff-form" style={{padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3"}}>
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
      <div className="diff-head" style={{display:"grid",gridTemplateColumns:cols+" "+actCol,padding:"6px 12px",background:"#FAFAF8",borderBottom:"1px solid #EDEDEB",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>
        {heads.map((h:string,i:number)=><span key={i}>{h}</span>)}<span></span>
      </div>
      <div style={{maxHeight:maxH,overflowY:"auto"}}>
        {data.length===0?<div style={{padding:14,textAlign:"center",color:"#DDD",fontSize:11}}>Aucun element</div>:
        data.map((d:any,i:number)=>(
          <div key={d.id??d.im??i} className="diff-row" style={editId===d.id?{padding:"8px 12px",borderBottom:"1px solid #F5F5F3",background:"#FAFAF8"}:{display:"grid",gridTemplateColumns:cols+" "+actCol,padding:"5px 12px",borderBottom:"1px solid #F5F5F3",fontSize:11,alignItems:"center"}}>
            {editId===d.id?<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>{formFields.map(([k,l,p,opts]:any)=>(
              <div key={k} style={{flex:"1 1 80px",minWidth:70}}>
                <div style={{fontSize:9,fontWeight:600,color:"#888",marginBottom:2}}>{l}</div>
                {opts
                  ?<select value={editF[k]||opts[0]} onChange={e=>setEditF({...editF,[k]:e.target.value})} style={{...iS,width:"100%",fontSize:10,padding:"5px 6px",background:"#fff"}}>{opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>
                  :<input value={editF[k]||""} onChange={e=>setEditF({...editF,[k]:e.target.value})} placeholder={p} style={{...iS,width:"100%",fontSize:10,padding:"5px 6px",background:"#fff"}}/>
                }
              </div>
            ))}<button onClick={saveEdit} style={{padding:"5px 12px",borderRadius:5,border:"none",background:"#1E8A52",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",height:28}}>OK</button><button onClick={()=>setEditId(null)} style={{padding:"5px 10px",borderRadius:5,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:10,cursor:"pointer",fontFamily:"inherit",height:28}}>Annuler</button></div>
            :<>{renderRow(d,i)}
            <span style={{display:"inline-flex",gap:2,justifyContent:"flex-end"}}>
              {delId===(useIdx?i:d.id)
                ?<button onClick={()=>{onDel(useIdx?i:d.id);setDelId(null);}} style={{padding:"1px 5px",borderRadius:3,border:"none",background:"#C0392B",color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Oui</button>
                :<>{onExit&&user.role!=='lecteur'&&<button title="Sortir du garage → mettre en dispo" onClick={()=>onExit(useIdx?i:d.id)} style={{padding:"1px 6px",borderRadius:3,border:"1px solid #E8633A",background:"#FFF1EB",color:"#E8633A",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sortir</button>}{onConfirm&&user.role!=='lecteur'&&<button title="Confirmer en départ réel" onClick={()=>onConfirm(useIdx?i:d.id)} style={{padding:"1px 5px",borderRadius:3,border:"1px solid #1E8A52",background:"#E8F8F0",color:"#1E8A52",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#10003;</button>}{onEdit&&user.role!=='lecteur'&&<button onClick={()=>startEdit(d)} style={{padding:"1px 4px",borderRadius:3,border:"1px solid #E8E8E5",background:"#fff",color:"#3A9BD5",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>&#9998;</button>}<button onClick={()=>setDelId(useIdx?i:d.id)} style={{padding:"1px 5px",borderRadius:3,border:"1px solid #E8E8E5",background:"#fff",color:"#CCC",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>×</button></>
              }
            </span></>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ ADDBOX ═══ */
export function AddBox({fields,form,setForm,onAdd,extra}:any){
  return <div className="ani" style={{background:"#fff",borderRadius:8,padding:14,border:"1px solid #E5E5E3",marginBottom:10}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
      {fields.map(([l,k,p]:any)=><div key={k}><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div><input value={form[k]||""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[k]:e.target.value})} placeholder={p} style={{...iS,width:"100%",background:"#FAFAF8"}}/></div>)}
      {extra}
    </div>
    <button onClick={onAdd} style={{marginTop:10,padding:"7px 18px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Ajouter</button>
  </div>;
}

/* ═══ CRUDP ═══ */
export function CrudP({title,color,data,type,showAdd,setShowAdd,fields,form,setForm,addItem,delItem,editItem,exitItem,cols,heads,rr,useIdx,user}:any){
  const open=showAdd===type;
  const [formErr,setFormErr]=useState("");
  const [delConfirm,setDelConfirm]=useState<any>(null);
  const [editId,setEditId]=useState<any>(null);
  const [editF,setEditF]=useState<any>({});
  const initDefaults=()=>{const o:any={};fields.forEach(([,k,,opts]:any)=>{if(opts)o[k]=opts[0];});return o;};
  const startEdit=(d:any)=>{const o:any={};fields.forEach(([,k]:any)=>{o[k]=d[k]||"";});setEditF(o);setEditId(d.id);};
  const saveEdit=()=>{if(editItem)editItem(type,editId,editF);setEditId(null);setEditF({});};
  return <div className="ani">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A"}}>{title} <span style={{fontSize:11,color:"#BBB",fontWeight:400}}>{data.length}</span></div>
      {user.role!=='lecteur' && <button onClick={()=>{open?setShowAdd(null):setShowAdd(type);setForm(initDefaults());setFormErr("");}} style={oBtn(color,open)}>{open?"Annuler":"+ Ajouter"}</button>}
    </div>
    {open&&<div className="ani" style={{background:"#fff",borderRadius:8,padding:14,border:"1px solid #E5E5E3",marginBottom:10}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
        {fields.map(([l,k,p,opts]:any)=><div key={k}><div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:3}}>{l}</div>
          {opts?<select value={form[k]||opts[0]} onChange={(e:React.ChangeEvent<HTMLSelectElement>)=>setForm({...form,[k]:e.target.value})} style={{...iS,width:"100%",background:"#FAFAF8"}}>{opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>
          :<input value={form[k]||""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setForm({...form,[k]:e.target.value});setFormErr("");}} placeholder={p} style={{...iS,width:"100%",background:"#FAFAF8"}}/>}
        </div>)}
      </div>
      {formErr&&<div style={{fontSize:11,color:"#C0392B",marginTop:6}}>{formErr}</div>}
      <button onClick={()=>{const req=type==="vacs"?form.ch:type==="pros"?form.nom:type==="users"?form.username:form.im;if(!req?.trim()){setFormErr("Veuillez remplir les champs obligatoires (*)");return;}setFormErr("");addItem(type,{...form,im:form.im?.toUpperCase().trim()});}} style={{marginTop:10,padding:"7px 18px",borderRadius:6,border:"none",background:"#1A1A1A",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Ajouter</button>
    </div>}
    <div className="diff-block" style={{background:"#fff",borderRadius:8,border:"1px solid #E5E5E3",overflow:"hidden"}}>
      <div className="diff-head" style={{display:"grid",gridTemplateColumns:cols,padding:"8px 12px",background:"#FAFAF8",borderBottom:"1px solid #E5E5E3",fontSize:9,fontWeight:700,color:"#AAA",letterSpacing:.8,textTransform:"uppercase"}}>{heads.map((h:string,i:number)=><span key={i}>{h}</span>)}</div>
      <div style={{maxHeight:420,overflowY:"auto"}}>
        {data.map((d:any,i:number)=><div key={useIdx?i:d.id} className="rw" style={{display:"grid",gridTemplateColumns:cols,padding:"7px 12px",borderBottom:"1px solid #F5F5F3",alignItems:"center",fontSize:12}}>
          {editId===d.id?<>{fields.map(([l,k,p,opts]:any)=><span key={k}>{opts
            ?<select value={editF[k]||opts[0]} onChange={e=>setEditF({...editF,[k]:e.target.value})} style={{...iS,width:"100%",fontSize:10,padding:"3px 5px"}}>{opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>
            :<input value={editF[k]||""} onChange={e=>setEditF({...editF,[k]:e.target.value})} placeholder={p||l} style={{...iS,width:"100%",fontSize:10,padding:"3px 5px"}}/>
          }</span>)}<span style={{display:"inline-flex",gap:2,justifyContent:"flex-end"}}><button onClick={saveEdit} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#1E8A52",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>OK</button><button onClick={()=>setEditId(null)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>X</button></span></>
          :<>{rr(d)}
          {user.role!=='lecteur'&&<span style={{display:"inline-flex",gap:2,justifyContent:"flex-end"}}>{delConfirm===(useIdx?i:d.id)?<span style={{display:"inline-flex",gap:2}}><button onClick={()=>{delItem(type,useIdx?i:d.id,useIdx);setDelConfirm(null);}} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#C0392B",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Oui</button><button onClick={()=>setDelConfirm(null)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Non</button></span>:<>{exitItem&&<button title="Sortir du garage → mettre en dispo" onClick={()=>exitItem(type,useIdx?i:d.id,useIdx)} style={{padding:"2px 8px",borderRadius:4,border:"1px solid #E8633A",background:"#FFF1EB",color:"#E8633A",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sortir</button>}{editItem&&<button className="dl" onClick={()=>startEdit(d)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#3A9BD5",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Editer</button>}<button className="dl" onClick={()=>setDelConfirm(useIdx?i:d.id)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid #E8E8E5",background:"#fff",color:"#BBB",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retirer</button></>}</span>}</>}
        </div>)}
        {data.length===0&&<div style={{padding:24,textAlign:"center",color:"#CCC",fontSize:11}}>Aucun element</div>}
      </div>
    </div>
  </div>;
}