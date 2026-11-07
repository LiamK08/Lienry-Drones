import type { ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";

type VisionBandProps = {
  id: string;
  /** The band's accessible name. */
  label: string;
  /** The opening sentence, set back in the muted white. */
  lead: string;
  /** The sentence it leads into, in white. */
  line: string;
  /** The closing sentence, under the display line in Inter. */
  close: string;
  name: string;
  title: string;
  image: ImageRef;
};

/**
 * The founder's statement (/company): a full-bleed still under a night scrim, and on it, centred on the
 * rail, a night panel (the panel corners, about 1000px) holding the statement as a quotation. The first two
 * sentences are one display line at the inner section step, PT Serif, the first set back in the muted
 * white; the third follows in Inter body; then the name and title. No italic: the band is named by its
 * label, not a heading. The still is decorative, so the scrim keeps every word on the panel's own night
 * whatever the frame shows.
 */
export function VisionBand({ id, label, lead, line, close, name, title, image }: VisionBandProps) {
  return (
    <Band id={id} tone="night" ariaLabel={label} className="isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Picture id={image.id} alt="" position={image.position} fit="fill" rounded="none" sizes="100vw" className="h-full" />
        <div className="absolute inset-0 bg-night/55" />
      </div>
      <Container>
        <figure className="on-dark mx-auto max-w-[64rem] rounded-panel bg-night px-6 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <blockquote>
            <p className="font-display text-h2s text-pretty text-white">
              <span className="text-white/60">{lead}</span> {line}
            </p>
            <p className="mt-6 max-w-[38rem] text-body leading-[1.6] text-white/85 md:mt-8">{close}</p>
          </blockquote>
          <figcaption className="mt-8 md:mt-10">
            <span className="block text-body font-medium leading-[1.4] text-white">{name}</span>
            <span className="block text-small leading-[1.5] text-white/70">{title}</span>
          </figcaption>
        </figure>
      </Container>
    </Band>
  );
}
