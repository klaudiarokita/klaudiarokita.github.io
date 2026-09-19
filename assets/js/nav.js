/* Section index on the right edge (wide screens; the CSS hides it elsewhere).
   - stays hidden while the hero is on screen, so the first screen is untouched;
   - marks the section that crosses the middle of the screen;
   - switches to light colours over the dark section. */
(function () {
  var toc = document.querySelector(".toc");
  var hero = document.querySelector(".hero");
  if (!toc || !hero || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("js-toc");

  new IntersectionObserver(function (entries) {
    toc.classList.toggle("is-on", entries[0].intersectionRatio < 0.35);
  }, { threshold: [0, 0.35, 0.6, 1] }).observe(hero);

  var links = [].slice.call(toc.querySelectorAll("a"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

  // a thin band in the middle of the screen decides which section is current
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
      var link = byId[entry.target.id];
      if (link) link.setAttribute("aria-current", "true");
      toc.classList.toggle("on-dark", entry.target.classList.contains("act--dark"));
    });
  }, { rootMargin: "-48% 0px -51% 0px" });

  Object.keys(byId).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) spy.observe(section);
  });
})();
