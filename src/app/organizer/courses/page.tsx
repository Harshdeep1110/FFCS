"use client";

import { useState, useEffect, useCallback } from "react";

interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  creditValue: number;
  courseType: string;
  prerequisites: string[];
  antirequisites: string[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    courseCode: "", courseName: "", creditValue: 3, courseType: "Theory",
    prerequisites: [] as string[], antirequisites: [] as string[],
  });

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/organizer/courses");
    const data = await res.json();
    if (data.success) setCourses(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filteredCourses = courses.filter(c =>
    c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ courseCode: "", courseName: "", creditValue: 3, courseType: "Theory", prerequisites: [], antirequisites: [] });
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode, courseName: course.courseName,
      creditValue: course.creditValue, courseType: course.courseType,
      prerequisites: [...course.prerequisites], antirequisites: [...course.antirequisites],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = { ...formData };
    if (editingCourse) {
      await fetch("/api/organizer/courses", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCourse.id, ...payload }),
      });
    } else {
      await fetch("/api/organizer/courses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/organizer/courses", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteConfirm(null);
    fetchCourses();
  };

  const togglePrereq = (code: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(code)
        ? prev.prerequisites.filter(p => p !== code)
        : [...prev.prerequisites, code],
    }));
  };

  const toggleAntireq = (code: string) => {
    setFormData(prev => ({
      ...prev,
      antirequisites: prev.antirequisites.includes(code)
        ? prev.antirequisites.filter(a => a !== code)
        : [...prev.antirequisites, code],
    }));
  };

  // Courses available for prerequisite/antirequisite selection (exclude self)
  const otherCourses = courses.filter(c => c.id !== editingCourse?.id);

  if (loading) {
    return <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center"><div className="text-surface-400 animate-pulse">Loading courses...</div></div>;
  }

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-surface-400">Add, edit, and manage course offerings • {courses.length} courses</p>
        </div>
        <button onClick={openCreateModal} id="add-course-btn" className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Course
        </button>
      </div>

      <div className="mb-6"><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input max-w-md" placeholder="Search courses by code or name..." /></div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Type</th><th>Prerequisites</th><th>Antirequisites</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredCourses.map(course => (
              <tr key={course.id}>
                <td><span className="badge-primary font-mono">{course.courseCode}</span></td>
                <td className="font-medium">{course.courseName}</td>
                <td><span className="bg-primary-600/10 text-primary-400 px-2.5 py-1 rounded-lg font-mono text-sm">{course.creditValue}</span></td>
                <td><span className="badge-neutral">{course.courseType}</span></td>
                <td>
                  {course.prerequisites.length > 0
                    ? <div className="flex flex-wrap gap-1">{course.prerequisites.map(p => <span key={p} className="badge-warning text-xs">{p}</span>)}</div>
                    : <span className="text-surface-500 text-sm">None</span>}
                </td>
                <td>
                  {course.antirequisites.length > 0
                    ? <div className="flex flex-wrap gap-1">{course.antirequisites.map(a => <span key={a} className="badge-danger text-xs">{a}</span>)}</div>
                    : <span className="text-surface-500 text-sm">None</span>}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(course)} className="btn-ghost btn-sm" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(course.id)} className="btn-ghost btn-sm text-danger-500 hover:text-danger-400" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: "36rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6">{editingCourse ? "Edit Course" : "Add New Course"}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Course Code *</label>
                  <input type="text" className="input" value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })} placeholder="e.g., CSE1001" />
                </div>
                <div>
                  <label className="label">Credits *</label>
                  <select className="input" value={formData.creditValue} onChange={e => setFormData({ ...formData, creditValue: parseInt(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} credit{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Course Name *</label>
                <input type="text" className="input" value={formData.courseName} onChange={e => setFormData({ ...formData, courseName: e.target.value })} placeholder="Full course title" />
              </div>
              <div>
                <label className="label">Course Type</label>
                <div className="flex gap-2">
                  {["Theory", "Lab", "Theory + Lab", "Project"].map(type => (
                    <button key={type} type="button" onClick={() => setFormData({ ...formData, courseType: type })}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${formData.courseType === type ? "border-primary-500 bg-primary-600/10 text-primary-400" : "border-surface-700 bg-surface-800/50 text-surface-400 hover:border-surface-600"}`}
                    >{type}</button>
                  ))}
                </div>
              </div>

              {/* Prerequisites — clickable chips */}
              {otherCourses.length > 0 && (
                <div>
                  <label className="label">Prerequisites <span className="text-surface-500 font-normal">(click to select)</span></label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-800/30 border border-surface-800 max-h-28 overflow-y-auto">
                    {otherCourses.map(c => (
                      <button key={c.id} type="button" onClick={() => togglePrereq(c.courseCode)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${formData.prerequisites.includes(c.courseCode) ? "bg-warning-500/20 text-warning-500 border border-warning-500/30" : "bg-surface-800/50 text-surface-400 border border-surface-700 hover:border-surface-600"}`}
                      >{c.courseCode}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Antirequisites — clickable chips */}
              {otherCourses.length > 0 && (
                <div>
                  <label className="label">Antirequisites <span className="text-surface-500 font-normal">(click to select)</span></label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-800/30 border border-surface-800 max-h-28 overflow-y-auto">
                    {otherCourses.map(c => (
                      <button key={c.id} type="button" onClick={() => toggleAntireq(c.courseCode)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${formData.antirequisites.includes(c.courseCode) ? "bg-danger-500/20 text-danger-500 border border-danger-500/30" : "bg-surface-800/50 text-surface-400 border border-surface-700 hover:border-surface-600"}`}
                      >{c.courseCode}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!formData.courseCode || !formData.courseName}>{editingCourse ? "Update" : "Create"} Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: "24rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Course?</h3>
            <p className="text-sm text-surface-400 mb-6">This will permanently remove the course and may affect existing registrations. This cannot be undone.</p>
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
