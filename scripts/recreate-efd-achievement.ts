import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Пересоздание достижения Escape from Donbass...');
  
  try {
    // Удаляем старое достижение (это автоматически удалит связанные UserAchievement записи благодаря onDelete: Cascade)
    console.log('1. Удаление старого достижения...');
    await prisma.achievement.delete({
      where: { key: 'escape_from_donbass' },
    });
    console.log('   ✅ Старое достижение удалено');

    // Создаём новое достижение с правильными данными
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

    console.log('   ✅ Новое достижение создано:');
    console.log(`      Ключ: ${newAchievement.key}`);
    console.log(`      Название: ${newAchievement.title}`);
    console.log(`      Описание: ${newAchievement.description}`);
    console.log(`      Иконка: ${newAchievement.icon}`);
    console.log(`      Категория: ${newAchievement.category}`);
    console.log(`      Редкость: ${newAchievement.rarity}`);
    console.log(`      Скрытое: ${newAchievement.isHidden}`);
    
    console.log('\n🎉 Достижение успешно пересоздано!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

