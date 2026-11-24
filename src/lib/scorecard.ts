// @ts-nocheck
/*
 * Plan Picker Scorecard logic. Plain DOM code, started once by src/routes/index.tsx.
 * Every link, price, date and bonus list is in CONFIG below.
 */
/* ============ EDIT HERE: every link, price and date lives in CONFIG ============ */
const CONFIG = {
  author: "Tracy",
  brand: "The GHL Coach",
  eyebrow: "Tracy's HighLevel Black Friday Plan Picker Scorecard",
  logo: "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/knES3eSWYIsc5YSZ3YLl/media/6a3d48e8e4daecfbb47f2a0b.svg",
  bonusNote: "Only the first 20 signups get a 1:1 call with Tracy.",
  claimNote: "To claim your bonuses, DM Tracy after you sign up.",
  optin: {
    webhook: "https://services.leadconnectorhq.com/hooks/eyjhfCNWnYhOrXNr11L9/webhook-trigger/f2258d56-90be-50a6-82e3-50914a3676ea",  // GHL workflow "06 - Plan Picker Scorecard Lead". If empty, names and emails are NOT saved anywhere.
    allowSkip: false,     // true shows a "No thanks, just show my plan" link under the form
    text: "Enter your first name and email to see your best-fit plan, the Black Friday price, and your bonuses.",
    fine: "No spam. I'll only email you about your scorecard and this offer."
  },
  links: {
    blackFriday: "https://gohighlevel.com/black-friday-2026?fp_ref=gvibx",  // used until blackFridayEnds
    cyberWeek:   "https://gohighlevel.com/cyber-week-2026?fp_ref=gvibx",    // used until cyberWeekEnds
    regular:     "https://www.gohighlevel.com/?fp_ref=gvibx",               // used after both deals end
    booking:     "https://gohighlevel.com/black-friday-2026?fp_ref=gvibx"   // "Book a free 15-minute call" button
  },
  deal: {
    blackFridayEnds: "2026-11-30T07:59:59Z",   // Sunday Nov 29, 11:59 PM Pacific
    cyberWeekEnds:   "2026-12-07T07:59:59Z",   // Sunday Dec 6, 11:59 PM Pacific
    months: 3
  },
  plans: {
    starter: {
      name: "Starter", price: 97, dealPrice: 48.50, save: 145.50,
      blurb: "1 business · up to 3 sub-accounts",
      fit: "For a single business that wants to stop missing calls and leads.",
      bonus: ["AI Receptionist Prompt Pack", "Complete Setup Checklist", "A 30-minute 1:1 setup call with Tracy (8+ year GHL early adopter and Certified GHL Admin), first 20 signups only", "Weekly office hours"],
      steps: ["Connect your phone number", "Turn on missed-call text-back", "Set up your AI receptionist"]
    },
    unlimited: {
      name: "Unlimited", price: 297, dealPrice: 148.50, save: 445.50,
      blurb: "Unlimited sub-accounts · for agencies",
      fit: "For consultants and agencies serving multiple businesses, with unlimited sub-accounts.",
      bonus: ["AI Receptionist Prompt Pack", "Complete Setup Checklist", "A 60-minute 1:1 strategy call with Tracy (8+ year GHL early adopter and Certified GHL Admin), first 20 signups only", "Weekly office hours", "A founding seat in Tracy's GHL Coach community"],
      steps: ["Build your first client sub-account", "Load a snapshot", "Set up the AI receptionist for that client"]
    },
    founder: {
      name: "Founder", price: 497, dealPrice: 248.50, save: 745.50,
      blurb: "SaaS mode + rebilling · sell under your brand",
      fit: "For anyone who wants to sell software under their own brand with SaaS mode and rebilling.",
      bonus: ["AI Receptionist Prompt Pack", "Complete Setup Checklist", "A 60-minute 1:1 strategy call, first 20 signups only", "A done-with-you AI receptionist build", "A pricing and SaaS playbook", "Weekly office hours", "A priority seat in Tracy's GHL Coach community"],
      steps: ["Turn on SaaS mode", "Set your pricing and markup", "Package your AI receptionist offer"]
    }
  }
};
/* ============================ end of CONFIG ============================ */

const ORDER = ["starter", "unlimited", "founder"];
/* each answer: [label, {points per plan}] */
const QUESTIONS = [
  ["What best describes you?", [["Local business owner",{starter:2}],["Freelancer or consultant",{starter:1,unlimited:1}],["Agency or marketer serving clients",{unlimited:2}],["I want to sell software to clients",{founder:3}]]],
  ["How many businesses or locations will you run in GHL?", [["1-3",{starter:2}],["4-10",{unlimited:2}],["10+",{unlimited:2,founder:1}]]],
  ["Do you want to resell GHL to clients under your own brand as your own software?", [["No",{starter:1}],["Maybe later",{unlimited:1}],["Yes",{founder:3}]]],
  ["Do you want to mark up phone, text, email or AI usage and profit from it?", [["No",{starter:1}],["Just pass costs through",{unlimited:2}],["Yes, mark it up",{founder:3}]]],
  ["Will you use an AI receptionist or AI employee?", [["Just for me",{starter:2}],["For several clients",{unlimited:2}],["As a product I sell",{founder:2}]]],
  ["Team size?", [["Just me",{starter:2}],["2-5",{unlimited:1}],["6+",{unlimited:1,founder:1}]]],
  ["Do you need a white-label mobile app?", [["No",{starter:1,unlimited:1}],["Yes",{founder:2}]]],
  ["Will you connect other software through the API?", [["No",{starter:1}],["Basic",{unlimited:2}],["Advanced, custom",{founder:2}]]],
  ["How comfortable are you with tech?", [["Beginner",{starter:2}],["Comfortable",{unlimited:1}],["Advanced",{unlimited:1,founder:1}]]],
  ["Monthly budget for software?", [["Under $150",{starter:2}],["$150-$300",{unlimited:2}],["$300+",{founder:2}]]],
  ["Main goal in the next 90 days?", [["Stop missing calls and leads",{starter:2}],["Serve more clients",{unlimited:2}],["Build recurring software revenue",{founder:3}]]]
];

const N = QUESTIONS.length;
const answers = new Array(N).fill(null);
let current = 0, lead = {name: "", email: ""};
const $ = id => document.getElementById(id);
const money = n => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function phase(now = new Date()) {
  if (now <= new Date(CONFIG.deal.blackFridayEnds)) return "bf";
  if (now <= new Date(CONFIG.deal.cyberWeekEnds)) return "cw";
  return "none";
}
const dealLabel = () => phase() === "bf" ? "Black Friday" : phase() === "cw" ? "Cyber Week" : "";
const signupLink = () => { const ph = phase(); return ph === "bf" ? CONFIG.links.blackFriday : ph === "cw" ? CONFIG.links.cyberWeek : CONFIG.links.regular; };

/* Scoring: highest total wins, ties go to the lower-priced plan, then the two overrides. */
function score(ans) {
  const totals = {starter:0, unlimited:0, founder:0};
  ans.forEach((a, i) => { if (a !== null) for (const [k, v] of Object.entries(QUESTIONS[i][1][a][1])) totals[k] += v; });
  let plan = ORDER.reduce((best, k) => totals[k] > totals[best] ? k : best, "starter");
  const notes = [];
  if (ans[1] === 1 || ans[1] === 2) {
    if (plan === "starter") plan = "unlimited";
    notes.push("Starter includes 3 sub-accounts.");
  }
  if (ans[2] === 2 || ans[3] === 2) {
    plan = "founder";
    notes.push("Only Founder includes SaaS mode and rebilling with markup.");
  }
  return {totals, plan, notes};
}

/* one screen at a time */
function show(name) {
  ["hero", "quiz", "gate", "result"].forEach(v => { $("view-" + v).hidden = v !== name; });
  window.scrollTo(0, 0);
}

function renderStatic() {
  const ph = phase(), months = CONFIG.deal.months;
  $("by").textContent = CONFIG.eyebrow;
  document.querySelectorAll("[data-eyebrow]").forEach(el => { el.textContent = CONFIG.eyebrow; });
  $("credit").textContent = "Created by " + CONFIG.author + ", " + CONFIG.brand + ".";
  if (CONFIG.logo) { const im = $("hl-logo"); im.onload = () => { im.hidden = false; }; im.src = CONFIG.logo; }
  $("deal-pill").hidden = ph === "none";
  $("deal-pill").textContent = dealLabel() + ": 50% off your first " + months + " months.";
  $("price-pills").innerHTML = ORDER.map(k => `<span>${CONFIG.plans[k].name} ${money(CONFIG.plans[k].price)}</span>`).join("");
  $("gate-text").textContent = ph === "none" ? CONFIG.optin.text.replace("the Black Friday price", "the price") : CONFIG.optin.text.replace("Black Friday", dealLabel());
  $("gate-fine").textContent = CONFIG.optin.fine;
  $("skip").hidden = !CONFIG.optin.allowSkip;
  $("claim").textContent = CONFIG.claimNote;
}

function renderQuestion() {
  const [q, opts] = QUESTIONS[current], n = answers.filter(a => a !== null).length;
  $("q-pos").textContent = "Question " + (current + 1) + " of " + N;
  $("q-count").textContent = n + " of " + N + " answered";
  $("fill").style.width = (n / N * 100) + "%";
  $("q-title").textContent = q;
  $("opts").innerHTML = opts.map(([label], j) =>
    `<button class="opt" type="button" id="opt${j}" data-o="${j}" aria-pressed="${answers[current] === j}">${esc(label)}</button>`).join("");
  $("back").disabled = current === 0;
  $("dots").innerHTML = QUESTIONS.map((_, i) => `<i class="${i === current ? "now" : answers[i] !== null ? "done" : ""}"></i>`).join("");
}

function renderResult() {
  const s = score(answers), key = s.plan, p = CONFIG.plans[key], ph = phase(), months = CONFIG.deal.months;
  const max = Math.max(1, ...ORDER.map(k => s.totals[k]));
  const hits = answers.filter((a, i) => QUESTIONS[i][1][a][1][key]).length;
  const why = [p.fit, ...s.notes, hits + " of your " + N + " answers pointed to " + p.name + "."];
  if (answers[6] === 1) why.push("The white-label mobile app is a separate paid add-on.");
  $("result").innerHTML = `<div class="result ${key}">
    <span class="tag">${lead.name ? esc(lead.name) + ", your best-fit plan" : "Your best-fit plan"}</span>
    <h2 id="result-title" tabindex="-1">${p.name}</h2>
    ${ph === "none"
      ? `<div class="price-row"><span class="now">${money(p.price)}<small>/mo</small></span></div>`
      : `<div class="price-row"><span class="now">${money(p.dealPrice)}<small>/mo</small></span><s>${money(p.price)}/mo</s><span class="badge">${dealLabel()}</span></div>
         <p class="save">You save ${money(p.save)} over ${months} months.</p>`}
    <span class="label">Why this plan fits you</span>
    <div class="why">${why.map(x => `<p>${esc(x)}</p>`).join("")}</div>
    <span class="label">What to set up first</span>
    <ol class="steps">${p.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
    <div class="bonus">
      <h3 class="bonus-title">Tracy's bonuses</h3>
      <ul>${p.bonus.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="limit">${esc(CONFIG.bonusNote)}</p>
    </div>
    <div class="ctas">
      <a class="btn btn-cta" href="${esc(signupLink())}" target="_blank" rel="noopener">Get ${p.name}${ph === "none" ? "" : " at 50% off"} →</a>
      ${CONFIG.links.booking ? `<a class="btn btn-ghost" href="${esc(CONFIG.links.booking)}" target="_blank" rel="noopener">Book a free 15-minute call with Tracy</a>` : ""}
    </div>
    <div class="bars">
      <span class="label">How you scored</span>
      ${ORDER.map(k => `<div class="bar${k === key ? " top" : ""}"><div><span>${CONFIG.plans[k].name}${k === key ? " ★" : ""}</span><span>${s.totals[k]} pts</span></div><span class="t"><i style="width:${s.totals[k] / max * 100}%"></i></span></div>`).join("")}
    </div>
  </div>`;
  $("deal-title").textContent = ph === "none" ? "All three plans" : "All three plans, " + dealLabel() + " pricing";
  $("tiles").innerHTML = ORDER.map(k => { const t = CONFIG.plans[k];
    return `<div class="tile ${k}${k === key ? " pick" : ""}"><b>${t.name}${k === key ? "<em>Your pick</em>" : ""}</b>
      <div class="now">${money(ph === "none" ? t.price : t.dealPrice)}<small>/mo</small>${ph === "none" ? "" : `<s>${money(t.price)}</s>`}</div><span>${esc(t.blurb)}</span></div>`; }).join("");
  const tail = " Usage (calls, texts, AI) is billed separately.";
  $("deal-text").textContent =
    ph === "bf" ? "Black Friday deal ends Sunday, Nov 29 at 11:59 PM PT. Cyber Week pricing runs Nov 30 to Dec 6." + tail :
    ph === "cw" ? "Cyber Week pricing ends Sunday, Dec 6 at 11:59 PM PT." + tail :
    "Black Friday and Cyber Week pricing have ended. These are the regular monthly prices." + tail;
  return s;
}

/* send the lead to GHL (only when a webhook is set). The page can't see whether GHL accepted it. */
function sendLead(s) {
  if (!CONFIG.optin.webhook) return;
  const p = CONFIG.plans[s.plan], ph = phase(), body = new URLSearchParams();
  body.set("name", lead.name); body.set("email", lead.email);
  body.set("plan", p.name);
  body.set("price", ph === "none" ? money(p.price) + "/mo" : money(p.dealPrice) + "/mo for " + CONFIG.deal.months + " months, then " + money(p.price) + "/mo");
  body.set("signup_link", signupLink());
  body.set("bonuses", p.bonus.join("; "));
  body.set("first_steps", p.steps.join("; "));
  body.set("scores", ORDER.map(k => CONFIG.plans[k].name + " " + s.totals[k]).join(", "));
  body.set("answers", QUESTIONS.map(([q, o], i) => (i + 1) + ". " + o[answers[i]][0]).join(" | "));
  body.set("source", "Plan Picker Scorecard");
  try { fetch(CONFIG.optin.webhook, {method: "POST", mode: "no-cors", body}).catch(() => {}); } catch (e) {}
}

function reveal(send) {
  const s = renderResult();
  if (send) sendLead(s);
  show("result"); $("result-title").focus({preventScroll: true});
}

/* Called once the page is in the browser. Returns a cleanup function. */
export function initScorecard() {
  const ac = new AbortController();
  const on = (id, type, fn) => $(id).addEventListener(type, fn, { signal: ac.signal });
  on("start", "click", () => { current = Math.max(0, answers.indexOf(null)); renderQuestion(); show("quiz"); });
  on("opts", "click", e => {
    const b = e.target.closest(".opt"); if (!b) return;
    answers[current] = +b.dataset.o; renderQuestion();
    setTimeout(() => {
      if (current < N - 1) { current++; renderQuestion(); $("q-title").focus({preventScroll: true}); }
      else if (answers.includes(null)) { current = answers.indexOf(null); renderQuestion(); }
      else { show("gate"); $("gate-title").focus({preventScroll: true}); }
    }, 260);
  });
  on("back", "click", () => { if (current > 0) { current--; renderQuestion(); } });
  on("gate-back", "click", () => { current = N - 1; renderQuestion(); show("quiz"); });
  on("skip", "click", () => { lead = {name: "", email: ""}; reveal(false); });
  on("gate-form", "submit", e => {
    e.preventDefault();
    const name = $("lead-name").value.trim(), email = $("lead-email").value.trim(), err = $("gate-err");
    const bad = !name ? "Add your first name." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Enter a valid email address." : "";
    err.hidden = !bad; err.textContent = bad;
    if (bad) { (name ? $("lead-email") : $("lead-name")).focus(); return; }
    lead = {name, email};
    reveal(!$("lead-site").value);
  });
  on("restart", "click", () => {
    answers.fill(null); current = 0; lead = {name: "", email: ""}; $("gate-form").reset(); $("gate-err").hidden = true; show("hero");
  });

  renderStatic(); show("hero");
  return () => ac.abort();
}
