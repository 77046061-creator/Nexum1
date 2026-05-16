"use client";

import { useRef, useState } from "react";

export default function UploadButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl md:bottom-8 md:right-8"
        aria-label="Subir archivo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>

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
    </>
  );
}
