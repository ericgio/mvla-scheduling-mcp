export interface Game {
  matchNumber: string | null;
  date: string | null;         // ISO YYYY-MM-DD
  dateDisplay: string | null;  // "Sunday, March 8, 2026"
  time: string | null;         // "10:00 PDT"
  status: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  score: { home: number; away: number } | null;
  location: string | null;
  division: string | null;
  played: boolean;
}

export interface ScheduleResult {
  team: string | null;
  gameCount: number;
  games: Game[];
  fetchedAt: string;
}

export interface CalendarEvent {
  summary: string;
  date: string;        // "Sat, Mar 8"
  start: string;       // "10:00 AM"
  end: string;         // "12:00 PM"
  location: string | null;
}

export interface CalendarResult {
  eventCount: number;
  events: CalendarEvent[];
  fetchedAt: string;
}
