"use client";

import { useState, useEffect, useCallback } from "react";

interface SeatEntry {
  id: string;
  slotName: string;
  day: string;
  course: string;
  teacher: string;
  occupied: number;
  limit: number;
}

interface DashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    activeRegistrations: number;
    slotsConfigured: number;
  };
  seats: SeatEntry[];
  registrationOpen: boolean;
}

function getStatusBadge(occupied: number, limit: number) {
  const pct = (occupied / limit) * 100;
  if (pct >= 100) return <span className="badge-danger">Full</span>;
  if (pct >= 80) return <span className="badge-warning">Filling</span>;
  return <span className="badge-success">Available</span>;
}

export default function OrganizerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/organizer/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 3 seconds for live updates
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleRegistration = async () => {
    if (!data) return;
    const newState = !data.registrationOpen;
    try {
      await fetch("/api/organizer/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationOpen: newState }),
      });
      setData({ ...data, registrationOpen: newState });
    } catch {
      console.error("Failed to toggle registration");
    }
  };

  if (loading) {
    return (
      <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-surface-400 text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-danger-500 text-lg">Failed to load dashboard data.</div>
      </div>
    );
  }

  // Deduplicate seats by slotName+course+teacher (aggregate across days)
  const uniqueSlotKeys = new Map<string, SeatEntry & { days: string[] }>();
  for (const seat of data.seats) {
    const key = `${seat.slotName}-${seat.course}-${seat.teacher}`;
    if (!uniqueSlotKeys.has(key)) {
      uniqueSlotKeys.set(key, { ...seat, days: [seat.day] });
    } else {
      uniqueSlotKeys.get(key)!.days.push(seat.day);
    }
  }

  const filteredSeats = Array.from(uniqueSlotKeys.values()).filter(
    (s) =>
      s.slotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 gradient-mesh min-h-screen">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-surface-400">Monitor live seat availability and manage registration</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Courses", value: data.stats.totalCourses, icon: "📚" },
          { label: "Total Students", value: data.stats.totalStudents, icon: "👥" },
          { label: "Active Registrations", value: data.stats.activeRegistrations, icon: "📝" },
          { label: "Slots Configured", value: data.stats.slotsConfigured, icon: "🕐" },
        ].map((stat, i) => (
          <div key={stat.label} className={`stat-card animate-fade-in stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Registration Control */}
      <div className="card mb-8 animate-fade-in stagger-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Registration Window</h2>
            <p className="text-sm text-surface-400">
              {data.registrationOpen
                ? "Registration is currently OPEN for students"
                : "Registration is currently CLOSED"}
            </p>
          </div>
          <button
            id="toggle-registration-btn"
            onClick={toggleRegistration}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-950 ${
              data.registrationOpen
                ? "bg-success-500 focus:ring-success-500"
                : "bg-surface-600 focus:ring-surface-500"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                data.registrationOpen ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Live Seat Availability */}
      <div className="card animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Live Seat Availability</h2>
            <p className="text-sm text-surface-400">
              Real-time seat counts • Updates every 3 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-xs text-success-500 font-medium">LIVE</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            id="seat-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input max-w-sm"
            placeholder="Search by slot, course, or teacher..."
          />
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Days</th>
                <th>Seats</th>
                <th>Availability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeats.map((seat) => {
                const pct = (seat.occupied / seat.limit) * 100;
                return (
                  <tr key={seat.id}>
                    <td><span className="badge-primary font-mono">{seat.slotName}</span></td>
                    <td className="font-medium">{seat.course}</td>
                    <td>{seat.teacher}</td>
                    <td><span className="text-xs text-surface-400">{seat.days.map(d => d.slice(0,3)).join(", ")}</span></td>
                    <td><span className="font-mono text-surface-300">{seat.occupied}/{seat.limit}</span></td>
                    <td>
                      <div className="w-32 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100 ? "bg-danger-500" : pct >= 80 ? "bg-warning-500" : "bg-success-500"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>
                    <td>{getStatusBadge(seat.occupied, seat.limit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
