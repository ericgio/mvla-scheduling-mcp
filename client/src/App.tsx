import { HTMLProps, useState } from 'react';

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
    <div className="container">
      <header>
        <img src="/mvla-claude.png" alt="MVLA Scheduling Assistant" />
        <h1>MVLA Scheduling Assistant</h1>
        <p>A Claude-powered scheduling tool for MVLA team managers.</p>
      </header>

      <section>
        <h2>Why Use This Tool?</h2>
        <p>
          If you've ever had to schedule games for an MVLA team, you know it can
          be a logistical nightmare: checking field availability on Byga,
          messaging teams on GotSport, coordinating with your coach's other
          teams, and avoiding conflicts with your personal calendar. And just
          when the schedule is all set... you get a request to reschedule a
          game.
        </p>
        <p>
          This tool aims to simplify that process by giving you a conversational
          assistant that can access all the data you need and help you find the
          best options in seconds.
        </p>
      </section>

      <section>
        <h2>Get Started</h2>
        <p>
          To get started, paste the following prompt into a new Claude
          conversation and Claude will walk you through the process step by
          step:
        </p>
        <div className="setup-box">
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={copyPrompt}
            aria-label="Copy to clipboard">
            {copied ? <CheckIcon /> : <CopyIcon />}
            &nbsp;{copied ? 'Copied!' : 'Copy'}
          </button>
          <p>
            I want to set up the MVLA Scheduling Assistant. Please use the setup
            instructions from this URL and follow them to get started:
          </p>
          <p>{SETUP_URL}</p>
        </div>
      </section>

      <section>
        <h2>How does it work?</h2>
        <p>
          The tool is a <Link href="https://claude.ai">Claude.ai</Link> Project
          — a persistent chat context that gives Claude access to your team's
          season info and a set of tools for fetching live data. When you ask it
          to schedule a game, it:
        </p>
        <ol>
          <li>Fetches available field slots from Byga</li>
          <li>Fetches your team's schedule and your coach's schedule</li>
          <li>Cross-references your personal calendar for conflicts</li>
          <li>Suggests 2–3 ranked options with reasoning</li>
        </ol>
        <p className="tagline">
          No code to run. No spreadsheets. Just a conversation.
        </p>
      </section>

      <section>
        <h2>What will I need?</h2>
        <ul>
          <li>
            A <Link href="https://claude.com/pricing">paid Claude</Link> account
            (free tier will not work)
          </li>
          <li>
            <Link href="https://claude.com/download">Claude Desktop</Link>{' '}
            installed
          </li>
          <li>
            <Link href="https://www.google.com/chrome/">Google Chrome</Link>{' '}
            with the{' '}
            <Link href="https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn">
              Claude in Chrome
            </Link>{' '}
            extension installed
          </li>
        </ul>
      </section>

      <section>
        <h2>Usage</h2>
        <p>Once set up, start a chat inside your project and ask naturally:</p>
        <div className="examples">
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
        </div>
      </section>

      <footer>
        Copyright © {new Date().getFullYear()} Eric Giovanola &middot;{' '}
        <Link href="https://github.com/ericgio/mvla-scheduling">GitHub</Link>
      </footer>
    </div>
  );
}
