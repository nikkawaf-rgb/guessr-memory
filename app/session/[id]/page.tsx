import { prisma } from "@/app/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SessionGameClient from "./_components/SessionGameClient";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

// Функция для генерации вариантов ответа на спецвопрос
async function generateSpecialOptions(correctAnswer: string, photoId: string): Promise<string[]> {
  // Получаем другие правильные ответы из базы
  const otherCorrectAnswers = await prisma.photo.findMany({
    where: {
      specialAnswerCorrect: { not: null },
      id: { not: photoId },
    },
    select: {
      specialAnswerCorrect: true,
    },
    take: 10,
  });

  // Собираем пул неправильных ответов
  const wrongAnswers = otherCorrectAnswers
    .map((p) => p.specialAnswerCorrect!)
    .filter((a) => a !== correctAnswer);

  // Выбираем 4 случайных неправильных ответа
  const shuffled = wrongAnswers.sort(() => Math.random() - 0.5);
  const selectedWrong = shuffled.slice(0, 4);

  // Добавляем правильный ответ и перемешиваем
  const allOptions = [correctAnswer, ...selectedWrong].sort(() => Math.random() - 0.5);

  // Если не хватает вариантов, добавляем заглушки
  while (allOptions.length < 5) {
    allOptions.push(`Вариант ${allOptions.length + 1}`);
  }

  return allOptions.slice(0, 5);
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

  // Генерируем варианты ответа для спецвопроса (если showSpecial = true И есть вопрос)
  let specialOptions: string[] = [];
  const shouldShowSpecial = currentSessionPhoto.showSpecial && 
                           currentSessionPhoto.photo.specialQuestion && 
                           currentSessionPhoto.photo.specialAnswerCorrect;
  
  if (shouldShowSpecial) {
    specialOptions = await generateSpecialOptions(
      currentSessionPhoto.photo.specialAnswerCorrect!,
      currentSessionPhoto.photo.id
    );
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
        // Показываем спецвопрос только если showSpecial = true
        specialQuestion: shouldShowSpecial ? currentSessionPhoto.photo.specialQuestion : null,
        specialAnswerCorrect: shouldShowSpecial ? currentSessionPhoto.photo.specialAnswerCorrect : null,
      }}
      sessionPhotoId={currentSessionPhoto.id}
      hasGuess={!!currentSessionPhoto.guess}
      specialOptions={specialOptions}
    />
  );
}
