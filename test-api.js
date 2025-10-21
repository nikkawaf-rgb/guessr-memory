// Простой тест API локально
const baseUrl = 'http://localhost:3000';

async function testPhotosList() {
  console.log('\n=== Тест: Получение списка фотографий ===');
  try {
    const response = await fetch(`${baseUrl}/api/admin/photos`);
    const data = await response.json();
    console.log('Статус:', response.status);
    console.log('Фотографий в базе:', data.photos?.length || 0);
    if (data.photos?.length > 0) {
      console.log('Первая фотография:', data.photos[0]);
    }
    return data.photos || [];
  } catch (error) {
    console.error('Ошибка:', error.message);
    return [];
  }
}

async function testDeletePhoto(photoId) {
  console.log('\n=== Тест: Удаление фотографии ===');
  console.log('ID фото:', photoId);
  try {
    const response = await fetch(`${baseUrl}/api/admin/photos/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId })
    });
    const data = await response.json();
    console.log('Статус:', response.status);
    console.log('Ответ:', data);
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

async function testStartSession(playerName) {
  console.log('\n=== Тест: Создание игровой сессии ===');
  console.log('Имя игрока:', playerName);
  try {
    const response = await fetch(`${baseUrl}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName })
    });
    const data = await response.json();
    console.log('Статус:', response.status);
    console.log('Ответ:', data);
    return data;
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Запуск тестов API...\n');
  
  // 1. Проверяем список фотографий
  const photos = await testPhotosList();
  
  // 2. Пытаемся создать сессию
  await testStartSession('Тестер');
  
  // 3. Если есть фото, пробуем удалить первое
  if (photos.length > 0) {
    console.log('\n⚠️ Есть фотографии для теста удаления');
    console.log('Удалять? Раскомментируйте строку ниже');
    // await testDeletePhoto(photos[0].id);
  }
  
  console.log('\n✅ Тесты завершены');
}

runTests();

