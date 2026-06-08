"use client";

import { useState, useEffect, useCallback } from "react";

interface Student {
  id: string;
  registrationNumber: string;
  name: string;
  creditLimit: number;
  creditsUsed: number;
  variantType: "HOSTELLER" | "DAY_BOARDER";
  registrationCount: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    registrationNumber: string; name: string; creditLimit: number;
    variantType: "HOSTELLER" | "DAY_BOARDER"; password: string;
  }>({
    registrationNumber: "", name: "", creditLimit: 27, variantType: "HOSTELLER", password: "",
  });

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/organizer/students");
    const data = await res.json();
    if (data.success) setStudents(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter(s =>
    s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    await fetch("/api/organizer/students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    setFormData({ registrationNumber: "", name: "", creditLimit: 27, variantType: "HOSTELLER", password: "" });
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/organizer/students", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteConfirm(null);
    fetchStudents();
  };

  if (loading) {
    return <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center"><div className="text-surface-400 animate-pulse">Loading students...</div></div>;
  }

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
          <p className="text-surface-400">View and manage registered students • {students.length} students</p>
        </div>
        <button onClick={() => { setFormData({ registrationNumber: "", name: "", creditLimit: 27, variantType: "HOSTELLER", password: "" }); setShowModal(true); }} className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Student
        </button>
      </div>

      <div className="mb-6"><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input max-w-md" placeholder="Search by registration number or name..." /></div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Reg. Number</th><th>Name</th><th>Type</th><th>Credits Used</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => {
              const pct = Math.round((s.creditsUsed / s.creditLimit) * 100);
              return (
                <tr key={s.id}>
                  <td><span className="font-mono font-medium text-primary-400">{s.registrationNumber}</span></td>
                  <td className="font-medium">{s.name}</td>
                  <td><span className={s.variantType === "HOSTELLER" ? "badge-primary" : "badge-warning"}>{s.variantType === "HOSTELLER" ? "Hosteller" : "Day Boarder"}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-danger-500" : pct >= 80 ? "bg-warning-500" : "bg-primary-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className="font-mono text-sm text-surface-300">{s.creditsUsed}/{s.creditLimit}</span>
                    </div>
                  </td>
                  <td><span className="font-mono">{s.registrationCount}</span></td>
                  <td>
                    {s.creditsUsed >= s.creditLimit ? <span className="badge-danger">Maxed</span>
                      : s.creditsUsed === 0 ? <span className="badge-neutral">Not Started</span>
                      : <span className="badge-success">Active</span>}
                  </td>
                  <td>
                    <button onClick={() => setDeleteConfirm(s.id)} className="btn-ghost btn-sm text-danger-500" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6">Add New Student</h3>
            <div className="space-y-4">
              <div><label className="label">Registration Number *</label><input type="text" className="input" value={formData.registrationNumber} onChange={e => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })} placeholder="e.g., 21BCE1001" /></div>
              <div><label className="label">Full Name *</label><input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Student full name" /></div>
              <div><label className="label">Initial Password *</label><input type="password" className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Min 6 characters" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Credit Limit</label>
                  <select className="input" value={formData.creditLimit} onChange={e => setFormData({ ...formData, creditLimit: parseInt(e.target.value) })}>
                    {[18, 20, 21, 24, 27, 30].map(n => <option key={n} value={n}>{n} credits</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Variant Type</label>
                  <div className="flex gap-2">
                    {(["HOSTELLER", "DAY_BOARDER"] as const).map(type => (
                      <button key={type} type="button" onClick={() => setFormData({ ...formData, variantType: type })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all text-center ${formData.variantType === type ? "border-primary-500 bg-primary-600/10 text-primary-400" : "border-surface-700 bg-surface-800/50 text-surface-400 hover:border-surface-600"}`}
                      >{type === "HOSTELLER" ? "🏠 Hosteller" : "🚌 Day Boarder"}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!formData.registrationNumber || !formData.name || !formData.password}>Add Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: "24rem" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Student?</h3>
            <p className="text-sm text-surface-400 mb-6">This will permanently remove the student and all their registrations. This cannot be undone.</p>
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
