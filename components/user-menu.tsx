"use client";

import { useState } from "react";

export default function UserMenu({
  displayName,
  streak,
}: {
  displayName: string;
  streak?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-primary text-sm font-semibold text-on-primary shadow-sm transition-all hover:scale-105"
      >
        {displayName.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-white/20 bg-white/90 p-2 shadow-xl backdrop-blur-xl"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <div className="border-b border-outline-variant/20 px-3 py-2">
            <p className="truncate text-label-sm font-medium text-on-surface">{displayName}</p>
            {streak !== undefined && (
              <p className="text-label-xs text-on-surface-variant">🔥 {streak} días seguidas</p>
            )}
          </div>
          <a
            href="/api/auth/logout"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </a>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
