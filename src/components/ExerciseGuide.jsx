import React,{useEffect} from 'react';
import {getExerciseMedia} from '../exerciseMedia.js';
export {getExerciseGuide} from '../exerciseGuides.js';

// Fixed YouTube watch URLs are selected manually, never guessed from an exercise name.
export default function ExerciseGuide({guide,onClose}){
 useEffect(()=>{if(!guide)return;const key=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[guide,onClose]);
 if(!guide)return null;
 const media=getExerciseMedia(guide.sourceName);
 const youtube=media?.videoId?'https://www.youtube.com/watch?v='+media.videoId:null;
 return <div className="pg-guide-backdrop" role="presentation" onClick={onClose}>
  <div className="pg-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="pg-guide-title" onClick={e=>e.stopPropagation()}>
   <div className="pg-guide-header"><div><span className="accent">PERSONAL GORILA · EXECUÇÃO</span><h2 id="pg-guide-title">{guide.title}</h2></div><button className="outline" onClick={onClose} aria-label="Fechar orientação">✕</button></div>
   {media?.image&&<figure style={{margin:'12px 0'}}><img src={media.image} alt={'Imagem local ilustrativa: '+guide.title} loading="lazy" width="420" height="230" style={{display:'block',width:'100%',maxHeight:260,objectFit:'contain',borderRadius:14}}/><figcaption className="hint" style={{fontSize:12,marginTop:6}}>Ilustração de identificação do exercício; para a técnica, veja as orientações abaixo e o vídeo selecionado quando disponível.</figcaption></figure>}
   {youtube?<a className="pg-guide-trigger" href={youtube} target="_blank" rel="noopener noreferrer" style={{display:'block',textAlign:'center',textDecoration:'none',padding:'12px 14px',margin:'12px 0'}}>▶ Ver vídeo selecionado no YouTube ↗</a>:<p className="hint" style={{padding:'10px 0'}}>Vídeo específico ainda em seleção para este exercício. Nenhum vídeo impreciso será sugerido automaticamente.</p>}
   <section className="pg-guide-section"><h3>💪 Músculos trabalhados</h3><div className="pg-muscles">{guide.muscles.map(m=><span key={m}>{m}</span>)}</div></section>
   <section className="pg-guide-section"><h3>Como fazer</h3><ol>{guide.steps.map(x=><li key={x}>{x}</li>)}</ol></section>
   <section className="pg-guide-section"><h3>✓ Dica de postura</h3><p>{guide.tip}</p></section>
   <section className="pg-guide-section"><h3>⚠ Erro comum</h3><p>{guide.mistake}</p></section>
   <p className="hint">As imagens e orientações podem ser consultadas offline após o app carregar. Os vídeos exigem conexão com o YouTube.</p>
  </div>
 </div>;
}
