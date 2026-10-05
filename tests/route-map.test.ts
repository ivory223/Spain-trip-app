import test from 'node:test';
import assert from 'node:assert/strict';
import { itinerary } from '../data/trip';
import { places } from '../data/places';
import { bookings } from '../data/bookings';
import { placeCoordinates } from '../data/coordinates';
import { accommodationForDate, parseState, placeQuery, mapsUrl, changeItem, dayItems, emptyState, mergeItems, mergePlaces, reorder } from '../lib/itinerary';
import { distanceMeters, markerGroups, nearbyPlaces, placePoint, routeSegments, routeStops, validPoint } from '../lib/route-map';
const date='2026-10-26';
function route(state=emptyState(),selected=date){
 const mergedPlaces=mergePlaces(places,state,bookings);
 return routeStops(dayItems(mergeItems(itinerary,mergedPlaces,bookings,state),selected,state),mergedPlaces,state);
}
test('route order, moves and statuses come from the shared itinerary state',()=>{
 let state=emptyState();const original=route(state);
 assert.deepEqual(original.map(s=>s.number),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(original.filter(s=>s.point).map(s=>s.number),[1,2,3,4,5,6,7]);
 state=reorder(state,original.map(s=>s.item),'26-ona',-1);
 assert.equal(route(state)[4].item.id,'26-ona');assert.equal(route(state)[4].number,5);
 state.progress['26-lunch']='skipped';state.progress['26-sagrada']='completed';
 let next=route(state);assert.equal(next[0].progress,'completed');assert.equal(next[2].progress,'skipped');
 assert(routeSegments(next).every(s=>s.from.item.id!=='26-lunch'&&s.to.item.id!=='26-lunch'));
 state=changeItem(state,next[4].item,{date:'2026-10-27'});
 assert(!route(state).some(s=>s.item.id==='26-ona'));
 assert(route(state,'2026-10-27').some(s=>s.item.id==='26-ona'));
});
test('unknown positions keep their number, never acquire a guessed pin, and break route continuity',()=>{
 const stops=route();assert.equal(stops[7].point,undefined);assert.equal(stops[7].number,8);
 const sample=[stops[0],{...stops[0],point:undefined,number:2}, {...stops[2],number:3}];
 assert.equal(routeSegments(sample)[0].gap,true);
 assert.equal(placePoint(places.find(p=>p.id==='soeur')!),undefined);
 const state=emptyState();state.itemEdits['26-sagrada']={address:'A new address'};
 assert.equal(route(state)[0].point,undefined);
 const hotel=places.find(p=>p.id==='hilton-bcn')!;
 assert.equal(placePoint({...hotel,address:'A new hotel address'}),undefined);
});
test('same-location airport activities retain individually accessible sequence numbers',()=>{
 const groups=markerGroups(route(emptyState(),'2026-10-22'));
 assert.equal(groups.length,1);assert.deepEqual(groups[0].map(s=>s.number),[1,2]);
 assert.deepEqual(route(emptyState(),'2026-10-29').filter(s=>s.point).map(s=>s.number),[1,2,3,4]);
});
test('nearby overlay excludes scheduled, unavailable, unlocated and distant places',()=>{
 const stops=route();const nearby=nearbyPlaces(places,stops);
 const used=new Set(stops.map(s=>s.item.placeId));
 assert(nearby.every(p=>!used.has(p.id)&&p.availability!=='unavailable'&&placePoint(p)));
 assert(!nearby.some(p=>p.id==='miro'||p.id==='hilton-mad'||p.id==='apartment'));
 assert.deepEqual(nearbyPlaces(places,[]),[]);
 assert.deepEqual(nearbyPlaces(places,stops.map(s=>({...s,progress:'skipped'}))),[]);
});
test('static geographic data is valid, traceable and numerically sane',()=>{
 assert(Object.keys(placeCoordinates).length>=19);
 for(const [id,location] of Object.entries(placeCoordinates)){assert(places.some(p=>p.id===id));assert(validPoint(location.point),id);assert(location.source.startsWith('https://'));}
 assert(!validPoint([NaN,2]));assert(!validPoint([91,2]));assert(!validPoint([41,181]));
 assert.equal(distanceMeters([41,2],[41,2]),0);
 assert(Math.abs(distanceMeters([0,0],[0,1])-111195)<2);
});

test('bookings select home and departure bases across all accommodation transitions',()=>{
 const expected=[['23','hilton-bcn',undefined],['24','hilton-bcn','hilton-bcn'],['25','apartment','hilton-bcn'],['26','apartment','apartment'],['27','apartment','apartment'],['28','hilton-mad','apartment'],['29','hilton-mad','hilton-mad']];
 for(const [day,home,departure] of expected){const selected=accommodationForDate(`2026-10-${day}`,bookings,places);assert.equal(selected.home?.id,home);assert.equal(selected.departure?.id,departure);assert(placePoint(selected.home!));}
 const changed=bookings.map(b=>b.id==='hotel-apartment'?{...b,date:'2026-10-26'}:b);
 assert.notEqual(accommodationForDate('2026-10-25',changed,places).home?.id,'apartment');
 const apartment=places.find(p=>p.id==='apartment')!;
 assert.equal(bookings.find(b=>b.id==='hotel-apartment')!.address,apartment.address);
 assert.equal(new URL(mapsUrl(placeQuery(apartment))).searchParams.get('query'),'Carrer de Bailèn, 125, 08009 Barcelona, Spain');
 for(const item of mergeItems(itinerary,places,bookings,emptyState()).filter(i=>i.placeId==='apartment')){assert.equal(item.address,apartment.address);assert.equal(item.googleMapsQuery,placeQuery(apartment));}
});
test('route starts at departure base, reaches train arrival and never fabricates a return leg',()=>{
 const apartment=places.find(p=>p.id==='apartment')!,sants=places.find(p=>p.id==='sants')!,atocha=places.find(p=>p.id==='atocha')!;
 const stops=route(),segments=routeSegments(stops,apartment);
 assert.deepEqual(segments[0].from.point,placePoint(apartment));assert.equal(segments[0].to.item.id,stops[0].item.id);
 assert.notDeepEqual(segments.at(-1)!.to.point,placePoint(apartment));
 const travel=route(emptyState(),'2026-10-28'),legs=routeSegments(travel,apartment);
 assert(legs.some(s=>JSON.stringify(s.from.point)===JSON.stringify(placePoint(sants))&&JSON.stringify(s.to.point)===JSON.stringify(placePoint(atocha))));
 assert.deepEqual(legs.at(-1)!.from.point,placePoint(atocha));assert.equal(legs.at(-1)!.to.item.placeId,'hilton-mad');
 const custom={...apartment,id:'custom',latitude:41.4,longitude:2.17};assert.deepEqual(placePoint(custom),[41.4,2.17]);assert.equal(placePoint({...custom,latitude:100}),undefined);
});
test('legacy apartment defaults refresh while personal edits and saved progress survive',()=>{
 const state=emptyState();state.bookingEdits['hotel-apartment']={notes:'Barcelona，3 晚。准确地址、入住时间、门禁/取钥匙方式待补充。',confirmationNumber:'personal-reference'};state.itemEdits['25-checkout']={googleMapsQuery:'Central Family Apartment 31 Barcelona',notes:'我的笔记'};state.progress['26-sagrada']='completed';
 const restored=parseState(JSON.stringify(state));assert.equal(restored.itemEdits['25-checkout'].googleMapsQuery,undefined);assert.equal(restored.bookingEdits['hotel-apartment'].notes,undefined);assert.equal(restored.bookingEdits['hotel-apartment'].confirmationNumber,'personal-reference');assert.equal(restored.itemEdits['25-checkout'].notes,'我的笔记');assert.equal(restored.progress['26-sagrada'],'completed');
 const edited=emptyState();edited.bookingEdits['hotel-apartment']={address:places.find(p=>p.id==='apartment')!.address};assert(placePoint(mergePlaces(places,edited,bookings).find(p=>p.id==='apartment')!));
 edited.bookingEdits['hotel-apartment']={address:'A new personal address'};const moved=mergePlaces(places,edited,bookings).find(p=>p.id==='apartment')!;assert.equal(placePoint(moved),undefined);assert(placeQuery(moved).includes('A new personal address'));
});
