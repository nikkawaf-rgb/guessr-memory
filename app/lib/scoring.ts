export interface ScoringConfig {
  // Time bonuses
  timeBonusMultiplier: number;
  maxTimeBonus: number;
  
  // Location scoring
  locationExactBonus: number;
  locationPartialBonus: number;
  
  // Date scoring
  yearExactBonus: number;
  yearCloseBonus: number; // ±1 year
  monthExactBonus: number;
  monthPartialBonus: number;
  dayExactBonus: number;
  dayPartialBonus: number;
  
  // People scoring
  peopleExactBonus: number;
  peoplePartialBonus: number;
  
  // Penalties
  wrongLocationPenalty: number;
  wrongYearPenalty: number;
  wrongMonthPenalty: number;
  wrongDayPenalty: number;
  wrongPeoplePenalty: number;
  
  // Fun mode specific
  hintsAvailable: boolean;
  maxHints: number;
  hintPenalty: number;
}

export const RANKED_SCORING: ScoringConfig = {
  timeBonusMultiplier: 2,
  maxTimeBonus: 1000,
  
  locationExactBonus: 2000,
  locationPartialBonus: 1000,
  
  yearExactBonus: 1500,
  yearCloseBonus: 750,
  monthExactBonus: 1000,
  monthPartialBonus: 500,
  dayExactBonus: 500,
  dayPartialBonus: 250,
  
  peopleExactBonus: 1000,
  peoplePartialBonus: 500,
  
  wrongLocationPenalty: -200,
  wrongYearPenalty: -100,
  wrongMonthPenalty: -50,
  wrongDayPenalty: -25,
  wrongPeoplePenalty: -50,
  
  hintsAvailable: false,
  maxHints: 0,
  hintPenalty: 0,
};

export const FUN_SCORING: ScoringConfig = {
  timeBonusMultiplier: 1.5,
  maxTimeBonus: 1500,
  
  locationExactBonus: 2500,
  locationPartialBonus: 1500,
  
  yearExactBonus: 2000,
  yearCloseBonus: 1000,
  monthExactBonus: 1200,
  monthPartialBonus: 600,
  dayExactBonus: 600,
  dayPartialBonus: 300,
  
  peopleExactBonus: 1200,
  peoplePartialBonus: 600,
  
  wrongLocationPenalty: -100,
  wrongYearPenalty: -50,
  wrongMonthPenalty: -25,
  wrongDayPenalty: -10,
  wrongPeoplePenalty: -25,
  
  hintsAvailable: true,
  maxHints: 3,
  hintPenalty: 200,
};

export function calculateScore(
  guess: {
    guessedCity?: string;
    guessedDay?: number;
    guessedMonth?: number;
    guessedYear?: number;
    guessedPeopleNames?: string[];
    timeSpentSec?: number;
    hintsUsed?: string[];
  },
  photo: {
    city: string;
    day: number;
    month: number;
    year: number;
    people: Array<{ name: string }>;
  },
  mode: "ranked" | "fun"
): number {
  const config = mode === "fun" ? FUN_SCORING : RANKED_SCORING;
  let score = 0;

  // Time bonus (more generous in fun mode)
  if (guess.timeSpentSec !== undefined) {
    const timeBonus = Math.max(0, config.maxTimeBonus - (guess.timeSpentSec * config.timeBonusMultiplier));
    score += timeBonus;
  }

  // Location scoring
  if (guess.guessedCity && photo.city) {
    const guessedLower = guess.guessedCity.toLowerCase().trim();
    const actualLower = photo.city.toLowerCase().trim();
    
    if (guessedLower === actualLower) {
      score += config.locationExactBonus;
    } else if (actualLower.includes(guessedLower) || guessedLower.includes(actualLower)) {
      score += config.locationPartialBonus;
    } else {
      score += config.wrongLocationPenalty;
    }
  }

  // Year scoring
  if (guess.guessedYear && photo.year) {
    const yearDiff = Math.abs(guess.guessedYear - photo.year);
    if (yearDiff === 0) {
      score += config.yearExactBonus;
    } else if (yearDiff === 1) {
      score += config.yearCloseBonus;
    } else {
      score += config.wrongYearPenalty;
    }
  }

  // Month scoring
  if (guess.guessedMonth && photo.month) {
    const monthDiff = Math.abs(guess.guessedMonth - photo.month);
    if (monthDiff === 0) {
      score += config.monthExactBonus;
    } else if (monthDiff <= 2) {
      score += config.monthPartialBonus;
    } else {
      score += config.wrongMonthPenalty;
    }
  }

  // Day scoring
  if (guess.guessedDay && photo.day) {
    const dayDiff = Math.abs(guess.guessedDay - photo.day);
    if (dayDiff === 0) {
      score += config.dayExactBonus;
    } else if (dayDiff <= 3) {
      score += config.dayPartialBonus;
    } else {
      score += config.wrongDayPenalty;
    }
  }

  // People scoring
  if (guess.guessedPeopleNames && photo.people.length > 0) {
    const guessedNames = guess.guessedPeopleNames.map(name => name.toLowerCase().trim());
    const actualNames = photo.people.map(person => person.name.toLowerCase().trim());
    
    const correctNames = guessedNames.filter(name => 
      actualNames.some(actual => actual === name || actual.includes(name) || name.includes(actual))
    );
    
    const correctCount = correctNames.length;
    const totalCount = Math.max(guessedNames.length, actualNames.length);
    
    if (correctCount === totalCount && correctCount > 0) {
      score += config.peopleExactBonus;
    } else if (correctCount > 0) {
      score += config.peoplePartialBonus * (correctCount / totalCount);
    } else {
      score += config.wrongPeoplePenalty;
    }
  }

  // Hint penalty (fun mode only)
  if (mode === "fun" && guess.hintsUsed && guess.hintsUsed.length > 0) {
    score -= config.hintPenalty * guess.hintsUsed.length;
  }

  return Math.max(0, score); // Never go below 0
}

export function getHintForPhoto(photo: {
  city: string;
  day: number;
  month: number;
  year: number;
  people: Array<{ name: string }>;
}, hintType: "location" | "date" | "people"): string {
  switch (hintType) {
    case "location":
      return `Город начинается с буквы "${photo.city.charAt(0).toUpperCase()}"`;
    case "date":
      return `Год: ${photo.year}`;
    case "people":
      if (photo.people.length === 0) return "На фото нет людей";
      if (photo.people.length === 1) return `На фото: ${photo.people[0].name}`;
      return `На фото ${photo.people.length} человек`;
    default:
      return "Подсказка недоступна";
  }
}

export function getAvailableHints(usedHints: string[]): string[] {
  const allHints = ["location", "date", "people"];
  return allHints.filter(hint => !usedHints.includes(hint));
}
