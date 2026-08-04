/**
 * Builds the gallery index's card grid from /gallery/sketches.json, then loads
 * theme.js, each card's declared script dependencies, and each thumbnail script
 * in that order -- thumbnail scripts execute immediately on load and may depend
 * on an earlier script being defined first.
 *
 * Requires the p5.js CDN script to already be loaded via a static <script> tag.
 */
(function () {
  const CARD_GRID_ID = "card-grid";

  function loadScriptsSequentially(urls, onComplete) {
    let i = 0;
    function next() {
      if (i >= urls.length) {
        onComplete();
        return;
      }
      const script = document.createElement("script");
      script.src = urls[i++];
      script.onload = next;
      script.onerror = next; // don't let one failed script block the rest of the chain
      document.body.appendChild(script);
    }
    next();
  }

  function cardHtml(sketch) {
    return `
      <li>
        <a class="card" href="/gallery/${sketch.slug}/index.html">
          <div class="card-thumb" id="thumb-${sketch.slug}"></div>
          <h2>${sketch.title}</h2>
          <p>${sketch.card}</p>
        </a>
      </li>
    `;
  }

  fetch("/gallery/sketches.json")
    .then((response) => response.json())
    .then((sketches) => {
      const grid = document.getElementById(CARD_GRID_ID);
      if (!grid) return;
      grid.innerHTML = sketches.map(cardHtml).join("");

      const dependencies = new Set();
      sketches.forEach((sketch) => (sketch.scripts || []).forEach((src) => dependencies.add(src)));

      const scriptQueue = [
        "/gallery/shared/theme.js",
        ...dependencies,
        ...sketches.map((sketch) => `/gallery/${sketch.slug}/thumb.js`),
      ];
      loadScriptsSequentially(scriptQueue, () => {});
    })
    .catch((err) => {
      console.error("Failed to load gallery manifest:", err);
    });
})();
