export const primaryTabs=['trip','map','places','shopping','more'] as const;
export const morePages=['bookings','flights','hotels','train','tickets','tax-refund','packing','documents','settings'] as const;
export type MorePage=typeof morePages[number];
export type AppRoute=typeof primaryTabs[number]|`more/${MorePage}`;
export function routeFromHash(hash:string):AppRoute {
 const value=hash.replace(/^#/,'');
 if(value==='itinerary')return 'trip';
 if(value==='bookings')return 'more/bookings';
 if(primaryTabs.some(tab=>tab===value)||morePages.some(page=>`more/${page}`===value))return value as AppRoute;
 return 'trip';
}
export function activeTab(route:AppRoute){return route.startsWith('more/')?'more':route;}
