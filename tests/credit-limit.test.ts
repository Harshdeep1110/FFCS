/**
 * WHITEBOX TESTS: Credit Limit Enforcement
 * 
 * Testing Techniques Applied:
 * ─────────────────────────────────────────────────────────
 * 1. Statement Coverage   — every executable statement runs
 * 2. Branch Coverage      — every decision branch taken
 * 3. Path Coverage        — all independent paths tested
 * 4. Boundary Value Analysis — exact limits, off-by-one
 * 5. Equivalence Partitioning — valid/invalid input classes
 */

import { describe, it, expect } from 'vitest';
import { checkCreditLimit, calculateCreditsAfterDrop } from '@/lib/credit-check';

// ═══════════════════════════════════════════════════════════
// SECTION 1: checkCreditLimit() — Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('checkCreditLimit() — Branch Coverage', () => {
  // B1: courseCredits <= 0 → error
  it('B1: rejects zero course credits', () => {
    const result = checkCreditLimit(10, 27, 0);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Invalid course credit value');
  });

  it('B1: rejects negative course credits', () => {
    const result = checkCreditLimit(10, 27, -3);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Invalid course credit value');
  });

  // B2: creditLimit <= 0 → error
  it('B2: rejects zero credit limit', () => {
    const result = checkCreditLimit(0, 0, 3);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Invalid credit limit');
  });

  it('B2: rejects negative credit limit', () => {
    const result = checkCreditLimit(0, -5, 3);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Invalid credit limit');
  });

  // B3: currentCredits < 0 → error
  it('B3: rejects negative current credits', () => {
    const result = checkCreditLimit(-1, 27, 3);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Invalid current credits');
  });

  // B4: Well under the limit → allowed
  it('B4: allows registration well under limit', () => {
    const result = checkCreditLimit(10, 27, 3);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(13);
    expect(result.message).toContain('Registration allowed');
  });

  // B5: Exactly at the limit → allowed
  it('B5: allows registration that reaches exact limit', () => {
    const result = checkCreditLimit(24, 27, 3);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(27);
    expect(result.message).toContain('0 remaining');
  });

  // B6: Over the limit → denied
  it('B6: denies registration that exceeds limit', () => {
    const result = checkCreditLimit(25, 27, 3);
    expect(result.allowed).toBe(false);
    expect(result.creditsAfter).toBe(28);
    expect(result.message).toContain('exceed credit limit by 1');
  });

  // B7: Already at limit → denied
  it('B7: denies when already at credit limit', () => {
    const result = checkCreditLimit(27, 27, 1);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('exceed credit limit');
  });

  // B8: Zero current, course = limit → allowed
  it('B8: allows fresh student registering for exact limit', () => {
    const result = checkCreditLimit(0, 27, 27);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(27);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 2: checkCreditLimit() — Path Coverage
// ═══════════════════════════════════════════════════════════

describe('checkCreditLimit() — Path Coverage', () => {
  // P1: Well under limit
  it('P1: 10/27, adding 3 → allowed', () => {
    const result = checkCreditLimit(10, 27, 3);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(13);
  });

  // P2: Exactly at limit
  it('P2: 24/27, adding 3 → allowed (exact)', () => {
    const result = checkCreditLimit(24, 27, 3);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(27);
  });

  // P3: Over by 1
  it('P3: 25/27, adding 3 → denied (over by 1)', () => {
    const result = checkCreditLimit(25, 27, 3);
    expect(result.allowed).toBe(false);
    expect(result.creditsAfter).toBe(28);
  });

  // P4: Over by many
  it('P4: 20/27, adding 10 → denied (over by 3)', () => {
    const result = checkCreditLimit(20, 27, 10);
    expect(result.allowed).toBe(false);
    expect(result.creditsAfter).toBe(30);
  });

  // P5: Zero credits, small course
  it('P5: 0/27, adding 4 → allowed', () => {
    const result = checkCreditLimit(0, 27, 4);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(4);
  });

  // P6: At limit, any course
  it('P6: 27/27, adding 1 → denied', () => {
    const result = checkCreditLimit(27, 27, 1);
    expect(result.allowed).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 3: Boundary Value Analysis
// ═══════════════════════════════════════════════════════════

describe('checkCreditLimit() — Boundary Value Analysis', () => {
  // Boundary: credit limit = 1
  it('limit=1, current=0, course=1 → allowed', () => {
    const result = checkCreditLimit(0, 1, 1);
    expect(result.allowed).toBe(true);
  });

  it('limit=1, current=1, course=1 → denied', () => {
    const result = checkCreditLimit(1, 1, 1);
    expect(result.allowed).toBe(false);
  });

  // Boundary: large values
  it('handles large credit values', () => {
    const result = checkCreditLimit(999, 1000, 1);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(1000);
  });

  // Boundary: course with exactly remaining credits
  it('course exactly equals remaining credits', () => {
    const result = checkCreditLimit(22, 27, 5);
    expect(result.allowed).toBe(true);
    expect(result.creditsAfter).toBe(27);
  });

  // Boundary: course one more than remaining
  it('course is one more than remaining', () => {
    const result = checkCreditLimit(23, 27, 5);
    expect(result.allowed).toBe(false);
    expect(result.creditsAfter).toBe(28);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 4: calculateCreditsAfterDrop() — Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('calculateCreditsAfterDrop() — Branch Coverage', () => {
  // B1: Normal drop
  it('B1: normal drop reduces credits', () => {
    expect(calculateCreditsAfterDrop(20, 4)).toBe(16);
  });

  // B2: Drop would go negative → clamp to 0
  it('B2: drop that would go negative clamps to 0', () => {
    expect(calculateCreditsAfterDrop(2, 5)).toBe(0);
  });

  it('drop to exactly zero', () => {
    expect(calculateCreditsAfterDrop(4, 4)).toBe(0);
  });

  it('drop from zero stays at zero', () => {
    expect(calculateCreditsAfterDrop(0, 3)).toBe(0);
  });
});
