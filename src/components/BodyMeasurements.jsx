import React,{useState} from 'react';
const fields=[['height','Altura','cm'],['weight','Peso','kg'],['shoulders','Ombros (circunferência)','cm'],['chest','Peito','cm'],['waist','Cintura','cm'],['hips','Quadril','cm'],['arm','Braço (contraído)','cm'],['thigh','Coxa','cm'],['calf','Panturrilha','cm']];
const empty=()=>Object.fromEntries(fields.map(([key])=>[key,'']));
const number=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)&&n>0?n:null};
const fmt=v=>v==null?'—':v.toLocaleString('pt-BR',{maximumFractionDigits:1});
function BodyAvatar({m}) {
 const n=k=>number(m?.[k]);
 const height=n('height')||175,shoulders=n('shoulders')||112,chest=n('chest')||98,waist=n('waist')||82,hips=n('hips')||95,arm=n('arm')||32,thigh=n('thigh')||55,calf=n('calf')||36;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 // Relative illustrative widths, not anatomical reconstruction.
 const shoulderW=clamp(shoulders/2.65,32,60),chestW=clamp(chest/2.65,28,54),waistW=clamp(waist/2.65,23,49),hipW=clamp(hips/2.65,27,51);
 const armW=clamp(arm/3.7,7,16),thighW=clamp(thigh/3.2,12,23),calfW=clamp(calf/3.3,8,15),scale=clamp(height/175,.88,1.1);
 const torso=`M ${120-shoulderW} 91 Q ${120-chestW} 112 ${120-chestW} 133 L ${120-waistW} 192 Q ${120-hipW} 212 ${120-hipW} 226 L ${120+hipW} 226 Q ${120+hipW} 212 ${120+waistW} 192 L ${120+chestW} 133 Q ${120+chestW} 112 ${120+shoulderW} 91 Z`;
 return <svg viewBox="0 0 240 400" role="img" aria-label="Avatar frontal ilustrativo com proporções aproximadas das medidas registradas" style={{width:'100%',maxWidth:310,height:390,display:'block',margin:'auto'}}>
 <defs><linearGradient id="bodyTone" x1="0" x2="1"><stop offset="0" stopColor="#88b7c4"/><stop offset=".5" stopColor="#b5d8df"/><stop offset="1" stopColor="#5f93a8"/></linearGradient></defs>
 <g transform={`translate(120 0) scale(${scale} 1) translate(-120 0)`} fill="url(#bodyTone)" stroke="#31566a" strokeWidth="1.8" strokeLinejoin="round">
 <ellipse cx="120" cy="47" rx="22" ry="29"/><rect x="110" y="72" width="20" height="20" rx="5"/>
 <path d={torso}/>
 <path d={`M ${120-shoulderW} 94 Q ${120-shoulderW-armW-7} 102 ${120-shoulderW-armW} 132 L ${120-shoulderW-armW-5} 190 Q ${120-shoulderW-armW} 208 ${120-shoulderW-4} 194 L ${120-shoulderW+5} 139 Z`}/>
 <path d={`M ${120+shoulderW} 94 Q ${120+shoulderW+armW+7} 102 ${120+shoulderW+armW} 132 L ${120+shoulderW+armW+5} 190 Q ${120+shoulderW+armW} 208 ${120+shoulderW+4} 194 L ${120+shoulderW-5} 139 Z`}/>
 <path d={`M ${120-hipW} 224 L ${120-8} 224 L ${120-7} 307 L ${120-thighW-3} 308 Z`}/>
 <path d={`M ${120+hipW} 224 L ${120+8} 224 L ${120+7} 307 L ${120+thighW+3} 308 Z`}/>
 <path d={`M ${120-thighW-3} 309 L ${120-7} 309 L ${120-8} 372 L ${120-calfW-11} 372 Z`}/>
 <path d={`M ${120+thighW+3} 309 L ${120+7} 309 L ${120+8} 372 L ${120+calfW+11} 372 Z`}/>
 </g><g stroke="#f2c43d" strokeDasharray="3 4" strokeWidth="1" opacity=".8"><line x1={120-chestW} y1="135" x2={120+chestW} y2="135"/><line x1={120-waistW} y1="191" x2={120+waistW} y2="191"/></g>
 <g fontSize="10" fill="#f4d66e"><text x="6" y="132">Peito</text><text x="6" y="190">Cintura</text></g></svg>;
}
export default function BodyMeasurements({records=[],onSave,onDelete}){
 const [draft,setDraft]=useState(empty),[when,setWhen]=useState(new Date().toISOString().slice(0,10)),[selected,setSelected]=useState('latest');
 const sorted=[...records].sort((a,b)=>new Date(b.date)-new Date(a.date)),current=selected==='latest'?sorted[0]:sorted.find(x=>x.id===selected)||sorted[0],previous=sorted.find(x=>x.id!==current?.id);
 const ratio=number(current?.shoulders)&&number(current?.waist)?number(current.shoulders)/number(current.waist):null;
 function save(e){e.preventDefault();if(!fields.some(([k])=>number(draft[k]))){alert('Informe ao menos uma medida.');return}const values={};for(const [k] of fields){if(draft[k]!==''&&number(draft[k])===null){alert('Corrija a medida: '+k);return}values[k]=number(draft[k])}onSave({id:String(Date.now()),date:when+'T12:00:00',...values});setDraft(empty());setSelected('latest')}
 return <><h1>Medidas corporais</h1><p>Registre suas medidas e acompanhe o shape em V. O avatar é uma representação proporcional ilustrativa, não uma reprodução exata do seu corpo.</p>
 <section className="card"><h2>Avatar corporal</h2>{sorted.length?<><label className="hint">Medição exibida</label><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="latest">Mais recente</option>{sorted.map(r=><option key={r.id} value={r.id}>{new Date(r.date).toLocaleDateString('pt-BR')}</option>)}</select></>:<p>Cadastre suas primeiras medidas para personalizar o avatar.</p>}
 <BodyAvatar m={current}/>{ratio&&<div className="stat"><small>Relação circunferência ombros / cintura</small><strong>{ratio.toFixed(2).replace('.',',')}</strong></div>}
 {current&&previous&&<div className="line"><span>Variação da cintura desde a medição anterior</span><b>{number(current.waist)&&number(previous.waist)?fmt(number(current.waist)-number(previous.waist))+' cm':'—'}</b></div>}</section>
 <form className="card" onSubmit={save}><h2>Nova medição</h2><label className="hint">Data<input className="formfield" type="date" value={when} max={new Date().toISOString().slice(0,10)} onChange={e=>setWhen(e.target.value)} required/></label><div className="measurement-grid">{fields.map(([key,label,unit])=><label className="hint" key={key}>{label} ({unit})<input className="formfield" inputMode="decimal" type="text" placeholder="Ex.: 90,5" value={draft[key]} onChange={e=>setDraft(v=>({...v,[key]:e.target.value}))}/></label>)}</div><button className="primary full" type="submit">Salvar medidas</button></form>
 <section className="card"><h2>Histórico de medições</h2>{sorted.length===0?<p>Nenhuma medição salva.</p>:sorted.map(r=><div className="line" key={r.id}><span>{new Date(r.date).toLocaleDateString('pt-BR')}<small className="report-sub">Peso {fmt(number(r.weight))} kg · Cintura {fmt(number(r.waist))} cm · Ombros {fmt(number(r.shoulders))} cm</small></span><button className="outline" onClick={()=>{if(confirm('Excluir esta medição?'))onDelete(r.id)}}>Excluir</button></div>)}</section>
 </>;
}