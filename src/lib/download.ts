/**
 * Lienry Desktop downloads: the one file to edit when the installers are published. The /download
 * page reads everything it shows about the release from here.
 *
 * To put the buttons live, paste each installer's full URL and the version below, then change
 * `available` to true. While `available` is false the hero shows Register interest as its primary
 * pill with a muted availability line under it ("Coming soon for Mac and Windows"), and no download
 * button. A platform whose URL is still empty stays off either way.
 */
export const desktopRelease = {
  /** The switch: true puts the download buttons live. */
  available: false,
  /** Shown under the buttons once they are live, e.g. "1.0.0". */
  version: "",
  /** Full https URLs of the installers, e.g. the .dmg for Mac and the .exe or .msi for Windows. */
  downloads: {
    mac: "",
    windows: "",
  },
};

export type Platform = keyof typeof desktopRelease.downloads;

export const platforms: readonly Platform[] = ["mac", "windows"];

/** The installer URL for `platform`, or null while that download is not live. */
export function downloadUrl(platform: Platform): string | null {
  const url = desktopRelease.downloads[platform].trim();
  return desktopRelease.available && url ? url : null;
}
