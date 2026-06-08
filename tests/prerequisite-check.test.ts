/**
 * WHITEBOX TESTS: Prerequisite & Antirequisite Checks
 * 
 * Testing Techniques Applied:
 * ─────────────────────────────────────────────────────────
 * 1. Statement Coverage   — every line runs
 * 2. Branch Coverage      — every conditional branch
 * 3. Path Coverage        — all independent execution paths
 * 4. Condition Coverage   — each sub-condition true/false
 * 5. Equivalence Partitioning — empty/single/multiple arrays
 */

import { describe, it, expect } from 'vitest';
import { checkPrerequisites } from '@/lib/prerequisite-check';

// ═══════════════════════════════════════════════════════════
// SECTION 1: Branch Coverage
// ═══════════════════════════════════════════════════════════

describe('checkPrerequisites() — Branch Coverage', () => {
  // B1: No prerequisites, no antirequisites → allowed
  it('B1: no prereqs, no antireqs → allowed', () => {
    const result = checkPrerequisites([], [], [], []);
    expect(result.allowed).toBe(true);
    expect(result.missingPrerequisites).toHaveLength(0);
    expect(result.violatedAntirequisites).toHaveLength(0);
    expect(result.message).toContain('passed');
  });

  // B2: Has prerequisites, all met → allowed
  it('B2: all prerequisites met → allowed', () => {
    const completed = ['CS101', 'CS201'];
    const result = checkPrerequisites(completed, [], ['CS101', 'CS201'], []);
    expect(result.allowed).toBe(true);
  });

  // B3: Has prerequisites, some missing → denied
  it('B3: some prerequisites missing → denied', () => {
    const completed = ['CS101'];
    const result = checkPrerequisites(completed, [], ['CS101', 'CS201'], []);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toEqual(['CS201']);
    expect(result.message).toContain('Missing prerequisites');
  });

  // B4: Has prerequisites, all missing → denied
  it('B4: all prerequisites missing → denied', () => {
    const result = checkPrerequisites([], [], ['CS101', 'CS201'], []);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toEqual(['CS101', 'CS201']);
  });

  // B5: No antirequisites → allowed (prereqs met)
  it('B5: prereqs met, no antireq check needed → allowed', () => {
    const result = checkPrerequisites(['CS101'], [], ['CS101'], []);
    expect(result.allowed).toBe(true);
  });

  // B6: Has antirequisites, none violated → allowed
  it('B6: antireqs not in current registrations → allowed', () => {
    const currentRegs = ['CS301'];
    const result = checkPrerequisites([], currentRegs, [], ['CS401']);
    expect(result.allowed).toBe(true);
  });

  // B7: Has antirequisites, some violated → denied
  it('B7: antireq violated → denied', () => {
    const currentRegs = ['CS301', 'CS401'];
    const result = checkPrerequisites([], currentRegs, [], ['CS401']);
    expect(result.allowed).toBe(false);
    expect(result.violatedAntirequisites).toEqual(['CS401']);
    expect(result.message).toContain('Antirequisite conflict');
  });

  // B8: Both prerequisites missing AND antirequisites violated
  it('B8: both prereqs missing and antireqs violated → denied', () => {
    const completed = ['CS100'];
    const currentRegs = ['CS401'];
    const result = checkPrerequisites(
      completed,
      currentRegs,
      ['CS101', 'CS201'],
      ['CS401']
    );
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toEqual(['CS101', 'CS201']);
    expect(result.violatedAntirequisites).toEqual(['CS401']);
    expect(result.message).toContain('Missing prerequisites');
    expect(result.message).toContain('Antirequisite conflict');
  });

  // B9: Empty completed courses with prerequisites → denied
  it('B9: fresh student with prerequisites → denied', () => {
    const result = checkPrerequisites([], ['CS301'], ['CS101'], []);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toEqual(['CS101']);
  });

  // B10: Empty registrations with antirequisites → allowed
  it('B10: no current registrations, has antireqs → allowed', () => {
    const result = checkPrerequisites([], [], [], ['CS401']);
    expect(result.allowed).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 2: Path Coverage
// ═══════════════════════════════════════════════════════════

describe('checkPrerequisites() — Path Coverage', () => {
  // P1: No constraints at all
  it('P1: no prereqs, no antireqs → passes', () => {
    const result = checkPrerequisites(['CS101'], ['CS201'], [], []);
    expect(result.allowed).toBe(true);
  });

  // P2: Only prereqs, all met
  it('P2: prereqs met, no antireqs → passes', () => {
    const result = checkPrerequisites(['CS101', 'CS201'], [], ['CS101'], []);
    expect(result.allowed).toBe(true);
  });

  // P3: Prereqs met, antireqs clear
  it('P3: prereqs met, antireqs not violated → passes', () => {
    const result = checkPrerequisites(
      ['CS101'],
      ['CS301'],
      ['CS101'],
      ['CS401']
    );
    expect(result.allowed).toBe(true);
  });

  // P4: Prereqs missing only
  it('P4: prereqs missing → fails with missing list', () => {
    const result = checkPrerequisites([], [], ['CS101'], []);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toContain('CS101');
    expect(result.violatedAntirequisites).toHaveLength(0);
  });

  // P5: Antireqs violated only
  it('P5: antireqs violated → fails with violated list', () => {
    const result = checkPrerequisites([], ['CS401'], [], ['CS401']);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toHaveLength(0);
    expect(result.violatedAntirequisites).toContain('CS401');
  });

  // P6: Both failing
  it('P6: both prereqs missing and antireqs violated → combined failure', () => {
    const result = checkPrerequisites([], ['CS401'], ['CS101'], ['CS401']);
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toContain('CS101');
    expect(result.violatedAntirequisites).toContain('CS401');
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 3: Equivalence Partitioning
// ═══════════════════════════════════════════════════════════

describe('checkPrerequisites() — Equivalence Partitioning', () => {
  // Class: single prerequisite
  it('single prereq met → allowed', () => {
    const result = checkPrerequisites(['CS101'], [], ['CS101'], []);
    expect(result.allowed).toBe(true);
  });

  it('single prereq missing → denied', () => {
    const result = checkPrerequisites([], [], ['CS101'], []);
    expect(result.allowed).toBe(false);
  });

  // Class: multiple prerequisites
  it('all of 3 prereqs met → allowed', () => {
    const result = checkPrerequisites(
      ['CS101', 'CS201', 'CS301'],
      [],
      ['CS101', 'CS201', 'CS301'],
      []
    );
    expect(result.allowed).toBe(true);
  });

  it('2 of 3 prereqs met → denied (1 missing)', () => {
    const result = checkPrerequisites(
      ['CS101', 'CS201'],
      [],
      ['CS101', 'CS201', 'CS301'],
      []
    );
    expect(result.allowed).toBe(false);
    expect(result.missingPrerequisites).toEqual(['CS301']);
  });

  // Class: multiple antirequisites
  it('multiple antireqs, none violated → allowed', () => {
    const result = checkPrerequisites(
      [],
      ['CS501'],
      [],
      ['CS401', 'CS402']
    );
    expect(result.allowed).toBe(true);
  });

  it('multiple antireqs, one violated → denied', () => {
    const result = checkPrerequisites(
      [],
      ['CS401', 'CS501'],
      [],
      ['CS401', 'CS402']
    );
    expect(result.allowed).toBe(false);
    expect(result.violatedAntirequisites).toEqual(['CS401']);
  });

  it('multiple antireqs, all violated → denied', () => {
    const result = checkPrerequisites(
      [],
      ['CS401', 'CS402'],
      [],
      ['CS401', 'CS402']
    );
    expect(result.allowed).toBe(false);
    expect(result.violatedAntirequisites).toEqual(['CS401', 'CS402']);
  });
});
