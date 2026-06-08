/**
 * Credit Limit Enforcement Module
 * 
 * Validates whether a student can register for a course
 * based on their credit limit and current credit usage.
 * 
 * Business Rules:
 * - Each student has a creditLimit (default 27)
 * - Each course has a creditValue
 * - creditsUsed + courseCredits must not exceed creditLimit
 */

import { CreditCheckResult } from '@/types';

/**
 * Checks if registering for a course would exceed the student's credit limit.
 * 
 * @param currentCredits - Credits currently used by the student
 * @param creditLimit    - Maximum credits allowed for the student
 * @param courseCredits  - Credit value of the course being registered
 * @returns CreditCheckResult with detailed information
 * 
 * Branch coverage targets:
 * - B1: courseCredits <= 0 → error (invalid course credits)
 * - B2: creditLimit <= 0 → error (invalid credit limit)
 * - B3: currentCredits < 0 → error (invalid current credits)
 * - B4: currentCredits + courseCredits < creditLimit → allowed (under limit)
 * - B5: currentCredits + courseCredits === creditLimit → allowed (exact limit)
 * - B6: currentCredits + courseCredits > creditLimit → denied (over limit)
 * - B7: currentCredits === creditLimit → denied (already at limit)
 * - B8: currentCredits === 0, courseCredits === creditLimit → allowed (fresh start, exact)
 * 
 * Path coverage targets:
 * - P1: Valid inputs, well under limit → success
 * - P2: Valid inputs, exactly at limit → success
 * - P3: Valid inputs, over limit by 1 → failure
 * - P4: Valid inputs, over limit by many → failure
 * - P5: Zero current credits, course fits → success
 * - P6: Already at limit, any course → failure
 */
export function checkCreditLimit(
  currentCredits: number,
  creditLimit: number,
  courseCredits: number
): CreditCheckResult {
  // Input validation
  if (courseCredits <= 0) {
    return {
      allowed: false,
      currentCredits,
      creditLimit,
      courseCredits,
      creditsAfter: currentCredits,
      message: `Invalid course credit value: ${courseCredits}. Must be positive.`,
    };
  }

  if (creditLimit <= 0) {
    return {
      allowed: false,
      currentCredits,
      creditLimit,
      courseCredits,
      creditsAfter: currentCredits,
      message: `Invalid credit limit: ${creditLimit}. Must be positive.`,
    };
  }

  if (currentCredits < 0) {
    return {
      allowed: false,
      currentCredits,
      creditLimit,
      courseCredits,
      creditsAfter: currentCredits,
      message: `Invalid current credits: ${currentCredits}. Cannot be negative.`,
    };
  }

  const creditsAfter = currentCredits + courseCredits;

  if (creditsAfter > creditLimit) {
    const overBy = creditsAfter - creditLimit;
    return {
      allowed: false,
      currentCredits,
      creditLimit,
      courseCredits,
      creditsAfter,
      message: `Cannot register: would exceed credit limit by ${overBy} credit(s). Current: ${currentCredits}/${creditLimit}, Course: ${courseCredits}.`,
    };
  }

  const remaining = creditLimit - creditsAfter;
  return {
    allowed: true,
    currentCredits,
    creditLimit,
    courseCredits,
    creditsAfter,
    message: `Registration allowed. Credits after: ${creditsAfter}/${creditLimit} (${remaining} remaining).`,
  };
}

/**
 * Calculates credits that would be freed by dropping a course.
 * 
 * @param currentCredits - Credits currently used
 * @param courseCredits  - Credits of the course being dropped
 * @returns New credit count after dropping
 * 
 * Branch coverage:
 * - B1: Normal drop → credits reduced
 * - B2: Drop would go negative → clamp to 0
 */
export function calculateCreditsAfterDrop(
  currentCredits: number,
  courseCredits: number
): number {
  const result = currentCredits - courseCredits;
  return Math.max(0, result);
}
