import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Миграция продакшн базы данных...');
  console.log('⚠️  ВНИМАНИЕ: Это удалит всех старых пользователей!');
  
  try {
    // Получаем всех пользователей без поля password
    const usersWithoutPassword = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    console.log(`Найдено пользователей без пароля: ${usersWithoutPassword.length}`);

    if (usersWithoutPassword.length > 0) {
      console.log('Удаляем старых пользователей...');
      
      // Удаляем всех пользователей (каскадно удалятся сессии и достижения)
      await prisma.user.deleteMany({});
      
      console.log('✅ Старые пользователи удалены');
    }

    // Создаем администратора
    console.log('Создаем нового администратора...');
    const admin = await prisma.user.create({
      data: {
        name: 'admin',
        password: 'admin123',
        role: 'admin',
      },
    });

    console.log('✅ Администратор создан:');
    console.log(`   Имя: ${admin.name}`);
    console.log(`   Пароль: ${admin.password}`);
    console.log(`   ID: ${admin.id}`);

    console.log('\n🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
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

