"use client";
import { useState, useEffect, useCallback } from "react";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  bestScore: number;
  totalSessions: number;
  avgScore: number;
  lastPlayed: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  period: string;
  mode: string;
  totalPlayers: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [mode, setMode] = useState("ranked");

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?period=${period}&mode=${mode}`);
      if (res.ok) {
        const leaderboardData = await res.json();
        setData(leaderboardData);
      }
    } catch (e) {
      console.error("Failed to load leaderboard:", e);
    } finally {
      setLoading(false);
    }
  }, [period, mode]);

  useEffect(() => {
    loadLeaderboard();
  }, [period, mode, loadLeaderboard]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatScore = (score: number) => {
    return score.toLocaleString("ru-RU");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Лидерборд</h1>
      
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Период:</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="all">Все время</option>
            <option value="daily">За день</option>
            <option value="weekly">За неделю</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Режим:</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="ranked">Рейтинговый</option>
            <option value="fun">Фан</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : data ? (
        <div>
          <div className="text-sm opacity-70 mb-4">
            Всего игроков: {data.totalPlayers} • Режим: {mode === "ranked" ? "Рейтинговый" : "Фан"} • 
            Период: {period === "all" ? "Все время" : period === "daily" ? "За день" : "За неделю"}
          </div>
          
          <div className="space-y-2">
            {data.leaderboard.map((entry, index) => (
              <div key={entry.userId} className="border rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-sm opacity-70">
                      Лучший результат: {formatScore(entry.bestScore)} • 
                      Игр: {entry.totalSessions} • 
                      Средний: {formatScore(Math.round(entry.avgScore))}
                    </div>
                  </div>
                </div>
                <div className="text-sm opacity-50">
                  Последняя игра: {formatDate(entry.lastPlayed)}
                </div>
              </div>
            ))}
          </div>
          
          {data.leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Нет данных для отображения
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-red-500">
          Ошибка загрузки лидерборда
        </div>
      )}
    </div>
  );
}


