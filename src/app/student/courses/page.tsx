"use client";

import { useState, useEffect, useCallback } from "react";
import { detectClash } from "@/lib/clash-detection";
import { checkCreditLimit } from "@/lib/credit-check";
import { checkSeatAvailability } from "@/lib/seat-check";
import { checkPrerequisites } from "@/lib/prerequisite-check";
import type { SlotInfo } from "@/types";

// ─── Types ──────────────────────────────────────────────

interface CourseSlot {
  id: string;
  slotName: string;
  day: string;
  startTime: string;
  endTime: string;
  seatLimit: number;
  seatsOccupied: number;
  courseId: string;
  teacherId: string;
  dayTime: string;
}

interface CourseTeacher {
  id: string;
  name: string;
  slots: CourseSlot[];
}

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  creditValue: number;
  courseType: string;
  prerequisites: string[];
  antirequisites: string[];
  teachers: CourseTeacher[];
}

interface StudentProfile {
  id: string;
  creditLimit: number;
  creditsUsed: number;
  completedCourses: string[];
}

interface Registration {
  id: string;
  courseId: string;
  slotId: string;
  slot: {
    id: string;
    slotName: string;
    day: string;
    startTime: string;
    endTime: string;
    seatLimit: number;
    seatsOccupied: number;
    courseId: string;
    teacherId: string;
    course?: { courseCode: string };
  };
}

interface ValidationResult {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function CourseSelectionPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [coursesRes, profileRes, regsRes] = await Promise.all([
        fetch("/api/student/courses"),
        fetch("/api/student/profile", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/student/registrations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const profileData = await profileRes.json();
      const regsData = await regsRes.json();

      if (coursesData.success) setCourses(coursesData.data);
      if (profileData.success) setProfile(profileData.data);
      if (regsData.success) setRegistrations(regsData.data);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const existingSlots: SlotInfo[] = registrations
    .filter(r => r.slot)
    .map(r => ({
      id: r.slot.id,
      slotName: r.slot.slotName,
      day: r.slot.day,
      startTime: r.slot.startTime,
      endTime: r.slot.endTime,
      seatLimit: r.slot.seatLimit,
      seatsOccupied: r.slot.seatsOccupied,
      courseId: r.slot.courseId,
      teacherId: r.slot.teacherId,
    }));

  const registeredCourseCodes = [...new Set(
    registrations
      .filter(r => r.slot?.course)
      .map(r => r.slot.course!.courseCode)
  )];

  const handleSelectCourse = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedTeacher(null);
    setValidationResults([]);
  };

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    if (!selectedCourse || !profile) return;

    const teacher = selectedCourse.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const results: ValidationResult[] = [];

    // 1. Prerequisite check
    const prereqCheck = checkPrerequisites(
      profile.completedCourses,
      registeredCourseCodes,
      selectedCourse.prerequisites,
      selectedCourse.antirequisites
    );
    results.push({
      type: prereqCheck.allowed ? "success" : "error",
      title: prereqCheck.allowed ? "Prerequisites Met" : "Prerequisite/Antirequisite Check Failed",
      message: prereqCheck.message,
    });

    // 2. Credit limit check
    const creditCheck = checkCreditLimit(
      profile.creditsUsed,
      profile.creditLimit,
      selectedCourse.creditValue
    );
    results.push({
      type: creditCheck.allowed ? "success" : "error",
      title: creditCheck.allowed ? "Credit Check Passed" : "Credit Limit Exceeded",
      message: creditCheck.message,
    });

    // 3. Already registered?
    const alreadyRegistered = registeredCourseCodes.includes(selectedCourse.courseCode);
    if (alreadyRegistered) {
      results.push({
        type: "error",
        title: "Already Registered",
        message: `You are already registered for ${selectedCourse.courseCode}.`,
      });
    }

    // 4. Seat + Clash checks for each slot
    for (const slot of teacher.slots) {
      const seatCheck = checkSeatAvailability(slot.seatsOccupied, slot.seatLimit);
      results.push({
        type: seatCheck.available ? "success" : "error",
        title: seatCheck.available ? `Seat Available — ${slot.slotName} (${slot.day})` : `Slot ${slot.slotName} (${slot.day}) Full`,
        message: seatCheck.message,
      });

      const clashResult = detectClash(existingSlots, slot as SlotInfo);
      if (clashResult.hasClash) {
        const clashingNames = clashResult.clashingSlots
          .map(cs => `${cs.slotName} (${cs.day} ${cs.startTime})`)
          .join(", ");
        results.push({
          type: "error",
          title: `Clash Detected — ${slot.slotName} (${slot.day})`,
          message: `Conflicts with: ${clashingNames}`,
        });
      } else {
        results.push({
          type: "success",
          title: `No Clash — ${slot.slotName} (${slot.day})`,
          message: "No schedule conflicts found.",
        });
      }
    }

    setValidationResults(results);
  };

  const canRegister = validationResults.length > 0 && validationResults.every(r => r.type === "success");
  const hasErrors = validationResults.some(r => r.type === "error");

  const handleRegister = async () => {
    if (!canRegister || !selectedCourse || !selectedTeacher || !token) return;

    const teacher = selectedCourse.teachers.find(t => t.id === selectedTeacher);
    if (!teacher || teacher.slots.length === 0) return;

    setRegistering(true);
    try {
      // Register using first slot — server auto-registers all slots for teacher+course
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotId: teacher.slots[0].id }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Successfully registered for ${selectedCourse.courseCode}!`, "success");
        setSelectedCourse(null);
        setSelectedTeacher(null);
        setValidationResults([]);
        await fetchAll(); // Refresh everything
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-surface-400 text-lg animate-pulse">Loading courses...</div>
      </div>
    );
  }

  const filtered = courses
    .filter(c =>
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.courseName.localeCompare(b.courseName));

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Course Registration</h1>
        <p className="text-surface-400">
          Credits: <span className="text-primary-400 font-semibold">{profile?.creditsUsed || 0}/{profile?.creditLimit || 27}</span>
          {" • "}Remaining: <span className="text-success-500 font-semibold">{(profile?.creditLimit || 27) - (profile?.creditsUsed || 0)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <input type="text" id="course-search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input" placeholder="Search courses..." />
          </div>
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {filtered.map(course => {
              const isRegistered = registeredCourseCodes.includes(course.courseCode);
              return (
                <button
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={`w-full text-left card-hover p-4 transition-all ${
                    selectedCourse?.id === course.id ? "border-primary-500/50 bg-primary-600/5" : ""
                  } ${isRegistered ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-primary font-mono">{course.courseCode}</span>
                    <div className="flex items-center gap-2">
                      {isRegistered && <span className="badge-success text-[10px]">REGISTERED</span>}
                      <span className="text-xs bg-primary-600/10 text-primary-400 px-2 py-0.5 rounded-md font-mono">{course.creditValue} cr</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">{course.courseName}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <span className="badge-neutral">{course.courseType}</span>
                    <span>{course.teachers.length} teacher(s)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2">
          {!selectedCourse ? (
            <div className="card flex flex-col items-center justify-center h-96 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-surface-400 text-lg font-medium">Select a course to begin</p>
              <p className="text-surface-500 text-sm mt-1">Choose from the list on the left</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Course Info */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCourse.courseName}</h2>
                    <p className="text-surface-400 text-sm mt-1">{selectedCourse.courseCode} • {selectedCourse.creditValue} Credits • {selectedCourse.courseType}</p>
                  </div>
                  <button onClick={() => { setSelectedCourse(null); setValidationResults([]); }} className="btn-ghost btn-sm">✕ Close</button>
                </div>
                {selectedCourse.prerequisites.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-surface-400">Prerequisites:</span>
                    {selectedCourse.prerequisites.map(p => <span key={p} className="badge-warning text-xs">{p}</span>)}
                  </div>
                )}
                {selectedCourse.antirequisites.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400">Antirequisites:</span>
                    {selectedCourse.antirequisites.map(a => <span key={a} className="badge-danger text-xs">{a}</span>)}
                  </div>
                )}
              </div>

              {/* Teacher Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Select a Teacher & Slot</h3>
                <div className="space-y-3">
                  {selectedCourse.teachers.map(teacher => (
                    <button
                      key={teacher.id}
                      onClick={() => handleSelectTeacher(teacher.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        selectedTeacher === teacher.id
                          ? "border-primary-500/50 bg-primary-600/10"
                          : "border-surface-800 bg-surface-800/30 hover:border-surface-700 hover:bg-surface-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-white">{teacher.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedTeacher === teacher.id ? "border-primary-500 bg-primary-500" : "border-surface-600"
                        }`}>
                          {selectedTeacher === teacher.id && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {teacher.slots.map(slot => {
                          const pct = (slot.seatsOccupied / slot.seatLimit) * 100;
                          const isFull = pct >= 100;
                          const clashResult = detectClash(existingSlots, slot as SlotInfo);
                          const isClashing = clashResult.hasClash;
                          return (
                            <div
                              key={slot.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                                isClashing ? "bg-danger-500/10 border-danger-500/30 text-danger-400"
                                  : isFull ? "bg-surface-800/80 border-surface-700 text-surface-500 line-through"
                                  : "bg-surface-800/50 border-surface-700 text-surface-300"
                              }`}
                            >
                              <span className="font-mono font-medium">{slot.slotName}</span>
                              <span className="text-surface-500">•</span>
                              <span>{slot.dayTime}</span>
                              <span className="text-surface-500">•</span>
                              <span className={isFull ? "text-danger-400" : pct >= 80 ? "text-warning-400" : "text-success-400"}>
                                {slot.seatsOccupied}/{slot.seatLimit}
                              </span>
                              {isClashing && <span className="bg-danger-500/20 text-danger-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">CLASH</span>}
                              {isFull && !isClashing && <span className="bg-surface-700 text-surface-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">FULL</span>}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Results */}
              {validationResults.length > 0 && (
                <div className="card animate-fade-in">
                  <h3 className="text-lg font-semibold text-white mb-4">Validation Results</h3>
                  <div className="space-y-2">
                    {validationResults.map((result, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                        result.type === "success" ? "bg-success-500/5 border-success-500/20" : "bg-danger-500/5 border-danger-500/20"
                      }`}>
                        <div className="mt-0.5">
                          {result.type === "success" ? (
                            <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${result.type === "success" ? "text-success-500" : "text-danger-500"}`}>{result.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-800 flex justify-end">
                    <button
                      onClick={handleRegister}
                      disabled={!canRegister || registering}
                      id="register-course-btn"
                      className={canRegister ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}
                    >
                      {registering ? (
                        <span>Registering...</span>
                      ) : hasErrors ? (
                        <span className="flex items-center gap-2 text-danger-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Cannot Register — Resolve Errors
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Confirm Registration
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast-${toast.type}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {toast.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
