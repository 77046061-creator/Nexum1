"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ itemId }: { itemId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;
    setDeleting(true);

    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-error-container px-6 py-3 text-body-md font-medium text-error transition-colors hover:bg-error-container/10 disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
      {deleting ? "Eliminando..." : "Eliminar archivo"}
    </button>
  );
}
