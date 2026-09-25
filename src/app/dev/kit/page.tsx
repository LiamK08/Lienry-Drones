import type { Metadata } from "next";
import { closing, places, safety, systemExplainer, twoSystems } from "@/content/home";
import { commercialPage, companyPage, homesPage, platformFaq, platformPage } from "@/content/pages";
import { softwareSection } from "@/content/software";
import { AppPanel } from "@/components/app/AppPanel";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { Faq } from "@/components/sections/Faq";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { PageHeroSplit } from "@/components/sections/PageHeroSplit";
import { Switcher, type SwitcherItem } from "@/components/sections/Switcher";
import { SoftwareBand } from "@/components/software/SoftwareBand";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { MediaCard } from "@/components/ui/MediaCard";
import { Picture, type PictureAspect } from "@/components/ui/Picture";
import { RevealItem, RevealList } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { SnapTrack } from "@/components/ui/SnapTrack";
import { KitAppPanel, KitFilmBand } from "./KitDemos";

// /dev/kit: every foundation component (docs/REDESIGN-SPEC.md B5 and B6) rendered with existing
// content or inline sample props, so the page packages can see them working. Temporary: not
// indexed, excluded from the checks, and deleted in F9 with the rest of src/app/dev.
// /dev/kit?hero=image shows the split hero with a still instead of the film.

export const metadata: Metadata = {
  title: "Lienry Drones",
  robots: { index: false, follow: false },
};

// Sample props: the six parts with the facts and links of the /platform switcher (C2 section 2).
const partMedia: Record<string, { alt: string; position: string }> = {
  dock: { alt: "The roof capsule's lid closing over the drone on a wet roof", position: "50% 55%" },
  tether: { alt: "The drone's tether rising from its fitting past a wet glass facade", position: "50% 60%" },
  drone: { alt: "The Lienry drone washing a glass wall, its spray bar, pad and rollers on the pane", position: "50% 50%" },
  scan: { alt: "The drone holding off the corner of a glass building to scan it, with no spray", position: "50% 40%" },
  software: { alt: "A laptop on a desk showing the desktop software's shaded 3D building", position: "50% 50%" },
  automation: { alt: "The roof capsule open at dawn, the drone rising from its cradle", position: "50% 40%" },
};
const partFacts: Record<string, Pick<SwitcherItem, "facts" | "link">> = {
  dock: {
    facts: [
      { term: "Commercial dock", text: "Weatherproof roof capsule, water tether fed from above" },
      { term: "Home dock", text: "Waterproof ground pod, power and water through the same tether" },
    ],
    link: { label: "Compare the two systems", href: "#commercial-system" },
  },
  tether: {
    facts: [
      { term: "Water", text: "Fed through the tether for the whole clean" },
      { term: "Carried water", text: "None. The drone never carries water." },
      { term: "Home system", text: "Fed from the ground pod, on the same line that powers it" },
    ],
  },
  drone: {
    facts: [
      { term: "Surfaces", text: "Glass, solar panels, walls, roofing, driveways" },
      { term: "Pressure", text: "Set by the software for each material, adjustable in the app" },
      { term: "Routes", text: "Short and planned, with the tether kept clear" },
    ],
  },
  scan: {
    facts: [
      { term: "Scan", text: "Maps the structure and dimensions of the building before the first clean" },
      { term: "Re-scan interval", text: "Every two days on commercial buildings, adjustable in settings" },
    ],
    link: { label: "The commercial system", href: "/commercial" },
  },
  software: {
    facts: [
      { term: "Control", text: "Desktop software for both systems; personalised mobile app for the home system" },
      { term: "Shows", text: "A 3D model of the building, live wash progress and debris shading" },
    ],
    link: { label: "See the software working", href: "#demo" },
  },
  automation: {
    facts: [
      { term: "People on site", text: "None during a clean" },
      { term: "Starting a clean", text: "From the app or the desktop software, from anywhere" },
    ],
    link: { label: "Register interest", href: "/register-interest" },
  },
};
const parts: SwitcherItem[] = systemExplainer.tabs.map((t, i) => ({
  id: t.id,
  tab: t.tab,
  label: `0${i + 1} · ${t.tab}`,
  title: t.title,
  body: t.body,
  image: { id: t.imageId, ...partMedia[t.id] },
  ...partFacts[t.id],
}));

const placeHref: Record<string, string> = {
  "p1-tower": "/commercial",
  "p2-apartments": "/commercial",
  "p3-house": "/homes-and-rentals",
  "p4-rental": "/homes-and-rentals",
  "p5-solar-farm": "/solar",
};

const stepImages = [
  { id: "m3-pod-master", alt: "The ground pod open beside a garden tap", position: "30% 50%" },
  { id: "p3-house", alt: "The home drone washing the front windows of a suburban house", position: "50% 50%" },
  { id: "p4-rental", alt: "The home drone over rooftop solar panels on a rental townhouse", position: "50% 40%" },
  { id: "p5-solar-farm", alt: "The home drone low over a solar farm row, its tether running back to the pod", position: "50% 60%" },
];


const aspects: PictureAspect[] = ["16/9", "21/9", "2/1", "3/2", "4/3", "1/1", "4/5", "3/4"];

export default async function KitPage({ searchParams }: { searchParams: Promise<{ hero?: string }> }) {
  const { hero } = await searchParams;
  const [commercial, home] = twoSystems.systems;

  return (
    <>
      {hero === "image" ? (
        <PageHeroSplit
          id="kit-hero-heading"
          headline={platformPage.headline}
          emphasis="Six parts."
          lead={platformPage.lead}
          primary={{ label: "Register interest", href: "/register-interest" }}
          secondary={{ label: "See the six parts", href: "#parts" }}
          media={{ kind: "image", id: "h0-hero-still", alt: "The Lienry drone finishing a glass wash at first light", position: "50% 50%" }}
        />
      ) : (
        <PageHeroSplit
          id="kit-hero-heading"
          headline={commercialPage.headline}
          emphasis="on the roof."
          lead={commercialPage.lead}
          primary={commercialPage.pilot.cta}
          secondary={{ label: "See the platform", href: "/platform" }}
          media={{
            kind: "film",
            videoId: "c2-commercial-clip",
            posterId: "c1-commercial-hero",
            alt: "The Lienry roof capsule on a plant deck at dawn, the drone rising from its cradle",
            name: "commercial film",
          }}
        />
      )}

      {/* SectionHead, Headline, Button and Container on a light band. */}
      <Band id="kit-head" tone="plaster" labelledBy="kit-head-heading">
        <Container>
          <SectionHead
            id="kit-head-heading"
            headline="Every heading has a partner beside it."
            emphasis="a partner beside it."
            breakBefore
            aside={{
              label: "Section head",
              intro: "The heading takes columns 1 to 7 and this aside columns 8 to 12, bottom-aligned. Below 1024 they stack.",
              link: { label: "See the platform", href: "/platform" },
            }}
          />
          <div className="mt-[var(--gap-head)] grid gap-6 lg:grid-cols-12 lg:gap-x-6">
            <div data-col className="flex flex-wrap items-center gap-4 lg:col-span-7">
              <Button href="/register-interest" size="lg" arrow>
                Register interest
              </Button>
              <Button href="/register-interest?type=homeowner">Register interest</Button>
              <Button href="/register-interest?type=investor" variant="secondary">
                Investor enquiries
              </Button>
              <Button href="/platform" variant="tertiary" arrow>
                Explore the platform
              </Button>
              <Button size="sm" arrow>
                Register interest
              </Button>
            </div>
            <div data-col className="lg:col-span-5 lg:col-start-8">
              <SectionHead
                id="kit-stack-heading"
                layout="stack"
                reveal={false}
                headline="A stacked head."
                below={<p className="text-body text-muted">The below slot sits under the heading, 16 above the aside.</p>}
                aside={{ link: { label: "All questions", href: "#kit-faq" } }}
              />
            </div>
          </div>
          <Container width="prose" className="mt-8">
            <p className="text-body text-muted">A prose container holds a text column on the grid&rsquo;s left edge, capped at 45 characters, so it lines up with the blocks above and below it.</p>
          </Container>
        </Container>
      </Band>

      {/* Dark: SectionHead, buttons, FactList with label terms, a dark SnapTrack and a dark Picture. */}
      <Band id="kit-dark" tone="ink" labelledBy="kit-dark-heading">
        <Container>
          <SectionHead
            id="kit-dark-heading"
            tone="dark"
            headline="Safety starts with the design."
            aside={{
              intro: safety.note,
              action: (
                <div className="flex flex-wrap items-center gap-4">
                  <Button href="/register-interest?type=landlord" variant="inverse" arrow>
                    I own rentals
                  </Button>
                  <Button href="/register-interest" onDark>
                    Register interest
                  </Button>
                  <Button href="/register-interest?type=investor" variant="secondary" onDark>
                    Investor enquiries
                  </Button>
                  <Button href="/platform" variant="tertiary" onDark arrow>
                    The platform
                  </Button>
                </div>
              ),
            }}
          />
          <div className="mt-[var(--gap-head)]">
            <SnapTrack tone="dark" columns={4} label="Safety details. Use left and right arrow keys to browse." prevLabel="Previous detail" nextLabel="Next detail">
              {safety.items.map((item) => (
                <RevealItem key={item.id}>
                  <MediaCard tone="dark" media={{ kind: "image", id: item.id, alt: item.title, aspect: "4/3", sizes: "(min-width: 1024px) 330px, 82vw" }} title={item.title} body={item.body} />
                </RevealItem>
              ))}
            </SnapTrack>
          </div>
          <FactList
            className="mt-8"
            tone="dark"
            columns={3}
            termStyle="label"
            items={platformPage.specs.rows.slice(0, 6).map(([term, text]) => ({ term, text }))}
          />
        </Container>
      </Band>

      <Switcher
        id="parts"
        tone="plaster"
        headline="How the six parts fit together."
        emphasis="fit together."
        intro={systemExplainer.intro}
        tabsLabel="The six parts"
        items={parts}
        hashSync
      />

      <FeatureRow
        id="commercial-system"
        tone="raised"
        side="left"
        title={commercial.name}
        body="A roof capsule for buildings under 70 metres. The drone lives on the roof, fed from above, and the whole building runs from the desktop software."
        link={{ label: "The commercial system", href: "/commercial" }}
        facts={commercial.points.map((text) => ({ text }))}
        image={{ id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", position: "50% 50%" }}
      />

      <FeatureRow
        id="home-system"
        tone="sunken"
        side="right"
        title={home.name}
        body="A ground pod for homes, rentals and solar farms. The pod powers the drone and feeds it water, and you start a clean from your phone wherever you are."
        link={{ label: "The home system", href: "/homes-and-rentals" }}
        facts={companyPage.values.items.map((v) => ({ term: v.title, text: v.body }))}
        termStyle="strong"
        image={{ id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", position: "35% 50%" }}
      />

      {/* MediaCard: images, the app fragment and links, in a revealed grid. */}
      <Band id="kit-cards" tone="plaster" labelledBy="kit-cards-heading">
        <Container>
          <SectionHead
            id="kit-cards-heading"
            headline={twoSystems.headline}
            aside={{ intro: "A roof capsule for commercial buildings under 70 metres, or a ground pod for homes, rentals and solar farms." }}
          />
          <RevealList className="mt-[var(--gap-head)] grid gap-8 lg:grid-cols-3 lg:gap-6">
            <RevealItem>
              <MediaCard
                media={{ kind: "image", id: "m2-capsule-master", alt: "The Lienry roof capsule open on a flat roof, the drone on its cradle beside the tether reel", aspect: "4/3", sizes: "(min-width: 1024px) 448px, 100vw" }}
                meta={commercial.subtitle}
                title="Commercial system"
                body="A weatherproof capsule on the roof, a tether fed from above, and desktop software that runs the whole building."
                link={{ label: "Commercial system", href: "/commercial" }}
              />
            </RevealItem>
            <RevealItem>
              <MediaCard
                media={{ kind: "image", id: "m3-pod-master", alt: "The Lienry ground pod open beside a garden tap, the home drone inside", aspect: "4/3", position: "35% 50%", sizes: "(min-width: 1024px) 448px, 100vw" }}
                meta={home.subtitle}
                title="Home system"
                body="A waterproof ground pod, a drone that knows each material, and an app that starts the clean wherever you are."
                link={{ label: "Home system", href: "/homes-and-rentals" }}
              />
            </RevealItem>
            <RevealItem>
              <MediaCard
                media={{
                  kind: "fragment",
                  aspect: "4/3",
                  ariaLabel: "Illustrative phone app, demo data: driveway and solar panels selected, ready to start a clean",
                  note: "Illustrative app interface. Demo data.",
                  node: (
                    <div className="absolute left-8 top-4 -right-6 lg:top-6">
                      <AppPanel mode="fragment" />
                    </div>
                  ),
                }}
                meta="For the home system"
                title="Phone app"
                body="Start a clean from another suburb or another country. Choose the areas, and the drone sets the pressure for each material."
                link={{ label: "See the app", href: "/homes-and-rentals#story" }}
              />
            </RevealItem>
          </RevealList>
        </Container>
      </Band>

      {/* SnapTrack from="none": a track at every width, four visible from 1024, whole-card links. */}
      <Band id="kit-places" tone="raised" labelledBy="kit-places-heading">
        <Container>
          <SectionHead
            id="kit-places-heading"
            headline={places.headline}
            emphasis="your property."
            aside={{ intro: "Five kinds of property, one platform. Each card shows which system does the work and opens its page." }}
          />
          <div className="mt-[var(--gap-head)]">
            <SnapTrack from="none" visible={4} columns={4} label="Property types. Use left and right arrow keys to browse." prevLabel="Previous property" nextLabel="Next property">
              {places.cards.map((card) => (
                <RevealItem key={card.id}>
                  <MediaCard
                    media={{ kind: "image", id: card.id, alt: `${card.title}: ${card.body}`, aspect: "4/5", position: card.id === "p5-solar-farm" ? "50% 60%" : undefined, sizes: "(min-width: 1024px) 330px, (min-width: 768px) 46vw, 82vw" }}
                    label={card.system}
                    title={card.title}
                    body={card.body}
                    wholeCard={{ href: placeHref[card.id] }}
                  />
                </RevealItem>
              ))}
            </SnapTrack>
          </div>
        </Container>
      </Band>

      {/* SnapTrack from="lg": a track below 1024, a four-column grid from it. Numbered step cards. */}
      <Band id="kit-steps" tone="plaster" labelledBy="kit-steps-heading">
        <Container>
          <SectionHead id="kit-steps-heading" headline={homesPage.steps.headline} aside={{ intro: "Four steps from a new pod to a clean you start from your phone." }} />
          <div className="mt-[var(--gap-head)]">
            <SnapTrack columns={4} label="Setup steps. Use left and right arrow keys to browse." prevLabel="Previous step" nextLabel="Next step">
              {homesPage.steps.items.map((step, i) => (
                <RevealItem key={step.n}>
                  <MediaCard
                    media={{ kind: "image", ...stepImages[i], aspect: "4/5", sizes: "(min-width: 1024px) 330px, (min-width: 768px) 46vw, 82vw" }}
                    label={step.n}
                    title={step.title}
                    body={step.body}
                  />
                </RevealItem>
              ))}
            </SnapTrack>
          </div>
        </Container>
      </Band>

      {/* FactList: terms as captions, strong or none; one to four columns. */}
      <Band id="kit-facts" tone="raised" labelledBy="kit-facts-heading">
        <Container>
          <SectionHead id="kit-facts-heading" headline="Fact lists." aside={{ intro: "A 1px rule, 12, the term, 4, the text, 12. Vertical rules between columns from 768." }} />
          <div className="mt-[var(--gap-head)] grid gap-4 lg:grid-cols-12 lg:gap-x-6">
            <div className="lg:col-span-4">
              <FactList items={parts[0].facts} />
            </div>
            <div className="lg:col-span-8">
              <FactList columns={2} termStyle="strong" items={companyPage.where.items.map((w) => ({ term: w.title, text: w.body }))} />
            </div>
          </div>
          <FactList className="mt-4" columns={3} termStyle="strong" items={commercialPage.software.tiles.map((t) => ({ term: t.title, text: t.body }))} />
          <FactList className="mt-4" columns={4} termStyle="strong" items={homesPage.app.items.map((t) => ({ term: t.title, text: t.body }))} />
          <FactList className="mt-4" columns={2} items={commercial.points.map((text) => ({ text }))} />
        </Container>
      </Band>

      {/* Picture: every ratio, and a fill frame stretching to the text beside it. */}
      <Band id="kit-pictures" tone="sunken" labelledBy="kit-pictures-heading">
        <Container>
          <SectionHead id="kit-pictures-heading" headline="Frames and captions." aside={{ intro: "Every frame is 4px with object-fit cover, and every render carries Concept render 8px under it." }} />
          <div className="mt-[var(--gap-head)] grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {aspects.map((aspect) => (
              <Picture key={aspect} id="co1-company" alt="A harbour-side street of mid-rise buildings at dawn" aspect={aspect} sizes="(min-width: 1024px) 330px, 50vw" />
            ))}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-12 lg:gap-x-6">
            <div data-col className="lg:col-span-6">
              <Picture id="s2-tether" alt="The drone's tether rising from its fitting past a wet glass facade" position="50% 60%" fit="fill" fillFrom="lg" aspect="4/3" minHeight="16rem" maxHeight="30rem" sizes="(min-width: 1024px) 684px, 100vw" />
            </div>
            <div data-col className="lg:col-span-5 lg:col-start-8">
              <FactList items={parts[1].facts} />
              <p className="mt-6 text-body text-muted">From 1024 the frame on the left takes the height of this column, between its floor and its ceiling. Below 1024 it keeps its 4:3 ratio.</p>
            </div>
          </div>
        </Container>
      </Band>

      <KitFilmBand />

      <SoftwareBand id="kit-software" tone="sunken" headline={softwareSection.headline} body={softwareSection.body} steps />

      <SoftwareBand
        id="demo"
        tone="raised"
        headline={commercialPage.software.headline}
        body={softwareSection.body}
        strip={commercialPage.software.tiles.map((t) => ({ term: t.title, text: t.body }))}
      />

      {/* The window and the app panel stubs on their own. */}
      <Band id="kit-stubs" tone="plaster" labelledBy="kit-stubs-heading">
        <Container>
          <SectionHead id="kit-stubs-heading" headline="The coded product." aside={{ intro: "Typed stubs of the software window and the app panel, at their real sizes. Their insides arrive later behind the same props." }} />
          <div className="mt-[var(--gap-head)] grid gap-8 lg:grid-cols-12 lg:gap-x-6">
            <div className="lg:col-span-8">
              <SoftwareWindow tone="raised" preset="map" />
            </div>
            <div className="lg:col-span-4">
              <KitAppPanel />
            </div>
          </div>
        </Container>
      </Band>

      <Faq
        id="kit-faq"
        tone="raised"
        headline={platformFaq.headline}
        intro="Straight answers, including what we cannot claim yet."
        link={{ label: "All questions", href: "/platform#faq" }}
        items={platformFaq.items}
      />

      <CtaPanel
        id="kit-closing"
        headline={closing.headline}
        body={closing.body}
        primary={{ label: closing.buttons[0].label, href: closing.buttons[0].href }}
        links={closing.buttons.slice(1).map((b) => ({ label: b.label, href: b.href }))}
        image={{ id: "ho1-homes-hero", alt: "The Lienry ground pod beside a house at first light, the drone washing a window", position: "60% 50%" }}
      />
    </>
  );
}
