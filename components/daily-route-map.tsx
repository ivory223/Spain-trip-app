'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BedDouble, Check, ChevronRight, LocateFixed, Maximize, Navigation, Route, SkipForward, TrainFront } from 'lucide-react';
import { Sheet } from './editor';
import { useLocale } from '@/lib/language';
import { bookingLabels, mapsUrl, placeQuery, priorityLabels } from '@/lib/itinerary';
import { distanceMeters, markerGroups, nearbyPlaces, placePoint, routeSegments, routeStops, type Point, type RouteStop } from '@/lib/route-map';
import { categoryLabels } from '@/data/places';
import type { ItineraryItem, LocalState, Place, TripDay } from '@/lib/types';

type Props={day:TripDay;items:ItineraryItem[];places:Place[];state:LocalState;nextId?:string;onViewItem:(id:string)=>void};
const categoryGlyph={food:'◒',shopping:'◇',vintage:'✧',kids:'✳',markets:'▤',hotels:'⌂',transport:'↔',attractions:'•'};
export default function DailyRouteMap({day,items,places,state,nextId,onViewItem}:Props){
 const {t,language,display}=useLocale();
 const container=useRef<HTMLDivElement>(null),frame=useRef<HTMLDivElement>(null),map=useRef<L.Map|null>(null);
 const [loaded,setLoaded]=useState(false),[showNearby,setShowNearby]=useState(false),[selected,setSelected]=useState<string|null>(null),[selectedPlace,setSelectedPlace]=useState<Place|null>(null);
 const [tileError,setTileError]=useState(false),[locationError,setLocationError]=useState(''),[locating,setLocating]=useState(false);
 const [position,setPosition]=useState<{point:Point;accuracy:number}|null>(null);
 const watch=useRef<number|null>(null),centerOnFix=useRef(false);
 const stops=useMemo(()=>routeStops(items,places,state),[items,places,state]);
 const nearby=useMemo(()=>showNearby?nearbyPlaces(places,stops):[],[showNearby,places,stops]);
 const current=stops.find(s=>s.item.id===selected);
 const currentPlace=places.find(p=>p.id===current?.item.placeId);
 const hotel=places.find(p=>p.id===day.hotelId);
 const hotelPoint=hotel&&placePoint(hotel);
 const separateHotel=hotel&&hotelPoint&&!stops.some(s=>s.item.placeId===hotel.id)?hotel:undefined;
 const name=(item:ItineraryItem)=>language==='en'?item.title:item.titleZh||item.title;
 const placeName=(place:Place)=>language==='en'?place.name:place.nameZh||place.name;
 const pinName=(stop:RouteStop)=>{
  const place=places.find(p=>p.id===stop.item.placeId);
  return place?placeName(place):name(stop.item);
 };
 const fit=()=>{
  const points=stops.filter(s=>s.point&&s.progress!=='skipped').map(s=>s.point!);
  if(!points.length)points.push(...stops.filter(s=>s.point).map(s=>s.point!));
  if(hotelPoint&&(points.length===0||points.some(p=>distanceMeters(p,hotelPoint)<10000)))points.push(hotelPoint);
  if(points.length)map.current?.fitBounds(L.latLngBounds(points),{padding:[45,60],maxZoom:15,animate:false});
  else map.current?.setView(day.timeZone==='America/New_York'?[40.6891,-74.1727]:day.date==='2026-10-29'?[40.46,-3.58]:[41.392,2.165],12,{animate:false});
 };
 const focusStop=(stop:RouteStop,scroll=false)=>{
  setSelected(stop.item.id);setSelectedPlace(null);
  if(stop.point)map.current?.setView(stop.point,Math.max(map.current.getZoom(),15),{animate:false});
  if(scroll)frame.current?.scrollIntoView({block:'center',behavior:'smooth'});
 };
 useEffect(()=>{
  if(!container.current)return;
  const instance=L.map(container.current,{zoomControl:false,scrollWheelZoom:false,attributionControl:true});map.current=instance;
  instance.setView([41.392,2.165],12);
  L.control.zoom({position:'bottomright',zoomInTitle:t('放大地图'),zoomOutTitle:t('缩小地图')}).addTo(instance);
  L.control.scale({position:'bottomleft',imperial:false}).addTo(instance);
  // Normal browser tile caching only. Never prefetch or put OSM tiles in the PWA cache.
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',keepBuffer:1,
  }).addTo(instance);
  tiles.on('tileerror',()=>setTileError(true));
  const resize=new ResizeObserver(()=>instance.invalidateSize({pan:false}));resize.observe(container.current);
  setLoaded(true);
  return()=>{resize.disconnect();instance.remove();map.current=null;};
 // Map lifetime follows this tab, not every local note or clock update.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(loaded)fit();},[loaded,day.date,JSON.stringify(stops.map(s=>[s.item.id,s.point,s.progress])),hotelPoint?.join(',')]);
 useEffect(()=>{setSelected(null);setSelectedPlace(null);},[day.date]);
 useEffect(()=>{
  if(!loaded||!map.current)return;
  for(const [selector,label] of [['.leaflet-control-zoom-in','放大地图'],['.leaflet-control-zoom-out','缩小地图']]){const control=map.current.getContainer().querySelector(selector);control?.setAttribute('title',t(label));control?.setAttribute('aria-label',t(label));}
  const layer=L.layerGroup().addTo(map.current);
  for(const segment of routeSegments(stops)){
   const points=[segment.from.point!,segment.to.point!];
   if(distanceMeters(points[0],points[1])<1)continue;
   L.polyline(points,{color:'#fffefa',weight:7,opacity:.9,interactive:false}).addTo(layer);
   L.polyline(points,{color:'#54725b',weight:3,opacity:.8,dashArray:segment.gap?'3 10':'8 7',interactive:false}).addTo(layer);
  }
  // Multiple activities at one station/airport remain individually tappable at one true coordinate.
  for(const group of markerGroups(stops)){
   const root=document.createElement('div');root.className='route-pin-group';
   for(const stop of group){
    const button=document.createElement('button');button.type='button';button.className=`route-pin ${stop.item.priority} ${stop.item.category} ${stop.progress||''} ${stop.item.id===selected?'selected':''} ${stop.item.id===nextId?'next':''}`;
    button.setAttribute('aria-label',`${stop.number}. ${pinName(stop)} · ${stop.progress?t(stop.progress==='completed'?'已完成':'已跳过'):t(priorityLabels[stop.item.priority])}`);
    button.setAttribute('data-stop-id',stop.item.id);
    const face=document.createElement('span');face.className='pin-face';face.textContent=String(stop.number);button.append(face);
    if(['hotels','transport'].includes(stop.item.category)){const icon=document.createElement('i');icon.textContent=stop.item.category==='hotels'?'⌂':'↔';button.append(icon);}
    if(stop.progress==='completed'){const check=document.createElement('i');check.className='pin-check';check.textContent='✓';button.append(check);}
    button.addEventListener('click',event=>{event.stopPropagation();focusStop(stop);});root.append(button);
   }
   const width=44*group.length;
   L.marker(group[0].point!,{keyboard:false,icon:L.divIcon({html:root,className:'route-div-icon',iconSize:[width,44],iconAnchor:[width/2,22]}),zIndexOffset:group.some(s=>s.item.id===selected)?900:200}).addTo(layer);
  }
  const addPlaceMarker=(place:Place,home=false)=>{
   const point=placePoint(place);if(!point)return;
   const button=document.createElement('button');button.type='button';button.className=home?'context-hotel':'nearby-pin';
   button.setAttribute('aria-label',`${t(home?'今晚住这里':'顺路收藏')} · ${t(categoryLabels[place.category])} · ${placeName(place)}`);
   const face=document.createElement('span');face.textContent=home?'⌂':categoryGlyph[place.category];button.append(face);
   button.addEventListener('click',()=>{setSelected(null);setSelectedPlace(place);});
   L.marker(point,{keyboard:false,icon:L.divIcon({html:button,className:'route-div-icon',iconSize:[44,44],iconAnchor:[22,22]}),zIndexOffset:home?100:-100}).addTo(layer);
  };
  nearby.forEach(place=>addPlaceMarker(place));if(separateHotel)addPlaceMarker(separateHotel,true);
  return()=>{layer.remove();};
 },[loaded,stops,nearby,language,selected,nextId,separateHotel]);
 useEffect(()=>{
  if(!loaded||!map.current||!position)return;
  const group=L.layerGroup().addTo(map.current);
  L.circle(position.point,{radius:position.accuracy,color:'#3385dc',weight:1,fillOpacity:.08,interactive:false}).addTo(group);
  L.circleMarker(position.point,{radius:7,color:'#fff',weight:3,fillColor:'#2384ee',fillOpacity:1}).bindTooltip(t('我的位置')).addTo(group);
  return()=>{group.remove();};
 },[loaded,position,language]);
 const startLocation=()=>{
  if(!window.isSecureContext){setLocationError('定位需要 HTTPS；仍可查看今日路线。');return;}
  if(!navigator.geolocation){setLocationError('此浏览器不支持定位；仍可查看今日路线。');return;}
  if(watch.current!==null)return;
  setLocating(true);setLocationError('');
  watch.current=navigator.geolocation.watchPosition(result=>{
   const point:Point=[result.coords.latitude,result.coords.longitude];setPosition({point,accuracy:result.coords.accuracy});setLocating(false);setLocationError('');
   if(centerOnFix.current){map.current?.setView(point,16);centerOnFix.current=false;}
  },error=>{
   setLocating(false);setLocationError(error.code===1?'定位权限未开启；仍可查看今日路线。':error.code===3?'定位超时，请稍后重试。':'暂时无法获取位置，请稍后重试。');
   if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null;
  },{enableHighAccuracy:true,maximumAge:30000,timeout:12000});
 };
 useEffect(()=>{
  let mounted=true;
  // Already granted permission may show the dot; never prompt on page load.
  void navigator.permissions?.query({name:'geolocation'}).then(permission=>{if(mounted&&permission.state==='granted')startLocation();}).catch(()=>{});
  return()=>{mounted=false;if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null;};
 },[]);
 const locate=()=>{if(position){map.current?.setView(position.point,16);return;}centerOnFix.current=true;startLocation();};
 const navLink=(item:ItineraryItem)=>item.googleMapsQuery||places.find(p=>p.id===item.placeId)&&placeQuery(places.find(p=>p.id===item.placeId)!);
 const missing=stops.filter(s=>!s.point).length;
 return <section className="daily-route" aria-label={t('每日路线地图')}>
  <div className="route-heading"><div><span className="eyebrow">{t('今天都去哪？')}</span><h2>{day.city}</h2></div><span className="route-count">{stops.length} {t('站')} · {stops.filter(s=>s.progress==='completed').length} {t('已完成')}</span></div>
  <div className="route-frame" ref={frame}>
   <div ref={container} className="route-canvas" role="region" aria-label={t('可缩放的每日路线地图')}/>
   <div className="map-top-controls"><label className="nearby-toggle"><input type="checkbox" checked={showNearby} onChange={e=>setShowNearby(e.target.checked)}/>{t('显示顺路收藏')}</label><button className="map-control" onClick={fit} aria-label={t('查看完整路线')} title={t('查看完整路线')}><Maximize size={19}/></button></div>
   <button className="map-locate" onClick={locate} disabled={locating}><LocateFixed size={18}/>{t(locating?'正在定位…':'回到我的位置')}</button>
   {tileError&&<p className="tile-notice" role="status">{t('底图暂不可用，路线与列表仍可查看。')}</p>}
  </div>
  <div className="map-caption"><span><i className="route-line-key"/>{t('连线仅示意顺序，非实际导航路线')}</span><span><i className="optional-key"/>{t('可选')}</span><span><BedDouble size={13}/>{t('住宿')}</span><span><TrainFront size={13}/>{t('交通')}</span></div>
  {locationError&&<p className="route-message" role="status">{t(locationError)}</p>}
  {showNearby&&<p className="route-message" role="status">{t('今日路线约 800 米内的已保存地点')} · {nearby.length} {t('个地点')}</p>}
  <div className="route-list-heading"><h3>{t('今日路线')}</h3><span>{t('与行程顺序同步')}</span></div>
  {missing>0&&<p className="route-message">{missing} {t('站位置待补充，保留原编号')}</p>}
  {!stops.length&&<div className="empty"><Route size={28}/><p>{t('这一天还没有活动，先到行程里添加。')}</p></div>}
  <ol className="route-stop-list">{stops.map((stop,index)=>{
   const previous=stops[index-1];const distance=stop.point&&previous?.point?distanceMeters(previous.point,stop.point):null;
   return <li key={stop.item.id} className={`route-stop ${stop.progress||''} ${stop.item.id===nextId?'next':''}`} data-testid={`route-stop-${stop.item.id}`}>
    <button onClick={()=>focusStop(stop,true)} aria-label={`${stop.number}. ${pinName(stop)} · ${t('查看地图站点')}`}>
     <span className={`list-number ${stop.item.priority}`}>{stop.number}</span>
     <span className="stop-copy"><span className="stop-title">{pinName(stop)}{stop.item.id===nextId&&<em>{t('下一站')}</em>}</span><span className="stop-meta">{stop.item.startTime||t('时间待定')}{display(stop.item,'duration')?' · '+display(stop.item,'duration'):''}{!stop.point?' · '+t('位置待补充'):stop.area?' · '+t('区域参考点'):''}</span>{display(stop.item,'walkingContext')&&<span className="stop-context">{display(stop.item,'walkingContext')}</span>}{distance!==null&&distance>30&&<span className="stop-distance">{t('距上一站直线约')} {distance<1000?`${Math.round(distance/10)*10} m`:`${(distance/1000).toFixed(1)} km`}</span>}</span>
     <span className="stop-state">{stop.progress==='completed'?<Check size={18} aria-label={t('已完成')}/>:stop.progress==='skipped'?<SkipForward size={18} aria-label={t('已跳过')}/>:<ChevronRight size={18}/>}</span>
    </button>
   </li>;
  })}</ol>
  {current&&<Sheet className="route-sheet" title={`${current.number}. ${currentPlace?.name||current.item.title}`} description={language==='zh'?(currentPlace?.nameZh||current.item.titleZh||t('今日路线')):(display(current.item,'timeNote')||t('今日路线'))} onClose={()=>setSelected(null)}>
   <div className="route-sheet-meta"><strong>{current.item.startTime||t('时间待定')}</strong>{display(current.item,'duration')&&<span>{t('预计停留')} · {display(current.item,'duration')}</span>}<span className={`badge status-${current.item.bookingStatus}`}>{t(bookingLabels[current.item.bookingStatus])}</span>{current.progress&&<span className="badge">{t(current.progress==='completed'?'已完成':'已跳过')}</span>}</div>
   {current.area&&<p className="route-message">{t('区域参考点，不代表具体入口。')}</p>}{!current.point&&<p className="route-message">{t('位置待补充；可查看行程或用名称导航。')}</p>}
   {display(current.item,'walkingContext')&&<p className="route-sheet-context">{display(current.item,'walkingContext')}</p>}
   <div className="route-sheet-actions">{navLink(current.item)&&<a className="primary-button" href={mapsUrl(navLink(current.item)!)} target="_blank" rel="noopener noreferrer"><Navigation size={17}/>{t('导航')}</a>}<button className="outline-button" onClick={()=>onViewItem(current.item.id)}><Route size={17}/>{t('查看行程')}</button></div>
  </Sheet>}
  {selectedPlace&&<Sheet className="route-sheet" title={placeName(selectedPlace)} description={selectedPlace.name} onClose={()=>setSelectedPlace(null)}><p className="route-message">{t(categoryLabels[selectedPlace.category])} · {display(selectedPlace,'neighborhood')}</p>{display(selectedPlace,'notes')&&<p className="route-sheet-context">{display(selectedPlace,'notes')}</p>}<a className="primary-button" href={mapsUrl(placeQuery(selectedPlace))} target="_blank" rel="noopener noreferrer"><Navigation size={17}/>{t('导航')}</a></Sheet>}
 </section>;
}
