import { counters } from "@/content/home";
import { Container, Section } from "@/components/ui/Section";

export function Counters() {
  return (
    <Section id="facts" ariaLabelledby="facts-heading" className="border-t border-hairline">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-baseline">
          <h2 id="facts-heading" className="text-h3">The platform, by design.</h2>
          <p className="text-caption text-muted">Design intent. Concept stage.</p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          {counters.items.map((c) => (
            <div key={c.label} className="border-t border-hairline pt-5">
              <dt className="text-caption text-muted">{c.unit === "m" ? "Building height" : c.unit === "days" ? "Re-scan interval" : c.unit === "people" ? "People on site" : c.unit === "surfaces" ? "Exterior surfaces" : "Resident systems"}</dt>
              <dd className="mt-4 flex items-baseline gap-2"><span className="numeral">{c.unit === "m" ? "<70" : c.value}</span><span className="text-small text-muted">{c.unit === "m" || c.unit === "days" ? c.unit : ""}</span></dd>
              <dd className="mt-3 text-caption text-muted">{c.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
