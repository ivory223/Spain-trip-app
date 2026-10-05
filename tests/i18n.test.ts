import test from 'node:test';
import assert from 'node:assert/strict';
import { translate, translateField, restoreField, LANGUAGE_KEY } from '../lib/i18n';
import { days, itinerary, trip } from '../data/trip';
import { places, collections, foodPreference } from '../data/places';
import { bookings } from '../data/bookings';
import { emptyState, parseState, mergeItems, STORAGE_KEY } from '../lib/itinerary';

test('English covers all seeded Chinese copy without changing Chinese or proper names',()=>{
 const visit=(value:unknown)=>{
  if(typeof value==='string'&&/[\u4e00-\u9fff]/.test(value)){
   assert.equal(translate(value,'zh'),value);
   assert(!/[\u4e00-\u9fff]/.test(translate(value,'en')),`Missing English: ${value}`);
  }else if(value&&typeof value==='object')Object.values(value).forEach(visit);
 };
 visit({days,itinerary,trip,places,collections,foodPreference,bookings});
 assert.equal(translate('Sagrada Família','en'),'Sagrada Família');
 assert.equal(translate(' 已预订 ','en'),' Booked ');
});

test('display translations preserve saved edits, notes, source data and existing backups',()=>{
 const state=emptyState();
 const original=itinerary.find(i=>i.id==='23-hotel')!;
 state.itemEdits[original.id]={notes:'下雨',description:'我们想晚一点出门'};
 state.placeNotes['sagrada']='明天记得带水';
 const before=JSON.stringify(state);
 const item=mergeItems(itinerary,places,bookings,state).find(i=>i.id===original.id)!;
 assert.equal(translateField(item,'description','en'),'我们想晚一点出门');
 assert.equal(translateField(item,'notes','en'),'下雨');
 assert.equal(translateField({...item,id:'custom'},'notes','en'),'下雨');
 assert.equal(translateField(original,'description','en'),'Store your luggage first; rest if early check-in is available. No timed attractions today.');
 assert.equal(translateField(item,'walkingContext','en'),'A resting place on arrival day');
 assert.equal(JSON.stringify(state),before);
 assert.deepEqual(parseState(before),state);
 assert.notEqual(LANGUAGE_KEY,STORAGE_KEY);
});


test('translated form defaults round-trip without replacing original notes',()=>{
 const booking=bookings.find(b=>b.id==='ticket-park')!;
 const shown=translateField(booking,'notes','en');
 assert.notEqual(shown,booking.notes);
 assert.equal(restoreField(booking,'notes',shown,'en'),booking.notes);
 assert.equal(restoreField(booking,'notes','Bring water / 记得带水','en'),'Bring water / 记得带水');
 const changed={...booking,notes:'下雨'};
 assert.equal(translateField(changed,'notes','en'),'下雨');
 assert.equal(restoreField(changed,'notes','下雨','en'),'下雨');
});
