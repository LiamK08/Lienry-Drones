// Shared shapes for the section components (docs/REDESIGN-SPEC.md B5, docs/DESIGN-PASS.md). The content
// files never import from here: they stay plain literals whose shapes match these types structurally.

/** A page section's tone. Raised and sunken are surfaces inside a section (.surface-raised, .surface-sunken). */
export type BandTone = "plaster" | "ink" | "paper" | "tint" | "night" | "mist";

/** @deprecated Accepted by Band until integration; check 4 fails it. */
export type LegacyTone = "raised" | "sunken";

/** @deprecated The pre-pass band tones. Deleted at integration: use BandTone. */
export type Tone = BandTone | LegacyTone;

/** A link: one label and one destination. Each enquiry route has exactly one label everywhere. */
export type Action = { label: string; href: string };

/**
 * A manifest still (public/media) with its alt text and optional object-positions: `position` from 1024
 * (and below when no smaller one is set), `positionMd` from 768 to 1023, `positionSm` below 768.
 */
export type ImageRef = { id: string; alt: string; position?: string; positionMd?: string; positionSm?: string };

/** The films in scripts/media/manifest.json. A future film is added here, to the manifest and to docs/MEDIA.md. */
export type FilmId = "h1-hero-film" | "c2-commercial-clip";

/** The stills that stand in for those films as posters. */
export type PosterId = "h0-hero-still" | "c1-commercial-hero";

/** A hover clip: a whole film (start and end unset; loops natively) or the segment start..end in seconds. */
export type ClipRef = { videoId: FilmId; start?: number; end?: number; rendition?: number };
