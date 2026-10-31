import React,{useState} from 'react';

const FIELDS=[['weight','Peso','kg'],['height','Altura','cm'],['neck','Pescoço','cm'],['shoulders','Ombros','cm'],['chest','Peito','cm'],['waist','Cintura','cm'],['abdomen','Abdômen','cm'],['hips','Quadril','cm'],['armLeft','Braço esquerdo','cm'],['armRight','Braço direito','cm'],['forearmLeft','Antebraço esquerdo','cm'],['forearmRight','Antebraço direito','cm'],['thighLeft','Coxa esquerda','cm'],['thighRight','Coxa direita','cm'],['calfLeft','Panturrilha esquerda','cm'],['calfRight','Panturrilha direita','cm']];
const today=()=>{const x=new Date();return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')};
const empty=()=>({date:today(),values:Object.fromEntries(FIELDS.map(([k])=>[k,'']))});
const fmtDate=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))return x||'—';const [y,m,d]=x.split('-');return d+'/'+m+'/'+y};
const numeric=x=>{if(x==null||String(x).trim()==='')return null;const n=Number(String(x).replace(',','.'));return Number.isFinite(n)&&n>0&&n<1000?Math.round(n*100)/100:NaN};
const fmt=(x,u)=>x==null?'—':Number(x).toLocaleString('pt-BR',{maximumFractionDigits:2})+' '+u;

function Trend({records,field}) {
 const points=[...records].filter(r=>Number.isFinite(r.values?.[field])&&r.values[field]>0).sort((a,b)=>a.date.localeCompare(b.date));
 if(points.length<2)return <p className="hint">Registre esta medida em duas datas para visualizar a evolução.</p>;
 let min=Math.min(...points.map(x=>x.values[field])),max=Math.max(...points.map(x=>x.values[field]));const pad=Math.max((max-min)*.2,.5);min-=pad;max+=pad;
 const xy=points.map((p,i)=>[40+i*280/(points.length-1),160-((p.values[field]-min)/(max-min))*125]);
 return <svg viewBox="0 0 340 205" role="img" aria-label="Gráfico de evolução corporal" style={{width:'100%',maxHeight:260}}>
 <line x1="40" y1="24" x2="40" y2="171" stroke="#52647a"/><line x1="40" y1="171" x2="326" y2="171" stroke="#52647a"/>
 {[0,.5,1].map(v=><g key={v}><line x1="40" y1={160-v*125} x2="326" y2={160-v*125} stroke="#38495c" strokeDasharray="3 5"/><text x="35" y={164-v*125} textAnchor="end" fontSize="9" fill="#adbed3">{(min+v*(max-min)).toFixed(1)}</text></g>)}
 <polyline fill="none" stroke="#f2c43d" strokeWidth="3" points={xy.map(([x,y])=>x+','+y).join(' ')}/>
 {xy.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill="#f2c43d"/>)}
 <text x="40" y="191" fontSize="10" fill="#afbed0">{fmtDate(points[0].date)}</text><text x="320" y="191" textAnchor="end" fontSize="10" fill="#afbed0">{fmtDate(points.at(-1).date)}</text>
 </svg>
}
export default function BodyMeasurements({records=[],onSave,onDelete,goals={},onSaveGoals}) {
 const [draft,setDraft]=useState(empty),[editing,setEditing]=useState(null),[showForm,setShowForm]=useState(false),[metric,setMetric]=useState('weight');
 const [goalDraft,setGoalDraft]=useState(null),[editingGoals,setEditingGoals]=useState(false);
 const sorted=[...records].sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||'').localeCompare(a.createdAt||'')),latest=sorted[0],previous=sorted[1];
 // Latest known measurement per field: incomplete newer records must not erase older known values.
 const current=Object.fromEntries(FIELDS.map(([key])=>[key,sorted.find(r=>Number.isFinite(r.values?.[key])&&r.values[key]>0)?.values[key]??null]));
 const startGoals=()=>{setGoalDraft(Object.fromEntries(FIELDS.map(([key])=>[key,goals?.[key]==null?'':String(goals[key])])));setEditingGoals(true)};
 const saveGoals=e=>{
  e.preventDefault();
  const next=Object.fromEntries(FIELDS.map(([key])=>[key,numeric(goalDraft[key])]));
  if(Object.values(next).some(Number.isNaN)){alert('Confira as metas. Use medidas positivas com vírgula ou ponto.');return}
  onSaveGoals(Object.fromEntries(Object.entries(next).filter(([,v])=>v!==null)));
  setEditingGoals(false);setGoalDraft(null);
 };
 const goalFields=FIELDS.filter(([key])=>goals?.[key]!=null);
 const difference=(actual,target,unit)=>{
  if(actual==null)return 'Registre a medida atual';
  const value=Math.round((target-actual)*100)/100;
  if(Math.abs(value)<.005)return 'Meta alcançada';
  return (value>0?'+':'')+value.toLocaleString('pt-BR',{maximumFractionDigits:2})+' '+unit+' até a meta';
 };
 const newEntry=()=>{setDraft(empty());setEditing(null);setShowForm(true)};
 const edit=r=>{setDraft({date:r.date,values:Object.fromEntries(FIELDS.map(([k])=>[k,r.values?.[k]==null?'':String(r.values[k])]))});setEditing(r.id);setShowForm(true);window.scrollTo({top:0,behavior:'smooth'})};
 const submit=e=>{e.preventDefault();if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)){alert('Informe uma data válida.');return}
 const values=Object.fromEntries(FIELDS.map(([k])=>[k,numeric(draft.values[k])]));if(Object.values(values).some(Number.isNaN)){alert('Informe apenas valores positivos válidos.');return}
 if(Object.values(values).every(v=>v===null)){alert('Preencha pelo menos uma medida.');return}
 const old=records.find(x=>x.id===editing);onSave({id:editing||Date.now()+'-'+Math.random().toString(36).slice(2,8),date:draft.date,createdAt:old?.createdAt||new Date().toISOString(),values});setShowForm(false);setEditing(null)};
 return <><h1>Medidas corporais</h1><p>Registre seu peso e medidas para acompanhar sua evolução. Sem boneco 3D.</p>
 <button className="primary" onClick={newEntry}>+ Adicionar medidas</button>
 <section className="card">
  <div className="line"><h2>Medidas atuais e metas</h2><button className="outline" onClick={startGoals}>Editar metas</button></div>
  <p className="hint">A medida atual é o último valor registrado para cada parte do corpo. A meta é definida por você.</p>
  {editingGoals&&<form onSubmit={saveGoals}>
   <h2>Definir minhas metas</h2>
   <div className="measurement-grid">{FIELDS.map(([key,label,unit])=><label className="hint" key={key}>{label} ({unit})<input className="formfield" type="text" inputMode="decimal" placeholder="Sem meta" value={goalDraft?.[key]??''} onChange={e=>setGoalDraft(d=>({...d,[key]:e.target.value}))}/></label>)}</div>
   <p className="hint">Deixe em branco para não definir uma meta. Você pode mudar ou remover metas quando quiser.</p>
   <div className="filters"><button type="submit" className="primary">Salvar metas</button><button type="button" className="outline" onClick={()=>{setEditingGoals(false);setGoalDraft(null)}}>Cancelar</button></div>
  </form>}
  <div className="measure-target-list">
   {FIELDS.filter(([key])=>current[key]!=null||goals?.[key]!=null).map(([key,label,unit])=><div className="measure-target-row" key={key}>
    <strong>{label}</strong>
    <div className="measure-target-pair"><span>Atual <b>{fmt(current[key],unit)}</b></span><span>Meta <b>{fmt(goals?.[key],unit)}</b></span></div>
    {goals?.[key]!=null&&<small className={current[key]!=null&&Math.abs(goals[key]-current[key])<.005?'measure-goal-hit':'hint'}>{difference(current[key],goals[key],unit)}</small>}
   </div>)}
   {!FIELDS.some(([key])=>current[key]!=null||goals?.[key]!=null)&&<p className="hint">Registre suas medidas atuais ou defina metas para começar a comparação.</p>}
  </div>
 </section>
 {showForm&&<form className="card" onSubmit={submit}><h2>{editing?'Editar medição':'Nova medição'}</h2><label className="hint">Data<input className="formfield" type="date" required value={draft.date} onChange={e=>setDraft(d=>({...d,date:e.target.value}))}/></label>
 <div className="measurement-grid">{FIELDS.map(([k,label,unit])=><label className="hint" key={k}>{label} ({unit})<input className="formfield" type="text" inputMode="decimal" placeholder="Opcional" value={draft.values[k]??''} onChange={e=>setDraft(d=>({...d,values:{...d.values,[k]:e.target.value}}))}/></label>)}</div>
 <p className="hint">Você pode preencher somente as medidas que realizou. Meça sempre nas mesmas condições.</p>
 <div className="filters"><button className="primary" type="submit">Salvar medidas</button><button className="outline" type="button" onClick={()=>setShowForm(false)}>Cancelar</button></div></form>}
 {!latest?<section className="card"><h2>Comece seu histórico</h2><p>Nenhum registro ainda. Cadastre sua primeira medição.</p></section>:<>
 <section className="card"><h2>Último registro · {fmtDate(latest.date)}</h2><div className="stats">{FIELDS.filter(([k])=>latest.values?.[k]!=null).slice(0,8).map(([k,label,unit])=><div className="stat" key={k}><small>{label}</small><strong>{fmt(latest.values[k],unit)}</strong>{previous?.values?.[k]!=null&&<small>Variação: {(latest.values[k]-previous.values[k]>0?'+':'')+(latest.values[k]-previous.values[k]).toFixed(1)} {unit}</small>}</div>)}</div></section>
 <section className="card"><h2>Gráfico de evolução</h2><select aria-label="Selecionar medida do gráfico" value={metric} onChange={e=>setMetric(e.target.value)}>{FIELDS.map(([k,label,u])=><option key={k} value={k}>{label} ({u})</option>)}</select><Trend records={sorted} field={metric}/></section>
 <section className="card"><h2>Histórico de medidas</h2>{sorted.map(r=><details key={r.id} style={{borderBottom:'1px solid #34475a',padding:'12px 0'}}><summary>{fmtDate(r.date)}</summary>
 {FIELDS.filter(([k])=>r.values?.[k]!=null).map(([k,label,u])=><div className="line" key={k}><span>{label}</span><strong>{fmt(r.values[k],u)}</strong></div>)}
 <div className="filters"><button className="outline" onClick={()=>edit(r)}>Editar</button><button className="outline" onClick={()=>{if(confirm('Excluir medidas de '+fmtDate(r.date)+'?'))onDelete(r.id)}}>Excluir</button></div></details>)}</section>
 </>}
 <p className="hint">Medidas salvas neste navegador, incluídas no backup JSON. Para trocar de celular, exporte e importe seu backup.</p></>;
}
