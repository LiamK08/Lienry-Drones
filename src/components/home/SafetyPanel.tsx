import { safety } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

/**
 * Safety by design: one black panel. From 1200 it is inset on white with the head on the left, its
 * heading at the top and its pill level with the tiles' foot, beside six tiles (3 by 2, equal rows).
 * Below 1200 the panel runs edge to edge and the head stacks above the tiles (3 across from 768, 2 on
 * a phone). Each tile holds an icon disc, a title and a short note. The pill turns white on hover.
 */
export function SafetyPanel() {
  return (
    <Band id="safety" tone="plaster" pad="compact" labelledBy="safety-heading">
      <Container>
        <div className="on-dark -mx-(--page-margin) grid gap-10 bg-night px-(--page-margin) py-10 text-white md:p-10 min-[75rem]:mx-0 min-[75rem]:grid-cols-[1fr_1.2fr] min-[75rem]:items-stretch min-[75rem]:rounded-panel min-[75rem]:p-14">
          <div className="flex flex-col items-start">
            <h2 id="safety-heading" className="text-h2">
              {safety.headline}
            </h2>
            <p className="mt-4 text-body text-white/70">{safety.body}</p>
            <Button href={safety.link.href} arrow invert className="mt-8 min-[75rem]:mt-auto">
              {safety.link.label}
            </Button>
          </div>
          <ul className="grid auto-rows-fr grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
            {safety.tiles.map((t) => (
              <li key={t.title} className="rounded-card bg-white/[0.06] p-4 md:p-5">
                <span className="flex size-12 items-center justify-center rounded-pill bg-white/10 text-white">
                  <Icon name={t.icon} className="size-6" />
                </span>
                <p className="mt-3.5 text-[0.9375rem] font-medium leading-[1.3] text-white md:text-body">{t.title}</p>
                <p className="mt-1 text-caption text-white/60 md:text-small">{t.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Band>
  );
}
