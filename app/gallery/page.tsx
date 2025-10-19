import { prisma } from "@/app/lib/prisma";
import { PhotoThumbnail } from "@/app/components/OptimizedPhoto";

export const revalidate = 60;

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    where: { isActive: true },
    include: { comments: { select: { id: true }, where: { isHidden: false } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Галерея воспоминаний</h1>
      <p className="text-sm mb-4">Без спойлеров: показываем только превью и комментарии (позже).</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos
          .sort((a: { comments: { id: string }[] }, b: { comments: { id: string }[] }) => b.comments.length - a.comments.length)
          .map((p: { id: string; storagePath: string; comments: { id: string }[] }) => (
            <a key={p.id} href={`/photo/${p.id}`} className="block group">
              <PhotoThumbnail
                src={p.storagePath}
                alt="photo"
                className="group-hover:opacity-90"
              />
              <div className="text-xs mt-1 opacity-70">💬 {p.comments.length}</div>
            </a>
          ))}
      </div>
    </div>
  );
}


