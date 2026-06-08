// ─── Variant Types ───────────────────────────────────────

export type VariantType = 'DAY_BOARDER' | 'HOSTELLER';

// ─── Core Domain Types ──────────────────────────────────

export interface SlotInfo {
  id: string;
  slotName: string;
  day: string;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  seatLimit: number;
  seatsOccupied: number;
  courseId: string;
  teacherId: string;
}

export interface CourseInfo {
  id: string;
  courseCode: string;
  courseName: string;
  creditValue: number;
  courseType: string;
  prerequisites: string[];
  antirequisites: string[];
}

export interface TeacherInfo {
  id: string;
  name: string;
  assignedSection: string | null;
}

export interface StudentInfo {
  id: string;
  registrationNumber: string;
  name: string;
  creditLimit: number;
  creditsUsed: number;
  variantType: VariantType;
  completedCourses: string[];
}

export interface RegistrationInfo {
  id: string;
  studentId: string;
  slotId: string;
  courseId: string;
  slot: SlotInfo & {
    course: CourseInfo;
    teacher: TeacherInfo;
  };
}

// ─── Clash Detection Types ──────────────────────────────

export interface ClashResult {
  hasClash: boolean;
  clashingSlots: SlotInfo[];
}

// ─── Credit Check Types ─────────────────────────────────

export interface CreditCheckResult {
  allowed: boolean;
  currentCredits: number;
  creditLimit: number;
  courseCredits: number;
  creditsAfter: number;
  message: string;
}

// ─── Seat Check Types ───────────────────────────────────

export interface SeatCheckResult {
  available: boolean;
  seatsOccupied: number;
  seatLimit: number;
  seatsRemaining: number;
  message: string;
}

// ─── Prerequisite Check Types ───────────────────────────

export interface PrerequisiteCheckResult {
  allowed: boolean;
  missingPrerequisites: string[];
  violatedAntirequisites: string[];
  message: string;
}

// ─── API Response Types ─────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Auth Types ─────────────────────────────────────────

export interface TokenPayload {
  sub: string;
  role: 'student' | 'organizer';
  registrationNumber?: string;
  name?: string;
}

// ─── Timetable Types ────────────────────────────────────

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type Day = typeof DAYS[number];

export interface TimetableSlot {
  id: string;
  slotName: string;
  day: string;
  startTime: string;
  endTime: string;
  courseName: string;
  courseCode: string;
  teacherName: string;
  isClashing?: boolean;
  isProvisional?: boolean;
}
