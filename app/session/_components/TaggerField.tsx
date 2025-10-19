"use client";
import React from "react";
import Image from "next/image";
import type { GuessedPersonCoord } from "@/app/lib/geometry";

export function TaggerField({ 
  peopleOptions, 
  imageSrc 
}: { 
  peopleOptions: string[];
  imageSrc: string;
}) {
  const [names, setNames] = React.useState<string[]>([]);
  const [coords, setCoords] = React.useState<GuessedPersonCoord[]>([]);
  const [startAt] = React.useState<number>(() => Date.now());
  
  React.useEffect(() => {
    const el = document.querySelector("input[name=guessedPeopleNames]") as HTMLInputElement | null;
    if (el) el.value = JSON.stringify(names);
  }, [names]);
  
  React.useEffect(() => {
    const el = document.querySelector("input[name=guessedPeopleCoords]") as HTMLInputElement | null;
    if (el) el.value = JSON.stringify(coords);
  }, [coords]);
  
  React.useEffect(() => {
    const el = document.querySelector("input[name=timeSpentSec]") as HTMLInputElement | null;
    if (!el) return;
    const id = setInterval(() => {
      const sec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
      el.value = String(sec);
    }, 1000);
    return () => clearInterval(id);
  }, [startAt]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
    
    // Add new tag with coordinates
    const newName = peopleOptions[0] || "";
    setNames(prev => [...prev, newName]);
    setCoords(prev => [...prev, { x: Math.round(x), y: Math.round(y), personName: newName }]);
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="guessedPeopleNames" defaultValue="[]" />
      <input type="hidden" name="guessedPeopleCoords" defaultValue="[]" />
      <input type="hidden" name="timeSpentSec" defaultValue="0" />
      
      {/* Clickable image for tagging */}
      <div className="relative">
        <Image
          src={imageSrc}
          alt="tagging-target"
          width={800}
          height={600}
          className="w-full h-auto rounded cursor-crosshair"
          onClick={handleImageClick}
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
        
        {/* Render existing tags */}
        {coords.map((coord, i) => {
          const img = document.querySelector('img[alt="tagging-target"]') as HTMLImageElement;
          if (!img) return null;
          
          const rect = img.getBoundingClientRect();
          const x = (coord.x / (img.naturalWidth || 800)) * rect.width;
          const y = (coord.y / (img.naturalHeight || 600)) * rect.height;
          
          return (
            <div
              key={i}
              className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {coord.personName}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs opacity-70">
        Нажмите на изображение, чтобы добавить метку. Выберите имя ниже.
      </div>
      
      {names.length ? (
        <div className="space-y-2">
          {names.map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="opacity-60">Метка {i + 1}:</div>
              <select
                className="border rounded px-2 py-1"
                value={n}
                onChange={(e) => {
                  const newName = e.target.value;
                  setNames((prev) => prev.map((pp, idx) => (idx === i ? newName : pp)));
                  setCoords((prev) => prev.map((coord, idx) => 
                    idx === i ? { ...coord, personName: newName } : coord
                  ));
                }}
              >
                {peopleOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button 
                type="button" 
                className="text-red-600" 
                onClick={() => {
                  setNames((prev) => prev.filter((_, idx) => idx !== i));
                  setCoords((prev) => prev.filter((_, idx) => idx !== i));
                }}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}


