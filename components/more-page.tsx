'use client';
import { ArrowLeft, BedDouble, CheckSquare, ChevronRight, Download, FileText, Plane, Receipt, Settings, Ticket, TrainFront } from 'lucide-react';
import { LanguageSwitch, useLocale } from '@/lib/language';
import { days, sourceNotes } from '@/data/trip';
import { safeUrl } from '@/lib/itinerary';
import type { AppRoute } from '@/lib/navigation';
import type { Booking, LocalState } from '@/lib/types';
const links=[
 {id:'bookings',en:'Bookings',zh:'全部预订',Icon:Ticket},
 {id:'flights',en:'Flights',zh:'航班',Icon:Plane},
 {id:'hotels',en:'Hotels',zh:'酒店与公寓',Icon:BedDouble},
 {id:'train',en:'Train',zh:'火车',Icon:TrainFront},
 {id:'tickets',en:'Tickets',zh:'门票与活动',Icon:Ticket},
 {id:'tax-refund',en:'Tax Refund',zh:'退税',Icon:Receipt},
 {id:'packing',en:'Packing List',zh:'行李清单',Icon:CheckSquare},
 {id:'documents',en:'Travel Documents',zh:'旅行文件',Icon:FileText},
 {id:'settings',en:'Settings',zh:'设置',Icon:Settings},
] as const;
const packing=[['passports','Passports and travel documents','护照与旅行证件'],['tickets','Tickets and booking confirmations','票券和预订确认'],['bags','3 large suitcases and stroller','3 件大行李箱与推车'],['clothes','Clothes and comfortable shoes','衣物与舒适的鞋子'],['child','Child’s snacks and daily essentials','孩子的零食与日用品'],['care','Personal care and medicines','洗护用品与常用药'],['power','Chargers and plug adapters','充电器与转换插头'],['rain','Rain gear and sun protection','雨具与防晒用品']] as const;
export function MorePage({route,bookings,state,update,onEditBooking,exportBackup,offlineReady}:{route:AppRoute;bookings:Booking[];state:LocalState;update:(fn:(s:LocalState)=>LocalState)=>void;onEditBooking:(booking:Booking)=>void;exportBackup:()=>void;offlineReady:boolean}){
 const {language,t,display}=useLocale();const en=language==='en',page=route.slice(5),current=links.find(l=>l.id===page);
 const toggle=(id:string)=>update(s=>({...s,checks:{...s.checks,[id]:!s.checks[id]}}));
 return <section className="more-view">{current&&<a className="more-back" href="#more"><ArrowLeft size={16}/> More</a>}<div className="page-heading"><span className="eyebrow">TRAVEL ESSENTIALS</span><h2>{current?.en||'More'}</h2>{!en&&current&&<p>{current.zh}</p>}</div>
 {route==='more'&&<div className="more-grid">{links.map(({id,en:label,zh,Icon})=><a key={id} className="more-card" href={`#more/${id}`}><Icon size={22}/><span><strong>{label}</strong>{!en&&<small>{zh}</small>}</span><ChevronRight size={18}/></a>)}</div>}
 {page==='packing'&&<section className="checklist"><h3>{en?'Before you leave':'出发前检查'}</h3>{packing.map(([id,english,chinese])=><label key={id}><input type="checkbox" checked={!!state.checks[`packing-${id}`]} onChange={()=>toggle(`packing-${id}`)}/><span>{en?english:chinese}</span></label>)}</section>}
 {page==='tax-refund'&&<><p className="description">{en?'Keep receipts and refund forms together. At Madrid airport, keep goods accessible for any required customs validation before checking luggage.':'收据与退税单集中保管。在马德里机场办理所需海关验核时，商品应可随时取出；先验核再托运。'}</p>{days.filter(d=>d.date>='2026-10-28').map(day=><section className="checklist" key={day.date}><h3>{day.date}</h3>{day.checklist?.filter(c=>['receipts','operators','passport-info','goods','valuables','customs','refund','checkin'].includes(c.id)).map(c=><label key={c.id}><input type="checkbox" checked={!!state.checks[`${day.date}-${c.id}`]} onChange={()=>toggle(`${day.date}-${c.id}`)}/><span>{t(c.label)}</span></label>)}</section>)}<a className="outline-button" href={sourceNotes.taxRefund} target="_blank" rel="noreferrer">{t('查看 Aena 官方退税流程')} ↗</a></>}
 {page==='documents'&&<><p className="description">{en?'Keep passports and required entry documents accessible. Your saved booking references and ticket links are collected below.':'请随身保管护照及所需入境证件。以下集中显示已保存的预订确认号和票券链接。'}</p><div className="place-grid">{bookings.map(booking=><article className="booking-card" key={booking.id}><h4>{display(booking,'title')}</h4><p>{booking.date}</p><p>{booking.confirmationNumber||t('从实际订单补充')}</p>{safeUrl(booking.ticketUrl)?<a className="outline-button" href={safeUrl(booking.ticketUrl)} target="_blank" rel="noreferrer">{t('打开票券')}</a>:<p>{t('票券尚未添加')}</p>}<button className="outline-button" onClick={()=>onEditBooking(booking)}>{t('编辑预订')}</button></article>)}</div></>}
 {page==='settings'&&<div className="settings-content"><article className="booking-card"><h3>{en?'Language':'语言'}</h3><LanguageSwitch/></article><article className="booking-card"><h3>{en?'Offline & backup':'离线与备份'}</h3><p>{t(offlineReady?'此设备已缓存应用和行程，可离线查看。':'离线缓存尚未就绪。正式版本首次联网打开后会缓存行程。')}</p><p>{t('导航与外部购票仍需要网络。修改只存在这台设备的这个浏览器，清除网站数据会删除修改；家人之间不会自动同步。')}</p><button className="outline-button" onClick={exportBackup}><Download size={16}/>{t('导出本机备份')}</button></article></div>}
 </section>;
}
