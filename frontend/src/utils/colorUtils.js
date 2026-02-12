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
 * Fixed 20-color palette for pixel art
 */
export const DEFAULT_PALETTE = [
  // Blacks / Grays (6)
  '#000000', // Pure black
  '#FFFFFF', // Pure white
  '#2C2C2C', // Dark charcoal
  '#6B6B6B', // Medium gray
  '#B8B8B8', // Light gray
  '#D4D4D4', // Pale gray
  
  // Reds / Pinks (3)
  '#8B1E3F', // Deep crimson
  '#E63946', // Bright red
  '#F4A6B5', // Soft pink
  
  // Oranges / Yellows (3)
  '#D95D39', // Burnt orange
  '#F4B400', // Golden yellow
  '#FFF3B0', // Pale cream yellow
  
  // Greens (2)
  '#2E7D32', // Forest green
  '#80ED99', // Mint green
  
  // Blues (3)
  '#1B263B', // Deep navy
  '#3A86FF', // Royal blue
  '#90DBF4', // Sky blue
  
  // Purples (2)
  '#6A0DAD', // Deep violet
  '#FF00FF', // Neon magenta
  
  // Universal Accent (1)
  '#C89F7A', // Warm tan / skin tone
];