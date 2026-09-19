/* Hand-drawn highlighter on key phrases, drawn with Rough Notation
   (assets/js/vendor/rough-notation.iife.js, MIT licence, served from this site).

   - Phrases marked .mark are highlighted as soon as the fonts are ready.
   - Two things are drawn in front of the reader, once they are well up the
     screen: the phrase marked .mark--draw and the circled step .gap-mark.
   - If the library does not load, the CSS keeps those phrases in the accent
     colour, so the emphasis never depends on this script. */
(function () {
  if (!window.RoughNotation) return;

  var annotate = window.RoughNotation.annotate;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("rn");

  // light lavender behind ink text; full accent behind white text on the dark section
  function colour(el) {
    return el.closest(".act--dark") ? "#4A47C2" : "#CFCCF7";
  }

  function mark(el, animate) {
    return annotate(el, {
      type: "highlight",
      color: colour(el),
      multiline: true,
      iterations: 2,
      padding: [1, 3],
      animate: animate && !reduce,
      animationDuration: 900
    });
  }

  // the problem step in the process diagram, circled by hand like a note on a printout
  function circle(el, animate) {
    return annotate(el, {
      type: "circle",
      color: "#38369A",
      strokeWidth: 1.6,
      padding: [6, 12],
      iterations: 1,
      animate: animate && !reduce,
      animationDuration: 800
    });
  }

  function start() {
    document.querySelectorAll(".mark:not(.mark--draw)").forEach(function (el) {
      mark(el, false).show();
    });

    // the only two things on the page that are drawn in front of the reader
    var drawn = [].slice.call(document.querySelectorAll(".mark--draw, .gap-mark"));
    function draw(el, animate) {
      (el.classList.contains("gap-mark") ? circle(el, animate) : mark(el, animate)).show();
    }

    if (!("IntersectionObserver" in window) || reduce) {
      drawn.forEach(function (el) { draw(el, false); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        draw(entry.target, true);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 1 });
    drawn.forEach(function (el) { io.observe(el); });
  }

  // measure after the web fonts are in, otherwise the strokes land in the wrong place
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    window.addEventListener("load", start);
  }
})();
