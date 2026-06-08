/**
 * WHITEBOX TESTS: Seat Limit Enforcement
 * 
 * Testing Techniques Applied:
 * ─────────────────────────────────────────────────────────
 * 1. Statement Coverage   — every line executes
 * 2. Branch Coverage      — every if/else branch
 * 3. Path Coverage        — all unique execution paths
 * 4. Boundary Value Analysis — 0, 1, limit-1, limit, limit+1
 * 5. Equivalence Partitioning — empty/partial/full/over
 */

import { describe, it, expect } from 'vitest';
import { checkSeatAvailability, updateSeatCount } from '@/lib/seat-check';

// ═══════════════════════════════════════════════════════════
// SECTION 1: checkSeatAvailability() — Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('checkSeatAvailability() — Branch Coverage', () => {
  // B1: seatLimit <= 0 → error
  it('B1: rejects zero seat limit', () => {
    const result = checkSeatAvailability(0, 0);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Invalid seat limit');
  });

  it('B1: rejects negative seat limit', () => {
    const result = checkSeatAvailability(0, -5);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Invalid seat limit');
  });

  // B2: seatsOccupied < 0 → error
  it('B2: rejects negative occupied count', () => {
    const result = checkSeatAvailability(-1, 30);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Invalid seats occupied');
  });

  // B3: seatsOccupied > seatLimit → data inconsistency
  it('B3: detects data inconsistency (occupied > limit)', () => {
    const result = checkSeatAvailability(35, 30);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Data inconsistency');
  });

  // B4: seatsOccupied < seatLimit → available
  it('B4: seats available when partially filled', () => {
    const result = checkSeatAvailability(15, 30);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(15);
  });

  // B5: seatsOccupied === seatLimit → full
  it('B5: slot full when occupied equals limit', () => {
    const result = checkSeatAvailability(30, 30);
    expect(result.available).toBe(false);
    expect(result.seatsRemaining).toBe(0);
    expect(result.message).toContain('full');
  });

  // B6: seatsOccupied === 0 → empty, available
  it('B6: empty slot is available', () => {
    const result = checkSeatAvailability(0, 30);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(30);
  });

  // B7: Single-seat slot, empty
  it('B7: single-seat slot, empty → available', () => {
    const result = checkSeatAvailability(0, 1);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(1);
  });

  // B8: Single-seat slot, full
  it('B8: single-seat slot, full → unavailable', () => {
    const result = checkSeatAvailability(1, 1);
    expect(result.available).toBe(false);
    expect(result.seatsRemaining).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 2: checkSeatAvailability() — Path Coverage
// ═══════════════════════════════════════════════════════════

describe('checkSeatAvailability() — Path Coverage', () => {
  // P1: Empty slot with many seats
  it('P1: completely empty (0/30) → available', () => {
    const result = checkSeatAvailability(0, 30);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(30);
  });

  // P2: Partially filled
  it('P2: partially filled (20/30) → available', () => {
    const result = checkSeatAvailability(20, 30);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(10);
  });

  // P3: One seat left
  it('P3: one seat left (29/30) → available', () => {
    const result = checkSeatAvailability(29, 30);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(1);
  });

  // P4: Completely full
  it('P4: completely full (30/30) → unavailable', () => {
    const result = checkSeatAvailability(30, 30);
    expect(result.available).toBe(false);
  });

  // P5: Over-full (data error)
  it('P5: over-full (31/30) → error', () => {
    const result = checkSeatAvailability(31, 30);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Data inconsistency');
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 3: Boundary Value Analysis
// ═══════════════════════════════════════════════════════════

describe('checkSeatAvailability() — Boundary Value Analysis', () => {
  it('at boundary: 0/1 → available', () => {
    expect(checkSeatAvailability(0, 1).available).toBe(true);
  });

  it('at boundary: 1/1 → full', () => {
    expect(checkSeatAvailability(1, 1).available).toBe(false);
  });

  it('at boundary: (limit-1)/limit → 1 remaining', () => {
    const result = checkSeatAvailability(99, 100);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(1);
  });

  it('at boundary: limit/limit → full', () => {
    const result = checkSeatAvailability(100, 100);
    expect(result.available).toBe(false);
  });

  it('at boundary: (limit+1)/limit → inconsistency', () => {
    const result = checkSeatAvailability(101, 100);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Data inconsistency');
  });

  it('large seat limit', () => {
    const result = checkSeatAvailability(999, 1000);
    expect(result.available).toBe(true);
    expect(result.seatsRemaining).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 4: updateSeatCount() — Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('updateSeatCount() — Branch Coverage', () => {
  // B1: register, seats available
  it('B1: register action when seats available', () => {
    const result = updateSeatCount(10, 30, 'register');
    expect(result.available).toBe(true);
  });

  // B2: register, seats full
  it('B2: register action when seats full', () => {
    const result = updateSeatCount(30, 30, 'register');
    expect(result.available).toBe(false);
  });

  // B3: drop, seats occupied > 0
  it('B3: drop action with occupied seats', () => {
    const result = updateSeatCount(10, 30, 'drop');
    expect(result.available).toBe(true);
    expect(result.seatsOccupied).toBe(9);
    expect(result.seatsRemaining).toBe(21);
  });

  // B4: drop, no seats occupied
  it('B4: drop action with zero occupied → error', () => {
    const result = updateSeatCount(0, 30, 'drop');
    expect(result.message).toContain('Cannot drop');
  });

  // Edge: drop from 1
  it('drop from 1 occupied → 0 occupied', () => {
    const result = updateSeatCount(1, 30, 'drop');
    expect(result.seatsOccupied).toBe(0);
    expect(result.seatsRemaining).toBe(30);
  });
});
