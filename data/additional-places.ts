import type { Place } from '@/lib/types';
export const additionalPlaces:Place[]=[
  {
    "id": "grocery-concepcio",
    "name": "Mercat de la Concepció",
    "category": "grocery",
    "neighborhood": "l'Eixample",
    "address": "Carrer d'Aragó 313–317, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.laconcepcio.cat/es/contacto/",
    "notes": "公寓附近的生鲜市场和特色食品摊位。请确认当前营业时间，不默认周日开放。",
    "needsVerification": true
  },
  {
    "id": "grocery-veritas",
    "name": "Veritas · Passeig de Sant Joan",
    "category": "grocery",
    "neighborhood": "Gràcia",
    "address": "Passeig de Sant Joan 144, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.veritas.es/barcelona-sant-joan-t015",
    "notes": "公寓附近的有机食品店。可在周日前采购，或选择已确认营业的其他店铺。",
    "needsVerification": true,
    "openingHours": "周一至周六 09:00–21:30 · 周日休息（2026-10-09 核对）"
  },
  {
    "id": "grocery-condis",
    "name": "Condis · Bailèn",
    "category": "grocery",
    "neighborhood": "l'Eixample",
    "address": "Carrer de Bailèn 93, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.openstreetmap.org/node/13059373602",
    "notes": "Bailèn 街附近的超市。入住后采购前，请先确认周日是否营业。",
    "needsVerification": true
  },
  {
    "id": "indi-cold",
    "name": "Indi & Cold",
    "category": "shopping",
    "neighborhood": "l'Eixample",
    "address": "Carrer de València 260, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.openstreetmap.org/node/11291344954",
    "notes": "位置来自 OpenStreetMap；营业时间和库存待确认。",
    "needsVerification": true
  },
  {
    "id": "skfk",
    "name": "SKFK",
    "category": "shopping",
    "neighborhood": "Gràcia",
    "address": "Carrer de Verdi, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.openstreetmap.org/node/10763878207",
    "notes": "位置来自 OpenStreetMap；营业时间和库存待确认。",
    "needsVerification": true
  },
  {
    "id": "bimba",
    "name": "Bimba y Lola",
    "category": "shopping",
    "neighborhood": "les Corts",
    "address": "Avinguda Diagonal 557, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.openstreetmap.org/node/11048677998",
    "notes": "位置来自 OpenStreetMap；营业时间和库存待确认。",
    "needsVerification": true
  },
  {
    "id": "hoss",
    "name": "Hoss Intropia",
    "category": "shopping",
    "neighborhood": "Barcelona",
    "priority": "optional",
    "needsVerification": true,
    "notes": "前往之前，请选择并确认巴塞罗那的具体分店。"
  },
  {
    "id": "eseoese",
    "name": "eseOese",
    "category": "shopping",
    "neighborhood": "Barcelona",
    "priority": "optional",
    "needsVerification": true,
    "notes": "前往之前，请选择并确认巴塞罗那的具体分店。"
  },
  {
    "id": "alohas",
    "name": "ALOHAS",
    "category": "shopping",
    "neighborhood": "Barcelona",
    "priority": "optional",
    "needsVerification": true,
    "notes": "前往之前，请选择并确认巴塞罗那的具体分店。"
  },
  {
    "id": "escena-poblenou",
    "name": "Festival Escena Poblenou",
    "category": "events",
    "neighborhood": "Poblenou",
    "priority": "optional",
    "openingHours": "2026年10月22–25日 · 各演出时间不同",
    "sourceUrl": "https://www.escenapoblenou.com/",
    "notes": "活动有多个场地。选择演出后确认地点、适龄提示和购票要求；尚未加入行程。",
    "needsVerification": true
  },
  {
    "id": "open-house",
    "name": "48h Open House Barcelona",
    "category": "events",
    "neighborhood": "Barcelona",
    "priority": "optional",
    "openingHours": "2026年10月24–25日 · 各建筑开放时间不同",
    "sourceUrl": "https://www.openhouseworldwide.org/barcelona",
    "notes": "全城活动。先选择建筑并确认参观时间和预约要求，再加入行程。",
    "needsVerification": true
  },
  {
    "id": "bargain-garden",
    "name": "Bargain Garden Flea Market",
    "category": "events",
    "neighborhood": "Ciutadella",
    "address": "Parròquia de Sant Fèlix Africà, Carrer de Sardenya 29, Barcelona",
    "priority": "optional",
    "openingHours": "24–25 Oct 2026 · 11:00–19:00",
    "sourceUrl": "https://fleamarketbcn.com/un-finde-de-gangas-en-bargain-garden/",
    "bookingStatus": "need-to-book",
    "notes": "可选跳蚤市场，向主办方确认入场票。尚未加入每日路线。"
  }
];
export const placeUpdates:Record<string,Partial<Place>>={
 sessun:{address:"Carrer del Consell de Cent 300, Barcelona",sourceUrl:"https://es.sessun.com/nuestras-boutiques.html?country=ES"},
 eseoese:{address:"Rambla de Catalunya 81, Barcelona",sourceUrl:"https://www.eseoese.com/es/tiendas-eseoese"},
 hoss:{address:"L’Illa Diagonal, Avinguda Diagonal 557, Barcelona",sourceUrl:"https://lilla.com/es/tienda/hoss-intropia/",notes:"位于 1 层；前往前确认当前营业时间。"},
  "camper": {
    "id": "camper",
    "name": "Camper",
    "category": "shopping",
    "neighborhood": "l'Eixample",
    "address": "Carrer de València 249, Barcelona",
    "priority": "optional",
    "sourceUrl": "https://www.openstreetmap.org/node/5915698088",
    "notes": "位置来自 OpenStreetMap；营业时间和库存待确认。",
    "needsVerification": true
  }
};
