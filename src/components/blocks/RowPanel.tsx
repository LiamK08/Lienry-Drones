import { project, rowPanels, solarProject, solarZones } from "@/content/software";
import { CardPanelStill, Rows, Shell, Tick } from "@/components/home/DemoPanels";

export type RowPanelId = "between-cleans" | "more-often" | "ground-pod" | "right-pressure" | "row-schedule";

/** Every row stands at its last beat: nothing here plays, appears or counts. */
const DONE = 9;

function BetweenCleans() {
  const p = rowPanels.betweenCleans;
  return (
    <Shell size="row" label={p.label} title={p.title} sub={p.sub}>
      <Rows beat={DONE} items={p.rows.map((text) => ({ text }))} />
      <span className="mt-auto flex items-center justify-between rounded-[0.5rem] bg-paper px-2.5 py-2 text-caption leading-tight">
        <span className="text-muted">{p.next}</span>
        <span className="font-medium">{project.nextClean}</span>
      </span>
    </Shell>
  );
}

function GroundPod() {
  const p = rowPanels.groundPod;
  return (
    <Shell size="row" label={p.label} title={p.title} sub={p.sub}>
      <Rows beat={DONE} items={p.rows.map((text) => ({ text }))} />
    </Shell>
  );
}

function RowSchedule() {
  const p = rowPanels.rowSchedule;
  return (
    <Shell size="row" label={p.label} title={p.title} sub={solarProject.name}>
      <ul className="flex flex-col">
        {solarZones.map((z, i) => {
          const washed = i < p.washed;
          return (
            <li key={z.id} className="flex items-center gap-2.5 border-b border-line py-[0.3125rem] text-caption leading-tight last:border-b-0">
              <Tick waiting={!washed} />
              <span className={`min-w-0 flex-1 ${washed ? "text-ink" : "text-muted"}`}>{z.name}</span>
              <span className="shrink-0 text-muted">{washed ? p.states.washed : p.states.queued}</span>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

/**
 * A feature row's still status card: coded from the software's demo data (src/content/software.ts), a
 * white card with the card corners, its title, a muted line and the Demo data tag, read as one image
 * (role="img" with its label). It never plays: no interval, nothing appears, widens or counts up, and the
 * debris amber appears only where the re-scan week marks debris. FeatureRows lays it over the row's
 * picture from 1280, and under it, overlapping its foot, below.
 */
export function RowPanel({ id, solarFirst = false }: { id: RowPanelId; solarFirst?: boolean }) {
  switch (id) {
    case "between-cleans":
      return <BetweenCleans />;
    case "ground-pod":
      return <GroundPod />;
    case "row-schedule":
      return <RowSchedule />;
    case "more-often":
      return <CardPanelStill id="repeat" />;
    case "right-pressure":
      return <CardPanelStill id="sliders" solarFirst={solarFirst} />;
  }
}
