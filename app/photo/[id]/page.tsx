import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import { PhotoDetail } from "@/app/components/OptimizedPhoto";
import { revalidatePath } from "next/cache";
import { likeComment, reportComment } from "@/app/photo/actions";

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return <div className="p-6">Фото не найдено</div>;
  const comments = await prisma.comment.findMany({
    where: { photoId: photo.id, isHidden: false },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { likes: true, reports: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="relative w-full h-auto">
        <PhotoDetail
          src={photo.storagePath}
          alt="photo"
        />
      </div>
      <p className="text-sm mb-2">⚠️ Не раскрывайте ответы в комментариях! Не портите игру другим!</p>
      <CommentForm photoId={photo.id} />
      <div className="mt-4 space-y-3">
        {comments.map((c: { id: string; content: string; _count: { likes: number; reports: number } }) => (
          <CommentItem key={c.id} id={c.id} content={c.content} photoId={photo.id} likesCount={c._count.likes} />
        ))}
      </div>
    </div>
  );
}

async function addCommentAction(photoId: string, formData: FormData) {
  "use server";
  const content = String(formData.get("content") || "").trim();
  const authorName = String(formData.get("name") || "Гость").slice(0, 50);
  if (!content || content.length > 200) return;
  const user = await prisma.user.create({ data: { name: authorName } });
  await prisma.comment.create({ data: { photoId, userId: user.id, content } });
  revalidatePath(`/photo/${photoId}`);
}

function CommentForm({ photoId }: { photoId: string }) {
  return (
    <form action={addCommentAction.bind(null, photoId)} className="flex flex-col gap-2">
      <input name="name" placeholder="Ваше имя (необязательно)" className="border rounded px-3 py-2" />
      <textarea name="content" placeholder="Комментарий до 200 символов" maxLength={200} className="border rounded px-3 py-2" />
      <button className="bg-black text-white rounded px-4 py-2 w-fit">Отправить</button>
    </form>
  );
}

function CommentItem({ id, content, photoId, likesCount }: { id: string; content: string; photoId: string; likesCount: number }) {
  return (
    <div className="border rounded p-3">
      <div className="whitespace-pre-wrap text-sm">{content}</div>
      <div className="flex gap-2 mt-2">
        <form action={likeComment.bind(null, id, photoId)}>
          <button className="text-xs bg-white/10 rounded px-2 py-1" type="submit">👍 Лайк ({likesCount})</button>
        </form>
        <form action={reportComment.bind(null, id, photoId)}>
          <button className="text-xs bg-white/10 rounded px-2 py-1" type="submit">🚩 Пожаловаться</button>
        </form>
      </div>
    </div>
  );
}


