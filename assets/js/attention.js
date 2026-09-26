/* Reading attention, sent as anonymous events (see assets/js/vendor: none needed).
   What it measures:
   - how many seconds each section was the one in the middle of the screen,
   - how far down the page the reader got,
   - which links were opened (resume, e-mail, LinkedIn, the two Work pieces).
   What it does not do: identify anyone. It only adds properties to the
   anonymous visit the analytics script already records.
   Counting pauses when the tab is in the background and after a minute
   without any scrolling, typing or pointer movement, so a page left open
   overnight does not turn into a reading record. */
(function () {
  "use strict";

  var MIN_SECONDS = 3;      // ignore glances
  var IDLE_AFTER = 60000;   // a minute without activity means nobody is reading
  var sections = [];
  var seconds = {};
  var maxScroll = 0;
  var total = 0;
  var lastActive = Date.now();
  var sent = false;

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
  }

  function collect() {
    var nodes = document.querySelectorAll("main section, main > section");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var head = el.querySelector("h1, h2");
      var name = el.classList.contains("hero") ? "hero"
        : el.id || (head ? slug(head.textContent) : "section-" + (i + 1));
      sections.push({ el: el, name: name });
    }
  }

  /* the section under the middle of the screen is the one being read */
  function current() {
    var mid = window.innerHeight / 2;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) return sections[i].name;
    }
    return null;
  }

  function active() {
    return !document.hidden && Date.now() - lastActive < IDLE_AFTER;
  }

  function tick() {
    if (!active()) return;
    var name = current();
    if (!name) return;
    seconds[name] = (seconds[name] || 0) + 1;
    total += 1;
  }

  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") window.umami.track(name, data);
  }

  function send() {
    if (sent) return;
    sent = true;
    for (var name in seconds) {
      if (seconds[name] >= MIN_SECONDS) track("section-time", { section: name, seconds: seconds[name] });
    }
    if (total >= MIN_SECONDS) track("reading", { seconds: total, scrolled: maxScroll });
  }

  function onScroll() {
    lastActive = Date.now();
    var doc = document.documentElement;
    var height = Math.max(doc.scrollHeight - window.innerHeight, 1);
    var pct = Math.round(((window.scrollY || doc.scrollTop) / height) * 100);
    if (pct > maxScroll) maxScroll = Math.min(pct, 100);
  }

  function onClick(e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var what =
      /\.pdf/.test(href) ? "resume" :
      /^mailto:/.test(href) ? "email" :
      /linkedin\.com/.test(href) ? "linkedin" :
      /case-study/.test(href) ? "case-study" :
      /build-log/.test(href) ? "build-log" : null;
    if (what) track("click", { link: what });
  }

  function start() {
    collect();
    if (!sections.length) return;
    onScroll();
    setInterval(tick, 1000);
    addEventListener("scroll", onScroll, { passive: true });
    ["pointerdown", "keydown", "touchstart", "wheel"].forEach(function (evt) {
      addEventListener(evt, function () { lastActive = Date.now(); }, { passive: true });
    });
    addEventListener("click", onClick, true);
    addEventListener("pagehide", send);
    addEventListener("visibilitychange", function () { if (document.hidden) send(); });
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
})();
