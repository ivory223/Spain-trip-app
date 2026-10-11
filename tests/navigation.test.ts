import test from 'node:test';
import assert from 'node:assert/strict';
import { primaryTabs,morePages,routeFromHash,activeTab } from '../lib/navigation';
test('five primary routes restore after refresh and retain legacy deep links',()=>{
 assert.deepEqual(primaryTabs,['trip','map','places','shopping','more']);
 for(const tab of primaryTabs){assert.equal(routeFromHash(`#${tab}`),tab);assert.equal(activeTab(tab),tab);}
 for(const page of morePages){const route=routeFromHash(`#more/${page}`);assert.equal(route,`more/${page}`);assert.equal(activeTab(route),'more');}
 assert.equal(routeFromHash('#itinerary'),'trip');assert.equal(routeFromHash('#bookings'),'more/bookings');assert.equal(routeFromHash('#unknown'),'trip');
});
