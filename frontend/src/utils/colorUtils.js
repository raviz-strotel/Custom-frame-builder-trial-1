// Utility functions for color manipulation and nearest-color matching

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 */
function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Find the nearest color from palette to the given color
 */
export function findNearestColor(targetRgb, palette) {
  let minDistance = Infinity;
  let nearestColor = palette[0];
  
  for (const hexColor of palette) {
    const paletteRgb = hexToRgb(hexColor);
    if (!paletteRgb) continue;
    
    const distance = colorDistance(targetRgb, paletteRgb);
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = hexColor;
    }
  }
  
  return nearestColor;
}

/**
 * Fixed 40-color palette for pixel art conversion
 */
export const DEFAULT_PALETTE = [
  // DARKS & DEPTH (5)
  '#0B0B0B', // deep black
  '#1A1A1A', // near black
  '#2E2E2E', // dark grey
  '#3A2F2F', // warm dark neutral
  '#1B263B', // deep navy
  
  // NEUTRALS & LIGHTS (5)
  '#555555', // mid grey
  '#7A7A7A', // neutral grey
  '#A8A8A8', // light grey
  '#DADADA', // soft light
  '#F5F5F0', // off white
  
  // RED FAMILY (5)
  '#6D0F1F', // deep wine red
  '#A4161A', // dark red
  '#E63946', // vibrant red
  '#FF6B6B', // coral red
  '#F4A6B5', // soft pink
  
  // ORANGE FAMILY (4)
  '#9C3F00', // dark orange
  '#D95D39', // burnt orange
  '#FF8C42', // vibrant orange
  '#FFD166', // warm golden
  
  // YELLOW FAMILY (3)
  '#E9C46A', // muted yellow
  '#FFE066', // bright yellow
  '#FFF3B0', // pale cream
  
  // GREEN FAMILY (5)
  '#1B5E20', // deep green
  '#2E7D32', // forest green
  '#52B788', // teal green
  '#80ED99', // mint
  '#B7E4C7', // soft pastel green
  
  // BLUE FAMILY (6)
  '#0D3B66', // dark blue
  '#1D4ED8', // strong blue
  '#3A86FF', // royal blue
  '#4CC9F0', // bright cyan
  '#90DBF4', // sky blue
  '#CAF0F8', // pale blue
  
  // PURPLE / MAGENTA FAMILY (4)
  '#3C096C', // dark purple
  '#6A0DAD', // violet
  '#9D4EDD', // bright purple
  '#FF00FF', // neon magenta
  
  // SKIN / EARTH TONES (3)
  '#5C4033', // dark brown
  '#8D6E63', // warm mid brown
  '#C89F7A', // light skin tone
];