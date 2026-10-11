import test from 'node:test';
import assert from 'node:assert/strict';
import { places } from '../data/places';
import { itinerary, days } from '../data/trip';
import { bookings } from '../data/bookings';
import { emptyState, parseState, mergePlaces, mergeItems, placeAssignments, savePlace, reorder, simpleDay } from '../lib/itinerary';
import { placePoint, routeSegments, routeStops } from '../lib/route-map';

test('legacy storage gains linked shopping data without losing saved restaurants or personal edits',()=>{
 const old=emptyState();delete old.contentRevision;
 const {placeEdits,shoppingItems,...legacy}=old;
 legacy.addedPlaces=[{id:'my-food',name:'My restaurant',category:'food',neighborhood:'Barcelona',priority:'optional',notes:'Keep this'}];
 legacy.placeNotes.ona='My note';legacy.favorite['my-food']=true;
 legacy.bookingEdits['activity-palau']={status:'need-to-book',confirmationNumber:'Keep ticket'};
 legacy.bookingEdits['train-madrid']={status:'need-to-book',time:'12:10'};
 legacy.order['2026-10-25']=['25-checkout','25-park'];
 const restored=parseState(JSON.stringify(legacy));
 assert.equal(restored.addedPlaces[0].notes,'Keep this');assert.equal(restored.favorite['my-food'],true);assert.equal(restored.placeNotes.ona,'My note');
 assert.equal(restored.shoppingItems[0].name,'Elmex Kids 0–6');assert.equal(restored.bookingEdits['activity-palau'].confirmationNumber,'Keep ticket');
 assert.equal(restored.bookingEdits['train-madrid'].time,'12:10');assert.equal(restored.bookingEdits['train-madrid'].status,undefined);
 assert.deepEqual(restored.order['2026-10-25'],['25-checkout','25-grocery','25-park']);
 restored.bookingEdits['train-madrid'].status='need-to-book';assert.equal(parseState(JSON.stringify(restored)).bookingEdits['train-madrid'].status,'need-to-book');
});
test('products and new saved places persist independently of itinerary assignments',()=>{
 const state=emptyState(),before=mergeItems(itinerary,places,bookings,state);
 state.shoppingItems[0]={...state.shoppingItems[0],status:'bought',placeIds:['grocery-condis'],notes:'Personal product note'};
 state.addedPlaces.push({id:'new-shop',name:'New shop',city:'Barcelona',neighborhood:'Eixample',category:'shopping',priority:'optional',latitude:41.4,longitude:2.17});
 const saved=parseState(JSON.stringify(state)),all=mergePlaces(places,saved,bookings);
 assert.deepEqual(mergeItems(itinerary,all,bookings,saved),before);assert.equal(saved.shoppingItems[0].status,'bought');
 assert.deepEqual(placePoint(all.find(p=>p.id==='new-shop')!),[41.4,2.17]);assert.deepEqual(placeAssignments('new-shop',before),[]);
 for(const id of ['escena-poblenou','open-house','bargain-garden','grocery-condis','grocery-veritas','grocery-concepcio']){assert(all.some(p=>p.id===id));assert.deepEqual(placeAssignments(id,before),[]);}
});
test('place edits synchronize hotel addresses and reservations without stale coordinates',()=>{
 const apartment=places.find(p=>p.id==='apartment')!;
 const state=savePlace(emptyState(),{...apartment,address:'New address',googleMapsQuery:'New address',latitude:null,longitude:null,bookingStatus:'booked'},bookings);
 assert.equal(state.bookingEdits['hotel-apartment'].address,'New address');
 const all=mergePlaces(places,state,bookings),moved=all.find(p=>p.id==='apartment')!;
 assert.equal(placePoint(moved),undefined);
 for(const item of mergeItems(itinerary,all,bookings,state).filter(i=>i.placeId==='apartment'))assert.equal(item.address,'New address');
 const positioned=savePlace(state,{...moved,latitude:41.4,longitude:2.17},bookings);
 assert.deepEqual(placePoint(mergePlaces(places,positioned,bookings).find(p=>p.id==='apartment')!),[41.4,2.17]);
});
test('optional stops retain numbers but cannot join the main route unless fixed',()=>{
 const state=emptyState();const p=places.find(p=>p.id==='ona')!;
 const main=itinerary.find(i=>i.id==='26-sagrada')!;
 const optional={...main,id:'optional',placeId:p.id,priority:'optional' as const};
 const last={...main,id:'last',placeId:'sant-pau'};
 const stops=routeStops([main,optional,last],places,state);
 assert.deepEqual(stops.map(s=>s.number),[1,2,3]);assert.equal(routeSegments(stops).length,1);assert.equal(routeSegments(stops)[0].to.item.id,'last');
 stops[1].item={...optional,fixed:true};assert.equal(routeSegments(stops).length,2);
});
test('confirmed bookings remain anchored during reordering and tired mode',()=>{
 const state=emptyState(),items=mergeItems(itinerary,places,bookings,state);
 for(const id of ['23-hotel','24-palau','25-checkout','28-train','29-flight']){const item=items.find(i=>i.id===id)!;assert(item,id);assert.equal(item.fixed,true,id);}
 const fixed=items.find(i=>i.id==='24-palau')!,other=items.find(i=>i.id==='24-market')!;
 assert.equal(reorder(state,[fixed,other],fixed.id,1),state);assert.equal(reorder(state,[fixed,other],other.id,-1),state);
 assert(simpleDay([{...fixed,priority:'optional',demanding:true}],days[2],state,new Date('2026-10-24T23:00:00Z')).some(i=>i.id===fixed.id));
 const checkin=itinerary.findIndex(i=>i.id==='25-checkout');assert.equal(itinerary[checkin+1].id,'25-grocery');
});
