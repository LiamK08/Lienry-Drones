import { safety } from "@/content/home";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

/** Safety by design: one black panel inset on white, the head left and six tiles right (3 by 2). */
export function SafetyPanel() {
  return (
    <Band id="safety" tone="plaster" pad="compact" labelledBy="safety-heading">
      <Container>
        <div className="on-dark grid gap-10 rounded-panel bg-night p-8 text-white md:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h2 id="safety-heading" className="text-h2">
              {safety.headline}
            </h2>
            <p className="mt-4 text-body text-white/70">{safety.body}</p>
            <Button href={safety.link.href} arrow className="mt-8">
              {safety.link.label}
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {safety.tiles.map((t) => (
              <li key={t.title} className="rounded-card border border-white/10 bg-white/[0.04] p-5">
                <span className="flex size-10 items-center justify-center rounded-pill bg-white/10 text-white">
                  <Icon name={t.icon} />
                </span>
                <p className="mt-4 text-small font-medium text-white">{t.title}</p>
                <p className="mt-1 text-caption text-white/60">{t.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Band>
  );
}
