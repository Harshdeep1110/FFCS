"use client";

import { useState, useEffect, useCallback } from "react";

interface Slot {
  id: string;
  slotName: string;
  day: string;
  startTime: string;
  endTime: string;
  seatLimit: number;
  seatsOccupied: number;
  courseId: string;
  teacherId: string;
  courseName: string;
  teacherName: string;
}

interface Course { id: string; courseCode: string; courseName: string; }
interface Teacher { id: string; name: string; }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_OPTIONS = [
  "08:00", "08:50", "09:00", "09:50", "10:00", "10:50", "11:00", "11:50",
  "12:00", "12:50", "13:00", "13:50", "14:00", "14:50", "15:00", "15:50",
  "16:00", "16:50", "17:00", "17:50",
];

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    slotName: "", day: "Monday", startTime: "08:00", endTime: "08:50",
    seatLimit: 30, courseId: "", teacherId: "",
  });

  const fetchAll = useCallback(async () => {
    const [slotsRes, coursesRes, teachersRes] = await Promise.all([
      fetch("/api/organizer/slots"),
      fetch("/api/organizer/courses"),
      fetch("/api/organizer/teachers"),
    ]);
    const slotsData = await slotsRes.json();
    const coursesData = await coursesRes.json();
    const teachersData = await teachersRes.json();
    if (slotsData.success) setSlots(slotsData.data);
    if (coursesData.success) setCourses(coursesData.data);
    if (teachersData.success) setTeachers(teachersData.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = slots.filter(s =>
    s.slotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setFormData({ slotName: "", day: "Monday", startTime: "08:00", endTime: "08:50", seatLimit: 30, courseId: courses[0]?.id || "", teacherId: teachers[0]?.id || "" });
    setShowModal(true);
  };

  const openEdit = (s: Slot) => {
    setEditing(s);
    setFormData({ slotName: s.slotName, day: s.day, startTime: s.startTime, endTime: s.endTime, seatLimit: s.seatLimit, courseId: s.courseId, teacherId: s.teacherId });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editing) {
      await fetch("/api/organizer/slots", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...formData }),
      });
    } else {
      await fetch("/api/organizer/slots", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/organizer/slots", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteConfirm(null);
    fetchAll();
  };

  if (loading) {
    return <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center"><div className="text-surface-400 animate-pulse">Loading slots...</div></div>;
  }

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Slot Management</h1>
          <p className="text-surface-400">Configure timetable slots • {slots.length} slots</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Slot
        </button>
      </div>

      <div className="mb-6"><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input max-w-md" placeholder="Search by slot, course, day, or teacher..." /></div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Slot</th><th>Day</th><th>Time</th><th>Course</th><th>Teacher</th><th>Seats</th><th>Fill</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(slot => {
              const pct = Math.round((slot.seatsOccupied / slot.seatLimit) * 100);
              const status = pct >= 100 ? "danger" : pct >= 80 ? "warning" : "success";
              return (
                <tr key={slot.id}>
                  <td><span className="badge-primary font-mono">{slot.slotName}</span></td>
                  <td>{slot.day}</td>
                  <td><span className="font-mono text-surface-300">{slot.startTime} - {slot.endTime}</span></td>
                  <td className="font-medium">{slot.courseName}</td>
                  <td>{slot.teacherName}</td>
                  <td><span className="font-mono">{slot.seatsOccupied}/{slot.seatLimit}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-${status}-500`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className={`text-xs text-${status}-500`}>{pct}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(slot)} className="btn-ghost btn-sm" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(slot.id)} className="btn-ghost btn-sm text-danger-500" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal — with DROPDOWNS */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: "36rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6">{editing ? "Edit Slot" : "Add New Slot"}</h3>
            <div className="space-y-4">
              {/* Slot Name + Day */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Slot Name *</label>
                  <input type="text" className="input" value={formData.slotName} onChange={e => setFormData({ ...formData, slotName: e.target.value.toUpperCase() })} placeholder="e.g., A1, B2, TA1" />
                </div>
                <div>
                  <label className="label">Day *</label>
                  <select className="input" value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Time — dropdowns */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Start Time</label>
                  <select className="input" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">End Time</label>
                  <select className="input" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}>
                    {TIME_OPTIONS.filter(t => t > formData.startTime).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Seat Limit</label>
                  <select className="input" value={formData.seatLimit} onChange={e => setFormData({ ...formData, seatLimit: parseInt(e.target.value) })}>
                    {[10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 80, 100].map(n => <option key={n} value={n}>{n} seats</option>)}
                  </select>
                </div>
              </div>

              {/* Course — DROPDOWN */}
              <div>
                <label className="label">Course *</label>
                <select className="input" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                  <option value="" disabled>Select a course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
                  ))}
                </select>
              </div>

              {/* Teacher — DROPDOWN */}
              <div>
                <label className="label">Teacher *</label>
                <select className="input" value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })}>
                  <option value="" disabled>Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}{t.assignedSection ? ` (${t.assignedSection})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!formData.slotName || !formData.courseId || !formData.teacherId}>{editing ? "Update" : "Create"} Slot</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: "24rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Slot?</h3>
            <p className="text-sm text-surface-400 mb-6">This will remove the slot. Existing registrations for this slot may be affected.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
