/* Entrance motion below the first screen.
   Scrolling only triggers it; the movement itself plays in time, so the
   reader actually sees it happen at eye level instead of it being scrubbed
   away at the bottom edge of the screen.

   Safety rules:
   - without JavaScript, or with "reduce motion" switched on, nothing is hidden;
   - the first screen is never touched;
   - once an element has played, its classes are removed, so it goes back to
     its normal state (and its normal hover transitions). */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var fold = window.innerHeight * 0.9;
  var reveals = [].slice.call(document.querySelectorAll(".reveal")).filter(function (el) {
    return el.getBoundingClientRect().top > fold;
  });
  if (!reveals.length) return;

  document.documentElement.classList.add("js-motion");
  reveals.forEach(function (el) { el.classList.add("pending"); });

  function settle(el, after) {
    window.setTimeout(function () {
      el.classList.remove("pending", "is-in");
      el.style.transitionDelay = "";
    }, after);
  }

  // Elements that arrive in the same moment play one after another.
  var observer = new IntersectionObserver(function (entries) {
    entries
      .filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; })
      .forEach(function (e, i) {
        var delay = i * 150;
        e.target.style.transitionDelay = delay + "ms";
        e.target.classList.add("is-in");
        observer.unobserve(e.target);
        settle(e.target, delay + 900);
      });
  }, { rootMargin: "0px 0px -14% 0px", threshold: 0.12 });

  reveals.forEach(function (el) { observer.observe(el); });

  // Printing or saving as PDF: show everything.
  window.addEventListener("beforeprint", function () {
    reveals.forEach(function (el) { el.classList.remove("pending"); });
  });
})();
