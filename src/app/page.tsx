"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FFCS</h1>
              <p className="text-xs text-surface-400">Flexible Credit System</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/student/login" className="btn-secondary btn-sm">
              Student Login
            </Link>
            <Link href="/organizer/login" className="btn-primary btn-sm">
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-300 font-medium">
              Registration Portal
            </span>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Fully Flexible{" "}
            <span className="gradient-text">Credit System</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Intelligent course registration with real-time seat availability,
            automatic clash detection, and dynamic timetable generation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/student/login"
              className="btn-primary btn-lg group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Registration
              </span>
            </Link>
            <Link
              href="/organizer/login"
              className="btn-secondary btn-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Portal
            </Link>
          </div>

          {/* Feature Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="card-hover text-left">
              <div className="w-12 h-12 rounded-xl bg-primary-600/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Real-Time Availability
              </h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Live seat counts updated instantly. Know exactly how many spots
                remain before you register.
              </p>
            </div>

            <div className="card-hover text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Clash Detection
              </h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Instant conflict checking highlights schedule overlaps before
                you commit to a course.
              </p>
            </div>

            <div className="card-hover text-left">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Dynamic Timetable
              </h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Your weekly schedule updates in real-time as you add or drop
                courses from your plan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-surface-500">
          <p>© 2026 FFCS — Fully Flexible Credit System</p>
          <p>Built for academic excellence</p>
        </div>
      </footer>
    </div>
  );
}
