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
 * Default 20-color palette for pixel art
 */
export const DEFAULT_PALETTE = [
  '#000000', // Black
  '#FFFFFF', // White
  '#1C1917', // Dark Gray
  '#78716C', // Medium Gray
  '#D6D3D1', // Light Gray
  '#F97316', // Orange (accent)
  '#EA580C', // Dark Orange
  '#FED7AA', // Peach
  '#DC2626', // Red
  '#16A34A', // Green
  '#0EA5E9', // Blue
  '#8B5CF6', // Purple
  '#FBBF24', // Yellow
  '#A78BFA', // Light Purple
  '#86EFAC', // Light Green
  '#FCA5A5', // Light Red
  '#7DD3FC', // Light Blue
  '#92400E', // Brown
  '#F3F4F6', // Off White
  '#FDE68A', // Light Yellow
];