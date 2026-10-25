import React from 'react';
export function WeekStrip({history,onSelect}){
 const marked=new Set(history.map(h=>new Date(h.date).toDateString()));
 const today=new Date(),monday=new Date(today.getFullYear(),today.getMonth(),today.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
 return <div className="week">{Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return <button type="button" aria-label={'Ver '+d.toLocaleDateString('pt-BR')} onClick={()=>onSelect(d.toDateString())} key={i} className={marked.has(d.toDateString())?'marked':''}><small>{['S','T','Q','Q','S','S','D'][i]}</small><strong>{d.getDate()}</strong></button>})}</div>;
}