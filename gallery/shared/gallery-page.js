/**
 * Hydrates a gallery sketch page's title/h1/description from
 * /gallery/sketches.json. The sketch's slug is derived from the URL path; this
 * script is identical on every sketch page.
 */
(function () {
  function currentSlug() {
    const parts = location.pathname.split("/").filter(Boolean); // e.g. ["gallery","worley","index.html"]
    const galleryIndex = parts.indexOf("gallery");
    return galleryIndex >= 0 && parts.length > galleryIndex + 1 ? parts[galleryIndex + 1] : null;
  }

  const slug = currentSlug();
  if (!slug) return;

  fetch("/gallery/sketches.json")
    .then((response) => response.json())
    .then((sketches) => {
      const sketch = sketches.find((s) => s.slug === slug);
      if (!sketch) return;

      document.title = `${sketch.title} — Gallery — Eric Hall`;

      const titleEl = document.getElementById("sketch-title");
      if (titleEl) titleEl.textContent = sketch.title;

      const descriptionEl = document.getElementById("sketch-description");
      if (descriptionEl) descriptionEl.textContent = sketch.description;
    })
    .catch((err) => {
      console.error("Failed to load gallery manifest:", err);
    });
})();
