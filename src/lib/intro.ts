// The first-visit intro (src/components/home/Intro.tsx): when a browser session starts on the home page,
// three drones fly in and build the mark, then the paper fades into the hero film. Once per session,
// only on a home entry from outside the site, never under reduced motion or on a deep link (a hash), and
// any key, press, wheel, touch or scroll ends it at once.

/** sessionStorage key: set on the first page of a session, whichever it is. */
export const INTRO_SEEN_KEY = "lienry:intro-seen";
/** Dispatched on window as the paper starts to fade (the hero film starts again from its first frame). */
export const INTRO_REVEAL_EVENT = "lienry:intro-reveal";
/** Dispatched on window when the intro ends, played through or cut short. */
export const INTRO_END_EVENT = "lienry:intro-end";

/**
 * Runs in the head before the body is parsed, so the overlay is up before the first paint. It sets
 * `data-intro="play"` on <html> (the overlay's only switch, in CSS) unless the session has already had a
 * page, the visit comes from another page of the site (a home tab opened from inside it), the page is not
 * home, the address has a hash, or motion is reduced. It clears it when the overlay's last animation ends,
 * on the first key, press, wheel, touch or scroll (a text-fragment link scrolls the page too), or 6
 * seconds after the tab is first visible. A press or tap that ends it while the paper still covers the
 * page (before the reveal) also has its click swallowed, and a tap its emulated hover (the mouseover and
 * mouseout that React's onMouseEnter reads), so neither lands on what was under the paper; from the
 * reveal the overlay lets presses through.
 */
export const introScript = `(function(){var d=document.documentElement,k=${JSON.stringify(INTRO_SEEN_KEY)},s,r=document.referrer,same=false,rev=false;try{s=sessionStorage.getItem(k);sessionStorage.setItem(k,"1")}catch(e){return}try{same=!!r&&new URL(r).origin===location.origin}catch(e){}if(s||same||location.pathname!=="/"||location.hash||!window.matchMedia||matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-intro","play");var t=["keydown","pointerdown","wheel","touchstart"],o={capture:true,passive:true},c,w=0;function end(e){if(d.getAttribute("data-intro")!=="play")return;d.removeAttribute("data-intro");t.forEach(function(n){removeEventListener(n,end,o)});removeEventListener("scroll",end);removeEventListener("animationstart",go,true);removeEventListener("animationend",done,true);document.removeEventListener("visibilitychange",arm);clearTimeout(c);if(e&&!rev&&(e.type==="pointerdown"||e.type==="touchstart")){var x=function(v){v.preventDefault();v.stopPropagation();removeEventListener("click",x,true)},h=function(v){v.stopPropagation()},m=e.type==="touchstart"||e.pointerType!=="mouse";addEventListener("click",x,true);if(m){addEventListener("mouseover",h,true);addEventListener("mouseout",h,true)}setTimeout(function(){removeEventListener("click",x,true);removeEventListener("mouseover",h,true);removeEventListener("mouseout",h,true)},600)}dispatchEvent(new Event(${JSON.stringify(INTRO_END_EVENT)}))}function go(e){if(String(e.animationName).indexOf("introReveal")>-1){rev=true;dispatchEvent(new Event(${JSON.stringify(INTRO_REVEAL_EVENT)}))}}function done(e){if(String(e.animationName).indexOf("introEnd")>-1)end()}function arm(){if(document.visibilityState==="visible"&&!w){w=1;c=setTimeout(end,6000)}}t.forEach(function(n){addEventListener(n,end,o)});addEventListener("scroll",end,{passive:true});addEventListener("animationstart",go,true);addEventListener("animationend",done,true);document.addEventListener("visibilitychange",arm);arm()})();`;
