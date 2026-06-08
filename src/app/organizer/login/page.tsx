"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function OrganizerLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/organizer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("role", "organizer");
      window.location.href = "/organizer/dashboard";
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-surface-400 mt-1">Sign in to manage FFCS</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-primary-600/5 border border-primary-500/20 text-primary-400 text-xs">
            <strong>Demo credentials:</strong> admin / admin123
          </div>

          <div>
            <label className="label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
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

          <button type="submit" className="btn-primary w-full" disabled={loading} id="organizer-login-btn">
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
