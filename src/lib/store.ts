/**
 * In-Memory Data Store
 * 
 * Shared server-side state for demo mode.
 * Both organizer and student API routes read/write here,
 * so changes on one side are immediately visible on the other.
 */

import { hashSync } from 'bcryptjs';

// ─── Types ──────────────────────────────────────────────

export interface StoreCourse {
  id: string;
  courseCode: string;
  courseName: string;
  creditValue: number;
  courseType: string;
  prerequisites: string[];
  antirequisites: string[];
}

export interface StoreTeacher {
  id: string;
  name: string;
  assignedSection: string | null;
}

export interface StoreSlot {
  id: string;
  slotName: string;
  day: string;
  startTime: string;
  endTime: string;
  seatLimit: number;
  seatsOccupied: number;
  courseId: string;
  teacherId: string;
}

export interface StoreStudent {
  id: string;
  registrationNumber: string;
  password: string; // hashed
  name: string;
  creditLimit: number;
  creditsUsed: number;
  variantType: 'HOSTELLER' | 'DAY_BOARDER';
  completedCourses: string[];
}

export interface StoreRegistration {
  id: string;
  studentId: string;
  slotId: string;
  courseId: string;
  createdAt: string;
}

export interface StoreOrganizer {
  id: string;
  username: string;
  password: string; // hashed
}

// ─── Initial Data ───────────────────────────────────────

const HASHED_PASS = hashSync('password', 10);
const ADMIN_PASS = hashSync('admin123', 10);

const initialOrganizers: StoreOrganizer[] = [
  { id: 'org-1', username: 'admin', password: ADMIN_PASS },
];

const initialStudents: StoreStudent[] = [
  { id: 'stu-1', registrationNumber: '21BCE1001', password: HASHED_PASS, name: 'Aarav Patel', creditLimit: 27, creditsUsed: 0, variantType: 'HOSTELLER', completedCourses: ['CSE1001'] },
  { id: 'stu-2', registrationNumber: '21BCE1002', password: HASHED_PASS, name: 'Diya Sharma', creditLimit: 27, creditsUsed: 0, variantType: 'DAY_BOARDER', completedCourses: ['CSE1001', 'MAT1001'] },
  { id: 'stu-3', registrationNumber: '21BCE1003', password: HASHED_PASS, name: 'Arjun Kumar', creditLimit: 27, creditsUsed: 0, variantType: 'HOSTELLER', completedCourses: [] },
];

const initialTeachers: StoreTeacher[] = [
  { id: 't-1', name: 'Dr. Sharma', assignedSection: 'CSE-A' },
  { id: 't-2', name: 'Dr. Patel', assignedSection: 'CSE-B' },
  { id: 't-3', name: 'Dr. Kumar', assignedSection: 'CSE-C' },
  { id: 't-4', name: 'Dr. Iyer', assignedSection: 'MAT-A' },
  { id: 't-5', name: 'Dr. Reddy', assignedSection: 'MAT-B' },
  { id: 't-6', name: 'Dr. Nair', assignedSection: 'PHY-A' },
  { id: 't-7', name: 'Dr. Das', assignedSection: 'ECE-A' },
  { id: 't-8', name: 'Dr. Roy', assignedSection: null },
  { id: 't-9', name: 'Dr. Gupta', assignedSection: 'ENG-A' },
  { id: 't-10', name: 'Dr. Mishra', assignedSection: 'CSE-E' },
  { id: 't-11', name: 'Dr. Verma', assignedSection: 'CSE-F' },
  { id: 't-12', name: 'Dr. Singh', assignedSection: 'CSE-D' },
];

const initialCourses: StoreCourse[] = [
  { id: 'c-1', courseCode: 'CSE1001', courseName: 'Problem Solving and Programming', creditValue: 4, courseType: 'Theory + Lab', prerequisites: [], antirequisites: [] },
  { id: 'c-2', courseCode: 'CSE2001', courseName: 'Data Structures and Algorithms', creditValue: 4, courseType: 'Theory + Lab', prerequisites: ['CSE1001'], antirequisites: [] },
  { id: 'c-3', courseCode: 'CSE3001', courseName: 'Database Management Systems', creditValue: 3, courseType: 'Theory', prerequisites: ['CSE2001'], antirequisites: [] },
  { id: 'c-4', courseCode: 'CSE3002', courseName: 'Operating Systems', creditValue: 4, courseType: 'Theory + Lab', prerequisites: ['CSE2001'], antirequisites: [] },
  { id: 'c-5', courseCode: 'MAT1001', courseName: 'Calculus and Linear Algebra', creditValue: 4, courseType: 'Theory', prerequisites: [], antirequisites: [] },
  { id: 'c-6', courseCode: 'MAT2001', courseName: 'Statistics for Engineers', creditValue: 3, courseType: 'Theory', prerequisites: ['MAT1001'], antirequisites: [] },
  { id: 'c-7', courseCode: 'PHY1001', courseName: 'Engineering Physics', creditValue: 3, courseType: 'Theory + Lab', prerequisites: [], antirequisites: [] },
  { id: 'c-8', courseCode: 'ECE1001', courseName: 'Digital Logic Design', creditValue: 4, courseType: 'Theory + Lab', prerequisites: [], antirequisites: ['CSE3002'] },
  { id: 'c-9', courseCode: 'HUM1001', courseName: 'Ethics and Values in Technology', creditValue: 2, courseType: 'Theory', prerequisites: [], antirequisites: [] },
  { id: 'c-10', courseCode: 'ENG1001', courseName: 'Technical English Communication', creditValue: 2, courseType: 'Theory', prerequisites: [], antirequisites: [] },
];

const initialSlots: StoreSlot[] = [
  // CSE1001 - Dr. Sharma - A1
  { id: 'sl-1', slotName: 'A1', day: 'Monday', startTime: '08:00', endTime: '08:50', seatLimit: 30, seatsOccupied: 0, courseId: 'c-1', teacherId: 't-1' },
  { id: 'sl-2', slotName: 'A1', day: 'Wednesday', startTime: '08:00', endTime: '08:50', seatLimit: 30, seatsOccupied: 0, courseId: 'c-1', teacherId: 't-1' },
  // CSE2001 - Dr. Kumar - B1
  { id: 'sl-3', slotName: 'B1', day: 'Tuesday', startTime: '08:00', endTime: '08:50', seatLimit: 35, seatsOccupied: 0, courseId: 'c-2', teacherId: 't-3' },
  { id: 'sl-4', slotName: 'B1', day: 'Thursday', startTime: '08:00', endTime: '08:50', seatLimit: 35, seatsOccupied: 0, courseId: 'c-2', teacherId: 't-3' },
  // MAT1001 - Dr. Iyer - C1
  { id: 'sl-5', slotName: 'C1', day: 'Monday', startTime: '10:00', endTime: '10:50', seatLimit: 40, seatsOccupied: 0, courseId: 'c-5', teacherId: 't-4' },
  { id: 'sl-6', slotName: 'C1', day: 'Wednesday', startTime: '10:00', endTime: '10:50', seatLimit: 40, seatsOccupied: 0, courseId: 'c-5', teacherId: 't-4' },
  // PHY1001 - Dr. Nair - D1
  { id: 'sl-7', slotName: 'D1', day: 'Wednesday', startTime: '14:00', endTime: '14:50', seatLimit: 30, seatsOccupied: 0, courseId: 'c-7', teacherId: 't-6' },
  { id: 'sl-8', slotName: 'D1', day: 'Friday', startTime: '14:00', endTime: '14:50', seatLimit: 30, seatsOccupied: 0, courseId: 'c-7', teacherId: 't-6' },
  // HUM1001 - Dr. Roy - E1
  { id: 'sl-9', slotName: 'E1', day: 'Friday', startTime: '10:00', endTime: '10:50', seatLimit: 50, seatsOccupied: 0, courseId: 'c-9', teacherId: 't-8' },
  { id: 'sl-10', slotName: 'E1', day: 'Saturday', startTime: '10:00', endTime: '10:50', seatLimit: 50, seatsOccupied: 0, courseId: 'c-9', teacherId: 't-8' },
  // CSE3001 - Dr. Mishra - F1 (full for demo)
  { id: 'sl-11', slotName: 'F1', day: 'Tuesday', startTime: '14:00', endTime: '14:50', seatLimit: 25, seatsOccupied: 25, courseId: 'c-3', teacherId: 't-10' },
  { id: 'sl-12', slotName: 'F1', day: 'Friday', startTime: '14:00', endTime: '14:50', seatLimit: 25, seatsOccupied: 25, courseId: 'c-3', teacherId: 't-10' },
  // CSE3001 - Dr. Verma - F2
  { id: 'sl-13', slotName: 'F2', day: 'Tuesday', startTime: '15:00', endTime: '15:50', seatLimit: 30, seatsOccupied: 10, courseId: 'c-3', teacherId: 't-11' },
  { id: 'sl-14', slotName: 'F2', day: 'Friday', startTime: '15:00', endTime: '15:50', seatLimit: 30, seatsOccupied: 10, courseId: 'c-3', teacherId: 't-11' },
  // CSE3002 - Dr. Singh - G1
  { id: 'sl-15', slotName: 'G1', day: 'Monday', startTime: '09:00', endTime: '09:50', seatLimit: 30, seatsOccupied: 18, courseId: 'c-4', teacherId: 't-12' },
  { id: 'sl-16', slotName: 'G1', day: 'Thursday', startTime: '09:00', endTime: '09:50', seatLimit: 30, seatsOccupied: 18, courseId: 'c-4', teacherId: 't-12' },
  // ENG1001 - Dr. Gupta - E2
  { id: 'sl-17', slotName: 'E2', day: 'Thursday', startTime: '14:00', endTime: '14:50', seatLimit: 40, seatsOccupied: 12, courseId: 'c-10', teacherId: 't-9' },
  { id: 'sl-18', slotName: 'E2', day: 'Saturday', startTime: '14:00', endTime: '14:50', seatLimit: 40, seatsOccupied: 12, courseId: 'c-10', teacherId: 't-9' },
  // ECE1001 - Dr. Das - D2
  { id: 'sl-19', slotName: 'D2', day: 'Wednesday', startTime: '11:00', endTime: '11:50', seatLimit: 30, seatsOccupied: 29, courseId: 'c-8', teacherId: 't-7' },
  { id: 'sl-20', slotName: 'D2', day: 'Friday', startTime: '11:00', endTime: '11:50', seatLimit: 30, seatsOccupied: 29, courseId: 'c-8', teacherId: 't-7' },
  // MAT2001 - Dr. Reddy - clash test: same time as A1
  { id: 'sl-21', slotName: 'A1', day: 'Monday', startTime: '08:00', endTime: '08:50', seatLimit: 40, seatsOccupied: 5, courseId: 'c-6', teacherId: 't-5' },
  { id: 'sl-22', slotName: 'A1', day: 'Wednesday', startTime: '08:00', endTime: '08:50', seatLimit: 40, seatsOccupied: 5, courseId: 'c-6', teacherId: 't-5' },
  // CSE1001 Lab - Dr. Sharma - TA1
  { id: 'sl-23', slotName: 'TA1', day: 'Monday', startTime: '14:00', endTime: '15:50', seatLimit: 30, seatsOccupied: 0, courseId: 'c-1', teacherId: 't-1' },
];

// ─── Store Singleton ────────────────────────────────────

class DataStore {
  organizers: StoreOrganizer[];
  students: StoreStudent[];
  teachers: StoreTeacher[];
  courses: StoreCourse[];
  slots: StoreSlot[];
  registrations: StoreRegistration[];
  registrationOpen: boolean;

  constructor() {
    this.organizers = [...initialOrganizers];
    this.students = [...initialStudents];
    this.teachers = [...initialTeachers];
    this.courses = [...initialCourses];
    this.slots = [...initialSlots];
    this.registrations = [];
    this.registrationOpen = true;
  }

  // ── Helpers ─────────────────────────────────────────

  findSlotWithDetails(slotId: string) {
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) return null;
    const course = this.courses.find(c => c.id === slot.courseId);
    const teacher = this.teachers.find(t => t.id === slot.teacherId);
    return { ...slot, course, teacher };
  }

  getStudentRegistrations(studentId: string) {
    return this.registrations
      .filter(r => r.studentId === studentId)
      .map(r => {
        const detail = this.findSlotWithDetails(r.slotId);
        return { ...r, slot: detail };
      });
  }

  getStudentRegisteredSlots(studentId: string): StoreSlot[] {
    const regSlotIds = this.registrations
      .filter(r => r.studentId === studentId)
      .map(r => r.slotId);
    return this.slots.filter(s => regSlotIds.includes(s.id));
  }

  getStudentRegisteredCourseCodes(studentId: string): string[] {
    const courseIds = new Set(
      this.registrations.filter(r => r.studentId === studentId).map(r => r.courseId)
    );
    return this.courses.filter(c => courseIds.has(c.id)).map(c => c.courseCode);
  }

  // ── Registration ────────────────────────────────────

  registerSlot(studentId: string, slotId: string): { success: boolean; error?: string } {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) return { success: false, error: 'Slot not found' };

    const course = this.courses.find(c => c.id === slot.courseId);
    if (!course) return { success: false, error: 'Course not found' };

    // Already registered for this exact slot?
    const existing = this.registrations.find(r => r.studentId === studentId && r.slotId === slotId);
    if (existing) return { success: false, error: 'Already registered for this slot' };

    // Seat check
    if (slot.seatsOccupied >= slot.seatLimit) {
      return { success: false, error: `Slot ${slot.slotName} (${slot.day}) is full` };
    }

    // Credit check
    if (student.creditsUsed + course.creditValue > student.creditLimit) {
      return { success: false, error: `Would exceed credit limit (${student.creditsUsed + course.creditValue}/${student.creditLimit})` };
    }

    // Clash check
    const regSlots = this.getStudentRegisteredSlots(studentId);
    for (const rs of regSlots) {
      if (rs.day.toLowerCase() === slot.day.toLowerCase()) {
        const sA = this.parseTime(rs.startTime), eA = this.parseTime(rs.endTime);
        const sB = this.parseTime(slot.startTime), eB = this.parseTime(slot.endTime);
        if (sA < eB && sB < eA) {
          return { success: false, error: `Clash with ${rs.slotName} on ${rs.day} (${rs.startTime}-${rs.endTime})` };
        }
      }
    }

    // Prerequisite check
    for (const prereq of course.prerequisites) {
      if (!student.completedCourses.includes(prereq)) {
        return { success: false, error: `Missing prerequisite: ${prereq}` };
      }
    }

    // Antirequisite check
    const regCodes = this.getStudentRegisteredCourseCodes(studentId);
    for (const anti of course.antirequisites) {
      if (regCodes.includes(anti)) {
        return { success: false, error: `Antirequisite conflict: already registered for ${anti}` };
      }
    }

    // All checks passed — register
    // Register ALL slots for this course+teacher combo (not just one slot)
    const allSlotsForTeacherCourse = this.slots.filter(
      s => s.courseId === slot.courseId && s.teacherId === slot.teacherId
    );

    for (const s of allSlotsForTeacherCourse) {
      // Skip if already registered
      if (this.registrations.find(r => r.studentId === studentId && r.slotId === s.id)) continue;
      
      this.registrations.push({
        id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId,
        slotId: s.id,
        courseId: s.courseId,
        createdAt: new Date().toISOString(),
      });
      s.seatsOccupied++;
    }

    student.creditsUsed += course.creditValue;
    return { success: true };
  }

  dropCourse(studentId: string, courseId: string): { success: boolean; error?: string } {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    const course = this.courses.find(c => c.id === courseId);
    if (!course) return { success: false, error: 'Course not found' };

    const regs = this.registrations.filter(r => r.studentId === studentId && r.courseId === courseId);
    if (regs.length === 0) return { success: false, error: 'Not registered for this course' };

    // Remove registrations and decrement seats
    for (const reg of regs) {
      const slot = this.slots.find(s => s.id === reg.slotId);
      if (slot) slot.seatsOccupied = Math.max(0, slot.seatsOccupied - 1);
    }
    this.registrations = this.registrations.filter(
      r => !(r.studentId === studentId && r.courseId === courseId)
    );
    student.creditsUsed = Math.max(0, student.creditsUsed - course.creditValue);

    return { success: true };
  }

  private parseTime(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
}

// Module-level singleton — survives across API route calls
const globalForStore = globalThis as unknown as { __store: DataStore };
if (!globalForStore.__store) {
  globalForStore.__store = new DataStore();
}

export const store = globalForStore.__store;
