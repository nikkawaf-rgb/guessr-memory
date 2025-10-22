import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Создаем администратора...');

  const admin = await prisma.user.create({
    data: {
      name: 'admin',
      password: 'admin123',
      role: 'admin',
    },
  });

  console.log(`✅ Администратор создан!`);
  console.log(`   Имя: ${admin.name}`);
  console.log(`   Пароль: ${admin.password}`);
  console.log(`   ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

