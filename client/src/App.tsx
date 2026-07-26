import { Fragment, HTMLProps, useState } from 'react';

declare const __SETUP_FILE__: string;
const SETUP_URL = `https://mvla.ericgio.com/files/${__SETUP_FILE__}`;

const PROMPT_TEXT = `I want to set up the MVLA Scheduling Assistant. Please use the setup instructions from this URL and follow them to get started:\n\n${SETUP_URL}`;

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor">
      <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943" />
    </svg>
  );
}

function Link(props: HTMLProps<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noreferrer" {...props}>
      {props.children}
    </a>
  );
}

export default function App() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Fragment>
      <header>
        <div className="">
          <img src="/mvla-claude.png" alt="MVLA Scheduling Assistant" />
          <h1>MVLA Scheduling Assistant</h1>
          <p>A Claude-powered scheduling tool for MVLA team managers.</p>
          {/* <a href="#get-started" className="cta-link">
            Get Started
          </a> */}
        </div>
      </header>
      <div className="container">
        <section id="get-started">
          <h2>Get Started</h2>
          <p>
            Paste the following prompt into a new conversation in{' '}
            <strong>Claude Desktop</strong> and Claude will walk you through the
            process step by step:
          </p>
          <div className="setup-box">
            <button
              className={`copy-btn${copied ? ' copied' : ''}`}
              onClick={copyPrompt}
              aria-label="Copy to clipboard">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <p>
              I want to set up the MVLA Scheduling Assistant. Please use the
              setup instructions from this URL and follow them to get started:
            </p>
            <p>{SETUP_URL}</p>
          </div>
        </section>
        <section>
          <h2>Why Use This Tool?</h2>
          <p>
            If you've ever had to schedule games for an MVLA team, you know it
            can be a logistical nightmare: checking field availability on Byga,
            messaging teams on GotSport, coordinating with your coach's other
            teams, and avoiding conflicts with your personal calendar. And just
            when the schedule is all set... you get a request to reschedule a
            game.
          </p>
          <p>
            This tool aims to simplify that process by giving you a
            conversational assistant that can access all the data you need and
            help you find the best options in seconds.
          </p>
        </section>
        <section>
          <h2>Requirements</h2>
          <p>You'll need the following to use the MVLA Scheduling Assistant:</p>
          <ul>
            <li>
              A{' '}
              <Link href="https://claude.com/pricing">paid Claude account</Link>{' '}
              (free tier will not work)
            </li>
            <li>
              <Link href="https://claude.com/download">Claude Desktop</Link>{' '}
              (Claude.ai in a browser will not work)
            </li>
            <li>
              <Link href="https://www.google.com/chrome/">
                Google Chrome
              </Link>{' '}
            </li>
          </ul>
          <p className="note">
            <strong>Note:</strong> Claude reads Byga through your own Chrome
            browser, signed in as you — that's why Desktop and Chrome are both
            required. More on how that works below.
          </p>
        </section>
        <section>
          <h2>How does it work?</h2>
          <p>
            The tool is a Claude Project: a workspace where Claude keeps the
            context — how MVLA scheduling works, who your team is, who your
            coach is — so you never have to re-explain it.
          </p>
          <h3>Where It Gets Data</h3>
          <p>
            Everything is fetched live, at the moment you ask. There's no copy
            of MVLA's data sitting on a server somewhere.
          </p>
          <ul>
            <li>
              <strong>Field availability</strong>: Claude reads the Byga field
              usage page through your own Chrome browser, signed in as you. It
              sees exactly what you'd see.
            </li>
            <li>
              <strong>Team and league schedules</strong>: league fixtures come
              from GotSport's public schedule export; coach and team schedules
              come from the calendar feeds Byga already publishes.
            </li>
            <li>
              <strong>Your own calendar</strong> (optional): Connect Google
              Calendar or paste in a calendar link and Claude will check your
              family's commitments too.
            </li>
          </ul>
          <h3>Per-Season Setup</h3>
          <p>
            The first time you use it each season, Claude walks you through
            tracking down a few things — your team's Byga and GotSport IDs, your
            coach's calendar link — and saves them into a short "season context"
            note in your project. That's what lets you say "schedule a home
            game" without re-explaining who your team is every time. You'll redo
            it each season, since teams get reshuffled and the IDs change.
          </p>
          <h3>Ask For Help</h3>
          <p>
            You tell it what you need — "I want to schedule a home game the
            weekend of September 12. The other team requested a morning kickoff"
            — and it does the legwork:
          </p>
          <ul>
            <li>Checks which fields are open</li>
            <li>
              Looks at your team's schedule and your coach's schedule, including
              their other teams
            </li>
            <li>
              Checks your personal calendar so it doesn't pick the date your kid
              has a recital
            </li>
            <li>Comes back with 2–3 good options and explains why</li>
          </ul>
          <p className="tagline">
            No spreadsheets. No tab-juggling. Just a conversation.
          </p>
          <h3>What It Won’t Do</h3>
          <ul>
            <li>
              It doesn't book fields or send messages. It drafts; you send.
            </li>
            <li>
              It has no special access to club systems — it reads the same pages
              you do, as you.
            </li>
            <li>
              It can be wrong. It's parsing live web pages and calendar feeds,
              and either can be stale or misread. Check anything before you act
              on it, especially dates.
            </li>
          </ul>
        </section>
        <section>
          <h2>Usage</h2>
          <p>
            Once set up, start a chat inside your project and ask naturally:
          </p>
          <p className="examples">
            <div className="example">
              "Can you check field availability for the weekend of June 14–15?"
            </div>
            <div className="example">
              "Schedule a home game against FC Ballistic — they can't do
              Saturdays."
            </div>
            <div className="example">
              "What does our schedule look like for the rest of the season?"
            </div>
          </p>
          <p>
            Claude will fetch live data, flag any conflicts, and walk you
            through the options. On confirmation, it can draft a message to the
            away team manager ready to paste into GotSport.
          </p>
        </section>
      </div>

      <footer>
        <Link href="https://github.com/ericgio/mvla-scheduling">
          <GitHubIcon />
        </Link>
      </footer>
    </Fragment>
  );
}
