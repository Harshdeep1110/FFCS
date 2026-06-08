"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function StudentLoginPage() {
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: regNumber, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("role", "student");
      localStorage.setItem("studentData", JSON.stringify(data.data.student));
      window.location.href = "/student/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Student Portal</h1>
          <p className="text-surface-400 mt-1">Register for courses</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-primary-600/5 border border-primary-500/20 text-primary-400 text-xs">
            <strong>Demo credentials:</strong> 21BCE1001 / password
          </div>

          <div>
            <label className="label" htmlFor="regNumber">Registration Number</label>
            <input
              id="regNumber"
              type="text"
              className="input"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g., 21BCE1001"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} id="student-login-btn">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <Link href="/" className="block text-center text-sm text-surface-400 hover:text-surface-200 transition-colors">
            ← Back to home
          </Link>
        </form>
      </div>
    </div>
  );
}
