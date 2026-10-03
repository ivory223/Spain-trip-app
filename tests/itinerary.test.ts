import test from 'node:test';
import assert from 'node:assert/strict';
import { days, itinerary, trip } from '../data/trip';
import { places } from '../data/places';
import { bookings } from '../data/bookings';
import { emptyState, parseState, mapsUrl, localClock, countdown, mergeItems, dayItems, nextActivity, simpleDay, changeItem, changeBooking, reorder, safeUrl } from '../lib/itinerary';
const monday=days.find(d=>d.date==='2026-10-26')!;
const state=emptyState();
const merged=mergeItems(itinerary,places,bookings,state);
const mondayItems=dayItems(merged,monday.date,state);
test('all eight dates, references, stable IDs and backup choices are complete',()=>{
 assert.equal(days.length,8);
 for(const list of [places,bookings,itinerary])assert.equal(new Set(list.map(i=>i.id)).size,list.length);
 for(const day of days){assert(itinerary.some(i=>i.date===day.date));assert.equal(new Intl.DateTimeFormat('en',{weekday:'short',timeZone:'UTC'}).format(new Date(day.date)).toUpperCase(),day.weekday);for(const reason of ['rain','tired','late','unavailable'])assert(day.planB.some(p=>p.reasons.includes(reason as never)));}
 for(const item of itinerary){assert(days.some(d=>d.date===item.date));if(item.placeId)assert(places.some(p=>p.id===item.placeId));if(item.bookingId)assert(bookings.some(b=>b.id===item.bookingId));}
 for(const day of days)for(const backup of day.planB)if(backup.placeId)assert(places.some(p=>p.id===backup.placeId));
 assert(!itinerary.some(i=>i.placeId==='miro'||i.placeId==='palo-alto'));
 assert.equal(bookings.find(b=>b.id==='activity-miro')?.status,'sold-out');
 assert.equal(itinerary.find(i=>i.id==='28-train')?.startTime,undefined);
 assert.equal(itinerary.find(i=>i.id==='25-park')?.startTime,undefined);
 assert.equal(bookings.filter(b=>b.type==='flights'&&b.status==='booked').length,2);
});
test('local clock handles the Spain daylight-saving change and NYC departure day',()=>{
 assert.deepEqual(localClock(new Date('2026-10-24T09:00:00Z')),{date:'2026-10-24',time:'11:00'});
 assert.deepEqual(localClock(new Date('2026-10-25T09:00:00Z')),{date:'2026-10-25',time:'10:00'});
 assert.equal(localClock(new Date('2026-10-23T01:00:00Z'),'America/New_York').date,'2026-10-22');
 assert.equal(countdown(new Date('2026-10-02T16:00:00Z'),trip.startDate),20);
});
test('next activity respects selected date, completed/skipped, actual time and overdue MUST stops',()=>{
 assert.equal(nextActivity(mondayItems,monday,state,new Date('2026-10-02T23:00:00Z')).item?.id,'26-sagrada');
 const done={...state,progress:{'26-sagrada':'completed','26-avenue':'skipped','26-lunch':'completed'} as const};
 assert.equal(nextActivity(mondayItems,monday,done,new Date('2026-10-26T13:30:00Z')).item?.id,'26-sant-pau');
 assert.equal(nextActivity(mondayItems,monday,state,new Date('2026-10-26T13:30:00Z')).mode,'overdue');
 const allDone={...state,progress:Object.fromEntries(mondayItems.map(i=>[i.id,'completed' as const]))};
 assert.equal(nextActivity(mondayItems,monday,allDone,new Date('2026-10-26T13:30:00Z')).item,undefined);
 const sold=[{...mondayItems[0],bookingStatus:'sold-out' as const},...mondayItems.slice(1)];
 assert.notEqual(nextActivity(sold,monday,state,new Date('2026-10-02T10:00:00Z')).item?.id,'26-sagrada');
});
test('Remi tired keeps MUST and easy food/shopping and removes demanding optionals',()=>{
 const easy=simpleDay(mondayItems,monday,state,new Date('2026-10-02T10:00:00Z'));
 assert(easy.some(i=>i.id==='26-sagrada'));assert(easy.some(i=>i.id==='26-lunch'));assert(easy.some(i=>i.id==='26-thinking'));assert(!easy.some(i=>i.id==='26-shopping'));
 const done={...state,progress:{'26-thinking':'completed'} as const};assert(!simpleDay(mondayItems,monday,done,new Date('2026-10-02T10:00:00Z')).some(i=>i.id==='26-thinking'));
});
test('edits, date moves and booking changes round-trip together without mutating base data',()=>{
 const santPau=mondayItems.find(i=>i.id==='26-sant-pau')!;
 const edited=changeItem(state,santPau,{startTime:'14:30',notes:'测试笔记',bookingStatus:'booked',date:'2026-10-27'});
 const saved=parseState(JSON.stringify(edited));
 assert.equal(saved.bookingEdits['ticket-sant-pau'].time,'14:30');assert.equal(saved.bookingEdits['ticket-sant-pau'].status,'booked');
 const effectiveBookings=bookings.map(b=>({...b,...saved.bookingEdits[b.id]}));
 const items=mergeItems(itinerary,places,effectiveBookings,saved);
 assert(!dayItems(items,monday.date,saved).some(i=>i.id===santPau.id));
 const moved=dayItems(items,'2026-10-27',saved).find(i=>i.id===santPau.id)!;assert.equal(moved.startTime,'14:30');assert.equal(moved.notes,'测试笔记');
 assert.equal(itinerary.find(i=>i.id===santPau.id)?.startTime,'14:00');
 const back=changeBooking(saved,effectiveBookings.find(b=>b.id==='ticket-sant-pau')!,{date:'2026-10-26',time:'13:30'},items);
 assert.equal(back.itemEdits[santPau.id].date,'2026-10-26');assert.equal(back.itemEdits[santPau.id].startTime,'13:30');
});
test('manual route order persists and can be reversed',()=>{
 const reordered=reorder(state,mondayItems,'26-sant-pau',-1);
 const list=dayItems(merged,monday.date,parseState(JSON.stringify(reordered)));
 assert.equal(list[2].id,'26-sant-pau');assert.equal(list[3].id,'26-lunch');
 assert.equal(dayItems(merged,monday.date,reorder(reordered,list,'26-sant-pau',1))[3].id,'26-sant-pau');
 assert.equal(reorder(state,mondayItems,mondayItems[0].id,-1),state);
});
test('new linked activity keeps its map link; Google Maps safely encodes Unicode and ampersands',()=>{
 const added={...state,addedItems:[{id:'custom',date:'2026-10-26',title:'Ona',placeId:'ona',googleMapsQuery:'',category:'kids',priority:'optional',bookingStatus:'no-reservation'} as const]};
 const item=mergeItems(itinerary,places,bookings,added).find(i=>i.id==='custom')!;assert(item.googleMapsQuery?.includes('Pau Claris'));
 const url=new URL(mapsUrl('桂尔公园 Park Güell & Barcelona'));assert.equal(url.origin,'https://www.google.com');assert.equal(url.searchParams.get('query'),'桂尔公园 Park Güell & Barcelona');assert.equal(url.searchParams.get('api'),'1');
 assert.equal(safeUrl('javascript:alert(1)'),undefined);assert.equal(safeUrl('https://example.com/ticket'),'https://example.com/ticket');
});
test('invalid or incompatible saved data is rejected without overwriting it',()=>{
 assert.throws(()=>parseState('{broken'));assert.throws(()=>parseState('{"version":99}'));assert.throws(()=>parseState(JSON.stringify({...state,order:{day:'bad'}})));assert.throws(()=>parseState(JSON.stringify({...state,placeNotes:{ona:{bad:true}}})));
 assert.deepEqual(parseState(JSON.stringify(state)),state);
});
test('hotel address edits update every place-based navigation target',async()=>{
 const {mergePlaces,placeQuery}=await import('../lib/itinerary');
 const changed={...state,bookingEdits:{'hotel-apartment':{address:'Carrer de Test 31, Barcelona'}}};
 const effective=mergePlaces(places,changed,bookings);
 const apartment=effective.find(p=>p.id==='apartment')!;
 assert(placeQuery(apartment).includes('Carrer de Test 31'));assert.equal(apartment.needsVerification,false);
 const item=mergeItems(itinerary,effective,bookings,changed).find(i=>i.id==='28-pack')!;
 assert(item.googleMapsQuery?.includes('Carrer de Test 31'));
 assert(!placeQuery(places.find(p=>p.id==='dune')!).includes('待确认'));
});
