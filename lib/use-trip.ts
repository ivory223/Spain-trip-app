'use client';
import { useEffect, useRef, useState } from 'react';
import { emptyState, parseState, STORAGE_KEY } from './itinerary';
import type { LocalState } from './types';
export function useTrip() {
 const [state,setState]=useState<LocalState>(emptyState);
 const [ready,setReady]=useState(false);
 const [saveError,setSaveError]=useState('');
 const [offlineReady,setOfflineReady]=useState(false);
 const [online,setOnline]=useState(true);
 const stateRef=useRef(state);
 const damaged=useRef(false);
 useEffect(()=>{
  try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){const saved=parseState(raw);stateRef.current=saved;setState(saved);} }
  catch { damaged.current=true;setSaveError('本机存储无法读取。原数据已保留；当前修改不会覆盖它。请先导出备份。'); }
  setReady(true);
  const network=()=>setOnline(navigator.onLine);network();
  window.addEventListener('online',network);window.addEventListener('offline',network);
  const changed=(event:StorageEvent)=>{ if(event.key===STORAGE_KEY && event.newValue){try{const next=parseState(event.newValue);stateRef.current=next;setState(next);}catch{setSaveError('另一窗口的修改无法读取，请先保留备份。');}} };
  window.addEventListener('storage',changed);
  if ('serviceWorker' in navigator && process.env.NODE_ENV==='production') {
   void navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(()=>setOfflineReady(true)).catch(()=>setOfflineReady(false));
  }
  return ()=>{window.removeEventListener('online',network);window.removeEventListener('offline',network);window.removeEventListener('storage',changed);};
 },[]);
 const update=(apply:(current:LocalState)=>LocalState)=>{
  const next=apply(stateRef.current);stateRef.current=next;setState(next);
  if(damaged.current) return;
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setSaveError('');}
  catch {setSaveError('本机存储空间不足或不可用，刚才的修改尚未保存。请导出备份。');}
 };
 return {state,update,ready,saveError,offlineReady,online};
}
