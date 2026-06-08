"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard?tab=files", label: "Mis Archivos", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard?tab=formulas", label: "Fórmulas", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { href: "/dashboard?tab=favorites", label: "Favoritos", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { href: "/dashboard?tab=downloads", label: "Descargas", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" },
  { href: "/dashboard?tab=stats", label: "Estadísticas", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/dashboard?tab=settings", label: "Configuración", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function Sidebar({ streak }: { streak?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-outline-variant/20 bg-white/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-outline-variant/20 px-4">
          {!collapsed && (
            <Link href="/" className="text-heading-md text-primary">
              Nexum
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? (
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sections.map((section) => {
            const isActive = section.href === "/dashboard"
              ? pathname === "/dashboard" && currentTab === "dashboard"
              : pathname + "?" + searchParams.toString() === section.href;
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-label-sm transition-all ${
                  isActive
                    ? "bg-primary-container/20 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
                title={collapsed ? section.label : undefined}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                  {section.icon.split(" ").map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
                {!collapsed && <span>{section.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant/20 p-3">
          {!collapsed && streak !== undefined && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-primary-fixed-dim/20 px-3 py-2 text-label-sm text-primary"
            >
              <span className="text-sm">🔥</span>
              <span>{streak} días seguidas</span>
            </Link>
          )}
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"}`}
      />
    </>
  );
}
