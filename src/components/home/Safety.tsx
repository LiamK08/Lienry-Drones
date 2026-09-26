import { safety } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack } from "@/components/ui/SnapTrack";

// A cell: a top rule, 24, then the content. From 1024 the cells abut in a ruled row, each with a rule
// below as well and 24px padding all round; the rule between two cells is drawn by the later cell's
// ::before, so it takes no width and all four renders stay 300px wide.
const cell = [
  "relative flex flex-col border-t border-plaster/20 pt-6",
  "lg:border-b lg:p-6",
  "lg:not-first:before:absolute lg:not-first:before:inset-y-0 lg:not-first:before:left-0 lg:not-first:before:w-px lg:not-first:before:bg-plaster/20",
].join(" ");

/**
 * Safety by design, on an ink plate. The heading sits beside the plain status line, which stands
 * where a certification list would, then come the four design details. From 1024 they are four
 * equal cells in a ruled row: a rule above and below the row and between the cells, 24px padding,
 * and in each cell the title, 8, the body, then its detail render at 4:3 pinned to the foot with at
 * least 24 above it, so the renders line up along the bottom. Below 1024 the cells run on a snap
 * track, each under a top rule, with the same anatomy.
 */
export function Safety() {
  return (
    <Band id="safety" tone="ink" pad="plate" labelledBy="safety-heading">
      <Container>
        <SectionHead id="safety-heading" tone="dark" headline={safety.headline} aside={{ intro: safety.note }} />
        {/* The row rises in as one piece so its rules stay continuous. SnapTrack's grid (from 1024)
            has 24px gutters; the ruled cells abut with a rule between them, so the gutter is zeroed. */}
        <Reveal className="mt-8 lg:[&_ul]:gap-0">
          <SnapTrack tone="dark" columns={4} label={safety.track.label} prevLabel={safety.track.prevLabel} nextLabel={safety.track.nextLabel}>
            {safety.items.map((item) => (
              <li key={item.id} className={cell}>
                <h3 className="text-h3">{item.title}</h3>
                <p className="mt-2 text-small text-muted-on-dark">{item.body}</p>
                <Picture
                  id={item.id}
                  alt={item.title}
                  aspect="4/3"
                  sizes="(min-width: 1440px) 300px, (min-width: 1024px) calc(25vw - 60px), (min-width: 768px) 44vw, 80vw"
                  className="mt-auto pt-6"
                />
              </li>
            ))}
          </SnapTrack>
        </Reveal>
      </Container>
    </Band>
  );
}
