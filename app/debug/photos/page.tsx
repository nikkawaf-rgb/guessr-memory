import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";

export default async function DebugPhotosPage() {
  const photos = await prisma.photo.findMany({
    where: { isActive: true },
    take: 10,
  });

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
              <img 
                src={photoPublicUrl(photo.storagePath)} 
                alt="photo" 
                className="w-32 h-32 object-cover border"
                onError={(e) => {
                  e.currentTarget.style.border = "2px solid red";
                  e.currentTarget.alt = "ERROR LOADING IMAGE";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
