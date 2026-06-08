"use client";

import { useRef, useState } from "react";

const actions = [
  { key: "upload", label: "Subir archivo", icon: "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" },
  { key: "folder", label: "Crear carpeta", icon: "M9 13h6m-3-3v6m-5 4h10a2 2 0 002-2V8a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "course", label: "Crear curso", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { key: "formula", label: "Añadir fórmula", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
];

export default function DashboardFab() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = (key: string) => {
    setOpen(false);
    if (key === "upload") {
      dialogRef.current?.showModal();
    } else {
      alert(`"${actions.find(a => a.key === key)?.label}" próximamente`);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al subir");
      } else {
        dialogRef.current?.close();
        formRef.current?.reset();
        window.location.reload();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        {open && (
          <div className="absolute bottom-16 right-0 mb-2 w-56 origin-bottom-right animate-fade-in rounded-2xl border border-white/20 bg-white/90 p-2 shadow-xl backdrop-blur-xl">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-label-sm text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                  {action.icon.split(" ").map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
                {action.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Acciones"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-0 shadow-2xl backdrop:bg-black/40"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-md text-primary">Subir archivo</h2>
            <button
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-outline-variant p-8 transition-colors hover:border-primary-container">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-label-md text-on-surface-variant">Click para seleccionar archivo</span>
              <input
                type="file"
                name="file"
                required
                className="hidden"
                onChange={(e) => {
                  const label = e.target.closest("label");
                  if (label && e.target.files?.[0]) {
                    label.querySelector("span")!.textContent = e.target.files[0].name;
                  }
                }}
              />
            </label>

            <input
              type="text"
              name="title"
              placeholder="Título del material"
              required
              className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
            />

            <select
              name="type"
              required
              className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
            >
              <option value="">Seleccionar tipo</option>
              <option value="exam">Examen</option>
              <option value="practice">Práctica</option>
              <option value="summary">Resumen</option>
              <option value="formula">Fórmula</option>
            </select>

            {error && (
              <p className="rounded-lg bg-error-container px-3 py-2 text-label-md text-on-error-container">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-3 text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Subir archivo"}
            </button>
          </form>
        </div>
      </dialog>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
