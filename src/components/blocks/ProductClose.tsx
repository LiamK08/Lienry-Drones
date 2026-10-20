import type { Action } from "@/lib/types";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

/** The platform's close: a centred line, a short paragraph and a pill over the working software window. */
export function ProductClose({ id, headline, body, action }: { id: string; headline: string; body: string; action: Action }) {
  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 id={`${id}-heading`} className="text-h2s">
            {headline}
          </h2>
          <p className="mt-4 text-body text-fg-muted">{body}</p>
          <Button href={action.href} arrow className="mt-8">
            {action.label}
          </Button>
        </div>
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 -top-10 bottom-0 -z-10 rounded-pill bg-accent/10 blur-3xl" />
          <div className="overflow-hidden rounded-card border border-line bg-white p-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.3)]">
            <SoftwareWindow />
          </div>
        </div>
      </Container>
    </Band>
  );
}
