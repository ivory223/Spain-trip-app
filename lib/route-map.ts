import { placeCoordinates } from '@/data/coordinates';
import { places as originalPlaces } from '@/data/places';
import { placeQuery } from './itinerary';
import type { ItineraryItem, LocalState, Place, Progress } from './types';
export type Point = [number,number];
export interface RouteStop {item:ItineraryItem;number:number;point?:Point;area:boolean;progress?:Progress}
export function validPoint(value:unknown):value is Point {
 return Array.isArray(value)&&value.length===2&&value.every(n=>typeof n==='number'&&Number.isFinite(n))&&Math.abs(value[0])<=90&&Math.abs(value[1])<=180;
}
export function placePoint(place:Place):Point|undefined {
 const original=originalPlaces.find(p=>p.id===place.id);
 // An edited address must never retain a pin at the old location.
 if(!original||place.address!==original.address||place.googleMapsQuery!==original.googleMapsQuery)return;
 const point=placeCoordinates[place.id]?.point;return validPoint(point)?point:undefined;
}
export function routeStops(items:ItineraryItem[],places:Place[],state:LocalState):RouteStop[] {
 return items.map((item,index)=>{
  const place=places.find(p=>p.id===item.placeId);
  const point=place&&(!item.address||item.address===place.address)&&(!item.googleMapsQuery||item.googleMapsQuery===placeQuery(place))?placePoint(place):undefined;
  return {item,number:index+1,point,area:!!placeCoordinates[place?.id||'']?.area,progress:state.progress[item.id]};
 });
}
export function routeSegments(stops:RouteStop[]) {
 const segments:{from:RouteStop;to:RouteStop;gap:boolean}[]=[];
 let previous:RouteStop|undefined,gap=false;
 for(const stop of stops){
  if(stop.progress==='skipped')continue;
  if(!stop.point){gap=true;continue;}
  if(previous)segments.push({from:previous,to:stop,gap});
  previous=stop;gap=false;
 }
 return segments;
}
export function distanceMeters(a:Point,b:Point):number {
 const rad=Math.PI/180;
 const h=Math.sin((b[0]-a[0])*rad/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin((b[1]-a[1])*rad/2)**2;
 return 6371000*2*Math.asin(Math.min(1,Math.sqrt(h)));
}
function distanceToSegment(point:Point,a:Point,b:Point) {
 const xScale=111195*Math.cos(point[0]*Math.PI/180),yScale=111195;
 const ax=(a[1]-point[1])*xScale,ay=(a[0]-point[0])*yScale,bx=(b[1]-point[1])*xScale,by=(b[0]-point[0])*yScale;
 const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/length)):0;
 return Math.hypot(ax+t*dx,ay+t*dy);
}
export function nearbyPlaces(places:Place[],stops:RouteStop[],radius=800):Place[] {
 const used=new Set(stops.map(s=>s.item.placeId));
 const points=stops.filter(s=>s.point&&s.progress!=='skipped').map(s=>s.point!);
 // A cross-city train / airport line is not a walkable shopping corridor.
 const segments=routeSegments(stops).filter(s=>!s.gap&&distanceMeters(s.from.point!,s.to.point!)<=5000);
 return places.filter(place=>{
  if(used.has(place.id)||place.availability==='unavailable'||!['food','shopping','vintage','kids','markets'].includes(place.category))return false;
  const point=placePoint(place);if(!point)return false;
  return points.some(p=>distanceMeters(point,p)<=radius)||segments.some(s=>distanceToSegment(point,s.from.point!,s.to.point!)<=radius);
 });
}
export function markerGroups(stops:RouteStop[]) {
 const groups=new Map<string,RouteStop[]>();
 for(const stop of stops){if(!stop.point)continue;const key=stop.point.join(',');groups.set(key,[...(groups.get(key)||[]),stop]);}
 return [...groups.values()];
}
