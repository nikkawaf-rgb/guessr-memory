"use client";
import React from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";

export type ShapeDraft =
  | { type: "rect"; data: { x: number; y: number; width: number; height: number } }
  | { type: "circle"; data: { x: number; y: number; radius: number } };

export function ZonesKonvaEditor({
  width = 600,
  height = 400,
  onChange,
}: {
  width?: number;
  height?: number;
  onChange: (draft: ShapeDraft | null) => void;
}) {
  const [mode, setMode] = React.useState<"rect" | "circle">("rect");
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = React.useState<ShapeDraft | null>(null);

  function getPointer(e: KonvaEventObject<MouseEvent>): { x: number; y: number } | null {
    const node = e.target as unknown as { getStage?: () => KonvaStage };
    const stage = node.getStage ? node.getStage() : undefined;
    const pos = stage?.getPointerPosition();
    return pos ? { x: pos.x, y: pos.y } : null;
  }

  function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
    const pos = getPointer(e);
    if (!pos) return;
    setDragStart({ x: pos.x, y: pos.y });
  }
  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    if (!dragStart) return;
    const pos = getPointer(e);
    if (!pos) return;
    if (mode === "rect") {
      const x = Math.min(dragStart.x, pos.x);
      const y = Math.min(dragStart.y, pos.y);
      const w = Math.abs(pos.x - dragStart.x);
      const h = Math.abs(pos.y - dragStart.y);
      const next: ShapeDraft = { type: "rect", data: { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) } };
      setDraft(next);
      onChange(next);
    } else {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const r = Math.round(Math.sqrt(dx * dx + dy * dy));
      const next: ShapeDraft = { type: "circle", data: { x: Math.round(dragStart.x), y: Math.round(dragStart.y), radius: r } };
      setDraft(next);
      onChange(next);
    }
  }
  function handleMouseUp() {
    setDragStart(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="opacity-70">Режим:</span>
        <label className="flex items-center gap-1">
          <input type="radio" name="mode" checked={mode === "rect"} onChange={() => setMode("rect")} />
          Прямоугольник
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="mode" checked={mode === "circle"} onChange={() => setMode("circle")} />
          Круг
        </label>
      </div>
      <div className="border rounded overflow-hidden bg-white">
        <Stage width={width} height={height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <Layer>
            {draft?.type === "rect" ? (
              <Rect x={draft.data.x} y={draft.data.y} width={draft.data.width} height={draft.data.height} stroke="#ef4444" strokeWidth={2} opacity={0.9} />
            ) : null}
            {draft?.type === "circle" ? (
              <Circle x={draft.data.x} y={draft.data.y} radius={draft.data.radius} stroke="#22c55e" strokeWidth={2} opacity={0.9} />
            ) : null}
          </Layer>
        </Stage>
      </div>
      <div className="text-xs opacity-70">
        {draft ? (
          <>
            Тип: <strong>{draft.type}</strong> · JSON: <code className="break-all">{JSON.stringify(draft.data)}</code>
          </>
        ) : (
          <span>Нарисуйте область, чтобы сформировать данные формы</span>
        )}
      </div>
    </div>
  );
}


