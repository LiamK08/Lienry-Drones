"use client";

import { useSyncExternalStore } from "react";
import { downloadPage } from "@/content/download";
import { desktopRelease, downloadUrl, type Platform } from "@/lib/download";
import { Button } from "@/components/ui/Button";

const copy = downloadPage.actions;
const noop = () => () => {};

/** Windows when the browser says so, Mac otherwise: macOS, and anything Lienry Desktop does not run on. */
function detect(): Platform {
  const d = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const p = d?.platform || navigator.platform || "";
  return /^win/i.test(p) || /Windows NT/.test(navigator.userAgent) ? "windows" : "mac";
}

// The same test as `detect`, run while the HTML is parsed: it marks the wrapper before the first
// paint, so a Windows visitor never sees the Mac button first. Keep the two in step.
const markPlatform = `(function(){try{var e=document.currentScript.parentNode,d=navigator.userAgentData,p=(d&&d.platform)||navigator.platform||"";if(/^win/i.test(p)||/Windows NT/.test(navigator.userAgent))e.setAttribute("data-os","windows")}catch(_){}})()`;

/**
 * An inline script for full page loads. React never runs a script it renders on the client, so on a
 * client render (a soft navigation) it is inert text/plain and `detect` does the work instead.
 */
function InlineScript({ html }: { html: string }) {
  return <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

const name = (p: Platform) => `${copy.download} ${copy.platforms[p]}`;

/** The availability line: a small status dot and "Coming soon for Mac and Windows" in the muted text. */
function Status({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-small leading-[1.5] text-fg-muted">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-accent forced-colors:bg-[CanvasText]" />
      {text}
    </p>
  );
}

/**
 * One platform's set once its download is live: the download pill, then the other platform's link
 * (live, or its own "coming soon" line) and the version.
 */
function Controls({ primary, other, className }: { primary: Platform; other: Platform; className: string }) {
  const url = downloadUrl(primary)!;
  const otherUrl = downloadUrl(other);
  return (
    <div className={className}>
      <Button href={url} download="">
        {name(primary)}
      </Button>
      <div data-actions="" className="mt-3 flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
        {otherUrl ? (
          <Button href={otherUrl} variant="tertiary" download="">
            {name(other)}
          </Button>
        ) : (
          <Status text={`${copy.platforms[other]}: ${copy.soon.toLowerCase()}`} />
        )}
        {desktopRelease.version ? <p className="text-small leading-[1.5] text-fg-muted">{`${copy.version} ${desktopRelease.version}`}</p> : null}
      </div>
    </div>
  );
}

/**
 * The hero's actions. Until a download is live (src/lib/download.ts) there is nothing to download, so
 * the one action is Register interest, the primary pill, with the availability as a muted line under
 * it ("Coming soon for Mac and Windows"), never a disabled pill.
 *
 * Once one is live, the download pill matches the visitor's platform: "Download for Mac" or "Download
 * for Windows", with the other platform's link underneath. Both sets are in the HTML and `data-os`
 * shows one, so the right set is on screen from the first paint, before any JavaScript loads.
 */
export function DownloadActions({ className = "" }: { className?: string }) {
  const os = useSyncExternalStore<Platform>(noop, detect, () => "mac");
  const live = Boolean(downloadUrl("mac") || downloadUrl("windows"));
  if (!live) {
    return (
      <div className={className}>
        <Button href={copy.register.href} arrow>
          {copy.register.label}
        </Button>
        <div className="mt-4">
          <Status text={copy.status} />
        </div>
      </div>
    );
  }
  // A platform without its own download yet shows the other's set to everyone.
  const macLive = Boolean(downloadUrl("mac"));
  const winLive = Boolean(downloadUrl("windows"));
  if (macLive !== winLive) {
    const only: Platform = macLive ? "mac" : "windows";
    return (
      <div className={className}>
        <Controls primary={only} other={only === "mac" ? "windows" : "mac"} className="" />
      </div>
    );
  }
  return (
    <div data-os={os} suppressHydrationWarning className={`group ${className}`}>
      <Controls primary="mac" other="windows" className="group-data-[os=windows]:hidden" />
      <Controls primary="windows" other="mac" className="hidden group-data-[os=windows]:block" />
      <InlineScript html={markPlatform} />
    </div>
  );
}
