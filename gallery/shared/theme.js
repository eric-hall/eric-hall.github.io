/**
 * Shared color palette for the gallery sketches, matching the site's CSS custom
 * properties. Java counterpart: ProcessingSketchbook's util.Theme.
 *
 * BG/BG_ELEVATED/TEXT are hex strings. ACCENT_HUE/ACCENT_SOFT_HUE/HUE_MIN/HUE_MAX
 * are HSB hues, valid once a sketch has called colorMode(HSB, 360, 100, 100, 100).
 */
const GalleryTheme = {
  BG: '#12141a',
  BG_ELEVATED: '#1a1d26',
  TEXT: '#e7e6e3',

  ACCENT_HUE: 171, // teal, #5eead4
  ACCENT_SOFT_HUE: 239, // violet, #8b8cf8

  HUE_MIN: 150,
  HUE_MAX: 320,
};
