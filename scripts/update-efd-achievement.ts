import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Обновляем достижение Escape from Donbass...');

  const updated = await prisma.achievement.update({
    where: { key: 'escape_from_donbass' },
    data: {
      title: 'Escape from Donbass',
      description: 'Доехать до конца!',
      icon: '🏁',
    },
  });

  console.log('✅ Достижение обновлено:');
  console.log(`   Название: ${updated.title}`);
  console.log(`   Описание: ${updated.description}`);
  console.log(`   Иконка: ${updated.icon}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

