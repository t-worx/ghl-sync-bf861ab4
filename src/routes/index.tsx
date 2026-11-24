import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import photo from "../assets/tracy.webp";
import { initScorecard } from "../lib/scorecard";
import "../scorecard.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Which GoHighLevel Plan Fits You? | Tracy's Plan Picker Scorecard" },
      {
        name: "description",
        content:
          "Answer 11 quick questions and get the GoHighLevel plan that fits, with Black Friday pricing. An independent affiliate guide by Tracy, The GHL Coach.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

/*
 * The markup below is static. All behavior (questions, scoring, the email step,
 * the result card and the Black Friday / Cyber Week date switch) lives in
 * src/lib/scorecard.ts, which also holds the CONFIG block with every link,
 * price and date.
 */
function Index() {
  useEffect(() => initScorecard(), []);
  return (
    <div className="pp">
      <header className="hero view" id="view-hero"><div className="wrap hero-wrap">
        <div className="hero-photo"><img src={photo} width={760} height={768} alt="Tracy pointing to the plan picker" /></div>
        <div className="hero-copy">
          <img className="logo" id="hl-logo" alt="HighLevel" hidden={true} />
          <p className="by" id="by"></p>
          <h1>Which GoHighLevel Plan Fits You?</h1>
          <p className="sub">Answer 11 quick questions. Get your plan in 2 minutes, so you don&apos;t overpay or end up with too little.</p>
          <span className="deal-pill" id="deal-pill"></span>
          <div className="prices" id="price-pills"></div>
          <div className="start"><button className="btn" id="start" type="button">Start the Scorecard →</button></div>
        </div>
      </div></header>

      <section className="screen view" id="view-quiz" hidden={true}><div className="wrap">
        <p className="topline" data-eyebrow></p>
        <div className="q-meta"><span id="q-pos"></span><b id="q-count"></b></div>
        <div className="track"><div className="fill" id="fill"></div></div>
        <h2 className="q-title" id="q-title" tabIndex={-1}></h2>
        <div className="opts" id="opts" role="group" aria-labelledby="q-title"></div>
        <div className="q-foot"><button className="link" id="back" type="button">← Back</button><div className="dots" id="dots" aria-hidden="true"></div></div>
      </div></section>

      <section className="screen view" id="view-gate" hidden={true}><div className="wrap">
        <p className="topline" data-eyebrow></p>
        <div className="gate">
          <span className="chip">→ One last step</span>
          <h2 id="gate-title" tabIndex={-1}>Reveal your plan</h2>
          <p id="gate-text"></p>
          <form id="gate-form" noValidate>
            <label htmlFor="lead-name">First name<input id="lead-name" name="name" autoComplete="given-name" placeholder="Your first name" /></label>
            <label htmlFor="lead-email">Email<input id="lead-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@business.com" /></label>
            <input className="hp" id="lead-site" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <p className="err" id="gate-err" hidden={true}></p>
            <button className="btn btn-cta" type="submit" id="gate-btn">See my plan →</button>
            <p className="fine" id="gate-fine"></p>
          </form>
          <button className="link" id="skip" type="button" hidden={true}>No thanks, just show my plan</button>
          <button className="link" id="gate-back" type="button">← Back to the questions</button>
        </div>
      </div></section>

      <section className="screen view" id="view-result" hidden={true}><div className="wrap">
        <p className="topline" data-eyebrow></p>
        <div id="result"></div>
        <button className="link again" id="restart" type="button">Start over</button>
        <div className="deal">
          <h2 id="deal-title"></h2>
          <div className="tiles" id="tiles"></div>
          <p className="dealnote" id="deal-text"></p>
          <p className="claim" id="claim"></p>
        </div>
      </div></section>

      <footer><div className="wrap">
        <b id="credit"></b>
        <p>I&apos;m a GoHighLevel affiliate and earn a commission if you sign up through my link, at no extra cost to you. This is my own guide, not an official HighLevel page.</p>
      </div></footer>
    </div>
  );
}
