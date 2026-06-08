"use client";

import { useState, useEffect, useCallback } from "react";

interface Teacher { id: string; name: string; assignedSection: string | null; }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", assignedSection: "" });

  const fetchTeachers = useCallback(async () => {
    const res = await fetch("/api/organizer/teachers");
    const data = await res.json();
    if (data.success) setTeachers(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.assignedSection && t.assignedSection.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openCreate = () => { setEditing(null); setFormData({ name: "", assignedSection: "" }); setShowModal(true); };
  const openEdit = (t: Teacher) => { setEditing(t); setFormData({ name: t.name, assignedSection: t.assignedSection || "" }); setShowModal(true); };

  const handleSave = async () => {
    const payload = { name: formData.name, assignedSection: formData.assignedSection || null };
    if (editing) {
      await fetch("/api/organizer/teachers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/organizer/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/organizer/teachers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleteConfirm(null);
    fetchTeachers();
  };

  if (loading) {
    return <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center"><div className="text-surface-400 animate-pulse">Loading teachers...</div></div>;
  }

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Management</h1>
          <p className="text-surface-400">Manage faculty members • {teachers.length} teachers</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Teacher
        </button>
      </div>

      <div className="mb-6"><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input max-w-md" placeholder="Search by name or section..." /></div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Name</th><th>Section</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td className="font-medium">{t.name}</td>
                <td>{t.assignedSection ? <span className="badge-primary">{t.assignedSection}</span> : <span className="text-surface-500 text-sm">Unassigned</span>}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(t)} className="btn-ghost btn-sm" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(t.id)} className="btn-ghost btn-sm text-danger-500" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6">{editing ? "Edit Teacher" : "Add Teacher"}</h3>
            <div className="space-y-4">
              <div><label className="label">Full Name *</label><input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Dr. Sharma" /></div>
              <div><label className="label">Assigned Section</label><input type="text" className="input" value={formData.assignedSection} onChange={e => setFormData({ ...formData, assignedSection: e.target.value })} placeholder="e.g., CSE-A (optional)" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!formData.name}>{editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: "24rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Teacher?</h3>
            <p className="text-sm text-surface-400 mb-6">This will permanently remove the teacher. Slots assigned to them may be affected.</p>
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
