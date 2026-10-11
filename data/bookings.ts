import { places } from './places';
import type { Booking } from '@/lib/types';
export const bookings: Booking[] = [
 {id:'flight-ua120',type:'flights',title:'United Airlines · UA120',date:'2026-10-22',endDate:'2026-10-23',timeNote:'出发时间待填 · 次日早晨抵达',placeId:'ewr',status:'booked',notes:'EWR → BCN。2 位成人 + Remi（3 岁）。准确航班时间、航站楼、行李额度与订单核对。',cancellationNotes:'以实际订单票规为准'},
 {id:'flight-hainan',type:'flights',title:'Hainan Airlines · HU728 · MAD → CKG',date:'2026-10-29',timeNote:'HU728 · 出发时间以票面为准',placeId:'mad',status:'booked',notes:'Madrid → Chongqing。离开欧盟前在 MAD 完成所需退税验核。准确时间以订单为准。',cancellationNotes:'以实际订单票规为准'},
 {id:'hotel-hilton-bcn',type:'hotels',title:'Hilton Barcelona',date:'2026-10-23',endDate:'2026-10-25',placeId:'hilton-bcn',status:'booked',notes:'2 晚（10/23、10/24）。抵达后先寄存行李；提前入住视酒店安排。',cancellationNotes:'取消截止时间待从订单补充'},
 {id:'hotel-apartment',type:'hotels',title:'Central Family Apartment 31',date:'2026-10-25',endDate:'2026-10-28',placeId:'apartment',status:'booked',address:places.find(p=>p.id==='apartment')!.address,notes:'Barcelona，3 晚，公寓住宿。入住时间、门禁/取钥匙方式待确认。',cancellationNotes:'取消政策待补充'},
 {id:'hotel-hilton-mad',type:'hotels',title:'Hilton Madrid Airport',date:'2026-10-28',endDate:'2026-10-29',placeId:'hilton-mad',status:'booked',notes:'1 晚。Atocha 到达后打车；向酒店确认翌日机场接送安排。',cancellationNotes:'取消截止时间待从订单补充'},
 {id:'train-madrid',type:'trains',title:'Barcelona Sants → Madrid Atocha',date:'2026-10-28',timeNote:'已订票 · 出发时间以票面为准',placeId:'sants',status:'booked',notes:'Barcelona → Madrid 高铁已确认。车次、准确时间、到达站及行李规则以车票为准。',cancellationNotes:'所选票种退改规则待确认'},
 {id:'ticket-park',type:'attractions',title:'桂尔公园 Park Güell',date:'2026-10-25',timeNote:'上午晚些时候或下午 · 待选时段',placeId:'park-guell',status:'need-to-book',reservationUrl:'https://parkguell.barcelona/en/buy-tickets',notes:'主付费高迪景点之一。票面时段确定后再调整当天行程。'},
 {id:'ticket-sagrada',type:'attractions',title:'圣家堂 Sagrada Família',date:'2026-10-26',time:'10:00',timeNote:'目标 10:00–10:30，尚未确认',placeId:'sagrada',status:'need-to-book',reservationUrl:'https://sagradafamilia.org/tickets',notes:'默认不选塔楼票。不要自动同时购买米拉之家和巴特罗之家内部票。'},
 {id:'ticket-sant-pau',type:'attractions',title:'圣保罗现代主义建筑群 Sant Pau',date:'2026-10-26',time:'14:00',timeNote:'建议时间，可修改',placeId:'sant-pau',status:'need-to-book',reservationUrl:'https://santpaubarcelona.org/visites/',notes:'高优先级，约 1–1.5 小时。'},
 {id:'activity-palau',type:'activities',title:'Palau de la Música Catalana',date:'2026-10-24',timeNote:'10/24 上午已订票 · 准确时间以票面为准',placeId:'palau',status:'booked',reservationUrl:'https://www.palaumusica.cat/',notes:'音乐宫上午门票已确认；演出名称、入场时间及儿童安排以已购票券为准。'},
 {id:'activity-miro',type:'activities',title:'I Am the Moon, the Sun and a Star',date:'2026-10-25',time:'11:30',placeId:'miro',status:'sold-out',notes:'3–5 岁。用户提供线上售罄，可问现场票、等候名单、退票；联系状态待确认。未编入主行程。'},
 {id:'activity-chocolate',type:'activities',title:'Chocolate Artists',date:'2026-10-24',time:'15:30',timeNote:'可选候选场次 · 待确认',placeId:'chocolate',status:'need-to-book',notes:'Museu de la Xocolata，3+。仅精力充足且确认有场次时安排。'},
];
