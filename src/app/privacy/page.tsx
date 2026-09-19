import type { Metadata } from "next";
import { privacyPage } from "@/content/pages";
import { Container, Rule } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Lienry Drones handles the details you share through this website.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  const p = privacyPage;
  return (
    <article className="page-x bg-plaster pb-[var(--section-y)] pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <Container width="prose">
        <Rule className="mb-6" />
        <h1 className="text-h1">{p.headline}</h1>
        <p className="mt-4 text-caption text-muted">Last updated {p.updated}. Template for legal review before launch.</p>
        <div className="mt-12 space-y-10">
          {p.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-h3">{s.title}</h2>
              <p className="mt-3 text-body text-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
