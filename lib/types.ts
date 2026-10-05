export type Priority = 'must' | 'recommended' | 'optional';
export type BookingStatus = 'booked' | 'need-to-book' | 'sold-out' | 'no-reservation' | 'tbd';
export type Category = 'attractions' | 'food' | 'shopping' | 'vintage' | 'kids' | 'markets' | 'hotels' | 'transport';
export type PlanReason = 'rain' | 'tired' | 'late' | 'unavailable';
export type Progress = 'completed' | 'skipped';
export interface Traveler { id: string; name: string; type: 'adult' | 'child'; age?: number }
export interface Trip { id: string; title: string; startDate: string; endDate: string; travelers: Traveler[]; luggage: string[] }
export interface Place {
  id: string; name: string; nameZh?: string; category: Category; neighborhood: string;
  address?: string; latitude?: number; longitude?: number; priority: Priority; notes?: string; walkingContext?: string;
  googleMapsQuery?: string; bookingUrl?: string; childFriendly?: boolean;
  strollerFriendly?: boolean; napFriendly?: boolean; indoor?: boolean;
  bathrooms?: string; freePlay?: boolean; tags?: string[];
  availability?: 'sold-out' | 'unavailable'; needsVerification?: boolean;
}
export interface ItineraryItem {
  id: string; date: string; placeId?: string; arrivalPlaceId?: string; bookingId?: string; startTime?: string; endTime?: string;
  timeNote?: string; title: string; titleZh?: string; category: Category;
  duration?: string; neighborhood?: string; address?: string; description?: string; notes?: string;
  bookingStatus: BookingStatus; priority: Priority; childFriendly?: boolean; strollerFriendly?: boolean;
  napFriendly?: boolean; indoor?: boolean; bathrooms?: string; freePlay?: boolean;
  demanding?: boolean; easy?: boolean; googleMapsQuery?: string; ticketUrl?: string; bookingUrl?: string;
  confirmationNumber?: string; walkingContext?: string;
}
export interface PlanAlternative { id: string; title: string; description: string; placeId?: string; reasons: PlanReason[] }
export interface TripDay {
  date: string; weekday: string; weekdayZh: string; city: string; cityZh: string; theme: string;
  timeZone: string; note: string; hotelId?: string; planB: PlanAlternative[];
  checklist?: { id: string; label: string }[];
}
export interface Booking {
  id: string; type: 'flights' | 'hotels' | 'trains' | 'attractions' | 'activities';
  title: string; date: string; endDate?: string; time?: string; timeNote?: string; placeId?: string;
  status: BookingStatus; confirmationNumber?: string; address?: string; notes: string;
  ticketUrl?: string; reservationUrl?: string; ticketImage?: string; cancellationNotes?: string;
}
export interface LocalState {
  version: 1;
  itemEdits: Record<string, Partial<ItineraryItem>>;
  addedItems: ItineraryItem[]; addedPlaces: Place[];
  progress: Record<string, Progress>; favorite: Record<string, boolean>; visited: Record<string, boolean>;
  placeNotes: Record<string, string>; bookingEdits: Record<string, Partial<Booking>>;
  order: Record<string, string[]>; checks: Record<string, boolean>; remiMode: boolean;
}
