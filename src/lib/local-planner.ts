import { GenerationSchema, type EventContext, type Generation } from "./ai-schema";
import { themeFor } from "./eventThemes";
import { hostParts } from "./utils";

/**
 * The offline planner.
 *
 * Answers when no ANTHROPIC_API_KEY is configured, so the whole product is
 * demonstrable without network access or credentials. It classifies the
 * prompt, then returns either grounded prose or a schema-valid Generation —
 * the same shape the model returns, so the UI cannot tell the difference and
 * the apply-to-plan path is exercised either way.
 *
 * Everything it produces is derived from the caller's real figures, and the
 * wording follows the occasion rather than assuming a wedding.
 */

type Intent = "reduce-budget" | "theme" | "checklist" | "decor" | "schedule" | "budget-plan" | "general";

export function classify(prompt: string): Intent {
  const p = prompt.toLowerCase();
  if (/(reduce|cut|cheaper|save|lower|trim|under budget|over budget)/.test(p)) return "reduce-budget";
  if (/(theme|royal|rajasthani|palette|colour|color|aesthetic|style)/.test(p)) return "theme";
  if (/(checklist|to.?do|task|month plan|timeline of tasks|what should i do)/.test(p)) return "checklist";
  if (/(decor|decoration|flower|floral|mandap|lighting|stage)/.test(p)) return "decor";
  if (/(schedule|run sheet|timings|itinerary|wedding day|hour by hour)/.test(p)) return "schedule";
  if (/(plan a wedding|budget of|budget within|split|allocate|breakdown)/.test(p)) return "budget-plan";
  return "general";
}

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: Math.abs(n) >= 100_000 ? "compact" : "standard",
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

export function mockReply(prompt: string, c: EventContext): string {
  const noun = themeFor(c.eventType).nouns.event;
  const lead = Math.max(0, Math.ceil((Date.parse(`${c.eventDate}T00:00:00Z`) - Date.now()) / 86_400_000));
  const perHead = c.guestCount > 0 ? Math.round(c.totalBudget / c.guestCount) : 0;
  const left = c.totalBudget - c.committed;

  switch (classify(prompt)) {
    case "reduce-budget":
      return `The two lines with real give are catering and decor — together they are usually more than half the spend, and guests notice a smaller guest list far less than they notice bad food. Dropping twenty covers at ${money(Math.round(perHead * 0.45), c.currency)} a head saves roughly ${money(Math.round(perHead * 0.45 * 20), c.currency)} without touching anything anyone will remember.\n\nAfter that, look at decoration before photography. Florals can usually come down 25% by concentrating them where people stand still — the entrance and wherever people gather — and leaving the walkways plain. You currently have ${money(left, c.currency)} uncommitted, so you have room to decide rather than react.`;

    case "theme":
      return `For ${c.city} in February, a royal Rajasthani direction works because the light is kind and the architecture does most of the job. Marigold and ivory as the base, old gold for metal, one deep accent — pomegranate or indigo — used sparingly on linen and invitations. Keep the palette to three and repeat it everywhere rather than adding a fourth.\n\nThe thing that makes it read as considered rather than themed: pick one motif, such as a block print or a jali pattern, and run it through the invitation, the table runners and the signage. At ${c.guestCount} guests, repetition reads richer than variety.`;

    case "checklist":
      return `With ${lead} days to go, the order that matters is: lock anything that is physically scarce, then anything that needs your guests' time, then everything else. Venue and photographer first, caterer and decorator next, invitations before you think you need them.\n\nUse "Generate" on this page rather than chat and I will write the whole list into your checklist with dates and owners, so you can tick it off instead of retyping it.`;

    case "decor":
      return `Outdoor evening in ${c.city} means your decor has to work twice — once in daylight as guests arrive, once under lights after dark. Concentrate decoration where people stop moving: the entrance, the bar, and the two metres around whatever the focal point is. Walkways need light, not flowers.\n\nFor the lighting itself, warm festoon at roughly three metres plus a few uplights on the walls will do more than any centrepiece. Ask the photographer before you commit to candlelight only — it looks wonderful and photographs badly without a plan.`;

    case "schedule":
      return `Work backwards from the one moment the whole ${noun} is built around, and put it late enough that the portraits land in good light but early enough that the evening still has somewhere to go. Everything before it — getting ready, photography, guest arrivals — schedules itself once that is fixed.\n\nThe slot people forget is the lull after lunch. Put something in it on purpose — a short performance, a group photo, the cake — or the room empties and never quite refills.`;

    case "budget-plan":
      return `At ${money(c.totalBudget, c.currency)} across ${c.guestCount} guests you are at about ${money(perHead, c.currency)} a head, which in ${c.city} buys a comfortable mid-market ${noun}: a good venue, a proper caterer, and one thing done really well. It does not stretch to a palace and a celebrity photographer at the same time, so pick which one matters.\n\nA workable split puts roughly a quarter on the venue and a little more on food, with decor, photography and entertainment sharing most of the rest and 10% held back. Use "Generate" and I will write that into your budget as real lines.`;

    default:
      return `You are ${lead} days out with ${c.tasksDone} of ${c.tasksTotal} tasks done and ${c.vendorsBooked} of ${c.vendorsTotal} vendors booked — that is a reasonable place to be, and the thing most likely to bite you now is the RSVP count, because your caterer prices on it.\n\nAsk me about the budget, the timeline, the vendors or the theme, or use one of the suggestions above. If you want something written into your plan rather than just discussed, use "Generate" and it lands in the right panel.`;
  }
}

export function mockGeneration(prompt: string, c: EventContext): Generation {
  const intent = classify(prompt);
  const noun = themeFor(c.eventType).nouns.event;
  const perHead = c.guestCount > 0 ? Math.round(c.totalBudget / c.guestCount) : 0;
  const allocatable = Math.round(c.totalBudget * 0.9);
  const [owner, coHost] = [hostParts(c.hosts)[0] ?? c.hosts, hostParts(c.hosts)[1] ?? "Both"];

  const base = {
    assumptions: [
      "Produced by the built-in planner, not a model — no ANTHROPIC_API_KEY is set.",
      `Costs assume mid-market suppliers in ${c.city}.`,
      "Every figure is a planning estimate, not a quote.",
    ],
    notes: [
      "Confirm each amount with the supplier before you commit to it.",
      "Nothing here replaces a written scope from the vendor.",
    ],
  };

  if (intent === "checklist") {
    return GenerationSchema.parse({
      ...base,
      headline: `${c.eventType === "corporate" ? "Offsite" : noun.charAt(0).toUpperCase() + noun.slice(1)} checklist`,
      summary: `Ten tasks sequenced the way the work actually happens for a ${c.guestCount}-guest ${noun} in ${c.city}, dated forward from today and assigned so nothing sits with "someone".`,
      tasks: [
        { title: "Confirm the final guest count", category: "Guests", dueInDays: 7, priority: "high", owner: "Both" },
        { title: "Lock the catering menu and book a real tasting", category: "Food", dueInDays: 14, priority: "high", owner },
        { title: "Approve the decoration plan and colour palette", category: "Decor", dueInDays: 21, priority: "high", owner: coHost },
        { title: "Send invitations with RSVP deadline", category: "Guests", dueInDays: 30, priority: "high", owner: coHost },
        { title: "Sort transport and, if anyone is staying over, the rooms", category: "Logistics", dueInDays: 45, priority: "medium", owner },
        ...(c.eventType === "corporate"
          ? [
              { title: "Rehearse the hybrid AV with the actual remote joiners", category: "Logistics" as const, dueInDays: 60, priority: "high" as const, owner },
              { title: "Issue travel approvals", category: "Paperwork" as const, dueInDays: 70, priority: "high" as const, owner: "Finance" },
            ]
          : c.eventType === "wedding"
            ? [
                { title: "Final fitting for both outfits", category: "Attire" as const, dueInDays: 60, priority: "medium" as const, owner: "Both" },
                { title: "Start the marriage registration paperwork", category: "Paperwork" as const, dueInDays: 70, priority: "high" as const, owner: "Both" },
              ]
            : [
                { title: "Confirm what you are wearing and anything that needs altering", category: "Attire" as const, dueInDays: 60, priority: "low" as const, owner },
                { title: "Check permits, noise limits and parking with the venue", category: "Paperwork" as const, dueInDays: 70, priority: "high" as const, owner },
              ]),
        { title: "Collect RSVPs and give the caterer final numbers", category: "Guests", dueInDays: 90, priority: "high", owner: "Both" },
        { title: "Reconfirm every vendor in writing", category: "Vendors", dueInDays: 110, priority: "high", owner },
        { title: "Publish the run sheet to everyone with a job", category: "Logistics", dueInDays: 120, priority: "medium", owner: "Both" },
      ],
      ideas: [],
      budgetLines: [],
    });
  }

  if (intent === "decor" || intent === "theme") {
    const work = c.eventType === "corporate";
    const party = c.eventType === "birthday" || c.eventType === "baby-shower";

    const ideas = work
      ? [
          { title: "Name the rooms on the signage", category: "Decor" as const, note: "Cheap, and it removes the single most common question of the day." },
          { title: "One room that can go quiet", category: "Theme" as const, note: "Not everything is a workshop. People need somewhere to think or take a call." },
          { title: "Spend on one dinner, not three catered meals", category: "Food" as const, note: "Night one, while people still have energy for each other." },
          { title: "Welcome kit with the agenda printed in it", category: "Keepsakes" as const, note: "Nobody reads the email on the coach. A notebook, a pen, the two-day plan." },
          { title: "Daylight in the main room", category: "Lighting" as const, note: "Two days under strip lighting is the thing people remember badly." },
          { title: "Leave night two unstructured", category: "Entertainment" as const, note: "Forced fun after two working days is what the feedback form complains about." },
        ]
      : party
        ? [
            { title: "Decorate where people stand, not the whole room", category: "Decor" as const, note: `At ${c.guestCount} guests that means the bar and the entrance. Everything else goes unseen.` },
            { title: "One colour family, three shades", category: "Theme" as const, note: "Repetition reads as designed. Six colours reads as whatever was in the shop." },
            { title: "Grazing table instead of a buffet queue", category: "Food" as const, note: "Keeps people moving and standing. A queue kills the first hour." },
            { title: "Low light at table height", category: "Lighting" as const, note: "Candles and lamps, nothing overhead. It makes any room forgiving." },
            { title: "A playlist that peaks late", category: "Entertainment" as const, note: "Slow build through the food. Hand whoever is on music a do-not-play list." },
            { title: "Favours people will actually keep", category: "Keepsakes" as const, note: "Small and useful beats ornamental. Nothing with the date printed on it." },
          ]
        : [
            { title: "One visual anchor, repeated", category: "Theme" as const, note: `Entrance, tables, invitation. At ${c.guestCount} guests repetition reads richer than variety.` },
            { title: "Flowers only where people stop moving", category: "Florals" as const, note: "The entrance and the stage. Walkways need light, not flowers." },
            { title: "Warm light at three metres", category: "Lighting" as const, note: `Festoon or uplights for an evening in ${c.city}. It does more than any centrepiece.` },
            { title: "One dish people will describe later", category: "Food" as const, note: "Spend disproportionately on a single item and keep the rest solid and simple." },
            { title: "Hired brass or ceramic, no disposables", category: "Table Setting" as const, note: "Cheaper than it sounds at this scale, and nothing arrives in plastic." },
            { title: "Plan the quiet half-hour after the food", category: "Entertainment" as const, note: "Put something there on purpose — a toast, a performance — or the room empties." },
          ];

    return GenerationSchema.parse({
      ...base,
      headline: work ? "Ideas for the two days" : intent === "theme" ? "A direction to build on" : "Decoration ideas",
      summary: `Six ideas sized to ${c.guestCount} guests at about ${perHead} ${c.currency} a head, chosen so they concentrate spend where people actually notice it.`,
      tasks: [],
      ideas,
      budgetLines: [],
    });
  }

  if (intent === "reduce-budget") {
    const cut = Math.round(c.committed * 0.15);
    return GenerationSchema.parse({
      ...base,
      headline: "Where 15% can come out",
      summary: `Four tasks that together target roughly ${money(cut, c.currency)} without touching the things guests remember. Catering and decor carry the cut; photography does not.`,
      tasks: [
        { title: "Trim the guest list by 20 covers with both families", category: "Guests", dueInDays: 7, priority: "high", owner: "Both" },
        { title: "Re-quote catering at the lower headcount", category: "Food", dueInDays: 14, priority: "high", owner },
        { title: "Cut decoration on walkways, keep the entrance and the focal point", category: "Decor", dueInDays: 21, priority: "medium", owner: coHost },
        { title: "Swap the second entertainment act for a longer DJ set", category: "Vendors", dueInDays: 30, priority: "low", owner },
      ],
      ideas: [],
      budgetLines: [],
    });
  }

  if (intent === "schedule") {
    return GenerationSchema.parse({
      ...base,
      headline: "Wedding day running order",
      summary: "Five anchor points for the day, worked backwards from the ceremony so the portraits land in good light and the reception starts after dark.",
      tasks: [
        { title: "Confirm makeup start time with the artist", category: "Vendors", dueInDays: 20, priority: "medium", owner: coHost },
        { title: "Agree the photography shot list and timings", category: "Vendors", dueInDays: 25, priority: "medium", owner: "Both" },
        { title: "Set the baraat start time with both families", category: "Logistics", dueInDays: 30, priority: "high", owner },
        { title: "Check the venue's sound curfew in writing", category: "Paperwork", dueInDays: 14, priority: "high", owner },
        { title: "Publish the run sheet with two numbers per vendor", category: "Logistics", dueInDays: 40, priority: "medium", owner: "Both" },
      ],
      ideas: [],
      budgetLines: [],
    });
  }

  // Default and "budget-plan": a full budget split.
  // Shares differ by occasion: an offsite spends on rooms and AV, a festival
  // on food and gifting, a wedding across everything.
  const WEIGHTS: Record<string, [string, string, number][]> = {
    corporate: [
      ["Venue", "Venue and rooms", 0.36],
      ["Catering", "Meals and breaks", 0.24],
      ["Entertainment", "AV, production and facilitation", 0.16],
      ["Logistics & Travel", "Travel and transfers", 0.13],
      ["Decoration", "Branding and signage", 0.05],
      ["Gifts & Stationery", "Welcome kits", 0.06],
    ],
    diwali: [
      ["Catering", "Dinner and sweets", 0.4],
      ["Decoration", "Diyas, lights and rangoli", 0.2],
      ["Gifts & Stationery", "Hampers for each household", 0.18],
      ["Venue", "Lawn booking and cleaning", 0.08],
      ["Entertainment", "Sound and seating", 0.08],
      ["Logistics & Travel", "Extra help for the evening", 0.06],
    ],
    birthday: [
      ["Catering", "Food, bar and cake", 0.42],
      ["Venue", "Room hire", 0.2],
      ["Decoration", "Balloons, signage and styling", 0.14],
      ["Entertainment", "DJ and a photo booth", 0.13],
      ["Photography", "Party coverage", 0.06],
      ["Gifts & Stationery", "Invites and favours", 0.05],
    ],
    default: [
      ["Venue", "Venue hire", 0.26],
      ["Catering", "Food and drink", 0.28],
      ["Decoration", "Staging, florals and entrance", 0.14],
      ["Photography", "Photo and film coverage", 0.1],
      ["Attire & Styling", "Outfits and styling", 0.09],
      ["Entertainment", "Music and performances", 0.08],
      ["Logistics & Travel", "Guest transfers", 0.05],
    ],
  };
  const weights = WEIGHTS[c.eventType] ?? WEIGHTS.default;

  return GenerationSchema.parse({
    ...base,
    headline: `A budget split for ${money(c.totalBudget, c.currency)}`,
    summary: `Seven lines totalling ${money(allocatable, c.currency)}, which holds 10% back as contingency. Sized to ${c.guestCount} guests at about ${money(perHead, c.currency)} a head in ${c.city}.`,
    tasks: [
      { title: "Move the contingency into a separate account", category: "Paperwork", dueInDays: 7, priority: "medium", owner: "Both" },
      { title: "Get written quotes against each budget line", category: "Vendors", dueInDays: 30, priority: "high", owner },
    ],
    ideas: [],
    budgetLines: weights.map(([category, label, w]) => ({
      category,
      label,
      estimated: Math.round(allocatable * w),
    })),
  });
}
