// Скрипт для удаления старых статичных скрытых достижений
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Удаляем старые статичные скрытые достижения...');

  // Удаляем старые hidden_1 ... hidden_8
  const oldHiddenKeys = [
    'hidden_1',
    'hidden_2',
    'hidden_3',
    'hidden_4',
    'hidden_5',
    'hidden_6',
    'hidden_7',
    'hidden_8',
  ];

  for (const key of oldHiddenKeys) {
    try {
      // Сначала удаляем связи с пользователями
      await prisma.userAchievement.deleteMany({
        where: {
          achievement: {
            key: key,
          },
        },
      });

      // Потом удаляем само достижение
      await prisma.achievement.delete({
        where: { key: key },
      });

      console.log(`✓ Удалено: ${key}`);
    } catch (error) {
      console.log(`⚠️  ${key} не найдено (уже удалено или не существовало)`);
    }
  }

  console.log('\n✅ Очистка завершена!');
  console.log('Теперь скрытые достижения создаются только при привязке к фото в админке.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

