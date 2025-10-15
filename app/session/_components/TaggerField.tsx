"use client";
import React from "react";

export function TaggerField({ peopleOptions }: { peopleOptions: string[] }) {
  const [names, setNames] = React.useState<string[]>([]);
  const [startAt] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const el = document.querySelector("input[name=guessedPeopleNames]") as HTMLInputElement | null;
    if (el) el.value = JSON.stringify(names);
  }, [names]);
  React.useEffect(() => {
    const el = document.querySelector("input[name=timeSpentSec]") as HTMLInputElement | null;
    if (!el) return;
    const id = setInterval(() => {
      const sec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
      el.value = String(sec);
    }, 1000);
    return () => clearInterval(id);
  }, [startAt]);
  return (
    <div className="space-y-2">
      <input type="hidden" name="guessedPeopleNames" defaultValue="[]" />
      <input type="hidden" name="timeSpentSec" defaultValue="0" />
      {/* Minimal tagger: clicks add entries; select to pick names */}
      <div
        className="border rounded h-48 bg-white text-black text-xs flex items-center justify-center select-none"
        onClick={() => setNames((prev) => [...prev, peopleOptions[0] || ""]) }
      >
        Нажмите, чтобы добавить метку. Выберите имя ниже.
      </div>
      {names.length ? (
        <div className="space-y-2">
          {names.map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="opacity-60">Метка {i + 1}:</div>
              <select
                className="border rounded px-2 py-1"
                value={n}
                onChange={(e) => setNames((prev) => prev.map((pp, idx) => (idx === i ? e.target.value : pp)))}
              >
                {peopleOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button type="button" className="text-red-600" onClick={() => setNames((prev) => prev.filter((_, idx) => idx !== i))}>Удалить</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}


