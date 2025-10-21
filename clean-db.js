// Очистка старых данных перед миграцией
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Очистка базы данных перед миграцией...\n');
  
  try {
    // Удаляем в правильном порядке (из-за foreign keys)
    
    console.log('Удаление CommentLike...');
    try {
      const commentLikes = await prisma.commentLike.deleteMany({});
      console.log(`✓ Удалено ${commentLikes.count} записей CommentLike`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление Report...');
    try {
      const reports = await prisma.report.deleteMany({});
      console.log(`✓ Удалено ${reports.count} записей Report`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление Comment...');
    try {
      const comments = await prisma.comment.deleteMany({});
      console.log(`✓ Удалено ${comments.count} записей Comment`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление UserAchievement...');
    try {
      const userAchievements = await prisma.userAchievement.deleteMany({});
      console.log(`✓ Удалено ${userAchievements.count} записей UserAchievement`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление Achievement...');
    try {
      const achievements = await prisma.achievement.deleteMany({});
      console.log(`✓ Удалено ${achievements.count} записей Achievement`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление PhotoPeopleZone...');
    try {
      const zones = await prisma.photoPeopleZone.deleteMany({});
      console.log(`✓ Удалено ${zones.count} записей PhotoPeopleZone`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление Person...');
    try {
      const persons = await prisma.person.deleteMany({});
      console.log(`✓ Удалено ${persons.count} записей Person`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
    console.log('Удаление Location...');
    try {
      const locations = await prisma.location.deleteMany({});
      console.log(`✓ Удалено ${locations.count} записей Location`);
    } catch (e) {
      console.log('  (таблица не существует или уже очищена)');
    }
    
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
