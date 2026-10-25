import React,{useRef,useState} from 'react';
const EXERCISES={
 costas:['Puxada alta na polia','Barra fixa','Remada curvada','Remada apoiada','Remada unilateral','Pulldown com braços retos'],
 peito:['Supino reto','Supino inclinado','Crucifixo com halteres','Crossover na polia','Flexão de braços'],
 ombros:['Elevação lateral','Desenvolvimento com halteres','Crucifixo inverso','Elevação frontal','Face pull'],
 trapezio:['Encolhimento com halteres','Encolhimento com barra','Remada alta','Face pull'],
 biceps:['Rosca direta','Rosca alternada','Rosca martelo','Rosca Scott'],
 triceps:['Tríceps na polia','Tríceps francês','Tríceps testa','Mergulho em banco'],
 abdomen:['Prancha','Abdominal na polia','Elevação de pernas','Abdominal reverso'],
 gluteos:['Elevação pélvica','Agachamento livre','Afundo','Cadeira abdutora'],
 quadriceps:['Agachamento livre','Leg press','Cadeira extensora','Afundo','Hack squat'],
 posterior:['Mesa flexora','Stiff / terra romeno','Cadeira flexora','Good morning'],
 panturrilhas:['Panturrilha em pé','Panturrilha sentado','Panturrilha no leg press']
};
const LABELS={costas:'Costas',peito:'Peito',ombros:'Ombros',trapezio:'Trapézio',biceps:'Bíceps',triceps:'Tríceps',abdomen:'Abdômen',gluteos:'Glúteos',quadriceps:'Quadríceps',posterior:'Posterior de coxa',panturrilhas:'Panturrilhas'};
const num=(v,f)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:f};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const shape=(x,y,z,rx,ry,rz,muscle,side='')=>({x,y,z,rx,ry,rz,muscle,side});
export default function MuscleAvatar360({measurements,onChooseExercise,compact=false,angle:externalAngle,onAngleChange}){
 const [internalAngle,setInternalAngle]=useState(0),[selected,setSelected]=useState('ombros'),drag=useRef(null);const angle=externalAngle??internalAngle;const setAngle=fn=>{const value=typeof fn==='function'?fn(angle):fn;if(onAngleChange)onAngleChange(value);else setInternalAngle(value)};
 const m=measurements||{},shoulder=clamp(num(m.shoulders,112)/112,.77,1.35),chest=clamp(num(m.chest,98)/98,.75,1.3),waist=clamp(num(m.waist,82)/82,.75,1.4),hip=clamp(num(m.hips,95)/95,.78,1.3),arm=clamp(num(m.arm,33)/33,.7,1.5),thigh=clamp(num(m.thigh,55)/55,.7,1.4),calf=clamp(num(m.calf,36)/36,.7,1.4),height=clamp(num(m.height,175)/175,.85,1.12);
 const parts=[
 shape(0,40,0,20,25,18,null),shape(0,69,0,9,11,9,null),
 shape(0,115,0,40*chest,44,19*chest,'peito'),
 shape(0,171,0,31*waist,35,17*waist,'abdomen'),
 shape(0,220,-4,35*hip,27,23*hip,'gluteos'),
 shape(0,114,-16,43*shoulder,41,13,'costas'),
 shape(0,89,-15,29,13,12,'trapezio')
 ];
 for(const side of [-1,1]){
  parts.push(shape(side*47*shoulder,96,0,18*shoulder,18,17,'ombros',side));
  parts.push(shape(side*(50*shoulder+6),139,1,12*arm,26,12*arm,'biceps',side));
  parts.push(shape(side*(50*shoulder+6),143,-8,11*arm,24,10*arm,'triceps',side));
  parts.push(shape(side*(50*shoulder+7),193,0,9*arm,29,9*arm,null));
  parts.push(shape(side*21*hip,274,0,18*thigh,49,18*thigh,'quadriceps',side));
  parts.push(shape(side*21*hip,279,-10,16*thigh,43,13*thigh,'posterior',side));
  parts.push(shape(side*21*hip,344,0,11*calf,34,12*calf,'panturrilhas',side));
  parts.push(shape(side*21*hip,380,8,15,7,23,null));
 }
 const rad=angle*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad);
 const project=p=>{const px=p.x*cos+p.z*sin,depth=-p.x*sin+p.z*cos,scale=1+depth/950;return {...p,px:140+px*scale,py:18+p.y*height*scale,depth,ww:Math.sqrt((p.rx*cos)**2+(p.rz*sin)**2)*scale,hh:p.ry*height*scale}};
 const sorted=parts.map(project).sort((a,b)=>a.depth-b.depth);
 const down=e=>{drag.current={x:e.clientX,angle};e.currentTarget.setPointerCapture(e.pointerId)};
 const move=e=>{if(drag.current)setAngle(((drag.current.angle+(e.clientX-drag.current.x)*1.3)%360+360)%360)};
 const up=()=>{drag.current=null};
 const visibleLabel=angle<45||angle>315?'Frente':angle<135?'Lado esquerdo':angle<225?'Costas':'Lado direito';
 return <><div className={'avatar-viewer'+(compact?' avatar-compact':'')}><div className="avatar-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Avatar corporal tridimensional esquemático, arraste para girar">
 <svg viewBox="0 0 280 465" role="img" aria-label="Avatar 360 graus; toque nos músculos para consultar exercícios">
 <defs><radialGradient id="muscleBody"><stop offset="0" stopColor="#b4d9e0"/><stop offset="1" stopColor="#527f92"/></radialGradient></defs>
 <ellipse cx="140" cy="449" rx="70" ry="9" fill="#07111e" opacity=".6"/>
 {sorted.map((p,i)=><ellipse key={i} cx={p.px} cy={p.py} rx={Math.max(3,p.ww)} ry={Math.max(4,p.hh)} fill={p.muscle===selected?'#f2c43d':p.muscle?'url(#muscleBody)':'#799eae'} stroke={p.muscle===selected?'#fff0b4':'#345d73'} strokeWidth={p.muscle===selected?2.5:1.3} opacity={p.muscle===selected?1:.95} onClick={e=>{e.stopPropagation();if(p.muscle)setSelected(p.muscle)}} style={{cursor:p.muscle?'pointer':'grab'}}><title>{p.muscle?LABELS[p.muscle]:'Corpo'}</title></ellipse>)}
 </svg></div>{!compact&&<div className="avatar-turn"><button className="outline" type="button" onClick={()=>setAngle(a=>(a+315)%360)}>↶ 45°</button><strong>{visibleLabel}</strong><button className="outline" type="button" onClick={()=>setAngle(a=>(a+45)%360)}>45° ↷</button></div><input aria-label="Girar avatar em 360 graus" className="avatar-angle" type="range" min="0" max="359" value={Math.round(angle)} onChange={e=>setAngle(Number(e.target.value))}/><small className="hint">Arraste o avatar ou use o controle para girar 360°. Toque em uma região muscular.</small></div>}
 {!compact&&<section className="muscle-picker"><h2>Escolha um grupo muscular</h2><div className="muscle-chips">{Object.keys(EXERCISES).map(k=><button type="button" key={k} className={selected===k?'active':''} onClick={()=>setSelected(k)}>{LABELS[k]}</button>)}</div><h2 className="accent">{LABELS[selected]} — exercícios</h2>{EXERCISES[selected].map(name=><div className="line" key={name}><span>{name}</span>{onChooseExercise&&<button className="outline" type="button" onClick={()=>onChooseExercise(name,selected)}>Adicionar</button>}</div>)}</section>}
 </>;
}