import type { Doc } from '../../convex/_generated/dataModel';
import type { Event } from '../types';

/** Maps a Convex event document to the buyer-facing `Event` shape (seating / cart). */
export function convexEventToBuyerEvent(doc: Doc<'events'>): Event {
  const total = Math.max(1, doc.totalTickets);
  const avail = Math.max(0, doc.totalTickets - doc.soldTickets);
  return {
    id: doc._id,
    title: doc.name,
    titleHe: doc.name,
    artist: doc.category,
    date: doc.date,
    time: doc.time,
    venue: doc.venue,
    image: doc.image || '/sultan-pool.jpg',
    genre: doc.category,
    description: doc.description || '',
    availableSeats: avail,
    totalSeats: total,
  };
}
