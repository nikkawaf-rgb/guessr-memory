import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { PhotoThumbnail } from "@/app/components/OptimizedPhoto";
import DeletePhotoButton from "./_components/DeletePhotoButton";

export default async function ManagePhotosPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/api/auth/signin");
  }

  const photos = await prisma.photo.findMany({
    where: { isActive: true },
    include: { 
      comments: { select: { id: true }, where: { isHidden: false } },
      _count: {
        select: {
          comments: true,
          sessionPhotos: true,
          zones: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Управление фотографиями</h1>
      <p className="text-sm mb-4">Всего активных фотографий: {photos.length}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="border rounded p-3 bg-white/5">
            <PhotoThumbnail
              src={photo.storagePath}
              alt="photo"
              className="mb-2"
            />
            <div className="text-xs space-y-1">
              <div>💬 {photo._count.comments}</div>
              <div>🎮 {photo._count.sessionPhotos}</div>
              <div>👥 {photo._count.zones}</div>
              <div className="text-gray-400">
                {photo.originalName || "Без имени"}
              </div>
            </div>
            <div className="mt-2">
              <DeletePhotoButton photoId={photo.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
