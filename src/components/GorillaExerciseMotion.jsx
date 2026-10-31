import React,{useEffect,useRef,useState} from 'react';

// Movimento esquemático em SVG. Não representa biomecânica validada.
const P={
 row:{a:[[151,233,130,279],[249,233,270,279]],b:[[149,225,178,251],[251,225,222,251]],leg:'stand',label:'Puxar / retornar'},
 bench:{a:[[163,190,136,240],[237,190,264,240]],b:[[163,162,184,118],[237,162,216,118]],leg:'bench',label:'Empurrar / descer'},
 lateral:{a:[[159,219,139,285],[241,219,261,285]],b:[[113,207,73,213],[287,207,327,213]],leg:'stand',label:'Elevar / abaixar'},
 shrug:{a:[[151,230,146,301],[249,230,254,301]],b:[[151,210,146,280],[249,210,254,280]],leg:'stand',label:'Elevar / abaixar ombros',liftBody:true},
 curl:{a:[[151,237,139,291],[249,237,261,291]],b:[[151,237,158,200],[249,237,242,200]],leg:'stand',label:'Flexionar / estender cotovelos'},
 pushdown:{a:[[154,222,166,238],[246,222,234,238]],b:[[154,241,162,298],[246,241,238,298]],leg:'stand',label:'Estender / flexionar cotovelos'},
 squat:{a:[[152,237,151,288],[248,237,249,288]],b:[[152,270,151,322],[248,270,249,322]],leg:'squat',label:'Descer / subir',shift:48},
 legpress:{a:[[150,227,154,264],[250,227,246,264]],b:[[150,227,154,264],[250,227,246,264]],leg:'legpress',label:'Empurrar / flexionar joelhos'},
 hinge:{a:[[153,240,155,294],[247,240,245,294]],b:[[153,263,155,309],[247,263,245,309]],leg:'hinge',label:'Quadril para trás / estender',tilt:22},
 legcurl:{a:[[150,231,149,285],[250,231,251,285]],b:[[150,231,149,285],[250,231,251,285]],leg:'legcurl',label:'Flexionar / estender joelhos'},
 calf:{a:[[154,240,147,290],[246,240,253,290]],b:[[154,240,147,290],[246,240,253,290]],leg:'calf',label:'Calcanhares sobem / descem',shift:-16},
 overhead:{a:[[154,203,158,163],[246,203,242,163]],b:[[151,133,147,83],[249,133,253,83]],leg:'stand',label:'Empurrar / descer'},
 reversefly:{a:[[157,243,171,272],[243,243,229,272]],b:[[115,210,79,217],[285,210,321,217]],leg:'hinge',label:'Abrir / fechar braços',tilt:16},
 crunch:{a:[[150,223,164,274],[250,223,236,274]],b:[[150,223,164,274],[250,223,236,274]],leg:'crunch',label:'Contrair / retornar',shift:12},
 overheadtriceps:{a:[[164,132,184,195],[236,132,216,195]],b:[[159,126,180,78],[241,126,220,78]],leg:'stand',label:'Estender / flexionar cotovelos'},
 legextension:{a:[[150,239,147,286],[250,239,253,286]],b:[[150,239,147,286],[250,239,253,286]],leg:'legextension',label:'Estender / flexionar joelhos'}
};
const path=(start,elbow,wrist)=>'M '+start[0]+' '+start[1]+' L '+elbow[0]+' '+elbow[1]+' L '+wrist[0]+' '+wrist[1];
function AnimPath({from,to,stroke='#4a4f62',width=29}){
 return <path d={from} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"><animate attributeName="d" dur="3.8s" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" keyTimes="0;.5;1" values={from+';'+to+';'+from} repeatCount="indefinite"/></path>;
}
function Legs({mode}){
 const grey='#363b4c',line='#171b27';
 if(mode==='bench'||mode==='crunch')return <g><rect x="68" y="320" width="260" height="16" rx="6" fill="#6c7180"/><path d="M146 294 L139 321 L131 360 M247 294 L266 319 L291 355" fill="none" stroke={grey} strokeWidth="31" strokeLinecap="round"/><path d="M142 328 V375 M269 328 V375" stroke="#66738a" strokeWidth="8"/></g>;
 if(mode==='squat')return <g><path d="M176 289 L145 326 L143 369 M224 289 L259 326 L257 369" fill="none" stroke={grey} strokeWidth="30" strokeLinecap="round"/><g stroke="#f2c43d" strokeWidth="4" opacity=".55"><path d="M131 380 H164 M243 380 H277"/></g></g>;
 if(mode==='legpress')return <g><path d="M158 285 L123 320 L92 287 M242 285 L277 320 L308 287" fill="none" stroke={grey} strokeWidth="30" strokeLinecap="round"/><path d="M56 260 L99 304 M344 260 L301 304" stroke="#a6adbb" strokeWidth="12"><animate attributeName="opacity" dur="3.8s" values="1;.45;1" repeatCount="indefinite"/></path><path d="M75 255 L103 308 M325 255 L297 308" stroke="#f2c43d" strokeWidth="3"/></g>;
 if(mode==='legcurl')return <g><rect x="116" y="308" width="168" height="15" rx="5" fill="#6c7180"/><path d="M166 290 L163 336 L163 371 M234 290 L237 336 L237 371" stroke={grey} strokeWidth="27" strokeLinecap="round" fill="none"/><g><rect x="132" y="363" width="136" height="12" rx="6" fill="#e5b934"><animateTransform attributeName="transform" type="translate" values="0 0;0 -42;0 0" dur="3.8s" repeatCount="indefinite"/></rect></g></g>;
 if(mode==='legextension')return <g><rect x="124" y="305" width="155" height="12" rx="5" fill="#6c7180"/><path d="M168 288 L167 327 L149 370 M232 288 L233 327 L251 370" stroke={grey} strokeWidth="26" fill="none" strokeLinecap="round"/><path d="M138 365 H264" stroke="#e6be40" strokeWidth="12"><animateTransform attributeName="transform" type="translate" values="0 0;0 -35;0 0" dur="3.8s" repeatCount="indefinite"/></path></g>;
 return <g><path d="M175 290 L165 331 L158 372 M225 290 L235 331 L242 372" fill="none" stroke={grey} strokeWidth="30" strokeLinecap="round"/><path d="M135 383 H179 M221 383 H265" stroke={line} strokeWidth="16" strokeLinecap="round"/></g>;
}
export default function GorillaExerciseMotion({motion='row'}){
 const m=P[motion]||P.row;
 const [paused,setPaused]=useState(false),ref=useRef(null);
 useEffect(()=>{const svg=ref.current;if(!svg)return;paused?svg.pauseAnimations():svg.unpauseAnimations()},[paused]);
 const arm=(xy,side)=>{
  const x=side===0?159:241,elbow=[xy[0],xy[1]],hand=[xy[2],xy[3]];
  return path([x,219],elbow,hand);
 };
 const torsoMove=m.shift||0;
 return <div className="pg-animation">
 <svg ref={ref} viewBox="0 0 400 420" role="img" aria-label={'Gorila anime em animação esquemática: '+m.label}>
 <defs><linearGradient id="pgMotionBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1b283a"/><stop offset="1" stopColor="#080e18"/></linearGradient><linearGradient id="pgMotionFur" x1="0" x2="1"><stop stopColor="#626777"/><stop offset="1" stopColor="#202637"/></linearGradient></defs>
 <rect width="400" height="420" rx="16" fill="url(#pgMotionBg)"/>
 <g opacity=".13" stroke="#bbc6d7"><path d="M25 70 H375 M25 140 H375 M25 210 H375 M25 280 H375 M25 350 H375 M48 45 V370 M352 45 V370"/></g>
 {motion==='pulldown'&&<g stroke="#77859a" strokeWidth="7"><path d="M32 343 V26 H368 V343" fill="none"/><path d="M200 26 V65"/></g>}
 {(motion==='row'||motion==='pushdown')&&<g stroke="#697585" strokeWidth="7" opacity=".7"><path d="M32 365 V85 M368 365 V85" /></g>}
 <g>
 <g><animateTransform attributeName="transform" type="translate" values={'0 0;0 '+torsoMove+';0 0'} dur="3.8s" repeatCount="indefinite"/>
 <Legs mode={m.leg}/>
 <path d="M163 196 Q131 210 151 272 L165 293 Q201 312 236 293 L253 272 Q270 210 237 196Z" fill="#1f2532" stroke="#0f1420" strokeWidth="7"/>
 <path d="M168 214 Q197 225 200 237 Q219 220 233 214 L237 263 Q200 277 164 263 Z" fill="#171b26" stroke="#f2c43d" strokeWidth="5"/>
 <path d="M174 270 L226 270 L223 293 L177 293Z" fill="#4a4d5e"/>
 <g fill="#353947" stroke="#111620" strokeWidth="6"><path d="M158 208 Q127 198 133 166 Q138 130 158 121 Q157 77 193 71 Q227 59 246 94 Q274 96 266 141 Q281 177 255 205Z"/></g>
 <path d="M162 120 Q167 100 195 102 Q235 95 239 124 Q261 150 244 177 Q229 195 201 194 Q170 195 161 173 Q147 150 162 120Z" fill="#9f9aa3" stroke="#1a1c26" strokeWidth="7"/>
 <path d="M157 130 L190 140 L203 130 L217 140 L246 129" stroke="#181923" strokeWidth="13" fill="none"/>
 <path d="M169 153 L189 157 M216 157 L234 152" stroke="#f5ecd9" strokeWidth="4" fill="none"/>
 <path d="M183 177 Q200 168 220 177 Q210 189 199 188 Q187 190 183 177Z" fill="#5b5760" stroke="#181923" strokeWidth="4"/>
 </g>
 {m.a.map((coords,i)=><g key={i}>
   <AnimPath from={arm(coords,i)} to={arm(m.b[i],i)} stroke="url(#pgMotionFur)" width={36}/>
   <AnimPath from={arm(coords,i)} to={arm(m.b[i],i)} stroke="#151923" width={3}/>
   <circle cx={coords[2]} cy={coords[3]} r="14" fill="#aaa2a7" stroke="#111821" strokeWidth="4">
    <animate attributeName="cx" values={coords[2]+';'+m.b[i][2]+';'+coords[2]} dur="3.8s" repeatCount="indefinite"/>
    <animate attributeName="cy" values={coords[3]+';'+m.b[i][3]+';'+coords[3]} dur="3.8s" repeatCount="indefinite"/>
   </circle>
 </g>)}
 </g>
 {(motion==='curl'||motion==='lateral'||motion==='shrug'||motion==='overhead'||motion==='reversefly'||motion==='overheadtriceps')&&<g fill="#89929d" stroke="#cbd1d9" strokeWidth="3">{m.a.map((p,i)=><g key={i}><rect x={p[2]-22} y={p[3]-8} width="44" height="16" rx="5"><animate attributeName="x" values={(p[2]-22)+';'+(m.b[i][2]-22)+';'+(p[2]-22)} dur="3.8s" repeatCount="indefinite"/><animate attributeName="y" values={(p[3]-8)+';'+(m.b[i][3]-8)+';'+(p[3]-8)} dur="3.8s" repeatCount="indefinite"/></rect></g>)}</g>}
 {motion==='row'&&<path d="M76 264 H324" stroke="#f2c43d" strokeWidth="5" strokeDasharray="6 10" opacity=".55"/>}
 <rect x="55" y="389" width="290" height="22" rx="11" fill="#111a27"/>
 <text x="200" y="404" fill="#f2c43d" fontSize="13" fontWeight="700" textAnchor="middle">{m.label.toUpperCase()}</text>
 </svg>
 <div className="pg-animation-controls"><span>Gorila anime · movimento esquemático</span><button className="outline" onClick={()=>setPaused(p=>!p)}>{paused?'Reproduzir':'Pausar'}</button></div>
 </div>;
}
