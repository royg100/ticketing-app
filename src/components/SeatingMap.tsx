import { useState, useMemo, useCallback } from 'react';
import type { Seat, SeatTier, Event } from '../types';
import { useCart } from '../context/CartContext';

interface SeatingMapProps {
  event: Event;
}

interface SeatDef {
  id: string;
  cx: number;
  cy: number;
  tier: SeatTier;
  section: string;
  sectionLabel: string;
  row: string;
  number: number;
  price: number;
}

const TIER_PRICES: Record<SeatTier, number> = {
  vip: 650,
  premium: 450,
  standard: 280,
  economy: 150,
};

const TIER_HEX: Record<SeatTier, string> = {
  vip: '#a855f7',
  premium: '#f59e0b',
  standard: '#a78bfa',
  economy: '#34d399',
};

const TIER_LABEL: Record<SeatTier, string> = {
  vip: 'פלאטיניום VIP',
  premium: 'זהב',
  standard: 'כסף',
  economy: 'ברונזה',
};

const SECTION_LABELS: Record<string, string> = {
  'vip-l': 'כנף שמאל VIP',
  'vip-r': 'כנף ימין VIP',
  'gold-front': 'קדמי מרכז',
  'silver-outer-l': 'חיצוני שמאל',
  'silver-outer-r': 'חיצוני ימין',
  'silver-inner-l': 'פנימי שמאל',
  'silver-inner-r': 'פנימי ימין',
  'bronze-outer-l': 'אחורי חיצוני שמאל',
  'bronze-outer-r': 'אחורי חיצוני ימין',
  'bronze-back-l': 'אחורי פנימי שמאל',
  'bronze-back-r': 'אחורי פנימי ימין',
  'bronze-back-ctr': 'אחורי מרכז (שורה 3)',
};

// Deterministic seeded RNG (mulberry32)
function makeRng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAKEN_RATIO = 0.27;

function generateSeats(): SeatDef[] {
  const seats: SeatDef[] = [];

  const addBlock = (
    sectionId: string,
    tier: SeatTier,
    startX: number,
    startY: number,
    rows: number,
    cols: number,
    gapX = 12,
    gapY = 12,
  ) => {
    const label = SECTION_LABELS[sectionId] ?? sectionId;
    for (let r = 0; r < rows; r++) {
      const rowChar = String.fromCharCode(65 + r);
      for (let c = 0; c < cols; c++) {
        seats.push({
          id: `${sectionId}-${rowChar}${c + 1}`,
          cx: startX + c * gapX,
          cy: startY + r * gapY,
          tier,
          section: sectionId,
          sectionLabel: label,
          row: rowChar,
          number: c + 1,
          price: TIER_PRICES[tier],
        });
      }
    }
  };

  // ── VIP Stage Wings (Platinum ₪650) ─────────────────────────────────
  // flanking the stage at same y-level
  addBlock('vip-l', 'vip', 140, 13, 5, 5, 12, 12);   // x:140-188  y:13-61
  addBlock('vip-r', 'vip', 559, 13, 5, 5, 12, 12);   // x:559-607  y:13-61

  // ── Gold Front Center (₪450) ─────────────────────────────────────────
  // wide section below stage, from inner-left to inner-right edge
  addBlock('gold-front', 'premium', 84, 64, 6, 49, 12, 12);  // x:84-672  y:64-124

  // ── Silver Outer Strips (₪280) ───────────────────────────────────────
  // thin vertical strips on far left and far right
  addBlock('silver-outer-l', 'standard', 10, 64, 17, 7, 11, 11); // x:10-76   y:64-240
  addBlock('silver-outer-r', 'standard', 685, 64, 17, 7, 11, 11); // x:685-751 y:64-240

  // ── Silver Inner Blocks (₪280) ───────────────────────────────────────
  // beside the ground area, left and right
  addBlock('silver-inner-l', 'standard', 84, 140, 11, 12, 12, 12);  // x:84-216   y:140-260
  addBlock('silver-inner-r', 'standard', 528, 140, 11, 12, 12, 12); // x:528-660  y:140-260

  // ── Bronze Outer (lower outer strips continuation) (₪150) ────────────
  addBlock('bronze-outer-l', 'economy', 10, 252, 7, 7, 11, 11);   // x:10-76   y:252-318
  addBlock('bronze-outer-r', 'economy', 685, 252, 7, 7, 11, 11);  // x:685-751 y:252-318

  // ── Bronze Back Inner (₪150) ─────────────────────────────────────────
  addBlock('bronze-back-l', 'economy', 84, 274, 7, 12, 12, 12);   // x:84-216  y:274-346
  addBlock('bronze-back-r', 'economy', 528, 274, 7, 12, 12, 12);  // x:528-660 y:274-346

  // ── Bronze Back Center – "שורה 3" (₪150) ────────────────────────────
  addBlock('bronze-back-ctr', 'economy', 222, 280, 7, 25, 12, 12); // x:222-510 y:280-352

  // Mark taken seats with seeded random
  const rand = makeRng(99991);
  seats.forEach(s => {
    if (rand() < TAKEN_RATIO) (s as SeatDef & { _taken?: boolean })._taken = true;
  });

  return seats;
}

export default function SeatingMap({ event }: SeatingMapProps) {
  const allSeats = useMemo(() => generateSeats(), []);

  const [takenIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    allSeats.forEach(s => {
      if ((s as SeatDef & { _taken?: boolean })._taken) set.add(s.id);
    });
    return set;
  });

  const { items, addItem, removeItem } = useCart();
  const selectedIds = useMemo(() => new Set(items.map(i => i.seat.id)), [items]);

  const [tooltip, setTooltip] = useState<{
    seat: SeatDef;
    svgX: number;
    svgY: number;
  } | null>(null);

  const handleClick = useCallback(
    (seat: SeatDef) => {
      if (takenIds.has(seat.id)) return;
      const s: Seat = {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        section: seat.section,
        tier: seat.tier,
        status: selectedIds.has(seat.id) ? 'selected' : 'available',
        price: seat.price,
      };
      if (selectedIds.has(seat.id)) removeItem(seat.id);
      else addItem(s, event);
    },
    [takenIds, selectedIds, addItem, removeItem, event],
  );

  const getSeatFill = (seat: SeatDef) => {
    if (takenIds.has(seat.id)) return '#b8a9d0';
    if (selectedIds.has(seat.id)) return '#e94560';
    return TIER_HEX[seat.tier];
  };

  // Ground/GA area bounds (SVG units)
  const GROUND = { x: 220, y: 136, w: 304, h: 134 };

  return (
    <div className="relative select-none w-full">
      <svg
        viewBox="0 0 762 375"
        className="w-full h-auto"
        style={{ display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* ── Background ───────────────────────────────────── */}
        <rect width="762" height="375" fill="#f3f0ff" rx="10" />

        {/* ── Section zone tints ───────────────────────────── */}
        {/* VIP wings */}
        <rect x="130" y="8"  width="68" height="64" rx="4" fill="#7c3aed" opacity="0.12" />
        <rect x="549" y="8"  width="68" height="64" rx="4" fill="#7c3aed" opacity="0.12" />
        {/* Gold front */}
        <rect x="78"  y="58" width="602" height="78" rx="3" fill="#d97706" opacity="0.08" />
        {/* Silver outer */}
        <rect x="4"   y="58" width="80"  height="272" rx="3" fill="#0369a1" opacity="0.08" />
        <rect x="678" y="58" width="80"  height="272" rx="3" fill="#0369a1" opacity="0.08" />
        {/* Silver inner */}
        <rect x="78"  y="134" width="144" height="134" rx="3" fill="#0369a1" opacity="0.08" />
        <rect x="522" y="134" width="144" height="134" rx="3" fill="#0369a1" opacity="0.08" />
        {/* Bronze back */}
        <rect x="4"   y="244" width="80"  height="112" rx="3" fill="#065f46" opacity="0.09" />
        <rect x="678" y="244" width="80"  height="112" rx="3" fill="#065f46" opacity="0.09" />
        <rect x="78"  y="268" width="448" height="96"  rx="3" fill="#065f46" opacity="0.09" />

        {/* ── Stage ────────────────────────────────────────── */}
        <rect x="203" y="8" width="356" height="50" rx="6" fill="#e94560" />
        <text x="381" y="32" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" letterSpacing="5">STAGE</text>
        <text x="381" y="51" textAnchor="middle" fill="#fca5a5" fontSize="10" letterSpacing="2">בָּמָה</text>

        {/* ── Ground/GA Floor ───────────────────────────────── */}
        <rect
          x={GROUND.x} y={GROUND.y}
          width={GROUND.w} height={GROUND.h}
          rx="6"
          fill="#ede9fe"
          stroke="#c4b5fd"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text x="372" y="193" textAnchor="middle" fill="#7c3aed" fontSize="13" fontWeight="700" letterSpacing="3">גראונד</text>
        <text x="372" y="208" textAnchor="middle" fill="#7db8c5" fontSize="8.5" letterSpacing="2">STANDING FLOOR</text>
        {/* Screen */}
        <rect x="292" y="218" width="160" height="30" rx="4" fill="#e0f4f9" stroke="#b0d8e3" strokeWidth="1" />
        <text x="372" y="237" textAnchor="middle" fill="#7db8c5" fontSize="8" letterSpacing="1">SCREEN</text>

        {/* ── Section labels ────────────────────────────────── */}
        {/* VIP */}
        <text x="164" y="6" textAnchor="middle" fill="#a855f7" fontSize="7" fontWeight="700">VIP שמאל</text>
        <text x="583" y="6" textAnchor="middle" fill="#a855f7" fontSize="7" fontWeight="700">VIP ימין</text>
        {/* Gold */}
        <text x="381" y="59" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="700" opacity="0.9">זהב — קדמי מרכז</text>
        {/* Silver outer */}
        <text x="44"  y="58" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">כסף</text>
        <text x="44"  y="66" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">חיצוני</text>
        <text x="718" y="58" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">כסף</text>
        <text x="718" y="66" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">חיצוני</text>
        {/* Silver inner */}
        <text x="150" y="133" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">כסף פנימי שמאל</text>
        <text x="594" y="133" textAnchor="middle" fill="#a78bfa" fontSize="7" fontWeight="700">כסף פנימי ימין</text>
        {/* Bronze */}
        <text x="44"  y="244" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="700">ברונזה</text>
        <text x="718" y="244" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="700">ברונזה</text>
        <text x="381" y="271" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="700">ברונזה אחורי — שורה 3</text>

        {/* ── Seats ─────────────────────────────────────────── */}
        {allSeats.map(seat => {
          const taken = takenIds.has(seat.id);
          const selected = selectedIds.has(seat.id);
          return (
            <circle
              key={seat.id}
              cx={seat.cx}
              cy={seat.cy}
              r={4.4}
              fill={getSeatFill(seat)}
              opacity={taken ? 0.28 : 1}
              stroke={selected ? '#fff' : 'none'}
              strokeWidth={selected ? 1.5 : 0}
              className={taken ? 'cursor-not-allowed' : 'seat cursor-pointer'}
              onClick={() => handleClick(seat)}
              onMouseEnter={() =>
                setTooltip({ seat, svgX: seat.cx, svgY: seat.cy })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}

        {/* ── Inline tooltip (SVG foreignObject) ───────────── */}
        {tooltip && !takenIds.has(tooltip.seat.id) && (() => {
          const s = tooltip.seat;
          // Flip tooltip to left side when seat is on right half
          const flipX = tooltip.svgX > 500;
          const tx = flipX ? tooltip.svgX - 138 : tooltip.svgX + 10;
          const ty = Math.max(4, tooltip.svgY - 52);
          return (
            <g>
              <rect
                x={tx - 4} y={ty - 2}
                width="132" height="56"
                rx="6"
                fill="#ffffff"
                stroke="#c4b5fd"
                strokeWidth="1"
                opacity="0.98"
              />
              <text x={tx + 62} y={ty + 13} textAnchor="middle" fill={TIER_HEX[s.tier]} fontSize="9" fontWeight="700">
                {TIER_LABEL[s.tier]}
              </text>
              <text x={tx + 62} y={ty + 26} textAnchor="middle" fill="#7db8c5" fontSize="8">
                {s.sectionLabel}
              </text>
              <text x={tx + 62} y={ty + 38} textAnchor="middle" fill="#6b5a8a" fontSize="8">
                שורה {s.row} · מקום {s.number}
              </text>
              <text x={tx + 62} y={ty + 51} textAnchor="middle" fill="#1a1a2e" fontSize="10" fontWeight="700">
                ₪{s.price}
              </text>
            </g>
          );
        })()}

        {/* ── Stats bar ─────────────────────────────────────── */}
        <text x="10" y="370" fill="#7db8c5" fontSize="8.5">
          {allSeats.length - takenIds.size} מקומות פנויים מתוך {allSeats.length}
        </text>
        <text x="752" y="370" textAnchor="end" fill="#7db8c5" fontSize="8.5">
          {selectedIds.size > 0 ? `נבחרו: ${selectedIds.size}` : ''}
        </text>
      </svg>

      {/* ── Legend ──────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3 text-xs">
        {(Object.entries(TIER_HEX) as [SeatTier, string][]).map(([tier, hex]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: hex }} />
            <span style={{ color: '#6b5a8a' }}>{TIER_LABEL[tier]} · ₪{TIER_PRICES[tier]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: '#b8a9d0' }} />
          <span style={{ color: '#9b8fb0' }}>תפוס</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: '#e94560' }} />
          <span style={{ color: '#6b5a8a' }}>נבחר</span>
        </div>
      </div>
    </div>
  );
}
