// Скрипт для заполнения базы данных достижениями
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // 🎖️ Скрытые достижения (8) - создаются автоматически при привязке к фото
  {
    key: 'hidden_1',
    title: '???',
    description: 'Секретное достижение',
    icon: '🎖️',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_2',
    title: '???',
    description: 'Секретное достижение',
    icon: '🏅',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_3',
    title: '???',
    description: 'Секретное достижение',
    icon: '🥇',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_4',
    title: '???',
    description: 'Секретное достижение',
    icon: '🥈',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_5',
    title: '???',
    description: 'Секретное достижение',
    icon: '🥉',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_6',
    title: '???',
    description: 'Секретное достижение',
    icon: '🎗️',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_7',
    title: '???',
    description: 'Секретное достижение',
    icon: '🏆',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },
  {
    key: 'hidden_8',
    title: '???',
    description: 'Секретное достижение',
    icon: '👑',
    category: 'скрытые',
    isHidden: true,
    rarity: 'legendary',
  },

  // 🌟 Космос и Астрономия (4)
  {
    key: 'yuri_gagarin',
    title: 'Юрий Гагарин',
    description: 'Угадать дату с точностью до дня (комбо) 12 апреля',
    icon: '🚀',
    category: 'космос',
    rarity: 'rare',
  },
  {
    key: 'milky_way',
    title: 'Млечный Путь',
    description: 'Сыграть 25 игр',
    icon: '🌌',
    category: 'космос',
    rarity: 'common',
  },
  {
    key: 'black_hole',
    title: 'Чёрная дыра',
    description: 'Ошибиться на 100+ лет хотя бы раз',
    icon: '🕳️',
    category: 'космос',
    rarity: 'common',
  },
  {
    key: 'moon_rover',
    title: 'Луноход',
    description: 'Сыграть хотя бы одну игру после полуночи (00:00-05:00)',
    icon: '🌙',
    category: 'космос',
    rarity: 'common',
  },

  // 🎌 Аниме (4)
  {
    key: 'naruto',
    title: 'Наруто',
    description: 'Угадать спецвопрос правильно 10 раз (суммарно)',
    icon: '🍜',
    category: 'аниме',
    rarity: 'common',
  },
  {
    key: 'sharingan',
    title: 'Шаринган',
    description: 'Получить комбо на 3 фотографиях подряд в одной игре',
    icon: '👁️',
    category: 'аниме',
    rarity: 'rare',
  },
  {
    key: 'rubber_rubber',
    title: 'Резина резиновая',
    description: 'Играть одну игру более 30 минут',
    icon: '🏴‍☠️',
    category: 'аниме',
    rarity: 'rare',
  },
  {
    key: 'legend_tochka_rosta',
    title: 'Легенда Точки Роста',
    description: 'Набрать 12,000 очков (10 комбо + 2 спецвопроса)',
    icon: '🍃',
    category: 'аниме',
    rarity: 'epic',
  },

  // 🎮 Игровые (6)
  {
    key: 'headshot',
    title: 'Хедшот',
    description: 'Угадать день правильно 20 раз (суммарно)',
    icon: '🎯',
    category: 'игровые',
    rarity: 'common',
  },
  {
    key: 'ace',
    title: 'Эйс',
    description: 'Набрать 10,000+ очков в 5 играх подряд',
    icon: '🏆',
    category: 'игровые',
    rarity: 'epic',
  },
  {
    key: 'flawless_victory',
    title: 'Флавлесс Виктори',
    description: 'Набрать 11,000+ очков в одной игре',
    icon: '👑',
    category: 'игровые',
    rarity: 'rare',
  },
  {
    key: 'ultracombo',
    title: 'Ультракомбо',
    description: 'Получить комбо на 5 фотографиях подряд в одной игре',
    icon: '💥',
    category: 'игровые',
    rarity: 'rare',
  },
  {
    key: 'fatality',
    title: 'Фаталити',
    description: 'Получить 1000 очков (комбо) на последнем (10-м) фото игры',
    icon: '💀',
    category: 'игровые',
    rarity: 'common',
  },
  {
    key: 'respawn',
    title: 'Респавн',
    description: 'Сыграть 10 игр за один день',
    icon: '🔄',
    category: 'игровые',
    rarity: 'rare',
  },

  // 🎯 Точность (4)
  {
    key: 'sniper',
    title: 'Снайпер',
    description: 'Получить комбо 10 раз (суммарно)',
    icon: '🎯',
    category: 'точность',
    rarity: 'common',
  },
  {
    key: 'calendar_memory',
    title: 'Календарь на память',
    description: 'Угадать месяц правильно 100 раз (суммарно)',
    icon: '📅',
    category: 'точность',
    rarity: 'rare',
  },
  {
    key: 'chronometer',
    title: 'Хронометр',
    description: 'Угадать год правильно 100 раз (суммарно)',
    icon: '⏱️',
    category: 'точность',
    rarity: 'rare',
  },
  {
    key: 'time_machine',
    title: 'Машина времени',
    description: 'Получить комбо на всех 10 фотографиях в одной игре',
    icon: '⏰',
    category: 'точность',
    rarity: 'epic',
  },

  // 🎨 3D и Моделирование (3)
  {
    key: 'polygonal_mesh',
    title: 'Полигональная сетка',
    description: 'Получить комбо на 3 фотографиях подряд с разными месяцами',
    icon: '🔷',
    category: '3d',
    rarity: 'rare',
  },
  {
    key: 'render_complete',
    title: 'Рендер завершён',
    description: 'Завершить 50 игр',
    icon: '💻',
    category: '3d',
    rarity: 'rare',
  },
  {
    key: 'subdivision_surface',
    title: 'Subdivision Surface',
    description: 'Улучшить свой рекорд 5 раз подряд',
    icon: '✨',
    category: '3d',
    rarity: 'rare',
  },

  // 📐 КОМПАС и Чертежи (2)
  {
    key: 'tolerance_001',
    title: 'Допуск 0.01',
    description: 'Ошибиться ровно на 1 год, 1 месяц, 1 день одновременно на одном фото',
    icon: '📏',
    category: 'компас',
    rarity: 'rare',
  },
  {
    key: '3d_projection',
    title: '3D-проекция',
    description: 'Получить комбо на 7 фотографиях в одной игре',
    icon: '📐',
    category: 'компас',
    rarity: 'rare',
  },

  // 🚀 Ракеты и Запуски (6)
  {
    key: 'orbital_speed',
    title: 'Орбитальная скорость',
    description: 'Набрать 8000+ очков в 3 играх подряд',
    icon: '🌍',
    category: 'ракеты',
    rarity: 'rare',
  },
  {
    key: 'soft_landing',
    title: 'Мягкая посадка',
    description: 'Набрать от 9500 до 10500 очков в одной игре',
    icon: '🪂',
    category: 'ракеты',
    rarity: 'rare',
  },
  {
    key: 'trajectory_apogee',
    title: 'Апогей траектории',
    description: 'Побить свой рекорд 10 раз',
    icon: '📈',
    category: 'ракеты',
    rarity: 'rare',
  },
  {
    key: 'hydraulic_start',
    title: 'Гидравлический старт',
    description: 'Набрать 3000+ очков на первых 3 фотографиях одной игры',
    icon: '💧',
    category: 'ракеты',
    rarity: 'common',
  },
  {
    key: 'powder_engine',
    title: 'Пороховой двигатель',
    description: 'Набрать 3000+ очков на последних 3 фотографиях одной игры',
    icon: '💥',
    category: 'ракеты',
    rarity: 'common',
  },
  {
    key: 'stabilizers',
    title: 'Стабилизаторы',
    description: 'Набрать 5000-7000 очков в 5 играх подряд',
    icon: '🎯',
    category: 'ракеты',
    rarity: 'rare',
  },

  // 😄 Особые (2)
  {
    key: 'drone_failed',
    title: 'Дрон так и не взлетел',
    description: 'Набрать минимум 60 очков за одно фото',
    icon: '🚁',
    category: 'особые',
    rarity: 'common',
  },
  {
    key: 'lucky_number',
    title: 'Везунчик',
    description: 'Набрать ровно 7777 очков в одной игре',
    icon: '🍀',
    category: 'особые',
    rarity: 'epic',
  },

  // 🚚 EFD — Escape From Donbass (2)
  {
    key: 'efd_license',
    title: 'Я получил права',
    description: 'Найти и сыграть в скрытую игру EFD',
    icon: '🚚',
    category: 'EFD',
    rarity: 'common',
  },
  {
    key: 'escape_from_donbass',
    title: '???',
    description: '???',
    icon: '👻',
    category: 'EFD',
    isHidden: true,
    rarity: 'legendary',
  },

  // 👑 Легендарное (1)
  {
    key: 'hokage_tochka_rosta',
    title: 'Хокаге Точки Роста',
    description: 'Получить ВСЕ остальные достижения (34 из 34)',
    icon: '🏆',
    category: 'легендарное',
    rarity: 'legendary',
  },
];

async function main() {
  console.log('🌟 Начинаем заполнение достижений...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
    console.log(`✓ ${achievement.icon} ${achievement.title}`);
  }

  console.log(`\n✅ Добавлено ${achievements.length} достижений!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

