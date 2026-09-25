// Shared shapes for the section components (docs/REDESIGN-SPEC.md, B5). The content files never
// import from here: they stay plain literals whose shapes match these types structurally.

/** The surfaces a band can take. Film bands (the home hero and film band) set their own tone. */
export type Tone = "plaster" | "raised" | "sunken" | "ink";

/** A link: one label and one destination. Each enquiry route has exactly one label everywhere. */
export type Action = { label: string; href: string };

/** A manifest still (public/media) with its alt text and an optional object-position. */
export type ImageRef = { id: string; alt: string; position?: string };

/** The two films in the manifest. */
export type FilmId = "h1-hero-film" | "c2-commercial-clip";

/** The stills that stand in for those films as posters. */
export type PosterId = "h0-hero-still" | "c1-commercial-hero";
