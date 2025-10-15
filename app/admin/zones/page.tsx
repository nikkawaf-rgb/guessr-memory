import { prisma } from "@/app/lib/prisma";
import Image from "next/image";
import { photoPublicUrl } from "@/app/lib/publicUrl";

export const revalidate = 0;

export default async function AdminZonesIndexPage() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Tagging zones (admin)</h1>
      <p className="text-sm mb-4">Choose a photo to define people zones.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <a key={p.id} href={`/admin/zones/${p.id}`} className="block group">
            <div className="relative w-full h-40">
              <Image
                src={photoPublicUrl(p.storagePath)}
                alt="photo"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 200px"
                className="object-cover rounded border border-white/10 group-hover:opacity-90"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


