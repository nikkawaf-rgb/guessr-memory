import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    console.log('🔧 Обновление достижения Escape from Donbass...');
    
    const achievement = await prisma.achievement.update({
      where: { key: 'escape_from_donbass' },
      data: {
        title: 'Escape from Donbass',
        description: 'Доехать до конца!',
        icon: '🏁',
      },
    });

    console.log('✅ Достижение обновлено:', achievement);

    return NextResponse.json({ 
      success: true, 
      achievement: {
        key: achievement.key,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
      }
    });
  } catch (error) {
    console.error('❌ Ошибка обновления достижения:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement', details: String(error) },
      { status: 500 }
    );
  }
}

