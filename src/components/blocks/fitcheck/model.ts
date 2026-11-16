import { fitCheck } from "@/content/home";

// The fit check's sums and tones, apart from its components: the questions, the score out of 100, the
// ceiling the building answers set, the verdict and the points to talk through.

export type Answer = (typeof fitCheck.answers)[number]["id"];
export type Zone = (typeof fitCheck.panel.zones)[number]["id"];
export type Question = (typeof fitCheck.groups)[number]["questions"][number];
export type Answers = Record<string, Answer>;
export type Verdict = (typeof fitCheck.panel.verdicts)[number];

export const all: Question[] = fitCheck.groups.flatMap((g) => g.questions);
export const { zones, verdicts } = fitCheck.panel;
/** The group a question belongs to ("The building", "The clean"): part of the status row. */
export const groupOf = (q: Question) => fitCheck.groups.find((g) => g.questions.some((x) => x.id === q.id))?.label ?? "";
export const labelOf = (a: Answer) => fitCheck.answers.find((x) => x.id === a)?.label ?? "";
export const zoneLabel = (z: Zone) => zones.find((x) => x.id === z)?.label ?? "";

const scoreOf = (a: Answer) => fitCheck.answers.find((x) => x.id === a)?.score ?? 0;

/** The weighted sum: each question's weight, in full for a Yes and by half for a Partly. */
const percent = (answers: Answers) => Math.round(all.reduce((s, q) => s + (answers[q.id] ? q.weight * scoreOf(answers[q.id]) : 0), 0));
const BUILDING = new Set<string>(fitCheck.groups[0].questions.map((q) => q.id));
/**
 * The ceiling the building answers set. Those three are hard requirements: a No there holds the score
 * (and so the verdict) under the middle zone, a Partly under the high one.
 */
const capOf = (answers: Answers) => {
  const building = [...BUILDING].map((id) => answers[id]);
  return building.includes("no") ? 39 : building.includes("partly") ? 74 : 100;
};
/** The score out of 100 as shown: the weighted sum under the building answers' ceiling, so the score, the bar and the verdict always agree. */
export const scoreFor = (answers: Answers) => Math.min(percent(answers), capOf(answers));
/**
 * The verdict for the answers so far. All seven answered, it is the score's; partway, it is judged on
 * the share of the weight answered (under the same ceiling), so a first Yes never reads as a poor fit.
 */
export function verdictFor(answers: Answers): Verdict {
  const asked = all.filter((q) => answers[q.id]);
  const weight = asked.reduce((s, q) => s + q.weight, 0);
  const share = weight ? Math.round((percent(answers) / weight) * 100) : 0;
  const pct = asked.length === all.length ? scoreFor(answers) : Math.min(share, capOf(answers));
  return verdicts.find((v) => pct >= v.min) ?? verdicts[verdicts.length - 1];
}
/** The points to talk through, three at most: every No in question order, then the Partlys, the building's first. */
export const gapsOf = (answers: Answers) => {
  const nos = all.filter((q) => answers[q.id] === "no");
  const partlys = all.filter((q) => answers[q.id] === "partly").sort((a, b) => b.weight - a.weight);
  return [...nos, ...partlys].slice(0, 3);
};

// A chosen answer takes its own tone: Yes the accent tint, Partly the warm debris tone, No a soft red.
// The chosen pill also takes a solid edge in its own tone (6:1 or more on white) and the heavier weight,
// so the choice never rests on colour alone. `edge` and `fill` also paint a switch's gliding marker.
export const tone: Record<Answer, { edge: string; fill: string; text: string }> = {
  yes: { edge: "border-accent", fill: "bg-tint", text: "text-accent" },
  partly: { edge: "border-debris-text", fill: "bg-fit-partly-soft", text: "text-debris-text" },
  no: { edge: "border-fit-no", fill: "bg-fit-no-soft", text: "text-fit-no" },
};
export const chosen = (a: Answer) => `${tone[a].edge} ${tone[a].fill} font-semibold ${tone[a].text}`;
export const forced = "forced-colors:forced-color-adjust-none forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]";

// The score bar's zones: the pale track of each, its fill while the score sits in it, and its label.
export const zoneTone: Record<Zone, { track: string; fill: string; text: string }> = {
  low: { track: "bg-fit-no-soft", fill: "bg-fit-no-bar", text: "text-fit-no" },
  mid: { track: "bg-fit-partly-soft", fill: "bg-debris", text: "text-debris-text" },
  high: { track: "bg-tint", fill: "bg-accent", text: "text-accent" },
};
