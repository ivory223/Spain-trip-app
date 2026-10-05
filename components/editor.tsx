'use client';
import { validPoint } from '@/lib/route-map';
import { restoreField } from '@/lib/i18n';
import { useLocale } from '@/lib/language';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Booking, BookingStatus, ItineraryItem, Place, TripDay } from '@/lib/types';
import { bookingLabels, safeUrl } from '@/lib/itinerary';
import { categoryLabels } from '@/data/places';
import { useState } from 'react';
export function Sheet({title,description,children,onClose,className}:{title:string;description?:string;className?:string;children:React.ReactNode;onClose:()=>void}) {
 const {t}=useLocale();
 return <Dialog.Root open onOpenChange={open=>{if(!open)onClose();}}><Dialog.Portal><Dialog.Overlay className="sheet-overlay"/><Dialog.Content className={`sheet ${className||''}`}><div className="sheet-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{t(description||'修改只保存到当前设备。')}</Dialog.Description></div><Dialog.Close className="icon-button" aria-label={t("关闭")}><X size={20}/></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function StatusField({value}:{value:BookingStatus}) {
 const {t}=useLocale();return <label>{t("预订状态")}<select aria-label={t("预订状态")} name="bookingStatus" defaultValue={value}>{Object.entries(bookingLabels).map(([k,v])=><option key={k} value={k}>{t(v)}</option>)}</select></label>;}
function DateField({value,days}:{value:string;days:TripDay[]}) {
 const {t}=useLocale();return <label>{t("安排日期")}<select aria-label={t("安排日期")} name="date" defaultValue={value}>{days.map(day=><option key={day.date} value={day.date}>{day.date.slice(5).replace('-','/')} · {t(day.weekdayZh)} · {t(day.cityZh)}</option>)}</select></label>;}
const value = (form:FormData,key:string)=>String(form.get(key)||'').trim();
export function ItemEditor({item,days,places,onSave,onClose}:{item:ItineraryItem;days:TripDay[];places:Place[];onSave:(patch:Partial<ItineraryItem>)=>void;onClose:()=>void}) {
 const {t,language,display}=useLocale();
 const [error,setError]=useState('');
 return <Sheet title={item.id==='new'?t('添加活动'):t('编辑活动')} description={t("时间、日期、顺序和备注都可以按旅途节奏调整。")} onClose={onClose}><form className="edit-form" onSubmit={event=>{
  event.preventDefault();const f=new FormData(event.currentTarget);const title=restoreField(item,'title',value(f,'title'),language),startTime=value(f,'startTime'),endTime=value(f,'endTime');
  if(!title){setError('请填写活动名称');return;}
  if(startTime && endTime && endTime<startTime){setError('结束时间应晚于开始时间；跨夜航班请只填写出发时间。');return;}
  const bookingUrl=value(f,'bookingUrl');if(bookingUrl&&!safeUrl(bookingUrl)){setError('请输入完整的 https:// 或 http:// 链接');return;}
  onSave({title,titleZh:value(f,'titleZh'),placeId:value(f,'placeId')||undefined,date:value(f,'date'),startTime,endTime,category:value(f,'category') as ItineraryItem['category'],priority:value(f,'priority') as ItineraryItem['priority'],bookingStatus:value(f,'bookingStatus') as BookingStatus,duration:restoreField(item,'duration',value(f,'duration'),language),notes:restoreField(item,'notes',value(f,'notes'),language),address:value(f,'address'),googleMapsQuery:value(f,'googleMapsQuery'),bookingUrl,confirmationNumber:value(f,'confirmationNumber'),childFriendly:f.has('childFriendly'),strollerFriendly:f.has('strollerFriendly'),napFriendly:f.has('napFriendly'),indoor:f.has('indoor'),timeNote:startTime!==item.startTime?'自定时间':item.timeNote});
 }}>
 <label>{t("活动名称 / Original name")}<input name="title" required defaultValue={display(item,'title')} maxLength={180}/></label>
 <label>{t("中文名称（可选）")}<input name="titleZh" defaultValue={item.titleZh} maxLength={100}/></label>
 <label>{t("关联已保存地点")}<select aria-label={t("关联已保存地点")} name="placeId" defaultValue={item.placeId||''}><option value="">{t("不关联 / 自定义活动")}</option>{places.filter(p=>p.availability!=='unavailable').map(p=><option key={p.id} value={p.id}>{language==='en'?p.name:(p.nameZh||p.name)}</option>)}</select></label>
 <DateField value={item.date} days={days}/>
 <div className="form-pair"><label>{t("开始时间")}<input type="time" name="startTime" defaultValue={item.startTime}/></label><label>{t("结束时间")}<input type="time" name="endTime" defaultValue={item.endTime}/></label></div>
 <p className="field-help">{t("不确定时留空；页面会显示「时间待定」。所有时间按当天所在地计算。")}</p>
 <div className="form-pair"><label>{t("类别")}<select aria-label={t("类别")} name="category" defaultValue={item.category}>{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{t(v)}</option>)}</select></label><label>{t("优先级")}<select aria-label={t("优先级")} name="priority" defaultValue={item.priority}><option value="must">{t("MUST · 必去")}</option><option value="recommended">{t("推荐")}</option><option value="optional">{t("可选")}</option></select></label></div>
 <StatusField value={item.bookingStatus}/>
 <label>{t("预计停留")}<input name="duration" defaultValue={display(item,'duration')} placeholder={t("例如：1–1.5 小时")}/></label>
 <label>{t("笔记")}<textarea name="notes" rows={3} defaultValue={display(item,'notes')} placeholder={t("进门方式、Remi 的需要、想买什么…")} maxLength={6000}/></label>
 <details className="editor-details"><summary>{t("地址、票务与亲子信息")}</summary><label>{t("地址")}<input name="address" defaultValue={item.address}/></label><label>{t("地图搜索词")}<input name="googleMapsQuery" defaultValue={item.googleMapsQuery} placeholder={t("地点名称 + Barcelona / Madrid")}/></label><label>{t("预订链接")}<input type="url" name="bookingUrl" defaultValue={item.bookingUrl}/></label><label>{t("确认号")}<input name="confirmationNumber" defaultValue={item.confirmationNumber}/></label><div className="checkbox-grid">{([['childFriendly',t('适合 Remi')],['strollerFriendly',t('推车友好')],['napFriendly',t('适合推车午睡')],['indoor',t('室内')]] as const).map(([k,label])=><label key={k}><input type="checkbox" name={k} defaultChecked={item[k]}/>{t(label)}</label>)}</div></details>
 {error&&<p role="alert" className="error">{t(error)}</p>}<button type="submit" className="primary-button">{t("保存活动")}</button>
 </form></Sheet>;
}
export function BookingEditor({booking,days,onSave,onClose}:{booking:Booking;days:TripDay[];onSave:(patch:Partial<Booking>)=>void;onClose:()=>void}) {
 const {t,language,display}=useLocale();
 const [error,setError]=useState('');
 return <Sheet title={t("编辑预订")} description={t("“已预订”只是你的记录；应用不会实际购买或取消任何订单。")} onClose={onClose}><form className="edit-form" onSubmit={e=>{
 e.preventDefault();const f=new FormData(e.currentTarget),ticketUrl=value(f,'ticketUrl'),reservationUrl=value(f,'reservationUrl'),endDate=value(f,'endDate');
 if(endDate&&endDate<value(f,'date')){setError('结束日期不能早于开始日期');return;}
 if((ticketUrl&&!safeUrl(ticketUrl))||(reservationUrl&&!safeUrl(reservationUrl))){setError('请输入完整的 http(s) 链接');return;}
 onSave({title:restoreField(booking,'title',value(f,'title'),language),date:value(f,'date'),endDate:endDate||undefined,time:value(f,'time'),status:value(f,'bookingStatus') as BookingStatus,confirmationNumber:value(f,'confirmationNumber'),address:value(f,'address'),notes:restoreField(booking,'notes',value(f,'notes'),language),ticketUrl,reservationUrl,cancellationNotes:restoreField(booking,'cancellationNotes',value(f,'cancellationNotes'),language),timeNote:restoreField(booking,'timeNote',value(f,'timeNote'),language)});
 }}><label>{t("预订名称")}<input name="title" required defaultValue={display(booking,'title')}/></label><DateField value={booking.date} days={days}/><label>{t("结束 / 退房日期（可选）")}<input type="date" name="endDate" defaultValue={booking.endDate}/></label><label>{t("出发 / 开始时间")}<input type="time" name="time" defaultValue={booking.time}/></label><label>{t("时间说明")}<input name="timeNote" defaultValue={display(booking,'timeNote')}/></label><StatusField value={booking.status}/><label>{t("确认号")}<input name="confirmationNumber" defaultValue={booking.confirmationNumber} placeholder={t("从实际订单补充")}/></label><label>{t("准确地址")}<input name="address" defaultValue={booking.address}/></label><label>{t("打开票券链接")}<input type="url" name="ticketUrl" defaultValue={booking.ticketUrl} placeholder="https://…"/></label><label>{t("预订 / 官方网站")}<input type="url" name="reservationUrl" defaultValue={booking.reservationUrl}/></label><label>{t("备注")}<textarea name="notes" defaultValue={display(booking,'notes')} rows={3}/></label><label>{t("取消与退改说明")}<textarea name="cancellationNotes" defaultValue={display(booking,'cancellationNotes')} rows={2}/></label>{error&&<p role="alert" className="error">{t(error)}</p>}<button className="primary-button" type="submit">{t("保存预订")}</button></form></Sheet>;
}
export function PlaceEditor({onSave,onClose}:{onSave:(place:Place)=>void;onClose:()=>void}) {
 const {t}=useLocale();const [error,setError]=useState('');
 return <Sheet title={t("保存一个新地点")} onClose={onClose}><form className="edit-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const lat=value(f,'latitude'),lon=value(f,'longitude');if((lat||lon)&&(!lat||!lon||!validPoint([Number(lat),Number(lon)]))){setError('请填写有效的纬度和经度，或同时留空。');return;}onSave({latitude:lat?Number(lat):undefined,longitude:lon?Number(lon):undefined,id:`place-${crypto.randomUUID()}`,name:value(f,'name'),nameZh:value(f,'nameZh'),category:value(f,'category') as Place['category'],neighborhood:value(f,'neighborhood'),address:value(f,'address'),priority:value(f,'priority') as Place['priority'],notes:value(f,'notes'),googleMapsQuery:[value(f,'name'),value(f,'address')||value(f,'neighborhood')].join(' ')});}}><label>{t("地点名称")}<input name="name" required maxLength={180}/></label><label>{t("中文名称（可选）")}<input name="nameZh"/></label><label>{t("类别")}<select aria-label={t("类别")} name="category">{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{t(v)}</option>)}</select></label><label>{t("街区 / 城市")}<input name="neighborhood" required placeholder={t("例如：Eixample, Barcelona")}/></label><label>{t("准确地址")}<input name="address"/></label><details className="editor-details"><summary>{t("地图坐标（可选）")}</summary><div className="form-pair"><label>{t("纬度")}<input name="latitude" type="number" min="-90" max="90" step="any"/></label><label>{t("经度")}<input name="longitude" type="number" min="-180" max="180" step="any"/></label></div><p className="field-help">{t("填入已知坐标即可显示地图标记；没有坐标仍可按地址导航。")}</p></details><label>{t("优先级")}<select aria-label={t("优先级")} name="priority" defaultValue="recommended"><option value="must">{t("Must · 必去")}</option><option value="recommended">{t("Want to visit · 想去")}</option><option value="optional">{t("If nearby · 顺路再去")}</option></select></label><label>{t("笔记")}<textarea name="notes" rows={3}/></label>{error&&<p role="alert" className="error">{t(error)}</p>}<button className="primary-button" type="submit">{t("保存到地点库")}</button></form></Sheet>;
}
