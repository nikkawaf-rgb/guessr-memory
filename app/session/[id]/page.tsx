import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import Image from "next/image";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { sessionPhotos: { include: { photo: true }, orderBy: { orderIndex: "asc" } } },
  });
  if (!session) return <div className="p-6">Сессия не найдена</div>;
  const current = session.sessionPhotos[0];
  if (!current) return <div className="p-6">Нет фотографий в сессии</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm opacity-70 mb-2">Фото 1 из {session.photoCount}</div>
      <div className="relative w-full h-auto">
        <Image
          src={photoPublicUrl(current.photo.storagePath)}
          alt="photo"
          width={1200}
          height={800}
          className="w-full h-auto rounded object-contain"
        />
      </div>
      <div className="mt-4 text-sm opacity-70">Дальше добавим: тегирование людей, город, дата, комментарий.</div>
    </div>
  );
}


