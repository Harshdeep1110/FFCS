/**
 * Seat Limit Enforcement Module
 * 
 * Validates whether a slot has available seats for registration.
 * In production, seat counts are cached in Redis and updated atomically
 * via database transactions with SELECT FOR UPDATE.
 * 
 * Business Rules:
 * - Each slot has a seatLimit (set by organizer)
 * - seatsOccupied tracks current registrations
 * - Registration blocked when seatsOccupied >= seatLimit
 */

import { SeatCheckResult } from '@/types';

/**
 * Checks if a slot has available seats for registration.
 * 
 * @param seatsOccupied - Current number of occupied seats
 * @param seatLimit     - Maximum number of seats allowed
 * @returns SeatCheckResult with detailed availability info
 * 
 * Branch coverage targets:
 * - B1: seatLimit <= 0 → error (invalid seat limit)
 * - B2: seatsOccupied < 0 → error (invalid occupied count)
 * - B3: seatsOccupied > seatLimit → error (data inconsistency)
 * - B4: seatsOccupied < seatLimit → available (seats remaining)
 * - B5: seatsOccupied === seatLimit → unavailable (full)
 * - B6: seatsOccupied === 0 → available (empty slot)
 * - B7: seatLimit === 1, seatsOccupied === 0 → available (last seat scenario)
 * - B8: seatLimit === 1, seatsOccupied === 1 → unavailable (single-seat full)
 * 
 * Path coverage targets:
 * - P1: Empty slot (0 occupied, many seats) → available
 * - P2: Partially filled → available
 * - P3: One seat left → available (edge case)
 * - P4: Completely full → unavailable
 * - P5: Overfull (data error) → error handling
 */
export function checkSeatAvailability(
  seatsOccupied: number,
  seatLimit: number
): SeatCheckResult {
  // Input validation
  if (seatLimit <= 0) {
    return {
      available: false,
      seatsOccupied,
      seatLimit,
      seatsRemaining: 0,
      message: `Invalid seat limit: ${seatLimit}. Must be positive.`,
    };
  }

  if (seatsOccupied < 0) {
    return {
      available: false,
      seatsOccupied,
      seatLimit,
      seatsRemaining: 0,
      message: `Invalid seats occupied: ${seatsOccupied}. Cannot be negative.`,
    };
  }

  if (seatsOccupied > seatLimit) {
    return {
      available: false,
      seatsOccupied,
      seatLimit,
      seatsRemaining: 0,
      message: `Data inconsistency: seats occupied (${seatsOccupied}) exceeds seat limit (${seatLimit}).`,
    };
  }

  const seatsRemaining = seatLimit - seatsOccupied;

  if (seatsOccupied >= seatLimit) {
    return {
      available: false,
      seatsOccupied,
      seatLimit,
      seatsRemaining: 0,
      message: `Slot is full. All ${seatLimit} seat(s) are occupied.`,
    };
  }

  return {
    available: true,
    seatsOccupied,
    seatLimit,
    seatsRemaining,
    message: `Seat available. ${seatsRemaining} of ${seatLimit} seat(s) remaining.`,
  };
}

/**
 * Calculates seat availability after a registration or drop.
 * 
 * @param currentOccupied - Current occupied seats
 * @param seatLimit       - Maximum seats
 * @param action          - 'register' to add, 'drop' to remove
 * @returns Updated seat check result
 * 
 * Branch coverage:
 * - B1: register action, seats available → increment
 * - B2: register action, seats full → blocked
 * - B3: drop action, seats occupied > 0 → decrement
 * - B4: drop action, seats occupied === 0 → error
 */
export function updateSeatCount(
  currentOccupied: number,
  seatLimit: number,
  action: 'register' | 'drop'
): SeatCheckResult {
  if (action === 'register') {
    return checkSeatAvailability(currentOccupied, seatLimit);
  }

  // Drop action
  if (currentOccupied <= 0) {
    return {
      available: true,
      seatsOccupied: 0,
      seatLimit,
      seatsRemaining: seatLimit,
      message: `Cannot drop: no registrations to remove.`,
    };
  }

  const newOccupied = currentOccupied - 1;
  return {
    available: true,
    seatsOccupied: newOccupied,
    seatLimit,
    seatsRemaining: seatLimit - newOccupied,
    message: `Seat released. ${seatLimit - newOccupied} of ${seatLimit} seat(s) now remaining.`,
  };
}
