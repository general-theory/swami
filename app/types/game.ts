export interface Game {
  id: number;
  providerGameId: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  active: boolean;
  homeId: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayPoints: number | null;
  resultId: string | null;
  venue: string;
  season: {
    id: number;
    name: string;
  };
  week: {
    id: number;
    week: number;
  };
  homeTeam: {
    id: string;
    name: string;
  };
  awayTeam: {
    id: string;
    name: string;
  };
  [key: string]: unknown;
}

export interface GameFormData {
  id?: number;
  providerGameId: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  active: boolean;
  homeId: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayPoints: number | null;
  resultId: string | null;
  venue: string;
}

export interface GameCreateData {
  providerGameId: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  homeId: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayPoints: number | null;
  resultId: string | null;
  venue: string;
}

export interface Season {
  id: number;
  name: string;
  year: number;
}

export interface Week {
  id: number;
  week: number;
  seasonId: number;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  mascot?: string;
} 