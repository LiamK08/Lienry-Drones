// The first-visit intro (src/components/home/Intro.tsx): when a browser session starts on the home page,
// three drones fly in and build the mark, then the paper fades into the hero film. Once per session,
// only on a home entry, never under reduced motion or on a deep link (a hash), and any key, press,
// wheel or touch ends it at once.

/** sessionStorage key: set on the first page of a session, whichever it is. */
export const INTRO_SEEN_KEY = "lienry:intro-seen";
/** Dispatched on window when the intro ends, played through or skipped (the hero film restarts on it). */
export const INTRO_END_EVENT = "lienry:intro-end";

/**
 * Runs in the head before the body is parsed, so the overlay is up before the first paint. It sets
 * `data-intro="play"` on <html> (the overlay's only switch, in CSS) and clears it when the overlay's
 * last animation ends, on the first key, press, wheel or touch, or after 6 seconds at most.
 */
export const introScript = `(function(){var d=document.documentElement,k=${JSON.stringify(INTRO_SEEN_KEY)},s;try{s=sessionStorage.getItem(k);sessionStorage.setItem(k,"1")}catch(e){return}if(s||location.pathname!=="/"||location.hash||!window.matchMedia||matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-intro","play");var t=["keydown","pointerdown","wheel","touchstart"],o={capture:true,passive:true};function end(){if(d.getAttribute("data-intro")!=="play")return;d.removeAttribute("data-intro");t.forEach(function(n){removeEventListener(n,end,o)});removeEventListener("animationend",done,true);clearTimeout(c);dispatchEvent(new Event(${JSON.stringify(INTRO_END_EVENT)}))}function done(e){if(String(e.animationName).indexOf("introEnd")>-1)end()}t.forEach(function(n){addEventListener(n,end,o)});addEventListener("animationend",done,true);var c=setTimeout(end,6000)})();`;
