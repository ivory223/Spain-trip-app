import english from '@/data/en.json';
import { itinerary } from '@/data/trip';
import { places } from '@/data/places';
import { bookings } from '@/data/bookings';
import type { Booking, ItineraryItem, Place } from './types';
export type Language = 'zh' | 'en';
export const LANGUAGE_KEY = 'spain-journal:language';
const messages: Record<string,string> = english;
export function translate(value:string,language:Language):string {
 if(language==='zh')return value;
 const translated=messages[value.trim()];
 return translated===undefined?value:value.replace(value.trim(),translated);
}
// Translate seed content only. User-created or changed text remains exactly as entered.
export function translateField<T extends {id?:string},K extends keyof T>(record:T,key:K,language:Language):T[K] {
 const value=record[key];
 if(language==='zh'||typeof value!=='string')return value;
 const original: ItineraryItem|Place|Booking|undefined=itinerary.find(i=>i.id===record.id)||places.find(p=>p.id===record.id)||bookings.find(b=>b.id===record.id);
 if(!original)return value;
 const source=original as unknown as Record<string,unknown>;
 const linkedPlace='placeId' in record?places.find(p=>p.id===record.placeId):undefined;
 const baseline=source[String(key)]??(linkedPlace as unknown as Record<string,unknown>|undefined)?.[String(key)];
 return (value===baseline?translate(value,language):value) as T[K];
}

// An untouched translated form field must round-trip to its original stored text.
export function restoreField<T extends {id?:string},K extends keyof T>(record:T,key:K,input:string,language:Language):string {
 const shown=translateField(record,key,language);
 return input===(typeof shown==='string'?shown:'')?String(record[key]??''):input;
}
