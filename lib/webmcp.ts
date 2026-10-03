'use client';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { ItineraryItem, LocalState, TripDay } from './types';
import { changeItem } from './itinerary';
type Context = {registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean};execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
type Actions={state:LocalState;items:ItineraryItem[];days:TripDay[];selectedDate:string;selectDate:(date:string)=>void;update:(fn:(s:LocalState)=>LocalState)=>void;ready:boolean};
export function useWebMCP(actions:Actions) {
 const current=useRef(actions);current.current=actions;
 useEffect(()=>{
  const context=(document as Document&{modelContext?:Context}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=(tool:Parameters<Context['registerTool']>[0])=>{try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability; the UI remains fully usable. */}};
  register({name:'read_spain_itinerary',description:'Read the family itinerary, stable activity IDs and completion state for a trip date.',inputSchema:{type:'object',properties:{date:{type:'string',enum:actions.days.map(d=>d.date)}},required:['date'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){
   if(!input||typeof input!=='object'||!('date' in input)||!current.current.days.some(d=>d.date===input.date))throw new Error('Invalid trip date');
   if(!current.current.ready)throw new Error('Trip still loading');
   return current.current.items.filter(i=>i.date===input.date).map(i=>({id:i.id,title:i.title,titleZh:i.titleZh,startTime:i.startTime,priority:i.priority,bookingStatus:i.bookingStatus,progress:current.current.state.progress[i.id]||'pending'}));
  }});
  register({name:'update_spain_activities',description:'Save date, start time or notes for existing itinerary activities on this device. Updates the same state as the edit form; never purchases tickets.',inputSchema:{type:'object',properties:{changes:{type:'array',minItems:1,maxItems:30,items:{type:'object',properties:{id:{type:'string'},date:{type:'string',enum:actions.days.map(d=>d.date)},startTime:{type:'string',pattern:'^$|^([01][0-9]|2[0-3]):[0-5][0-9]$'},notes:{type:'string',maxLength:6000}},required:['id'],additionalProperties:false}}},required:['changes'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){
   if(!current.current.ready)throw new Error('Trip still loading');
   if(!input||typeof input!=='object'||!('changes' in input)||!Array.isArray(input.changes)||input.changes.length<1||input.changes.length>30)throw new Error('Provide 1–30 changes');
   const changes=input.changes.map((change:unknown)=>{
    if(!change||typeof change!=='object')throw new Error('Invalid change');const c=change as Record<string,unknown>;
    const item=current.current.items.find(i=>i.id===c.id);if(!item)throw new Error('Unknown activity');
    if(Object.keys(c).some(k=>!['id','date','startTime','notes'].includes(k)))throw new Error('Unsupported field');
    if(c.date!==undefined&&!current.current.days.some(d=>d.date===c.date))throw new Error('Invalid date');
    if(c.startTime!==undefined&&(typeof c.startTime!=='string'||!/^$|^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(c.startTime)))throw new Error('Invalid time');
    if(c.notes!==undefined&&(typeof c.notes!=='string'||c.notes.length>6000))throw new Error('Invalid notes');
    if(typeof c.startTime==='string'&&c.startTime&&item.endTime&&c.startTime>item.endTime)throw new Error('Start time must be before end time; use the editor to adjust both');
    const {id,...patch}=c;return {item,patch:patch as Partial<ItineraryItem>};
   });
   flushSync(()=>{current.current.update(s=>changes.reduce((next,{item,patch})=>changeItem(next,item,patch),s));const last=changes.at(-1);if(last?.patch.date)current.current.selectDate(last.patch.date);});
   return {updated:changes.map(c=>c.item.id),storage:'this device only'};
  }});
  return()=>lifecycle.abort();
 },[]);
}
