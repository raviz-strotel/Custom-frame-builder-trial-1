/**
 * Apply real-time image adjustments
 */
export function applyImageAdjustments(image, adjustments) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = image.width;
  canvas.height = image.height;
  
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply adjustments
  const brightness = adjustments.brightness / 100;
  const contrast = (adjustments.contrast + 100) / 100;
  const saturation = (adjustments.saturation + 100) / 100;
  const hue = adjustments.hue;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Brightness
    r += brightness * 255;
    g += brightness * 255;
    b += brightness * 255;
    
    // Contrast
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
    
    // Convert to HSL for saturation and hue adjustments
    const hsl = rgbToHsl(r, g, b);
    
    // Saturation
    hsl.s = Math.max(0, Math.min(1, hsl.s * saturation));
    
    // Hue shift
    hsl.h = (hsl.h + hue / 360) % 1;
    
    // Convert back to RGB
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    
    data[i] = Math.max(0, Math.min(255, rgb.r));
    data[i + 1] = Math.max(0, Math.min(255, rgb.g));
    data[i + 2] = Math.max(0, Math.min(255, rgb.b));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}