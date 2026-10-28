import { safety } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

/**
 * Safety by design: one pale accent panel on white, on the rail, so the dark Explore band above stays
 * the page's one dark band before the footer. From 1200 the head stands on the left, centred against
 * six tiles (3 by 2, equal rows) with its pill right under the lead; below 1200 the head stacks above
 * the tiles (3 across from 768, 2 on a phone). Each tile is a white card with a hairline edge: an icon
 * disc, a title and a short note.
 */
export function SafetyPanel() {
  return (
    <Band id="safety" tone="plaster" pad="compact" labelledBy="safety-heading">
      <Container>
        <div className="grid gap-8 rounded-panel bg-tint p-5 md:gap-10 md:p-10 min-[75rem]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] min-[75rem]:items-center min-[75rem]:gap-16 min-[75rem]:p-14">
          <div className="flex flex-col items-start">
            <h2 id="safety-heading" className="text-h2">
              {safety.headline}
            </h2>
            <p className="mt-4 text-lead text-fg-muted">{safety.body}</p>
            <Button href={safety.link.href} arrow className="mt-8">
              {safety.link.label}
            </Button>
          </div>
          <ul className="grid auto-rows-fr grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
            {safety.tiles.map((t) => (
              <li key={t.title} className="rounded-card border border-line bg-white p-4 md:p-5">
                <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-pill bg-tint text-accent">
                  <Icon name={t.icon} className="size-6" />
                </span>
                <p className="mt-4 text-[0.9375rem] font-medium leading-[1.35] text-ink md:text-body">{t.title}</p>
                <p className="mt-1 text-caption text-muted md:text-small">{t.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Band>
  );
}
