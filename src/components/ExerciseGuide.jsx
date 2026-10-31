import React,{useEffect,useRef,useState} from 'react';

const CATALOG={
 pulldown:{
  title:'Puxada alta na polia',group:'Costas',muscles:['Grande dorsal','Redondo maior','Bíceps e músculos estabilizadores'],
  steps:['Ajuste o apoio para manter as coxas firmes e segure a barra com pegada confortável.','Mantenha o peito elevado e conduza os cotovelos para baixo, trazendo a barra na direção da parte superior do peito.','Retorne lentamente, permitindo que os braços se estendam sem perder o controle.'],
  tip:'Evite elevar os ombros em direção às orelhas; mantenha o tronco estável.',
  mistake:'Não balance o corpo para trás nem puxe a barra atrás da nuca.'
 }
};
export function getExerciseGuide(name=''){
 const s=name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/puxada alta|puxada na polia|lat pulldown/.test(s))return CATALOG.pulldown;
 return null;
}
function GorillaPull(){
 const [paused,setPaused]=useState(false),svgRef=useRef(null);
 useEffect(()=>{const svg=svgRef.current;if(!svg)return;if(paused)svg.pauseAnimations();else svg.unpauseAnimations()},[paused]);
 return <div className={'pg-animation'+(paused?' pg-paused':'')}>
 <svg ref={svgRef} viewBox="0 0 520 480" role="img" aria-label="Animação ilustrativa do gorila realizando a puxada alta: barra desce até a região superior do peito e retorna, com os cotovelos descendo lateralmente.">
  <defs><linearGradient id="pgBg" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#1b2535"/><stop offset="1" stopColor="#080d15"/></linearGradient><linearGradient id="pgFur" x1="0" x2="1"><stop stopColor="#626675"/><stop offset=".42" stopColor="#343846"/><stop offset="1" stopColor="#1a202d"/></linearGradient><linearGradient id="pgSkin" x1="0" x2="1"><stop stopColor="#c4b8bb"/><stop offset="1" stopColor="#5f606d"/></linearGradient></defs>
  <rect width="520" height="480" rx="16" fill="url(#pgBg)"/>
  <g opacity=".15" stroke="#a3b5cb"><path d="M40 50 V450 M470 50 V450 M35 90 H485 M35 270 H485"/><path d="M30 420 H500"/></g>
  <g stroke="#657287" strokeWidth="13" fill="none"><path d="M84 424 V30 H436 V424"/><path d="M260 30 V80"/></g>
  <g fill="#1a222e" stroke="#7e8490" strokeWidth="3"><rect x="238" y="320" width="44" height="118" rx="7"/><rect x="181" y="415" width="158" height="20" rx="7"/><rect x="186" y="383" width="148" height="25" rx="8"/></g>
  <path d="M194 337 L167 403 Q169 427 196 416 L235 373 L285 373 L323 416 Q350 428 351 399 L327 337 Z" fill="#262b39" stroke="#10151d" strokeWidth="5"/>
  <path d="M172 214 Q139 225 143 287 L166 365 Q197 388 234 377 L286 377 Q327 386 352 361 L373 284 Q377 225 342 213 Z" fill="#212534" stroke="#0b0e15" strokeWidth="10"/>
  <path d="M173 221 Q201 212 260 242 Q314 211 347 221 L340 286 Q310 298 260 281 Q213 298 183 287 Z" fill="#161d2b" stroke="#eebf31" strokeWidth="6"/>
  <path d="M217 285 Q262 301 305 285 L293 347 Q260 361 229 347 Z" fill="#333848" stroke="#11151f" strokeWidth="6"/>
  <path d="M248 229 L242 266 L259 270 L276 264 L272 230" fill="#debba0"/>
  <g fill="#3b404d" stroke="#13151d" strokeWidth="5"><path d="M185 189 Q157 189 166 148 Q168 110 201 107 Q218 64 258 64 Q312 62 330 110 Q364 109 356 151 Q360 188 333 191 L318 231 Q291 255 259 247 Q228 252 200 231 Z"/></g>
  <path d="M209 137 Q215 102 259 99 Q302 99 310 136 Q323 165 309 194 Q300 218 260 220 Q218 220 209 191 Q193 168 209 137 Z" fill="url(#pgSkin)" stroke="#171923" strokeWidth="7"/>
  <path d="M209 142 L244 151 L259 143 L277 151 L313 140" stroke="#171923" strokeWidth="15" fill="none" strokeLinejoin="round"/>
  <path d="M215 158 Q229 153 243 161 M275 161 Q291 153 306 159" stroke="#fff5dd" strokeWidth="4" fill="none" strokeLinecap="round"/>
  <path d="M233 187 Q258 174 286 187 L283 205 Q258 216 237 205 Z" fill="#5c5460" stroke="#161923" strokeWidth="5"/>
  <path d="M246 186 L252 192 M266 192 L273 186" stroke="#22232a" strokeWidth="6"/>
  <path d="M229 223 Q259 242 290 223" fill="none" stroke="#f2c43d" strokeWidth="3" opacity=".7"/>
  {/* Upper arms redraw between straight and bent positions; bar and hands move together. */}
  <path fill="url(#pgFur)" stroke="#171921" strokeWidth="8" d="M177 224 Q141 214 126 185 L103 112 Q99 93 117 90 L150 154 Q168 163 191 197 Z">
   <animate attributeName="d" dur="3.6s" repeatCount="indefinite" values="M177 224 Q141 214 126 185 L103 112 Q99 93 117 90 L150 154 Q168 163 191 197 Z;M177 224 Q145 218 122 261 L87 209 Q83 184 101 182 L151 206 Q168 189 191 197 Z;M177 224 Q145 218 122 261 L87 209 Q83 184 101 182 L151 206 Q168 189 191 197 Z;M177 224 Q141 214 126 185 L103 112 Q99 93 117 90 L150 154 Q168 163 191 197 Z"/>
  </path>
  <path fill="url(#pgFur)" stroke="#171921" strokeWidth="8" d="M343 224 Q379 214 394 185 L417 112 Q421 93 403 90 L370 154 Q352 163 329 197 Z">
   <animate attributeName="d" dur="3.6s" repeatCount="indefinite" values="M343 224 Q379 214 394 185 L417 112 Q421 93 403 90 L370 154 Q352 163 329 197 Z;M343 224 Q375 218 398 261 L433 209 Q437 184 419 182 L369 206 Q352 189 329 197 Z;M343 224 Q375 218 398 261 L433 209 Q437 184 419 182 L369 206 Q352 189 329 197 Z;M343 224 Q379 214 394 185 L417 112 Q421 93 403 90 L370 154 Q352 163 329 197 Z"/>
  </path>
  <g className="pg-bar">
   <path d="M260 -70 V-4" stroke="#a0a6b0" strokeWidth="5"/>
   <path d="M68 0 Q120 -3 152 0 H368 Q400 -3 452 0" fill="none" stroke="#d8dde4" strokeWidth="12" strokeLinecap="round"/>
   <path d="M93 -5 V7 M427 -5 V7" stroke="#121a23" strokeWidth="6"/>
   <rect x="84" y="-11" width="37" height="22" rx="10" fill="#a49aa0" stroke="#292d39" strokeWidth="4"/>
   <rect x="399" y="-11" width="37" height="22" rx="10" fill="#a49aa0" stroke="#292d39" strokeWidth="4"/>
  </g>
  <text x="260" y="467" fill="#f2c43d" fontSize="14" textAnchor="middle" fontWeight="800" letterSpacing="2">PERSONAL GORILA</text>
 </svg>
 <div className="pg-animation-controls"><span>Movimento ilustrativo em loop</span><button className="outline" onClick={()=>setPaused(p=>!p)}>{paused?'Reproduzir':'Pausar'}</button></div>
 </div>;
}
export default function ExerciseGuide({guide,onClose}){
 useEffect(()=>{const key=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[onClose]);
 if(!guide)return null;
 return <div className="pg-guide-backdrop" role="presentation" onClick={onClose}>
  <div className="pg-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="pg-guide-title" onClick={e=>e.stopPropagation()}>
   <div className="pg-guide-header"><div><span className="accent">PERSONAL GORILA · EXECUÇÃO</span><h2 id="pg-guide-title">{guide.title}</h2></div><button className="outline" onClick={onClose} aria-label="Fechar orientação">✕</button></div>
   <GorillaPull/>
   <section className="pg-guide-section"><h3>💪 Músculos trabalhados</h3><div className="pg-muscles">{guide.muscles.map(m=><span key={m}>{m}</span>)}</div></section>
   <section className="pg-guide-section"><h3>Como fazer</h3><ol>{guide.steps.map(x=><li key={x}>{x}</li>)}</ol></section>
   <section className="pg-guide-section"><h3>✓ Dica de postura</h3><p>{guide.tip}</p></section>
   <section className="pg-guide-section"><h3>⚠ Erro comum</h3><p>{guide.mistake}</p></section>
   <p className="hint">Animação simplificada, não é uma demonstração biomecânica validada. Respeite sua amplitude e peça orientação a um profissional para ajustar a execução.</p>
  </div>
 </div>;
}
