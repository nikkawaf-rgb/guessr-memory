"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/app/lib/publicUrl";

interface Photo {
  id: string;
  storagePath: string;
  originalName: string | null;
  fileSize: number | null;
  mimeType: string | null;
}

export default function DebugPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/debug/photos');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Debug: Photos in Database</h1>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Debug: Photos in Database</h1>
      <p className="mb-4">Total photos: {photos.length}</p>
      
      <div className="space-y-4">
        {photos.map((photo) => (
          <div key={photo.id} className="border rounded p-4">
            <h3 className="font-medium">Photo ID: {photo.id}</h3>
            <p>Storage Path: {photo.storagePath}</p>
            <p>Original Name: {photo.originalName || "None"}</p>
            <p>File Size: {photo.fileSize || "None"}</p>
            <p>MIME Type: {photo.mimeType || "None"}</p>
            <p>Public URL: {photoPublicUrl(photo.storagePath)}</p>
            <div className="mt-2">
              <Image 
                src={photoPublicUrl(photo.storagePath)} 
                alt="photo" 
                width={128}
                height={128}
                className="object-cover border"
                onError={(e) => {
                  e.currentTarget.style.border = "2px solid red";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
