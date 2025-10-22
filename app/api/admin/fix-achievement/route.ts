import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    const updated = await prisma.achievement.update({
      where: { key: 'escape_from_donbass' },
      data: {
        title: 'Escape from Donbass',
        description: 'Доехать до конца!',
        icon: '🏁',
      },
    });

    return NextResponse.json({ 
      success: true, 
      achievement: updated 
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

