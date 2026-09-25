import { visionLetter } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";

/**
 * The founder's letter, in the slot where a reference site places a testimonial. There is no
 * portrait, signature or office photograph (no real photo exists and no generated people are
 * allowed): the name is set in Inter, and the side image is the street render.
 *
 * From 1024 both columns run the full height of the row and end on the same line: the heading at
 * the top of columns 1-5 with the image at their foot, and the letter in 7-12 with the sign-off
 * at its foot. Below 1024: heading, 24, letter, 24, sign-off, 24, image.
 */
export function FounderBand() {
  const { headline, paragraphs, signature, image } = visionLetter;
  return (
    <Band id="founder" tone="sunken" pad="plate" labelledBy="founder-heading">
      <Container>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-x-6">
          {/* Below 1024 this column dissolves so its heading and image can sit either side of the letter. */}
          <div data-col className="contents lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:gap-6">
            <h2 id="founder-heading" className="order-1 text-h2">
              {headline}
            </h2>
            <Picture
              id={image.id}
              alt={image.alt}
              position={image.position}
              aspect="21/9"
              sizes="(min-width: 1440px) 566px, (min-width: 1024px) 40vw, 100vw"
              className="order-3"
            />
          </div>
          <div data-col className="order-2 flex flex-col justify-between gap-6 lg:col-span-6 lg:col-start-7">
            <div className="space-y-4 text-body text-ink">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div>
              <p className="text-body font-medium text-ink">{signature.name}</p>
              <p className="mt-1 text-caption text-muted">{signature.title}</p>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
