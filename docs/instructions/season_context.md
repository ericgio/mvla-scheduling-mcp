# Season Context Generation Instructions

Follow these steps to generate a season context doc for a team.

## Extraction steps

1. Before extracting anything new, look for prior context for the exact target season only. If the user is generating Fall 2026 context, check for any existing Fall 2026 context doc or notes first. Do not use Spring 2026 or other seasons as a substitute. If an existing doc for that season already contains TBD/blocked notes, read them first and treat them as the current known state before trying a new extraction.

2. Navigate to `https://mvlasc.byga.net/`. If the user is not logged in, prommpt them to do so. Logging in should automatically redirect to `https://mvlasc.byga.net/dashboard`.

3. On the dashboard page there should be a section with the season name listing all the teams for that season. If there is more than one, prompt the user to specify which one they want to generate context for.

4. Navigate to that team and extract:
   - Team name, birth year, and format (7v7 / 9v9 / 11v11)
   - Byga team ID (from the URL)
   - League and division name
   - Byga season name and season/schedule ID (from the active schedule). Confirm the ID by navigating to `https://mvlasc.byga.net/game_schedules/{id}?tab=field_usage` and verifying the season name in the top-right matches the expected season.
   - Coach name and consolidated iCal URL: navigate to the coach's profile by reading the href on the coach's name link on the team page (pattern: `/users/{user_id}`) and navigating to `https://mvlasc.byga.net{href}`. Extract the iCal URL via JavaScript (`document.querySelectorAll('a[href*=".ics"]')`) rather than using the "Copy Subscription Link" button — clipboard content is not reliably readable. The consolidated iCal covers all their teams.
   - All other teams the coach coaches: for each competitive team, get name, Byga team ID, and league; note any in-house or development programs separately (Byga only, no GotSport). Identify in-house programs by checking whether the team appears in the coach's profile team list without a league name, or has no Competitions tab content.

5. For each team (your team + each of the coach's competitive teams), look up GotSport IDs as follows:
   a. Navigate to the team's Byga page (`https://mvlasc.byga.net/teams/{team_id}`)
   b. Use find to locate the Competitions dropdown in the tab bar and click it
   c. In the dropdown, click the competition that corresponds to the current season's league (e.g. "2025-26 NorCal Premier Spring League U8-U19"). This takes you to the team calendar page for that competition.
   d. On the team calendar page, locate the standings table on the right side of the page. Below it, find the "Source:" link and click it. This opens a new tab — switch to that tab before proceeding.
   e. In the new GotSport tab, use a JavaScript search for the team name (e.g. `Array.from(document.querySelectorAll('a')).filter(a => a.textContent.includes('Bayern') || a.textContent.includes('Dortmund'))`) to find the team link, then click it. Alternatively, use find with the team name.
   f. Read `window.location.href` from the resulting page. It will be in the form `https://system.gotsport.com/org_event/events/{event_id}/schedules?team={team_id}`. Extract both IDs from the URL.

   Notes:
   - The Source link always opens GotSport in a new tab — always switch to that tab before trying to interact with it, and verify `window.location.href` in the new tab before reading any data from it — do not assume the active tab has changed just because the click succeeded
   - The Source link may land on a different division view than your team's — don't try to navigate to the right division; just search for the team name directly on whatever page loads. When searching, use a distinctive single word from the team name (e.g. "Bayern", "Dortmund") rather than the full name — GotSport prefixes team names with the club name ("Mountain View Los Altos Soccer Club MVLA…"), so partial matching is more reliable
   - In-house/development programs have no GotSport presence — skip them
   - The documented click-based Source link flow is unreliable in some cases. A more robust fallback is to read the event and group IDs straight from the Source link href on the Byga page:
     `Array.from(document.querySelectorAll('a')).filter(a => /gotsport/i.test(a.href)).map(a => { const u = new URL(a.href); return { event: (u.pathname.match(/events\/(\d+)/)||[])[1], group: u.searchParams.get('group') }; })`
     Then navigate directly to `https://system.gotsport.com/org_event/events/{event}/schedules?date=All&group={group}` and pull the team ID the same way from the team links' URL params. If the full href is masked as `[BLOCKED: Cookie/query string data]`, extracting the individual params via `URLSearchParams` still returns the clean values.

6. Ask the user for tournament blackout dates and any other info not visible on the calendar (e.g. a deliberate withdrawal from a tournament).

After completing the GotSport lookup, close any GotSport tabs that were opened during extraction to avoid tab confusion in subsequent steps. Always confirm the correct tab is active before reading data by checking `window.location.href`.

## Output rules

- Do not include game schedules, field format rules, manager info, personal calendar URLs, or scheduling notes — those are fetched live or live in Project Instructions
- The field availability URL does not include a `team_id` param
- The coach's consolidated iCal covers all their teams — do not add individual team iCals
- The Tournament Blackouts section always appears with the prompt comment, even if empty
- GotSport team IDs must be looked up from the GotSport schedule page — never guessed
- A doc with TBD placeholders and inline revisit notes is a successful partial outcome. Do not block the whole generation on one missing field.
- For any single data point, allow at most two distinct approaches: the documented path and one alternative. If both fail, stop and ask the user rather than trying more variants or brute-forcing IDs.
- If a season context doc already exists for the target season, read its TBD/blocked notes before starting extraction. Do not re-attempt something a previous run already documented as unavailable unless the blocking condition has clearly changed.
- Treat pre-season absence as a normal state, not an error: field usage tab not yet open, no game_schedule ID issued yet, Competitions tab absent, league/division fields unset. In each case, record TBD and move on.
- Retry transient HTTP errors (for example 502s) up to 3 times with a short backoff. If a request returns 200 but the content is structurally absent, do not retry; record TBD and continue.

## Template

Generate the doc using exactly this structure. Fill in values; do not deviate from the format.

```markdown
# {Season} Season Context — {Team Name}

_Generated: {date}. Source: Byga, GotSport, coach iCal._

---

## Team

| Field             | Value                              |
| ----------------- | ---------------------------------- |
| **Team name**     | {name}                             |
| **Birth year**    | {year}                             |
| **Format**        | {7v7 / 9v9 / 11v11}                |
| **Byga team ID**  | `{id}`                             |
| **Byga team URL** | https://mvlasc.byga.net/teams/{id} |
| **League**        | {league name}                      |
| **Division**      | {division name}                    |

---

## Byga Season / Schedule

| Field                      | Value                                                              |
| -------------------------- | ------------------------------------------------------------------ |
| **Byga season name**       | {name}                                                             |
| **Byga season ID**         | `{id}`                                                             |
| **Field availability URL** | https://mvlasc.byga.net/game_schedules/{season_id}?tab=field_usage |

---

## GotSport

| Field                 | Value  |
| --------------------- | ------ |
| **GotSport event ID** | `{id}` |
| **GotSport team ID**  | `{id}` |

---

## Coach

| Field                         | Value   |
| ----------------------------- | ------- |
| **Name**                      | {name}  |
| **Coach iCal (consolidated)** | `{url}` |

### Coach's other team(s)

#### {Team Name}

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| **Byga team ID**      | `{id}`                             |
| **Byga team URL**     | https://mvlasc.byga.net/teams/{id} |
| **League**            | {league name}                      |
| **GotSport event ID** | `{id}`                             |
| **GotSport team ID**  | `{id}`                             |

#### {Program Name} _(in-house program — Byga only)_

| Field             | Value                              |
| ----------------- | ---------------------------------- |
| **Byga team ID**  | `{id}`                             |
| **Byga team URL** | https://mvlasc.byga.net/teams/{id} |

---

## Tournament Blackouts & Manual Notes

> ✏️ Add any dates the team is unavailable for league games (tournament weekends,
> travel, etc.) and any other info that won't be visible on the calendar.

- _{add entries here, or leave blank}_
```

Tell the user to add the generated doc to the project files, being sure to include the name of the season (e.g. "Spring 2026" if pasting text or `SPRING_2026.md` if uploading a file).

## New season

If the user says it's a new season, run the same generation flow as above. Ask specifically for the new season's tournament blackout dates. Tell the user to add the new doc to Project Knowledge alongside (or replacing) the previous season's doc.
