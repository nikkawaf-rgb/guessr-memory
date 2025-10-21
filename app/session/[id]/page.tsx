import { prisma } from "@/app/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SessionGameClient from "./_components/SessionGameClient";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      user: true,
      sessionPhotos: {
        include: {
          photo: true,
          guess: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  // Если сессия завершена, перенаправляем на результаты
  if (session.finishedAt) {
    redirect(`/session/${id}/results`);
  }

  // Получаем текущее фото
  const currentSessionPhoto = session.sessionPhotos[session.currentPhotoIndex];

  if (!currentSessionPhoto) {
    // Если больше нет фото, завершаем сессию
    await prisma.session.update({
      where: { id },
      data: { finishedAt: new Date() },
    });
    redirect(`/session/${id}/results`);
  }

  return (
    <SessionGameClient
      session={{
        id: session.id,
        currentPhotoIndex: session.currentPhotoIndex,
        photoCount: session.photoCount,
        totalScore: session.totalScore,
      }}
      currentPhoto={{
        id: currentSessionPhoto.photo.id,
        storagePath: currentSessionPhoto.photo.storagePath,
        width: currentSessionPhoto.photo.width,
        height: currentSessionPhoto.photo.height,
      }}
      sessionPhotoId={currentSessionPhoto.id}
      hasGuess={!!currentSessionPhoto.guess}
    />
  );
}
