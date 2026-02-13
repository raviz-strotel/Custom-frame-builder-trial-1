import { DEFAULT_PALETTE, hexToRgb, rgbToHex } from './colorUtils';

/**
 * Advanced color quantization using k-means clustering
 */
function kMeansQuantize(imageData, k = 40) {
  const pixels = [];
  const data = imageData.data;
  
  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2]
    });
  }
  
  // Initialize centroids from existing palette
  let centroids = DEFAULT_PALETTE.slice(0, k).map(hex => hexToRgb(hex));
  
  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters = Array(k).fill(null).map(() => []);
    
    // Assign pixels to nearest centroid
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(pixel.r - centroid.r, 2) +
          Math.pow(pixel.g - centroid.g, 2) +
          Math.pow(pixel.b - centroid.b, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      });
      
      clusters[clusterIndex].push(pixel);
    });
    
    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0];
      const sum = cluster.reduce((acc, p) => ({
        r: acc.r + p.r,
        g: acc.g + p.g,
        b: acc.b + p.b
      }), { r: 0, g: 0, b: 0 });
      
      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length)
      };
    });
  }
  
  return centroids.map(c => rgbToHex(c.r, c.g, c.b));
}

/**
 * Find nearest color in palette
 */
function findNearestPaletteColor(r, g, b, palette) {
  let minDist = Infinity;
  let nearest = palette[0];
  
  palette.forEach(hexColor => {
    const c = hexToRgb(hexColor);
    if (!c) return;
    
    // Weighted Euclidean distance (more weight on perceptually important channels)
    const dist = Math.sqrt(
      2 * Math.pow(r - c.r, 2) +
      4 * Math.pow(g - c.g, 2) +
      3 * Math.pow(b - c.b, 2)
    );
    
    if (dist < minDist) {
      minDist = dist;
      nearest = hexColor;
    }
  });
  
  return hexToRgb(nearest);
}

/**
 * Floyd-Steinberg dithering for smooth color transitions
 */
function floydSteinbergDither(imageData, palette) {
  const width = imageData.width;
  const height = imageData.height;
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const oldR = data[idx];
      const oldG = data[idx + 1];
      const oldB = data[idx + 2];
      
      // Find nearest palette color
      const newColor = findNearestPaletteColor(oldR, oldG, oldB, palette);
      
      data[idx] = newColor.r;
      data[idx + 1] = newColor.g;
      data[idx + 2] = newColor.b;
      
      // Calculate error
      const errR = oldR - newColor.r;
      const errG = oldG - newColor.g;
      const errB = oldB - newColor.b;
      
      // Distribute error to neighboring pixels
      const distributeError = (xOffset, yOffset, factor) => {
        const nx = x + xOffset;
        const ny = y + yOffset;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          data[nIdx] = Math.max(0, Math.min(255, data[nIdx] + errR * factor));
          data[nIdx + 1] = Math.max(0, Math.min(255, data[nIdx + 1] + errG * factor));
          data[nIdx + 2] = Math.max(0, Math.min(255, data[nIdx + 2] + errB * factor));
        }
      };
      
      distributeError(1, 0, 7/16);
      distributeError(-1, 1, 3/16);
      distributeError(0, 1, 5/16);
      distributeError(1, 1, 1/16);
    }
  }
  
  return new ImageData(data, width, height);
}

/**
 * High-quality image downsampling with antialiasing
 */
function downsampleWithAntialiasing(sourceCanvas, targetSize) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw with proper scaling
  ctx.drawImage(sourceCanvas, 0, 0, targetSize, targetSize);
  
  return ctx.getImageData(0, 0, targetSize, targetSize);
}

/**
 * Main advanced pixelation function
 */
export function advancedPixelate(image, size = 32, useDithering = true) {
  // Step 1: Create high-quality downsampled version
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx.drawImage(image, 0, 0);
  
  // Step 2: Downsample with antialiasing
  const downsampled = downsampleWithAntialiasing(tempCanvas, size);
  
  // Step 3: Extract optimal color palette from image
  const palette = kMeansQuantize(downsampled, 40);
  
  // Step 4: Apply dithering for smooth transitions
  let finalImageData;
  if (useDithering) {
    finalImageData = floydSteinbergDither(downsampled, palette);
  } else {
    // Without dithering, just quantize
    const data = downsampled.data;
    for (let i = 0; i < data.length; i += 4) {
      const nearest = findNearestPaletteColor(data[i], data[i + 1], data[i + 2], palette);
      data[i] = nearest.r;
      data[i + 1] = nearest.g;
      data[i + 2] = nearest.b;
    }
    finalImageData = downsampled;
  }
  
  return finalImageData;
}

/**
 * Draw pixelated image to canvas with sharp edges
 */
export function drawAdvancedPixelArt(canvas, imageData, displaySize = 512) {
  const ctx = canvas.getContext('2d');
  const pixelSize = imageData.width;
  
  canvas.width = displaySize;
  canvas.height = displaySize;
  
  // Create temporary canvas with pixelated data
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = pixelSize;
  tempCanvas.height = pixelSize;
  tempCtx.putImageData(imageData, 0, 0);
  
  // Disable smoothing for crisp pixel edges
  ctx.imageSmoothingEnabled = false;
  
  // Draw scaled up
  ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
}