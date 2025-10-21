// Очистка старых данных перед миграцией
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Очистка базы данных...\n');
  
  try {
    // Удаляем в правильном порядке (из-за foreign keys)
    console.log('Удаление Guess...');
    const guesses = await prisma.guess.deleteMany({});
    console.log(`✓ Удалено ${guesses.count} записей Guess`);
    
    console.log('Удаление SessionPhoto...');
    const sessionPhotos = await prisma.sessionPhoto.deleteMany({});
    console.log(`✓ Удалено ${sessionPhotos.count} записей SessionPhoto`);
    
    console.log('Удаление Session...');
    const sessions = await prisma.session.deleteMany({});
    console.log(`✓ Удалено ${sessions.count} записей Session`);
    
    console.log('\n✅ База данных очищена!');
    console.log('Теперь можно применить миграцию: npx prisma db push --accept-data-loss');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();

