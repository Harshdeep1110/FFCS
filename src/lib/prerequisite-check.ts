/**
 * Prerequisite & Antirequisite Check Module
 * 
 * Validates whether a student meets the prerequisite requirements
 * and does not have any conflicting antirequisite courses.
 * 
 * Business Rules:
 * - Prerequisites: ALL listed course codes must be in the student's completedCourses
 * - Antirequisites: NONE of the listed course codes should be in current registrations
 */

import { PrerequisiteCheckResult } from '@/types';

/**
 * Checks if a student meets the prerequisites for a course and
 * does not violate any antirequisite constraints.
 * 
 * @param completedCourses     - Course codes the student has already completed
 * @param currentRegistrations - Course codes the student is currently registered for
 * @param prerequisites        - Course codes required before registration
 * @param antirequisites       - Course codes that conflict with this course
 * @returns PrerequisiteCheckResult with detailed information
 * 
 * Branch coverage targets:
 * - B1: No prerequisites, no antirequisites → allowed
 * - B2: Has prerequisites, all met → allowed
 * - B3: Has prerequisites, some missing → denied
 * - B4: Has prerequisites, all missing → denied
 * - B5: No antirequisites → allowed (prereqs check only)
 * - B6: Has antirequisites, none violated → allowed
 * - B7: Has antirequisites, some violated → denied
 * - B8: Both prerequisites missing AND antirequisites violated → denied (both reasons)
 * - B9: Empty completed courses, has prerequisites → denied
 * - B10: Empty current registrations, has antirequisites → allowed
 * 
 * Path coverage targets:
 * - P1: No prereqs, no antireqs → pass
 * - P2: Prereqs met, no antireqs → pass
 * - P3: Prereqs met, antireqs clear → pass
 * - P4: Prereqs missing → fail (missing list)
 * - P5: Antireqs violated → fail (violated list)
 * - P6: Both failing → fail (combined message)
 */
export function checkPrerequisites(
  completedCourses: string[],
  currentRegistrations: string[],
  prerequisites: string[],
  antirequisites: string[]
): PrerequisiteCheckResult {
  const missingPrerequisites: string[] = [];
  const violatedAntirequisites: string[] = [];

  // Check prerequisites — all must be in completedCourses
  for (const prereq of prerequisites) {
    if (!completedCourses.includes(prereq)) {
      missingPrerequisites.push(prereq);
    }
  }

  // Check antirequisites — none should be in currentRegistrations
  for (const antireq of antirequisites) {
    if (currentRegistrations.includes(antireq)) {
      violatedAntirequisites.push(antireq);
    }
  }

  const allowed = missingPrerequisites.length === 0 && violatedAntirequisites.length === 0;

  // Build descriptive message
  let message = '';
  if (allowed) {
    message = 'All prerequisite and antirequisite checks passed.';
  } else {
    const parts: string[] = [];
    if (missingPrerequisites.length > 0) {
      parts.push(`Missing prerequisites: ${missingPrerequisites.join(', ')}`);
    }
    if (violatedAntirequisites.length > 0) {
      parts.push(`Antirequisite conflict: already registered for ${violatedAntirequisites.join(', ')}`);
    }
    message = parts.join('. ') + '.';
  }

  return {
    allowed,
    missingPrerequisites,
    violatedAntirequisites,
    message,
  };
}
