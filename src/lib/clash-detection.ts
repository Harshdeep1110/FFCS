/**
 * Clash Detection Engine
 * 
 * Determines whether a candidate slot conflicts with any existing
 * registered slots based on day and time overlap.
 * 
 * Time overlap formula: slotA.start < slotB.end && slotB.start < slotA.end
 * Two slots clash only if they are on the SAME day AND their time ranges overlap.
 */

import { SlotInfo, ClashResult } from '@/types';

/**
 * Parses a time string in "HH:mm" format to minutes since midnight.
 * This normalization allows simple numeric comparison of time ranges.
 * 
 * @param time - Time string in "HH:mm" format (e.g., "08:30", "14:00")
 * @returns Number of minutes since midnight
 * @throws Error if the time format is invalid
 * 
 * Branch coverage targets:
 * - B1: Valid time string → parse successfully
 * - B2: Invalid format → throw error
 * - B3: Edge case "00:00" → returns 0
 * - B4: Edge case "23:59" → returns 1439
 */
export function parseTime(time: string): number {
  if (!time || typeof time !== 'string') {
    throw new Error(`Invalid time value: ${time}`);
  }

  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid time format: "${time}". Expected "HH:mm".`);
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hours: ${hours}. Must be 0-23.`);
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Must be 0-59.`);
  }

  return hours * 60 + minutes;
}

/**
 * Checks whether two time ranges overlap.
 * Uses the standard interval overlap formula:
 *   overlap = (startA < endB) && (startB < endA)
 * 
 * Note: Adjacent slots (endA === startB) do NOT overlap.
 * This is intentional — a class ending at 09:00 and another starting
 * at 09:00 should not clash.
 * 
 * @param startA - Start time of range A in minutes
 * @param endA   - End time of range A in minutes
 * @param startB - Start time of range B in minutes
 * @param endB   - End time of range B in minutes
 * @returns true if the ranges overlap
 * 
 * Branch coverage targets:
 * - B1: No overlap (A entirely before B)
 * - B2: No overlap (A entirely after B)
 * - B3: Partial overlap (A starts before B, ends during B)
 * - B4: Full containment (A contains B)
 * - B5: Full containment (B contains A)
 * - B6: Adjacent slots (endA === startB) → no overlap
 * - B7: Identical ranges → overlap
 */
export function timeRangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Determines if two slots clash.
 * Two slots clash if and only if:
 *   1. They are on the same day (case-insensitive comparison)
 *   2. Their time ranges overlap
 * 
 * @param slotA - First slot to compare
 * @param slotB - Second slot to compare
 * @returns true if the slots clash
 * 
 * Branch coverage targets:
 * - B1: Different days → no clash
 * - B2: Same day, no time overlap → no clash
 * - B3: Same day, time overlap → clash
 * - B4: Same day (different case) with overlap → clash
 */
export function slotsClash(slotA: SlotInfo, slotB: SlotInfo): boolean {
  // Different days → no clash
  if (slotA.day.toLowerCase() !== slotB.day.toLowerCase()) {
    return false;
  }

  const startA = parseTime(slotA.startTime);
  const endA = parseTime(slotA.endTime);
  const startB = parseTime(slotB.startTime);
  const endB = parseTime(slotB.endTime);

  return timeRangesOverlap(startA, endA, startB, endB);
}

/**
 * Main clash detection function.
 * Checks a candidate slot against all existing registered slots
 * and returns detailed clash information.
 * 
 * @param existingSlots  - Array of slots the student is already registered for
 * @param candidateSlot  - The slot the student wants to register for
 * @returns ClashResult with clash status and list of clashing slots
 * 
 * Path coverage targets:
 * - P1: Empty existing slots → no clash
 * - P2: One existing slot, no clash → no clash
 * - P3: One existing slot, clash → clash with that slot
 * - P4: Multiple existing slots, no clashes → no clash
 * - P5: Multiple existing slots, one clash → clash with one
 * - P6: Multiple existing slots, multiple clashes → all clashing slots returned
 * - P7: Candidate clashes with same-named slot → clash detected
 */
export function detectClash(
  existingSlots: SlotInfo[],
  candidateSlot: SlotInfo
): ClashResult {
  const clashingSlots: SlotInfo[] = [];

  for (const existing of existingSlots) {
    if (slotsClash(existing, candidateSlot)) {
      clashingSlots.push(existing);
    }
  }

  return {
    hasClash: clashingSlots.length > 0,
    clashingSlots,
  };
}
