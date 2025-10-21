// Полная очистка всех данных перед миграцией
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 ПОЛНАЯ очистка базы данных...\n');
  
  try {
    // Удаляем все данные из всех таблиц
    const tables = [
      'CommentLike',
      'Report',
      'Comment',
      'UserAchievement',
      'Achievement',
      'PhotoPeopleZone',
      'Person',
      'Location',
      'Guess',
      'SessionPhoto',
      'Session',
      'Photo',
      'User'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        console.log(`✓ ${table}: удалено ${count} записей`);
      } catch (e) {
        console.log(`  ${table}: таблица не существует или уже очищена`);
      }
    }
    
    console.log('\n✅ База данных полностью очищена!');
    console.log('Теперь можно применить миграцию: npx prisma db push --accept-data-loss');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();

