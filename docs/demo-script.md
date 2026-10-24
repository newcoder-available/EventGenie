# EventGenie — demo video script

A 90-second product demo, with a 60-second cut for reels and a 2-minute cut for judges who
want to see the engineering.

**How to use this.** The numbered shots are **screen recording** — that is where the product
actually lives, and no video model can fake a real dashboard convincingly. The prompts in
[Generated B-roll](#generated-b-roll) are for the three shots where a video model (Veo, Runway,
Sora, Kling) earns its place: the opening, the transition and the close. Cut them around the
capture.

Narration is timed at roughly 150 words per minute. Every number quoted below is what the app
actually shows in Guided Demo mode, so the voiceover and the screen agree.

---

## Before you record

Get the app into a known state or the numbers in the script will not match:

```bash
npm run dev
```

1. Open the app, then in the browser console:
   `Object.keys(localStorage).filter(k=>k.startsWith('eventgenie')).forEach(k=>localStorage.removeItem(k)); sessionStorage.clear()`
2. Reload. You should land on the occasion picker with nothing selected.
3. Record at **1440 × 900** or larger, 30fps. The layout is widest and calmest there.
4. Leave `ANTHROPIC_API_KEY` unset unless you want to show live streaming — Guided Demo mode is
   deterministic, so takes are repeatable. If you do set a key, the assistant's wording will
   differ from the script below.
5. Slow your cursor down. Demo footage is always too fast; you know where everything is and the
   viewer does not.

---

## The 90-second cut (recommended)

| # | Time | On screen | Narration |
|---|---|---|---|
| 1 | 0:00–0:06 | **Generated B-roll A** — see prompts below. Title card fades to the landing page. | "Every celebration runs on the same four things. Money, time, people, suppliers." |
| 2 | 0:06–0:14 | Landing page. Scroll slowly to the occasion grid. Let all seven tiles land. | "A wedding, a fortieth, an office offsite, a Diwali open house — the shape is identical. Only the words change." |
| 3 | 0:14–0:22 | Hover across three tiles so each previews its own accent. Click **Birthday**. | "So EventGenie starts by asking what you're planning…" |
| 4 | 0:22–0:30 | Sign-in page animates in: violet, balloons, a cake. Pause on it. Type a name, then the email. | "…and rebuilds itself around the answer. Different colour, different decoration, different checklist underneath." |
| 5 | 0:30–0:40 | Click through to the dashboard. Let the confetti land. Rest on the hero and the four KPI cards. | "Here's a fortieth in Pune. Forty-six days out, and the budget is already ninety-two percent committed." |
| 6 | 0:40–0:52 | Click **Budget Planner**. Hover two donut segments so the centre figure changes. Click **Add expense**, add *Photo booth, extra hour — Entertainment — 8,000*, save. Cut back to **Overview**: the card moves 92% → 96%, and "₹17,600 left" becomes "₹9,600 left". | "Every number comes from one place. Add a line here, and the card on the dashboard moves with it — because nothing keeps its own copy of the total." |
| 7 | 0:52–1:06 | **AI Planning Assistant**. Click *Help me cut the bar and catering budget*. Let the reply stream. | "The assistant can see the real plan. It isn't guessing — it's reading your actual categories and telling you which two have give in them." |
| 8 | 1:06–1:18 | Click **Create a 6-week birthday checklist** → **Generate**. The preview renders. Click **Apply to my plan**, then **Checklist** — the ten new tasks are there with AI badges. | "Ask it to plan, and you get real tasks with real dates — previewed first. Nothing touches your plan until you approve it." |
| 9 | 1:18–1:26 | Sidebar: click **change** next to the occasion chip. Pick **Wedding**. Dashboard reloads in burgundy with a marigold swag. | "Same product, different occasion. New palette, new decoration, new plan — and the old one is still there when you switch back." |
| 10 | 1:26–1:30 | **Generated B-roll C**, or hold on the wedding dashboard. End card: *EventGenie · github.com/newcoder-available/EventGenie* | "EventGenie. One planner, every celebration." |

**Word count:** ~215. If your read runs long, cut the second sentence of shot 7 first.

---

## The 60-second cut

Keep shots **1, 3, 4, 5, 8, 9, 10**. Drop the budget demo and the chat reply — the generate-and-apply
beat in shot 8 is the one that lands hardest, so protect it.

Trim the narration to:

> "Every celebration runs on the same four things: money, time, people, suppliers.
> EventGenie asks what you're planning — and rebuilds itself around the answer.
> Here's a fortieth: forty-six days out, the budget already ninety-two percent committed.
> Ask the planner for a checklist and you get real tasks with real dates — previewed first,
> applied only when you say so.
> Switch occasion, and the whole product changes with you.
> EventGenie. One planner, every celebration."

---

## The 2-minute cut, for judges

Run the 90-second cut, then add these three beats before the end card. They are the parts that
distinguish this from a template.

| # | Time | On screen | Narration |
|---|---|---|---|
| 11 | 1:30–1:44 | Budget Planner, slowly scrolling the donut and the category rollup. Then switch occasion and return to Budget — the chart colours are unchanged. | "The chart palette doesn't follow the theme. Those eight hues were validated as a set for contrast and colourblind separation — so the brand changes and the data doesn't." |
| 12 | 1:44–1:56 | Terminal: `npm run selftest`, all twenty-two passing. Hold on the list. | "Twenty-two tests cover the parts that fail quietly: redaction, prompt fencing, the budget arithmetic, and whether any occasion borrows another's vocabulary." |
| 13 | 1:56–2:04 | Split: `.env.example` on one side, the assistant answering on the other with no key set. | "And it runs with no API key at all. A deterministic planner answers instead, so the whole product demos offline." |

---

## The numbers, checked

Quoted figures come from a fresh Guided Demo state. If you change the expense in shot 6, work
out the new percentage first — the budgets differ per occasion and it is easy to carry a figure
across from the wrong one.

| Occasion | Total | Committed | Utilisation | After +₹8,000 |
| --- | --- | --- | --- | --- |
| Birthday | ₹2,20,000 | ₹2,02,400 | 92% | 96% (₹9,600 left) |
| Wedding | ₹15,00,000 | ₹13,71,487 | 91% | 92% |

On the birthday plan a ₹60,000 line would push committed spend to **119%** and trip the
over-budget banner. That is a legitimate thing to demo — it shows the warning state — but it is
a different beat from "watch the card tick up", so pick one.

---

## Generated B-roll

Three shots where a video model is the right tool. Keep them **short** — they frame the demo,
they are not the demo. Ask for no on-screen text: models garble it.

### A — opening, 0:00–0:06

```
Slow push-in on an empty table at golden hour, warm ivory linen, scattered
marigold petals and a few unlit tea lights. Soft natural window light from the
left, shallow depth of field, gentle dust motes. Nobody in frame. Calm,
unhurried, editorial. Warm ivory and deep burgundy palette. No text, no logos,
no people. 24fps, subtle handheld drift.
```

### B — optional transition, between shots 9 and 10

```
Macro shot, overhead: a single marigold flower on ivory linen dissolving into a
cluster of violet balloons, then into a lit clay diya. Continuous slow crossfade,
each object centred, same lighting and same ivory background throughout. Warm,
soft, editorial. No text, no people, no hands.
```

This is the one generated shot that earns its keep — it says *one product, many occasions*
faster than any UI cut can.

### C — close, 1:26–1:30

```
Slow pull-back from a warmly lit terrace at dusk, strings of small bulbs
overhead, empty chairs around a long table, soft bokeh. Nobody in frame. Warm
amber and deep rose palette, cinematic, calm. No text, no logos, no people.
```

Lay the end card over this in your editor rather than asking the model for text.

---

## Accuracy guardrails

Things the footage could imply that are not true. Worth avoiding in the voiceover:

- **The vendors are invented.** Names, prices and ratings are sample data. Don't say "browse
  real vendors" or imply anyone is contacted. "Mark as booked" updates your own tracker and
  notifies nobody.
- **Sign-in is a demo.** No account, no password, no server. Don't call it "secure login" —
  call it what it is, or skip it in the narration.
- **Figures are planning estimates, not quotes.** The app says so on the budget page; the video
  shouldn't claim otherwise.
- **Guided Demo mode is not the model.** If you record without a key, don't present the
  assistant's replies as Claude's output. Either set a key for the recording, or say "built-in
  planner" once.
- **Nothing is stored server-side.** If you want to make a privacy point, the true one is
  stronger than a vague one: the plan lives in your browser, and guest names are never sent to
  the model at all.

---

## Shot-list checklist

```
[ ] localStorage cleared, landing page fresh
[ ] Recording at 1440x900 or larger
[ ] Cursor movement slowed
[ ] Confetti captured on first dashboard entry (it fires once per session)
[ ] Budget: expense added and the KPI card change captured in the same take
[ ] Assistant: generate -> preview -> apply -> checklist, uncut
[ ] Occasion switch captured without a page flash
[ ] B-roll A and C rendered and colour-matched to the ivory UI
[ ] Voiceover under 220 words for the 90s cut
```
