"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start(mode: "ranked" | "fun") {
    try {
      setLoading(true);
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error("Failed to start session");
      const { id } = await res.json();
      router.push(`/session/${id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Играть</h1>
      <div className="flex gap-3">
        <button disabled={loading} onClick={() => start("ranked")} className="bg-black text-white rounded px-4 py-2">Старт — Рейтинговый</button>
        <button disabled={loading} onClick={() => start("fun")} className="bg-white/10 rounded px-4 py-2">Старт — Фан</button>
      </div>
    </div>
  );
}


