import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Обновление достижения Escape from Donbass...');
  
  try {
    const achievement = await prisma.achievement.update({
      where: { key: 'escape_from_donbass' },
      data: {
        title: 'Escape from Donbass',
        description: 'Доехать до конца!',
        icon: '🏁',
      },
    });

    console.log('✅ Достижение обновлено:');
    console.log(`   Ключ: ${achievement.key}`);
    console.log(`   Название: ${achievement.title}`);
    console.log(`   Описание: ${achievement.description}`);
    console.log(`   Иконка: ${achievement.icon}`);
    console.log(`   Редкость: ${achievement.rarity}`);
  } catch (error) {
    console.error('❌ Ошибка обновления:', error);
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

