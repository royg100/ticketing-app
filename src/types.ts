export type SeatStatus = 'available' | 'selected' | 'taken' | 'vip';

export type SeatTier = 'vip' | 'premium' | 'standard' | 'economy';

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  tier: SeatTier;
  status: SeatStatus;
  price: number;
}

export interface Section {
  id: string;
  name: string;
  nameHe: string;
  tier: SeatTier;
  rows: number;
  seatsPerRow: number;
  price: number;
}

export interface Event {
  id: string;
  title: string;
  titleHe: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  genre: string;
  description: string;
  availableSeats: number;
  totalSeats: number;
}

export interface CartItem {
  seat: Seat;
  event: Event;
}
