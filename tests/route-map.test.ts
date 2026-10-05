import test from 'node:test';
import assert from 'node:assert/strict';
import { itinerary } from '../data/trip';
import { places } from '../data/places';
import { bookings } from '../data/bookings';
import { placeCoordinates } from '../data/coordinates';
import { changeItem, dayItems, emptyState, mergeItems, mergePlaces, reorder } from '../lib/itinerary';
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
 assert.equal(placePoint(places.find(p=>p.id==='apartment')!),undefined);
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
