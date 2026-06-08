"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────

interface StudentProfile {
  id: string;
  registrationNumber: string;
  name: string;
  creditLimit: number;
  creditsUsed: number;
  variantType: "HOSTELLER" | "DAY_BOARDER";
}

interface Registration {
  id: string;
  studentId: string;
  slotId: string;
  courseId: string;
  slot: {
    id: string;
    slotName: string;
    day: string;
    startTime: string;
    endTime: string;
    courseId: string;
    course?: { courseCode: string; courseName: string };
    teacher?: { name: string };
  };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const SLOT_COLORS: Record<string, string> = {
  0: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  1: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  2: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  3: "bg-rose-500/20 border-rose-500/40 text-rose-300",
  4: "bg-sky-500/20 border-sky-500/40 text-sky-300",
  5: "bg-violet-500/20 border-violet-500/40 text-violet-300",
  6: "bg-teal-500/20 border-teal-500/40 text-teal-300",
  7: "bg-orange-500/20 border-orange-500/40 text-orange-300",
};

function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [profileRes, regsRes] = await Promise.all([
        fetch("/api/student/profile", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/student/registrations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const profileData = await profileRes.json();
      const regsData = await regsRes.json();
      if (profileData.success) setProfile(profileData.data);
      if (regsData.success) setRegistrations(regsData.data);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDropCourse = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/student/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Course dropped successfully", "success");
        await fetchData();
      } else {
        showToast(data.error || "Failed to drop course", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-surface-400 text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-danger-500">Could not load profile. Please log in again.</div>
      </div>
    );
  }

  // Build color map for courses
  const uniqueCourseIds = [...new Set(registrations.map(r => r.courseId))];
  const courseColorMap: Record<string, string> = {};
  uniqueCourseIds.forEach((cid, idx) => {
    courseColorMap[cid] = SLOT_COLORS[String(idx % 8)];
  });

  const getSlotForCell = (day: string, time: string) => {
    const timeMin = parseTimeToMinutes(time);
    return registrations.filter(r => {
      if (!r.slot || r.slot.day !== day) return false;
      const start = parseTimeToMinutes(r.slot.startTime);
      const end = parseTimeToMinutes(r.slot.endTime);
      return timeMin >= start && timeMin < end;
    });
  };

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.name}</h1>
        <p className="text-surface-400">Your current timetable and registration overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card animate-fade-in stagger-1">
          <span className="stat-label">Credits Used</span>
          <span className="stat-value">{profile.creditsUsed}</span>
          <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(profile.creditsUsed / profile.creditLimit) * 100}%` }}
            />
          </div>
        </div>
        <div className="stat-card animate-fade-in stagger-2">
          <span className="stat-label">Credits Remaining</span>
          <span className="stat-value">{profile.creditLimit - profile.creditsUsed}</span>
          <p className="text-xs text-surface-500">out of {profile.creditLimit} total</p>
        </div>
        <div className="stat-card animate-fade-in stagger-3">
          <span className="stat-label">Courses Registered</span>
          <span className="stat-value">{uniqueCourseIds.length}</span>
        </div>
        <div className="stat-card animate-fade-in stagger-4">
          <span className="stat-label">Variant</span>
          <span className="text-xl font-bold text-primary-400 mt-1">
            {profile.variantType === "HOSTELLER" ? "🏠 Hosteller" : "🚌 Day Boarder"}
          </span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card mb-8 animate-fade-in stagger-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Weekly Timetable</h2>
            <p className="text-sm text-surface-400">Your registered slots for the week</p>
          </div>
          <Link href="/student/courses" className="btn-primary btn-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Courses
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-400 text-lg">No courses registered yet.</p>
            <Link href="/student/courses" className="btn-primary mt-4 inline-flex">Browse Courses</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-surface-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-800/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider w-20 border-r border-surface-700">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-3 py-3 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider border-r border-surface-700 last:border-r-0">{day.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="border-t border-surface-800/60">
                    <td className="px-4 py-1 font-mono text-xs text-surface-500 border-r border-surface-700 bg-surface-900/40 h-16 align-top pt-2">{time}</td>
                    {DAYS.map(day => {
                      const slots = getSlotForCell(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-1.5 py-1 border-r border-surface-700 last:border-r-0 h-16 align-top">
                          {slots.map(reg => {
                            if (!reg.slot || reg.slot.startTime !== time) return null;
                            const durationHours = Math.ceil(
                              (parseTimeToMinutes(reg.slot.endTime) - parseTimeToMinutes(reg.slot.startTime)) / 60
                            );
                            const color = courseColorMap[reg.courseId] || SLOT_COLORS["0"];
                            return (
                              <div
                                key={reg.id}
                                className={`timetable-slot ${color} group relative`}
                                style={{ height: durationHours > 1 ? `${durationHours * 64 - 8}px` : undefined }}
                              >
                                <p className="font-semibold text-[11px] truncate">{reg.slot.course?.courseCode || "?"}</p>
                                <p className="text-[10px] opacity-75 truncate">{reg.slot.slotName} • {reg.slot.teacher?.name || "?"}</p>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Courses List */}
      {uniqueCourseIds.length > 0 && (
        <div className="card animate-fade-in stagger-4">
          <h2 className="text-xl font-bold text-white mb-4">Registered Courses</h2>
          <div className="space-y-3">
            {uniqueCourseIds.map(courseId => {
              const courseRegs = registrations.filter(r => r.courseId === courseId);
              const first = courseRegs[0];
              const courseName = first?.slot?.course?.courseName || "Unknown";
              const courseCode = first?.slot?.course?.courseCode || "???";
              const teacherName = first?.slot?.teacher?.name || "Unknown";
              return (
                <div key={courseId} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/40 border border-surface-800 hover:border-surface-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="badge-primary font-mono">{courseCode}</span>
                    <div>
                      <p className="font-medium text-white">{courseName}</p>
                      <p className="text-sm text-surface-400">
                        {teacherName} • Slots: {courseRegs.map(r => `${r.slot?.slotName || "?"}(${(r.slot?.day || "?").slice(0, 3)})`).join(", ")}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDropCourse(courseId)} className="btn-ghost btn-sm text-danger-500 hover:text-danger-400 hover:bg-danger-500/10">
                    Drop Course
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
