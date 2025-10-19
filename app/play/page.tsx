"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  mode: "ranked" | "fun";
  photoCount: number;
  currentPhotoIndex: number;
  createdAt: string;
}

export default function PlayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get or create user ID from localStorage
    let storedUserId = localStorage.getItem("memoryKeeperUserId");
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("memoryKeeperUserId", storedUserId);
    }
    setUserId(storedUserId);
    
    // Load active sessions
    loadActiveSessions(storedUserId);
  }, []);

  async function loadActiveSessions(userId: string) {
    try {
      const res = await fetch(`/api/session/active?userId=${userId}`);
      if (res.ok) {
        const { sessions } = await res.json();
        setActiveSessions(sessions);
      }
    } catch (e) {
      console.error("Failed to load active sessions:", e);
    }
  }

  async function start(mode: "ranked" | "fun") {
    try {
      setLoading(true);
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userId }),
      });
      if (!res.ok) throw new Error("Failed to start session");
      const { id } = await res.json();
      router.push(`/session/${id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  async function resumeSession(sessionId: string) {
    router.push(`/session/${sessionId}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Играть</h1>
      
      {activeSessions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Активные сессии</h2>
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {session.mode === "ranked" ? "Рейтинговый" : "Фан"} режим
                  </div>
                  <div className="text-sm opacity-70">
                    Фото {session.currentPhotoIndex + 1} из {session.photoCount}
                  </div>
                  <div className="text-xs opacity-50">
                    Начато: {new Date(session.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => resumeSession(session.id)}
                  className="bg-blue-600 text-white rounded px-3 py-1 text-sm"
                >
                  Продолжить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <button disabled={loading} onClick={() => start("ranked")} className="bg-black text-white rounded px-4 py-2">
          Новая игра — Рейтинговый
        </button>
        <button disabled={loading} onClick={() => start("fun")} className="bg-white/10 rounded px-4 py-2">
          Новая игра — Фан
        </button>
      </div>
    </div>
  );
}


