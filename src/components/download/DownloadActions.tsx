"use client";

import { useSyncExternalStore } from "react";
import { downloadPage } from "@/content/pages";
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

/** A download that is not live yet: its label, a separator and "Coming soon", named as one phrase. */
function Soon({ platform }: { platform: Platform }) {
  return (
    <>
      {name(platform)}
      <span aria-hidden="true">·</span>
      <span className="font-normal">{copy.soon}</span>
    </>
  );
}

/**
 * One platform's set: its download button, then 8 below it the other platform's smaller link and,
 * beside that (below it on phones), Register interest while the download is not live, or the
 * version once it is.
 */
function Controls({ primary, other, className }: { primary: Platform; other: Platform; className: string }) {
  const url = downloadUrl(primary);
  const otherUrl = downloadUrl(other);
  const soonLabel = (p: Platform) => `${name(p)}, ${copy.soon.toLowerCase()}`;
  return (
    <div className={className}>
      {url ? (
        <Button href={url} size="lg" download="">
          {name(primary)}
        </Button>
      ) : (
        <Button size="lg" aria-disabled aria-label={soonLabel(primary)}>
          <Soon platform={primary} />
        </Button>
      )}
      <div className="mt-2 flex flex-col items-start md:flex-row md:items-center md:gap-6">
        {otherUrl ? (
          <Button href={otherUrl} variant="tertiary" download="">
            {name(other)}
          </Button>
        ) : (
          <Button variant="tertiary" aria-disabled aria-label={soonLabel(other)}>
            <Soon platform={other} />
          </Button>
        )}
        {url ? (
          desktopRelease.version ? <p className="text-caption text-muted">{`${copy.version} ${desktopRelease.version}`}</p> : null
        ) : (
          <Button href={copy.register.href} variant="tertiary" arrow>
            {copy.register.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * The download buttons, matched to the visitor's platform: "Download for Mac" or "Download for
 * Windows", with the other platform's link underneath. Both sets are in the HTML and `data-os` shows
 * one, so the right set is on screen from the first paint, before any JavaScript loads.
 *
 * What is live comes from src/lib/download.ts. Until a download is live its control is shown as
 * "Coming soon": aria-disabled rather than disabled, so it stays focusable and announces its state.
 */
export function DownloadActions({ className = "" }: { className?: string }) {
  const os = useSyncExternalStore<Platform>(noop, detect, () => "mac");
  return (
    <div data-os={os} suppressHydrationWarning className={`group ${className}`}>
      <Controls primary="mac" other="windows" className="group-data-[os=windows]:hidden" />
      <Controls primary="windows" other="mac" className="hidden group-data-[os=windows]:block" />
      <InlineScript html={markPlatform} />
    </div>
  );
}
