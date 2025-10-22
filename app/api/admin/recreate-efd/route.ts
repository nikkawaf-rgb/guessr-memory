import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    console.log('🔧 Пересоздание достижения Escape from Donbass...');
    
    // Удаляем старое достижение
    console.log('1. Удаление старого достижения...');
    await prisma.achievement.delete({
      where: { key: 'escape_from_donbass' },
    });
    console.log('   ✅ Старое достижение удалено');

    // Создаём новое достижение
    console.log('2. Создание нового достижения...');
    const newAchievement = await prisma.achievement.create({
      data: {
        key: 'escape_from_donbass',
        title: 'Escape from Donbass',
        description: 'Доехать до конца!',
        icon: '🏁',
        category: 'EFD',
        isHidden: true,
        rarity: 'legendary',
      },
    });

    console.log('   ✅ Новое достижение создано:', newAchievement);

    return NextResponse.json({ 
      success: true,
      message: 'Достижение успешно пересоздано',
      achievement: {
        key: newAchievement.key,
        title: newAchievement.title,
        description: newAchievement.description,
        icon: newAchievement.icon,
        category: newAchievement.category,
        rarity: newAchievement.rarity,
        isHidden: newAchievement.isHidden,
      }
    });
  } catch (error) {
    console.error('❌ Ошибка пересоздания достижения:', error);
    return NextResponse.json(
      { error: 'Failed to recreate achievement', details: String(error) },
      { status: 500 }
    );
  }
}

