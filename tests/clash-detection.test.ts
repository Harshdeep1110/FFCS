/**
 * WHITEBOX TESTS: Clash Detection Engine
 * 
 * Testing Techniques Applied:
 * ─────────────────────────────────────────────────────────
 * 1. Statement Coverage   — every line of code executes at least once
 * 2. Branch Coverage      — every if/else branch taken
 * 3. Path Coverage        — all independent paths through the code
 * 4. Boundary Value Analysis — edge values (00:00, 23:59, adjacent times)
 * 5. Condition Coverage   — each boolean sub-expression tested T/F
 * 6. MC/DC (Modified Condition/Decision Coverage)
 *    — each condition in a decision independently affects the outcome
 */

import { describe, it, expect } from 'vitest';
import {
  parseTime,
  timeRangesOverlap,
  slotsClash,
  detectClash,
} from '@/lib/clash-detection';
import { SlotInfo } from '@/types';

// ─── Helper: Create a slot with defaults ────────────────

function makeSlot(overrides: Partial<SlotInfo> = {}): SlotInfo {
  return {
    id: overrides.id ?? 'slot-1',
    slotName: overrides.slotName ?? 'A1',
    day: overrides.day ?? 'Monday',
    startTime: overrides.startTime ?? '08:00',
    endTime: overrides.endTime ?? '08:50',
    seatLimit: overrides.seatLimit ?? 30,
    seatsOccupied: overrides.seatsOccupied ?? 0,
    courseId: overrides.courseId ?? 'course-1',
    teacherId: overrides.teacherId ?? 'teacher-1',
  };
}

// ═══════════════════════════════════════════════════════════
// SECTION 1: parseTime() — Statement & Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('parseTime() — Statement & Branch Coverage', () => {
  // B1: Valid time string → parse successfully
  it('B1: parses "08:30" to 510 minutes', () => {
    expect(parseTime('08:30')).toBe(510);
  });

  it('B1: parses "14:00" to 840 minutes', () => {
    expect(parseTime('14:00')).toBe(840);
  });

  it('B1: parses "9:05" (single digit hour) to 545 minutes', () => {
    expect(parseTime('9:05')).toBe(545);
  });

  // B2: Invalid format → throw error
  it('B2: throws on empty string', () => {
    expect(() => parseTime('')).toThrow('Invalid time value');
  });

  it('B2: throws on null-like value', () => {
    expect(() => parseTime(null as unknown as string)).toThrow('Invalid time value');
  });

  it('B2: throws on malformed string "abc"', () => {
    expect(() => parseTime('abc')).toThrow('Invalid time format');
  });

  it('B2: throws on "25:00" (invalid hours)', () => {
    expect(() => parseTime('25:00')).toThrow('Invalid hours');
  });

  it('B2: throws on "12:60" (invalid minutes)', () => {
    expect(() => parseTime('12:60')).toThrow('Invalid minutes');
  });

  // B3: Edge case "00:00" → returns 0
  it('B3: parses "00:00" (midnight) to 0', () => {
    expect(parseTime('00:00')).toBe(0);
  });

  // B4: Edge case "23:59" → returns 1439
  it('B4: parses "23:59" to 1439', () => {
    expect(parseTime('23:59')).toBe(1439);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 2: timeRangesOverlap() — MC/DC Coverage
// ═══════════════════════════════════════════════════════════

describe('timeRangesOverlap() — MC/DC & Condition Coverage', () => {
  // The decision: startA < endB && startB < endA
  // For MC/DC, each condition must independently affect the outcome.

  // B1: No overlap — A entirely before B
  //     startA=60, endA=120, startB=180, endB=240
  //     60 < 240 = true, 180 < 120 = false → false
  it('B1: A entirely before B → no overlap', () => {
    expect(timeRangesOverlap(60, 120, 180, 240)).toBe(false);
  });

  // B2: No overlap — A entirely after B
  //     startA=300, endA=360, startB=60, endB=120
  //     300 < 120 = false → short-circuit → false
  it('B2: A entirely after B → no overlap', () => {
    expect(timeRangesOverlap(300, 360, 60, 120)).toBe(false);
  });

  // B3: Partial overlap — A starts before B, ends during B
  //     startA=60, endA=180, startB=120, endB=240
  //     60 < 240 = true, 120 < 180 = true → true
  it('B3: partial overlap (A starts before B, ends during B)', () => {
    expect(timeRangesOverlap(60, 180, 120, 240)).toBe(true);
  });

  // B4: Full containment — A contains B
  //     startA=60, endA=300, startB=120, endB=240
  it('B4: A fully contains B → overlap', () => {
    expect(timeRangesOverlap(60, 300, 120, 240)).toBe(true);
  });

  // B5: Full containment — B contains A
  //     startA=120, endA=240, startB=60, endB=300
  it('B5: B fully contains A → overlap', () => {
    expect(timeRangesOverlap(120, 240, 60, 300)).toBe(true);
  });

  // B6: Adjacent slots — endA === startB → no overlap
  //     startA=60, endA=120, startB=120, endB=180
  //     60 < 180 = true, 120 < 120 = false → false
  it('B6: adjacent slots (endA === startB) → NO overlap', () => {
    expect(timeRangesOverlap(60, 120, 120, 180)).toBe(false);
  });

  // B7: Identical ranges → overlap
  it('B7: identical time ranges → overlap', () => {
    expect(timeRangesOverlap(60, 120, 60, 120)).toBe(true);
  });

  // MC/DC: condition 1 (startA < endB) independently decides outcome
  // When condition 2 is true, toggling condition 1 changes result
  it('MC/DC: condition 1 independently affects outcome', () => {
    // Both true → overlap
    expect(timeRangesOverlap(60, 180, 120, 240)).toBe(true);
    // condition 1 false (startA >= endB), condition 2 would be true → no overlap
    expect(timeRangesOverlap(240, 300, 120, 240)).toBe(false);
  });

  // MC/DC: condition 2 (startB < endA) independently decides outcome
  it('MC/DC: condition 2 independently affects outcome', () => {
    // Both true → overlap
    expect(timeRangesOverlap(60, 180, 120, 240)).toBe(true);
    // condition 1 true, condition 2 false (startB >= endA) → no overlap
    expect(timeRangesOverlap(60, 120, 180, 240)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 3: slotsClash() — Branch & Path Coverage
// ═══════════════════════════════════════════════════════════

describe('slotsClash() — Branch Coverage', () => {
  // B1: Different days → no clash
  it('B1: different days → no clash', () => {
    const slotA = makeSlot({ day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'Tuesday', startTime: '08:00', endTime: '09:00' });
    expect(slotsClash(slotA, slotB)).toBe(false);
  });

  // B2: Same day, no time overlap → no clash
  it('B2: same day, no time overlap → no clash', () => {
    const slotA = makeSlot({ day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'Monday', startTime: '10:00', endTime: '11:00' });
    expect(slotsClash(slotA, slotB)).toBe(false);
  });

  // B3: Same day, overlapping times → clash
  it('B3: same day, overlapping times → clash', () => {
    const slotA = makeSlot({ day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'Monday', startTime: '08:30', endTime: '09:30' });
    expect(slotsClash(slotA, slotB)).toBe(true);
  });

  // B4: Same day (different case) with overlap → clash
  it('B4: case-insensitive day comparison → clash', () => {
    const slotA = makeSlot({ day: 'monday', startTime: '08:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'MONDAY', startTime: '08:00', endTime: '09:00' });
    expect(slotsClash(slotA, slotB)).toBe(true);
  });

  // Edge: adjacent slots on same day → no clash
  it('Edge: adjacent slots on same day → no clash', () => {
    const slotA = makeSlot({ day: 'Wednesday', startTime: '09:00', endTime: '10:00' });
    const slotB = makeSlot({ day: 'Wednesday', startTime: '10:00', endTime: '11:00' });
    expect(slotsClash(slotA, slotB)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 4: detectClash() — Path Coverage
// ═══════════════════════════════════════════════════════════

describe('detectClash() — Path Coverage', () => {
  // P1: Empty existing slots → no clash
  it('P1: no existing slots → no clash', () => {
    const candidate = makeSlot({ day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const result = detectClash([], candidate);
    expect(result.hasClash).toBe(false);
    expect(result.clashingSlots).toHaveLength(0);
  });

  // P2: One existing slot, no clash
  it('P2: one existing slot, no clash', () => {
    const existing = [makeSlot({ id: 'e1', day: 'Monday', startTime: '08:00', endTime: '09:00' })];
    const candidate = makeSlot({ day: 'Monday', startTime: '10:00', endTime: '11:00' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(false);
    expect(result.clashingSlots).toHaveLength(0);
  });

  // P3: One existing slot, clash
  it('P3: one existing slot that clashes', () => {
    const existing = [makeSlot({ id: 'e1', day: 'Monday', startTime: '08:00', endTime: '09:00' })];
    const candidate = makeSlot({ day: 'Monday', startTime: '08:30', endTime: '09:30' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(true);
    expect(result.clashingSlots).toHaveLength(1);
    expect(result.clashingSlots[0].id).toBe('e1');
  });

  // P4: Multiple existing, no clashes
  it('P4: multiple existing slots, none clash', () => {
    const existing = [
      makeSlot({ id: 'e1', day: 'Monday', startTime: '08:00', endTime: '09:00' }),
      makeSlot({ id: 'e2', day: 'Tuesday', startTime: '10:00', endTime: '11:00' }),
      makeSlot({ id: 'e3', day: 'Wednesday', startTime: '14:00', endTime: '15:00' }),
    ];
    const candidate = makeSlot({ day: 'Thursday', startTime: '08:00', endTime: '09:00' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(false);
    expect(result.clashingSlots).toHaveLength(0);
  });

  // P5: Multiple existing, one clash
  it('P5: multiple existing, one clashes', () => {
    const existing = [
      makeSlot({ id: 'e1', day: 'Monday', startTime: '08:00', endTime: '09:00' }),
      makeSlot({ id: 'e2', day: 'Monday', startTime: '10:00', endTime: '11:00' }),
      makeSlot({ id: 'e3', day: 'Tuesday', startTime: '08:00', endTime: '09:00' }),
    ];
    const candidate = makeSlot({ day: 'Monday', startTime: '08:30', endTime: '09:30' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(true);
    expect(result.clashingSlots).toHaveLength(1);
    expect(result.clashingSlots[0].id).toBe('e1');
  });

  // P6: Multiple existing, multiple clashes
  it('P6: multiple existing, multiple clashes', () => {
    const existing = [
      makeSlot({ id: 'e1', day: 'Monday', startTime: '08:00', endTime: '09:00' }),
      makeSlot({ id: 'e2', day: 'Monday', startTime: '08:30', endTime: '09:30' }),
      makeSlot({ id: 'e3', day: 'Tuesday', startTime: '08:00', endTime: '09:00' }),
    ];
    const candidate = makeSlot({ day: 'Monday', startTime: '08:15', endTime: '09:15' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(true);
    expect(result.clashingSlots).toHaveLength(2);
    expect(result.clashingSlots.map((s) => s.id)).toContain('e1');
    expect(result.clashingSlots.map((s) => s.id)).toContain('e2');
  });

  // P7: Same slot name on same day — always clashes
  it('P7: same slot name on same day with overlap → clash', () => {
    const existing = [makeSlot({ id: 'e1', slotName: 'A1', day: 'Monday', startTime: '08:00', endTime: '09:00' })];
    const candidate = makeSlot({ slotName: 'A1', day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const result = detectClash(existing, candidate);
    expect(result.hasClash).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 5: Boundary Value Analysis
// ═══════════════════════════════════════════════════════════

describe('Boundary Value Analysis', () => {
  it('slots that share exactly one minute of overlap → clash', () => {
    const slotA = makeSlot({ day: 'Monday', startTime: '08:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'Monday', startTime: '08:59', endTime: '10:00' });
    expect(slotsClash(slotA, slotB)).toBe(true);
  });

  it('slot ending at midnight boundary', () => {
    const slotA = makeSlot({ day: 'Friday', startTime: '22:00', endTime: '23:59' });
    const slotB = makeSlot({ day: 'Friday', startTime: '23:00', endTime: '23:59' });
    expect(slotsClash(slotA, slotB)).toBe(true);
  });

  it('zero-duration slot does not clash with adjacent slot', () => {
    // A slot from 09:00 to 09:00 has zero duration
    const slotA = makeSlot({ day: 'Monday', startTime: '09:00', endTime: '09:00' });
    const slotB = makeSlot({ day: 'Monday', startTime: '09:00', endTime: '10:00' });
    // 09:00 < 10:00 (true) && 09:00 < 09:00 (false) → no overlap
    expect(slotsClash(slotA, slotB)).toBe(false);
  });

  it('earliest possible slot (00:00 - 00:50)', () => {
    const slotA = makeSlot({ day: 'Monday', startTime: '00:00', endTime: '00:50' });
    const slotB = makeSlot({ day: 'Monday', startTime: '00:25', endTime: '01:00' });
    expect(slotsClash(slotA, slotB)).toBe(true);
  });
});
