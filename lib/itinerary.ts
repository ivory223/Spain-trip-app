import type { Booking, ItineraryItem, LocalState, Place, TripDay } from './types';
export const STORAGE_KEY = 'spain-journal:v1';
export const bookingLabels = { booked:'已预订', 'need-to-book':'待预订', 'sold-out':'已售罄', 'no-reservation':'无需预约', tbd:'待确认' };
export const priorityLabels = { must:'MUST · 必去', recommended:'推荐', optional:'可选' };
export function emptyState(): LocalState {
 return {version:1,itemEdits:{},addedItems:[],addedPlaces:[],progress:{},favorite:{},visited:{},placeNotes:{},bookingEdits:{},order:{},checks:{},remiMode:false};
}
const record = (value:unknown): value is Record<string,unknown> => !!value && typeof value==='object' && !Array.isArray(value);
export function parseState(raw:string): LocalState {
 const value:unknown = JSON.parse(raw);
 if (!record(value) || value.version!==1) throw new Error('存储版本无法识别');
 const base = emptyState();
 for (const key of ['itemEdits','progress','favorite','visited','placeNotes','bookingEdits','order','checks'] as const) {
  if (!record(value[key])) throw new Error('本地数据不完整');
 }
 if (!Array.isArray(value.addedItems) || !Array.isArray(value.addedPlaces)) throw new Error('本地数据不完整');
 for (const item of value.addedItems) if (!record(item) || typeof item.id!=='string' || typeof item.date!=='string' || typeof item.title!=='string') throw new Error('活动数据无法读取');
 for (const place of value.addedPlaces) if (!record(place) || typeof place.id!=='string' || typeof place.name!=='string') throw new Error('地点数据无法读取');
 for (const edits of Object.values(value.itemEdits as Record<string,unknown>)) if (!record(edits)) throw new Error('活动编辑无法读取');
 for (const edits of Object.values(value.bookingEdits as Record<string,unknown>)) if (!record(edits)) throw new Error('预订编辑无法读取');
 for (const order of Object.values(value.order as Record<string,unknown>)) if (!Array.isArray(order) || order.some(id=>typeof id!=='string')) throw new Error('顺序数据无法读取');
 for (const key of ['favorite','visited','checks']) if (Object.values(value[key] as Record<string,unknown>).some(v=>typeof v!=='boolean')) throw new Error('标记数据无法读取');
 if (Object.values(value.progress as Record<string,unknown>).some(v=>v!=='completed'&&v!=='skipped')) throw new Error('进度数据无法读取');
 if (Object.values(value.placeNotes as Record<string,unknown>).some(v=>typeof v!=='string')) throw new Error('笔记数据无法读取');
 if (typeof value.remiMode!=='boolean') throw new Error('偏好数据无法读取');
 const restored={...base,...value} as LocalState;
 // Remove only known obsolete seed text from old form saves; preserve personal edits and notes.
 for(const edit of Object.values(restored.itemEdits)){
  if(edit.googleMapsQuery==='Central Family Apartment 31 Barcelona')delete edit.googleMapsQuery;
  if(edit.description==='从 Hilton 退房。提前和公寓确认地址、寄存行李、入住时间和取钥匙。')delete edit.description;
 }
 const apartment=restored.bookingEdits['hotel-apartment'];
 if(apartment?.notes==='Barcelona，3 晚。准确地址、入住时间、门禁/取钥匙方式待补充。')delete apartment.notes;
 return restored;
}
export function localClock(now:Date, timeZone='Europe/Madrid') {
 const parts = new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get = (type:string)=>parts.find(part=>part.type===type)?.value||'';
 return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
}
export function countdown(now:Date,startDate:string) {
 return Math.max(0,Math.round((Date.parse(startDate)-Date.parse(localClock(now,'America/New_York').date))/86400000));
}
export function mapsUrl(query:string) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; }
export function placeQuery(place:Place) {
 if(place.googleMapsQuery)return place.googleMapsQuery;
 const city=place.neighborhood.includes('Madrid')?'Madrid':place.neighborhood.includes('Newark')?'Newark':'Barcelona';
 return [place.name,place.address||city].join(' ');
}
export function mergePlaces(base:Place[],state:LocalState,bookings:Booking[]):Place[] {
 return [...base,...state.addedPlaces].map(place=>{
  const booking=bookings.find(b=>b.type==='hotels'&&b.placeId===place.id);
  const address=booking&&state.bookingEdits[booking.id]?.address;
  return address&&address!==place.address?{...place,address,googleMapsQuery:`${place.name} ${address}`,latitude:undefined,longitude:undefined,needsVerification:false}:place;
 });
}
export function safeUrl(url?:string) {
 if (!url) return undefined;
 try { const parsed = new URL(url); return parsed.protocol==='https:' || parsed.protocol==='http:' ? parsed.href : undefined; } catch { return undefined; }
}
export function mergeItems(base:ItineraryItem[], places:Place[], bookings:Booking[], state:LocalState) {
 return [...base,...state.addedItems].map(original=>{
  const edits=state.itemEdits[original.id]||{};
  const item={...original,...edits};
  const place=places.find(p=>p.id===item.placeId);
  const booking=bookings.find(b=>b.id===item.bookingId);
  const inherited=place ? {neighborhood:place.neighborhood,address:place.address,childFriendly:place.childFriendly,strollerFriendly:place.strollerFriendly,napFriendly:place.napFriendly,indoor:place.indoor,bathrooms:place.bathrooms,freePlay:place.freePlay,bookingUrl:place.bookingUrl,googleMapsQuery:placeQuery(place),walkingContext:place.walkingContext} : {};
  return {...inherited,...item,googleMapsQuery:item.googleMapsQuery||inherited.googleMapsQuery,address:item.address||inherited.address,...(booking?{bookingStatus:booking.status,confirmationNumber:booking.confirmationNumber,ticketUrl:booking.ticketUrl||item.ticketUrl}:{}),...(state.bookingEdits[item.bookingId||'']?.time!==undefined ? {startTime:booking?.time} : {})};
 });
}
export function dayItems(items:ItineraryItem[], date:string, state:LocalState) {
 const list=items.filter(item=>item.date===date); const order=state.order[date];
 if (!order) return list;
 const indices=new Map(order.map((id,i)=>[id,i]));
 return list.toSorted((a,b)=>(indices.get(a.id)??9999)-(indices.get(b.id)??9999));
}
export function nextActivity(items:ItineraryItem[], day:TripDay, state:LocalState, now:Date) {
 const remaining=items.filter(item=>!state.progress[item.id] && item.bookingStatus!=='sold-out');
 const clock=localClock(now,day.timeZone);
 if (clock.date!==day.date) return {item:remaining[0],mode:clock.date<day.date?'preview':'past'} as const;
 // Respect the user's route order. Overdue MUST stops remain actionable until completed or skipped.
 const next=remaining.find(item=>!item.startTime || item.priority==='must' || (item.endTime||item.startTime)>=clock.time);
 return {item:next,mode:next?.startTime && (next.endTime||next.startTime)<clock.time?'overdue':'today'} as const;
}
export function simpleDay(items:ItineraryItem[], day:TripDay, state:LocalState, now:Date) {
 const clock=localClock(now,day.timeZone);
 return items.filter(item=>!state.progress[item.id] && item.bookingStatus!=='sold-out' &&
  (item.priority==='must' || (!item.demanding && (item.easy || item.category==='food' || (item.category==='shopping' && item.strollerFriendly)))) &&
  (clock.date!==day.date || !item.startTime || (item.endTime||item.startTime)>=clock.time || item.priority==='must'));
}
export function changeItem(state:LocalState,item:ItineraryItem,patch:Partial<ItineraryItem>):LocalState {
 const bookingPatch:Partial<Booking>={};
 if (patch.bookingStatus!==undefined) bookingPatch.status=patch.bookingStatus;
 if (patch.startTime!==undefined) bookingPatch.time=patch.startTime;
 if (patch.date!==undefined) bookingPatch.date=patch.date;
 if (patch.confirmationNumber!==undefined) bookingPatch.confirmationNumber=patch.confirmationNumber;
 return {...state,itemEdits:{...state.itemEdits,[item.id]:{...state.itemEdits[item.id],...patch}},bookingEdits:item.bookingId?{...state.bookingEdits,[item.bookingId]:{...state.bookingEdits[item.bookingId],...bookingPatch}}:state.bookingEdits};
}
export function changeBooking(state:LocalState,booking:Booking,patch:Partial<Booking>,items:ItineraryItem[]):LocalState {
 const itemEdits={...state.itemEdits};
 for (const item of items.filter(i=>i.bookingId===booking.id)) {
  itemEdits[item.id]={...itemEdits[item.id],...(patch.date!==undefined?{date:patch.date}:{}),...(patch.time!==undefined?{startTime:patch.time}:{}),...(patch.status!==undefined?{bookingStatus:patch.status}:{})};
 }
 return {...state,itemEdits,bookingEdits:{...state.bookingEdits,[booking.id]:{...state.bookingEdits[booking.id],...patch}}};
}
export function reorder(state:LocalState,items:ItineraryItem[],id:string,direction:-1|1):LocalState {
 const index=items.findIndex(item=>item.id===id), next=index+direction;
 if(index<0 || next<0 || next>=items.length) return state;
 const order=items.map(item=>item.id); [order[index],order[next]]=[order[next],order[index]];
 return {...state,order:{...state.order,[items[index].date]:order}};
}

// Check-in is inclusive, checkout is exclusive; the previous night supplies the departure base.
export function accommodationForDate(date:string,bookings:Booking[],places:Place[]) {
 const stays=bookings.filter(b=>b.type==='hotels'&&b.placeId&&b.endDate);
 const tonight=stays.find(b=>b.date<=date&&date<b.endDate!);
 const previous=stays.find(b=>b.date<date&&date<=b.endDate!);
 return {home:places.find(p=>p.id===(tonight||previous)?.placeId),departure:places.find(p=>p.id===previous?.placeId)};
}
