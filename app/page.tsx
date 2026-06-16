"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [id, setId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-center text-purple-700">
          Certificate Verifier
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Enter your certificate ID to verify.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Certificate ID (e.g. LIVE-2)"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-purple-700 px-4 py-3 font-semibold text-white hover:bg-purple-800"
          >
            Verify
          </button>
        </form>
      </div>
    </main>
  );
}
