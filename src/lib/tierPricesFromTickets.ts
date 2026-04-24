import type { Doc } from '../../convex/_generated/dataModel';
import type { SeatTier } from '../types';

/** שימוש בכרטיסים המופעלים; אם אין אף `enabled` — כל הרשומות (המחיר בכל זאת מוגדר בפאנל). */
function typesForPrice(types: Doc<'ticketTypes'>[]): Doc<'ticketTypes'>[] {
  if (types.length === 0) return [];
  const on = types.filter((t) => t.enabled);
  return on.length > 0 ? on : types;
}

/** Map Convex ticket types to the four visual tiers in SeatingMap (low → high). */
export function mapTicketTypesToTierPrices(types: Doc<'ticketTypes'>[]): Record<SeatTier, number> | null {
  const source = typesForPrice(types);
  if (source.length === 0) return null;
  const prices = [...new Set(source.map((t) => t.price))].sort((a, b) => a - b);
  if (prices.length === 1) {
    const p = prices[0];
    return { economy: p, standard: p, premium: p, vip: p };
  }
  if (prices.length === 2) {
    return {
      economy: prices[0],
      standard: prices[0],
      premium: prices[1],
      vip: prices[1],
    };
  }
  if (prices.length === 3) {
    return {
      economy: prices[0],
      standard: prices[1],
      premium: prices[1],
      vip: prices[2],
    };
  }
  return {
    economy: prices[0],
    standard: prices[1],
    premium: prices[2],
    vip: prices[prices.length - 1],
  };
}

export function minEnabledTicketPrice(types: Doc<'ticketTypes'>[] | undefined): number | null {
  if (!types || types.length === 0) return null;
  const source = typesForPrice(types);
  if (source.length === 0) return null;
  return Math.min(...source.map((t) => t.price));
}
