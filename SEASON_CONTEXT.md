# MVLA Scheduling Assistant — Season Context Template

## How to use this document

Paste this into your Claude Project instructions alongside the scheduling
assistant system prompt. Fill in every section for your team. Claude will
reference this automatically in every conversation.

Remove any sections that don't apply to your team, and add notes anywhere
something is unclear or needs context.

You can paste this into a chatbot and ask it to help you fill this out.

---

## Your Team

- Current season: [eg: Spring 2026]
- Team name: [e.g. MVLA 16B Dortmund White]
- Birth year: [e.g. 2016]
- Age group: [e.g. U10]
- Field format: [7v7 / 9v9 / 11v11]

## Byga Info

- Season ID: [found in Byga URL when viewing your season]
- Team ID: [found in Byga URL when viewing your team]

## Scheduling Platform

Some leagues use GotSport, others use a different platform or coordinate
manually. Fill in whatever applies to your team.

- Platform: [e.g. GotSport, CCSL, manual coordination]
- Schedule URL: [public URL to your team's schedule, if available]

Ex: https://system.gotsport.com/org_event/events/49370/schedules?team=3793768

### GotSport (if applicable)

- Event ID: [found in GotSport URL — /org_event/events/XXXXX/]
- Team ID: [found in GotSport URL — ?team=XXXXXXX]

## Coach

- Name: [Coach first name, for use in messages]
- iCal URL: [Byga calendar URL — coach can find this in their Byga profile
  under Account Settings → Calendar Integration]

## Coach's Other Teams (for conflict checking)

List any other teams your coach coaches. Claude will check these for time
conflicts when scheduling home games.

- Team: [e.g. 2009B U17 11v11] | iCal URL: [url]
  Note: [e.g. different field format — time conflicts only, no field overlap]
- Team: [add more if needed]

## Personal Calendars (optional)

List URLs for any personal calendars Claude should check when evaluating
dates — useful for team social events or dates that depend on your own
availability.

- [Label, e.g. Family]: [Calendar URL]
- [Label, e.g. Kids]: [Calendar URL]

## Preferred Game Window

- Preferred days: [e.g. Saturdays and Sundays]
- Preferred times: [e.g. 9am–1pm]
- Notes: [e.g. avoid before 9am in winter months]

## Tournament Blackouts

Weekends when your team is unavailable due to tournaments, holidays, or
other commitments. Claude will never suggest these dates for home games.

- [Date range, e.g. Apr 25–26]: [Event name, e.g. MVLA Spring Cup]
- [Date range]: [Event name]

## Games to Schedule

List games that still need to be scheduled, however your league tracks them.
If you're on GotSport, paste your placeholder list from there. If coordinating
manually, list opponent names and any known constraints.

Update this section as games get confirmed — remove scheduled games or mark
them complete so Claude knows what's still outstanding.

[Paste or list here]

## Away Team Constraints

Add constraints as you receive them from opposing managers. Claude will
cross-reference these when suggesting slots.

- [Team name] can't do [date(s)]: [reason if known]

## Notes / Season Updates

Running log of anything that changes mid-season — withdrawn tournaments,
rescheduled games, coach availability changes, etc.

- [Date]: [Update]
