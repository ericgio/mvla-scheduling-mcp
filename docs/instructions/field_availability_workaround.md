# Field Availability Workaround

The direct Byga API integration is not yet connected. Follow these steps to fetch field availability via Claude in Chrome.

The params have already been received and are echoed in `params_received` in the response — use those values where the steps below reference `{schedule_id}`, `{team_id}`, `{format}`, `{start_date}`, and `{end_date}`.

The field usage URL pattern is:

```
https://mvlasc.byga.net/game_schedules/{schedule_id}?tab=field_usage
```

Use `tab=field_usage` (not `field_request`) — this exposes the FullCalendar in-memory state needed for the JS query below.

Follow these steps in order without waiting for the user to prompt each one:

## 1. Open a browser via Claude in Chrome

Use `list_connected_browsers` to find a connected Chrome instance, then `select_browser` to connect to it. Create a new tab with `tabs_create_mcp`.

## 2. Check for an active Byga session

Navigate to `https://mvlasc.byga.net`. If the page redirects to a login screen, pause and direct the user to log in. Wait for them to confirm before proceeding.

## 3. Navigate to the field usage page

Navigate to the full URL with IDs from `params_received`:

```
https://mvlasc.byga.net/game_schedules/{schedule_id}?tab=field_usage&team_id={team_id}
```

## 4. Wait for FullCalendar to initialize

Wait 2 seconds after navigation. Use `javascript_tool` to jump to the start date and confirm the calendar view is ready:

```javascript
const $cal = jQuery('.fc');
$cal.fullCalendar('gotoDate', '{start_date}');
$cal.fullCalendar('getView').name;
```

If `clientEvents` returns 0 events in the next step, wait another 2 seconds and retry once — the page may still be loading.

## 5. Extract slot data via JavaScript

```javascript
const $cal = jQuery('.fc');
const events = $cal.fullCalendar('clientEvents');
const resources = $cal.fullCalendar('getResources') || [];
const rMap = {};
resources.forEach((r) => (rMap[r.id] = r.title));

const fmt = '{format}'; // e.g. '7v7'
const startD = '{start_date}'; // e.g. '2026-05-23'
const endD = '{end_date}'; // e.g. '2026-05-24'

events
  .filter((e) => (e.shortTitle || '').includes(fmt))
  .filter((e) => {
    const d = e.start.format('YYYY-MM-DD');
    return d >= startD && d <= endD;
  })
  .map((e) => ({
    field: rMap[e.resourceId],
    format: e.shortTitle,
    date: e.start.format('YYYY-MM-DD'),
    day: e.start.format('ddd'),
    start: e.start.format('h:mm A'),
    end: e.end.format('h:mm A'),
    available: e.available,
  }))
  .sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.field.localeCompare(b.field) ||
      a.start.localeCompare(b.start),
  );
```

## 6. Handle multi-week date ranges

FullCalendar shows a rolling window (typically ~2 days for weekends). If the requested range spans more than the current view, call `gotoDate` for the next window and repeat step 5, then merge results.

## 7. Continue with the scheduling workflow

Filter results to the preferred game window, cross-reference coach and personal calendars, and present ranked suggestions.

**Constraints**

- Do NOT call any Byga API endpoints directly (fetch, XHR, etc.)
- Do NOT modify any data on the page
- Read only from FullCalendar's in-memory state via `javascript_tool`

**Known limitations**

- Requires Claude in Chrome to be installed and the browser logged into Byga
- Multi-week ranges require multiple `gotoDate` calls and result merging
