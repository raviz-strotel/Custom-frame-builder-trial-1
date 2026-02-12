import { hexToRgb, findNearestColor } from './colorUtils';

/**
 * Pixelate an image using HTML5 Canvas API
 * @param {HTMLImageElement} image - Source image
 * @param {number} pixelSize - Target pixel dimensions (16 or 32)
 * @param {string[]} palette - Array of hex colors for the palette
 * @returns {ImageData} - Pixelated image data
 */
export function pixelateImage(image, pixelSize, palette) {
  // Create a temporary canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  
  // Draw the image scaled down to pixel size
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, pixelSize, pixelSize);
  
  // Get the image data
  const imageData = ctx.getImageData(0, 0, pixelSize, pixelSize);
  const pixels = imageData.data;
  
  // Apply palette reduction (nearest color matching)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Find nearest color in palette
    const nearestHex = findNearestColor({ r, g, b }, palette);
    const nearestRgb = hexToRgb(nearestHex);
    
    if (nearestRgb) {
      pixels[i] = nearestRgb.r;
      pixels[i + 1] = nearestRgb.g;
      pixels[i + 2] = nearestRgb.b;
      // Alpha stays the same
    }
  }
  
  return imageData;
}

/**
 * Draw pixelated image data to a canvas with sharp edges
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {ImageData} imageData - Pixelated image data
 * @param {number} displaySize - Size to display (for scaling up)
 */
export function drawPixelatedImage(canvas, imageData, displaySize = 512) {
  const ctx = canvas.getContext('2d');
  const pixelSize = imageData.width;
  
  canvas.width = displaySize;
  canvas.height = displaySize;
  
  // Create temporary canvas with the pixelated data
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = pixelSize;
  tempCanvas.height = pixelSize;
  tempCtx.putImageData(imageData, 0, 0);
  
  // Disable smoothing for sharp pixel edges
  ctx.imageSmoothingEnabled = false;
  
  // Draw scaled up
  ctx.drawImage(tempCanvas, 0, 0, pixelSize, pixelSize, 0, 0, displaySize, displaySize);
}