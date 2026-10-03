'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Booking, BookingStatus, ItineraryItem, Place, TripDay } from '@/lib/types';
import { bookingLabels, safeUrl } from '@/lib/itinerary';
import { categoryLabels } from '@/data/places';
import { useState } from 'react';
export function Sheet({title,description,children,onClose}:{title:string;description?:string;children:React.ReactNode;onClose:()=>void}) {
 return <Dialog.Root open onOpenChange={open=>{if(!open)onClose();}}><Dialog.Portal><Dialog.Overlay className="sheet-overlay"/><Dialog.Content className="sheet"><div className="sheet-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description||'修改只保存到当前设备。'}</Dialog.Description></div><Dialog.Close className="icon-button" aria-label="关闭"><X size={20}/></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function StatusField({value}:{value:BookingStatus}) {return <label>预订状态<select aria-label="预订状态" name="bookingStatus" defaultValue={value}>{Object.entries(bookingLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>;}
function DateField({value,days}:{value:string;days:TripDay[]}) {return <label>安排日期<select aria-label="安排日期" name="date" defaultValue={value}>{days.map(day=><option key={day.date} value={day.date}>{day.date.slice(5).replace('-','/')} · {day.weekdayZh} · {day.cityZh}</option>)}</select></label>;}
const value = (form:FormData,key:string)=>String(form.get(key)||'').trim();
export function ItemEditor({item,days,places,onSave,onClose}:{item:ItineraryItem;days:TripDay[];places:Place[];onSave:(patch:Partial<ItineraryItem>)=>void;onClose:()=>void}) {
 const [error,setError]=useState('');
 return <Sheet title={item.id==='new'?'添加活动':'编辑活动'} description="时间、日期、顺序和备注都可以按旅途节奏调整。" onClose={onClose}><form className="edit-form" onSubmit={event=>{
  event.preventDefault();const f=new FormData(event.currentTarget);const title=value(f,'title'),startTime=value(f,'startTime'),endTime=value(f,'endTime');
  if(!title){setError('请填写活动名称');return;}
  if(startTime && endTime && endTime<startTime){setError('结束时间应晚于开始时间；跨夜航班请只填写出发时间。');return;}
  const bookingUrl=value(f,'bookingUrl');if(bookingUrl&&!safeUrl(bookingUrl)){setError('请输入完整的 https:// 或 http:// 链接');return;}
  onSave({title,titleZh:value(f,'titleZh'),placeId:value(f,'placeId')||undefined,date:value(f,'date'),startTime,endTime,category:value(f,'category') as ItineraryItem['category'],priority:value(f,'priority') as ItineraryItem['priority'],bookingStatus:value(f,'bookingStatus') as BookingStatus,duration:value(f,'duration'),notes:value(f,'notes'),address:value(f,'address'),googleMapsQuery:value(f,'googleMapsQuery'),bookingUrl,confirmationNumber:value(f,'confirmationNumber'),childFriendly:f.has('childFriendly'),strollerFriendly:f.has('strollerFriendly'),napFriendly:f.has('napFriendly'),indoor:f.has('indoor'),timeNote:startTime!==item.startTime?'自定时间':item.timeNote});
 }}>
 <label>活动名称 / Original name<input name="title" required defaultValue={item.title} maxLength={180}/></label>
 <label>中文名称（可选）<input name="titleZh" defaultValue={item.titleZh} maxLength={100}/></label>
 <label>关联已保存地点<select aria-label="关联已保存地点" name="placeId" defaultValue={item.placeId||''}><option value="">不关联 / 自定义活动</option>{places.filter(p=>p.availability!=='unavailable').map(p=><option key={p.id} value={p.id}>{p.nameZh||p.name}</option>)}</select></label>
 <DateField value={item.date} days={days}/>
 <div className="form-pair"><label>开始时间<input type="time" name="startTime" defaultValue={item.startTime}/></label><label>结束时间<input type="time" name="endTime" defaultValue={item.endTime}/></label></div>
 <p className="field-help">不确定时留空；页面会显示「时间待定」。所有时间按当天所在地计算。</p>
 <div className="form-pair"><label>类别<select aria-label="类别" name="category" defaultValue={item.category}>{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>优先级<select aria-label="优先级" name="priority" defaultValue={item.priority}><option value="must">MUST · 必去</option><option value="recommended">推荐</option><option value="optional">可选</option></select></label></div>
 <StatusField value={item.bookingStatus}/>
 <label>预计停留<input name="duration" defaultValue={item.duration} placeholder="例如：1–1.5 小时"/></label>
 <label>笔记<textarea name="notes" rows={3} defaultValue={item.notes} placeholder="进门方式、Remi 的需要、想买什么…" maxLength={6000}/></label>
 <details className="editor-details"><summary>地址、票务与亲子信息</summary><label>地址<input name="address" defaultValue={item.address}/></label><label>地图搜索词<input name="googleMapsQuery" defaultValue={item.googleMapsQuery} placeholder="地点名称 + Barcelona / Madrid"/></label><label>预订链接<input type="url" name="bookingUrl" defaultValue={item.bookingUrl}/></label><label>确认号<input name="confirmationNumber" defaultValue={item.confirmationNumber}/></label><div className="checkbox-grid">{([['childFriendly','适合 Remi'],['strollerFriendly','推车友好'],['napFriendly','适合推车午睡'],['indoor','室内']] as const).map(([k,label])=><label key={k}><input type="checkbox" name={k} defaultChecked={item[k]}/>{label}</label>)}</div></details>
 {error&&<p role="alert" className="error">{error}</p>}<button type="submit" className="primary-button">保存活动</button>
 </form></Sheet>;
}
export function BookingEditor({booking,days,onSave,onClose}:{booking:Booking;days:TripDay[];onSave:(patch:Partial<Booking>)=>void;onClose:()=>void}) {
 const [error,setError]=useState('');
 return <Sheet title="编辑预订" description="“已预订”只是你的记录；应用不会实际购买或取消任何订单。" onClose={onClose}><form className="edit-form" onSubmit={e=>{
 e.preventDefault();const f=new FormData(e.currentTarget),ticketUrl=value(f,'ticketUrl'),reservationUrl=value(f,'reservationUrl'),endDate=value(f,'endDate');
 if(endDate&&endDate<value(f,'date')){setError('结束日期不能早于开始日期');return;}
 if((ticketUrl&&!safeUrl(ticketUrl))||(reservationUrl&&!safeUrl(reservationUrl))){setError('请输入完整的 http(s) 链接');return;}
 onSave({title:value(f,'title'),date:value(f,'date'),endDate:endDate||undefined,time:value(f,'time'),status:value(f,'bookingStatus') as BookingStatus,confirmationNumber:value(f,'confirmationNumber'),address:value(f,'address'),notes:value(f,'notes'),ticketUrl,reservationUrl,cancellationNotes:value(f,'cancellationNotes'),timeNote:value(f,'timeNote')});
 }}><label>预订名称<input name="title" required defaultValue={booking.title}/></label><DateField value={booking.date} days={days}/><label>结束 / 退房日期（可选）<input type="date" name="endDate" defaultValue={booking.endDate}/></label><label>出发 / 开始时间<input type="time" name="time" defaultValue={booking.time}/></label><label>时间说明<input name="timeNote" defaultValue={booking.timeNote}/></label><StatusField value={booking.status}/><label>确认号<input name="confirmationNumber" defaultValue={booking.confirmationNumber} placeholder="从实际订单补充"/></label><label>准确地址<input name="address" defaultValue={booking.address}/></label><label>打开票券链接<input type="url" name="ticketUrl" defaultValue={booking.ticketUrl} placeholder="https://…"/></label><label>预订 / 官方网站<input type="url" name="reservationUrl" defaultValue={booking.reservationUrl}/></label><label>备注<textarea name="notes" defaultValue={booking.notes} rows={3}/></label><label>取消与退改说明<textarea name="cancellationNotes" defaultValue={booking.cancellationNotes} rows={2}/></label>{error&&<p role="alert" className="error">{error}</p>}<button className="primary-button" type="submit">保存预订</button></form></Sheet>;
}
export function PlaceEditor({onSave,onClose}:{onSave:(place:Place)=>void;onClose:()=>void}) {
 return <Sheet title="保存一个新地点" onClose={onClose}><form className="edit-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);onSave({id:`place-${crypto.randomUUID()}`,name:value(f,'name'),nameZh:value(f,'nameZh'),category:value(f,'category') as Place['category'],neighborhood:value(f,'neighborhood'),address:value(f,'address'),priority:value(f,'priority') as Place['priority'],notes:value(f,'notes'),googleMapsQuery:[value(f,'name'),value(f,'address')||value(f,'neighborhood')].join(' ')});}}><label>地点名称<input name="name" required maxLength={180}/></label><label>中文名称（可选）<input name="nameZh"/></label><label>类别<select aria-label="类别" name="category">{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>街区 / 城市<input name="neighborhood" required placeholder="例如：Eixample, Barcelona"/></label><label>准确地址<input name="address"/></label><label>优先级<select aria-label="优先级" name="priority" defaultValue="recommended"><option value="must">Must · 必去</option><option value="recommended">Want to visit · 想去</option><option value="optional">If nearby · 顺路再去</option></select></label><label>笔记<textarea name="notes" rows={3}/></label><button className="primary-button" type="submit">保存到地点库</button></form></Sheet>;
}
