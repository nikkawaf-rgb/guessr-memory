"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Vector = { x: number; y: number };

const WIDTH = 360;
const HEIGHT = 600;
const ROAD_WIDTH = 220;
const LANE_COUNT = 3;
const LANE_W = ROAD_WIDTH / LANE_COUNT; // ширина полосы
const MARGIN = (WIDTH - ROAD_WIDTH) / 2;

const TRUCK_W = 36;
const TRUCK_H = 60;

interface Obstacle {
  pos: Vector;
  w: number;
  h: number;
}

function getLaneX(lane: number) {
  return MARGIN + lane * LANE_W + (LANE_W - TRUCK_W) / 2;
}

async function award(type: "start" | "win") {
  try {
    const current = localStorage.getItem("currentUser");
    if (!current) return;
    const user = JSON.parse(current);
    await fetch("/api/efd/achievement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, type }),
    });
  } catch {
    // ignore errors
  }
}

export default function EFDGamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [distance, setDistance] = useState(0); // прогресс
  const [showStartAchievement, setShowStartAchievement] = useState(false);

  // управление
  const laneRef = useRef(1); // 0..2
  const speedRef = useRef(3); // px/frame
  const obstaclesRef = useRef<Obstacle[]>([]);
  const animRef = useRef<number | null>(null);
  const [awardedStart, setAwardedStart] = useState(false);

  useEffect(() => {
    if (!awardedStart) {
      award("start");
      setAwardedStart(true);
      setShowStartAchievement(true);
      // Скрываем уведомление через 5 секунд
      setTimeout(() => setShowStartAchievement(false), 5000);
    }
  }, [awardedStart]);

  const handleRestart = () => {
    setRunning(true);
    setWon(false);
    setDistance(0);
    laneRef.current = 1;
    speedRef.current = 3;
    obstaclesRef.current = [];
  };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let lastSpawn = 0;
    const targetDistance = 20000; // финальная дистанция

    function spawnObstacle() {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const w = TRUCK_W;
      const h = TRUCK_H * 0.8;
      obstaclesRef.current.push({ pos: { x: getLaneX(lane), y: -h }, w, h });
    }

    function drawRoad() {
      if (!ctx) return;
      // фон
      ctx.fillStyle = "#1f2937"; // серый
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // обочины
      ctx.fillStyle = "#374151";
      ctx.fillRect(0, 0, MARGIN, HEIGHT);
      ctx.fillRect(WIDTH - MARGIN, 0, MARGIN, HEIGHT);

      // разделительные линии
      ctx.strokeStyle = "#f9fafb";
      ctx.setLineDash([16, 12]);
      ctx.lineWidth = 3;
      for (let i = 1; i < LANE_COUNT; i++) {
        const x = MARGIN + i * LANE_W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawTruck(x: number, y: number, color: string) {
      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, TRUCK_W, TRUCK_H);
      // стекло
      ctx.fillStyle = "#93c5fd";
      ctx.fillRect(x + 6, y + 8, TRUCK_W - 12, 12);
    }

    function drawBomb(x: number, y: number, w: number, h: number) {
      if (!ctx) return;
      // рисуем бомбу emoji
      ctx.font = `${Math.floor(h)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💣", x + w / 2, y + h / 2);
    }

    function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
      return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    }

    function loop() {
      if (!running || !ctx) return;
      drawRoad();

      // игрок
      const playerX = getLaneX(laneRef.current);
      const playerY = HEIGHT - TRUCK_H - 24;
      drawTruck(playerX, playerY, "#ef4444");

      // препятствия
      const speed = speedRef.current;
      obstaclesRef.current.forEach((o) => {
        o.pos.y += speed;
        // рисуем бомбу
        drawBomb(o.pos.x, o.pos.y, o.w, o.h);
      });
      obstaclesRef.current = obstaclesRef.current.filter((o) => o.pos.y < HEIGHT + 40);

      // спавн (с увеличенным минимальным расстоянием)
      lastSpawn += speed;
      if (lastSpawn > 200) { // было 120, теперь 200 - больше расстояния
        lastSpawn = 0;
        spawnObstacle();
      }

      // коллизии
      const playerRect = { x: playerX, y: playerY, w: TRUCK_W, h: TRUCK_H };
      for (const o of obstaclesRef.current) {
        const oRect = { x: o.pos.x, y: o.pos.y, w: o.w, h: o.h };
        if (rectsOverlap(playerRect, oRect)) {
          setRunning(false);
          cancelAnimationFrame(animRef.current!);
          return;
        }
      }

      // прогресс и сложность
      setDistance((d) => {
        const nd = d + speed;
        if (nd > 400 && speedRef.current < 4) speedRef.current = 4;
        if (nd > 700 && speedRef.current < 5) speedRef.current = 5;
        if (nd > targetDistance) {
          setWon(true);
          setRunning(false);
          award("win");
          return targetDistance;
        }
        return nd;
      });

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") laneRef.current = Math.max(0, laneRef.current - 1);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") laneRef.current = Math.min(LANE_COUNT - 1, laneRef.current + 1);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [running]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-6 px-4">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">EFD — Escape From Donbass (prototype)</h1>
          <Link href="/" className="text-sm text-gray-300 hover:text-white">На главную</Link>
        </div>

        <div className="grid md:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block rounded" />
            {/* Мобильные кнопки управления */}
            <div className="flex gap-4 mt-4 md:hidden">
              <button
                onTouchStart={() => laneRef.current = Math.max(0, laneRef.current - 1)}
                onClick={() => laneRef.current = Math.max(0, laneRef.current - 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 rounded-lg text-2xl font-bold"
              >
                ← Влево
              </button>
              <button
                onTouchStart={() => laneRef.current = Math.min(LANE_COUNT - 1, laneRef.current + 1)}
                onClick={() => laneRef.current = Math.min(LANE_COUNT - 1, laneRef.current + 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 rounded-lg text-2xl font-bold"
              >
                Вправо →
              </button>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-sm leading-6">
            {showStartAchievement && (
              <div className="mb-4 bg-blue-900 border-2 border-blue-400 rounded p-3 animate-pulse">
                <div className="text-blue-300 font-bold text-center mb-1">🚚 Достижение получено!</div>
                <div className="text-blue-100 text-sm text-center">Я получил права</div>
                <div className="text-blue-200 text-xs text-center mt-1">Найти и сыграть в скрытую игру EFD</div>
              </div>
            )}
            <div className="mb-2 font-bold">Управление</div>
            <div className="hidden md:block">← → или A / D — перестраиваться между полосами</div>
            <div className="block md:hidden">Используйте кнопки ниже игры для управления</div>
            <div className="mt-4 mb-2 font-bold">Цель</div>
            <div>Доехать до конца без столкновений. Скорость постепенно растет.</div>
            <div className="mt-4">Дистанция: <span className="font-bold">{distance}</span></div>
            {!running && !won && (
              <div className="mt-4">
                <div className="text-red-300 font-bold mb-3">Столкновение!</div>
                <button
                  onClick={handleRestart}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition"
                >
                  🔄 Рестарт
                </button>
              </div>
            )}
            {won && (
              <div className="mt-4">
                <div className="text-green-300 font-bold text-lg mb-3">🎉 Вы победили!</div>
                <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border-2 border-yellow-400 rounded p-3 mb-3 animate-pulse">
                  <div className="text-yellow-300 font-bold text-center mb-1 text-lg">🏁 Легендарное достижение!</div>
                  <div className="text-yellow-100 font-bold text-center">Escape from Donbass</div>
                  <div className="text-yellow-200 text-xs text-center mt-1">Доехать до конца!</div>
                </div>
                <button
                  onClick={handleRestart}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition"
                >
                  🔄 Играть снова
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


