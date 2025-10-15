"use client";
import React from "react";

export function ZoneCanvasHelper() {
  const [start, setStart] = React.useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null);
  return (
    <div>
      <div
        className="select-none border rounded bg-white text-black text-xs p-2"
        style={{ height: 220, position: "relative", cursor: "crosshair" }}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          const el = e.currentTarget as HTMLDivElement;
          const r = el.getBoundingClientRect();
          setStart({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!start) return;
          const el = e.currentTarget as HTMLDivElement;
          const r = el.getBoundingClientRect();
          const x = Math.min(start.x, e.clientX - r.left);
          const y = Math.min(start.y, e.clientY - r.top);
          const w = Math.abs((e.clientX - r.left) - start.x);
          const h = Math.abs((e.clientY - r.top) - start.y);
          setRect({ x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
        }}
        onMouseUp={() => setStart(null)}
      >
        {rect ? (
          <div
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              border: "2px solid red",
              background: "rgba(255,0,0,0.1)",
            }}
          />
        ) : null}
      </div>
      <div className="mt-2 text-xs">
        JSON: <code className="break-all">{rect ? JSON.stringify(rect) : "{ }"}</code>
      </div>
    </div>
  );
}


