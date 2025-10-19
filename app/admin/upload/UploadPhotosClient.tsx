"use client";
import { useState } from "react";
import exifr from "exifr";
import { supabase } from "@/app/lib/supabase";

export default function UploadPhotosClient() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function handleUpload() {
    if (!files?.length) return;
    const newLog: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const uploadKey = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        // Direct upload to Supabase Storage to avoid Vercel body size limits
        const { error: upErr } = await supabase.storage.from("photos").upload(uploadKey, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
        if (upErr) throw upErr;
        const storedKey = uploadKey;
        let takenAt: Date | null = null;
        try {
          const exif = await exifr.parse(file, { tiff: true, exif: true });
          if (exif?.DateTimeOriginal) {
            takenAt = new Date(exif.DateTimeOriginal);
          }
        } catch {}
        // register in DB
        await fetch("/api/photos/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: storedKey ?? uploadKey, exifISO: takenAt ? takenAt.toISOString() : null }),
        });
        newLog.push(`OK: ${file.name} -> ${storedKey ?? uploadKey} ${takenAt ? `(EXIF ${takenAt.toISOString()})` : "(no EXIF)"}`);
        setLog([...newLog]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        newLog.push(`ERR: ${file.name} -> ${message}`);
        setLog([...newLog]);
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Загрузка фотографий</h1>
      <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
      <div className="h-3" />
      <button className="bg-black text-white rounded px-4 py-2" onClick={handleUpload}>Загрузить</button>
      <div className="mt-4 whitespace-pre-wrap text-sm">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
