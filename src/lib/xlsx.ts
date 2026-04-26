import * as XLSX from 'xlsx';
import type { Game, ScheduleResult } from './types.js';

const COL_NAMES = {
  match:    'Match #',
  date:     'Date',
  time:     'Time',
  home:     'Home Team',
  results:  'Results',
  away:     'Away Team',
  location: 'Location',
  division: 'Division',
  status:   'Status',
} as const;

type ColKey = keyof typeof COL_NAMES;
const REQUIRED: ColKey[] = ['match', 'date', 'time', 'home', 'away'];

type ColIndex = Record<ColKey, number>;

export function parseScheduleXlsx(
  buf: Buffer,
  opts: { contentDisposition?: string } = {},
): Omit<ScheduleResult, 'fetchedAt'> {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

  if (rows.length === 0) {
    return { team: null, gameCount: 0, games: [] };
  }

  const headers = (rows[0] as unknown[]).map((h) => String(h).trim());
  const col = {} as ColIndex;
  for (const [key, name] of Object.entries(COL_NAMES) as [ColKey, string][]) {
    col[key] = headers.indexOf(name);
  }

  for (const key of REQUIRED) {
    if (col[key] === -1) {
      throw new Error(
        `Column "${COL_NAMES[key]}" not found in XLSX. Headers: ${headers.join(', ')}`,
      );
    }
  }

  const get = (row: unknown[], key: ColKey): string => {
    const i = col[key];
    return i >= 0 ? String((row as unknown[])[i] ?? '').trim() : '';
  };

  type GameWithSort = Game & { _sortTime: string };

  const games: GameWithSort[] = (rows.slice(1) as unknown[][])
    .filter((r) => r.some((c) => String(c).trim() !== ''))
    .map((row): GameWithSort => {
      const dateDisplay = get(row, 'date');
      const timeRaw = get(row, 'time');
      const homeName = get(row, 'home');
      const awayName = get(row, 'away');
      const score = parseScore(get(row, 'results'));
      return {
        matchNumber: get(row, 'match') || null,
        date: parseDate(dateDisplay),
        dateDisplay: dateDisplay || null,
        time: timeRaw || null,
        _sortTime: parseTime24(timeRaw),
        status: get(row, 'status') || null,
        homeTeam: homeName || null,
        awayTeam: awayName || null,
        score,
        location: get(row, 'location') || null,
        division: get(row, 'division') || null,
        played: score !== null,
      };
    });

  games.sort((a, b) => {
    const dateCmp = (a.date ?? '').localeCompare(b.date ?? '');
    return dateCmp !== 0 ? dateCmp : a._sortTime.localeCompare(b._sortTime);
  });

  const team = teamFromContentDisposition(opts.contentDisposition);

  return {
    team,
    gameCount: games.length,
    games: games.map(({ _sortTime: _s, ...g }) => g),
  };
}

function parseScore(text: string): { home: number; away: number } | null {
  const m = text.match(/^(\d+)\s*-\s*(\d+)$/);
  return m ? { home: parseInt(m[1], 10), away: parseInt(m[2], 10) } : null;
}

function parseDate(text: string): string | null {
  if (!text) return null;
  const cleaned = text.replace(/^[A-Za-z]+,\s*/, '');
  const d = new Date(cleaned + ' 00:00:00 UTC');
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseTime24(text: string): string {
  const m = text.match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

function teamFromContentDisposition(cd?: string): string | null {
  if (!cd) return null;
  const m = cd.match(/filename="?([^"]+?)_matches\.xlsx"?/i);
  return m ? m[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}
