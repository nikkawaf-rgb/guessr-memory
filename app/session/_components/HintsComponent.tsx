"use client";
import { useState } from "react";

interface HintsComponentProps {
  photoId: string;
  mode: "ranked" | "fun";
  onHintUsed: (hintType: string, hintText: string) => void;
}

export default function HintsComponent({ photoId, mode, onHintUsed }: HintsComponentProps) {
  const [usedHints, setUsedHints] = useState<string[]>([]);
  const [hints, setHints] = useState<Record<string, string>>({});

  // Fun mode only
  if (mode !== "fun") {
    return null;
  }

  const maxHints = 3;
  const hintTypes = [
    { id: "location", label: "Местоположение", icon: "📍" },
    { id: "date", label: "Дата", icon: "📅" },
    { id: "people", label: "Люди", icon: "👥" },
  ];

  const handleHintClick = async (hintType: string) => {
    if (usedHints.includes(hintType) || usedHints.length >= maxHints) {
      return;
    }

    try {
      const response = await fetch(`/api/hints?photoId=${photoId}&type=${hintType}`);
      if (response.ok) {
        const data = await response.json();
        setHints(prev => ({ ...prev, [hintType]: data.hint }));
        setUsedHints(prev => [...prev, hintType]);
        onHintUsed(hintType, data.hint);
      }
    } catch (error) {
      console.error("Failed to get hint:", error);
    }
  };

  const remainingHints = maxHints - usedHints.length;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-800">Подсказки</h3>
        <div className="text-sm text-blue-600">
          Осталось: {remainingHints} из {maxHints}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {hintTypes.map((hint) => (
          <button
            key={hint.id}
            onClick={() => handleHintClick(hint.id)}
            disabled={usedHints.includes(hint.id) || remainingHints === 0}
            className={`
              flex items-center gap-2 p-3 rounded-lg border transition-colors
              ${usedHints.includes(hint.id)
                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                : remainingHints === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              }
            `}
          >
            <span className="text-lg">{hint.icon}</span>
            <span className="font-medium">{hint.label}</span>
            {usedHints.includes(hint.id) && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Display used hints */}
      {Object.keys(hints).length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-blue-800">Использованные подсказки:</h4>
          {Object.entries(hints).map(([type, hint]) => (
            <div key={type} className="bg-white border border-blue-200 rounded p-2">
              <div className="text-sm font-medium text-blue-700">
                {hintTypes.find(h => h.id === type)?.label}:
              </div>
              <div className="text-sm text-gray-700">{hint}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-600">
        💡 Каждая подсказка снижает итоговый счет на 200 очков
      </div>
    </div>
  );
}
