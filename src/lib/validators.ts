/**
 * Zod Validation Schemas
 * 
 * All API request bodies are validated with Zod schemas
 * before processing. Clear error messages are returned
 * for every validation failure.
 */

import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────

export const organizerLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const studentLoginSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  password: z.string().min(1, 'Password is required'),
  captchaToken: z.string().min(1, 'CAPTCHA verification is required'),
});

// ─── Course Schemas ─────────────────────────────────────

export const createCourseSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required').max(20),
  courseName: z.string().min(1, 'Course name is required').max(200),
  creditValue: z.number().int().min(1, 'Credit value must be at least 1').max(10),
  courseType: z.string().default('Theory'),
  prerequisites: z.array(z.string()).default([]),
  antirequisites: z.array(z.string()).default([]),
});

export const updateCourseSchema = createCourseSchema.partial();

// ─── Teacher Schemas ────────────────────────────────────

export const createTeacherSchema = z.object({
  name: z.string().min(1, 'Teacher name is required').max(200),
  assignedSection: z.string().optional().nullable(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

// ─── Slot Schemas ───────────────────────────────────────

export const createSlotSchema = z.object({
  slotName: z.string().min(1, 'Slot name is required').max(10),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'End time must be in HH:mm format'),
  seatLimit: z.number().int().min(1, 'Seat limit must be at least 1'),
  courseId: z.string().min(1, 'Course is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
});

export const updateSlotSchema = createSlotSchema.partial();

// ─── Student Schemas ────────────────────────────────────

export const createStudentSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  creditLimit: z.number().int().min(1).default(27),
  variantType: z.enum(['DAY_BOARDER', 'HOSTELLER']).default('HOSTELLER'),
});

// ─── Registration Schemas ───────────────────────────────

export const registerSlotSchema = z.object({
  slotId: z.string().min(1, 'Slot ID is required'),
});

export const dropSlotSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required'),
});

// ─── System Config Schemas ──────────────────────────────

export const updateConfigSchema = z.object({
  registrationOpen: z.boolean(),
});
