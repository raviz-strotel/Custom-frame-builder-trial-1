# BUILD YOUR CUSTOM FRAME - Complete Application Specification

**Purpose**: This document provides a complete, detailed specification for recreating a real-time, in-browser image-to-pixel-art converter application. It can be embedded as a component on an e-commerce website (specifically Framer).

---

## TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [User Flow](#4-user-flow)
5. [Frontend Components Specification](#5-frontend-components-specification)
6. [Image Processing Algorithms](#6-image-processing-algorithms)
7. [Color System & Palette](#7-color-system--palette)
8. [UI/UX Design System](#8-uiux-design-system)
9. [File Structure](#9-file-structure)
10. [Implementation Details](#10-implementation-details)

---

## 1. PRODUCT OVERVIEW

### 1.1 What It Does
A browser-based pixel art studio that:
- Converts any uploaded image into a **32x32 pixel art** representation
- Uses advanced image processing (k-means clustering + Floyd-Steinberg dithering) for high-quality, recognizable results
- Provides a complete editing suite for manual refinement
- Designed for e-commerce integration (custom frame ordering)

### 1.2 Core Features
1. **Image Upload**: Drag-and-drop or file browser upload
2. **Handle-less Cropper**: Square crop tool for selecting the image region to convert
3. **Real-time Image Adjustments**: Brightness, Contrast, Saturation, Hue sliders
4. **Advanced Pixel Art Generation**: K-means color quantization + Floyd-Steinberg dithering
5. **Manual Pixel Editing Tools**: Paint, Fill, Color Picker
6. **Undo/Redo History**: Full history stack for editing
7. **Zoom Controls**: 50% to 300% zoom for precise editing
8. **Fixed 40-Color Palette**: Professional color palette for pixel art
9. **E-commerce Integration**: "Confirm" and "Add to Cart" buttons (placeholder)

### 1.3 Key Constraints
- Output is ALWAYS **32x32 pixels** (no other sizes)
- Uses a **fixed 40-color palette** (not customizable by user)
- All processing happens **client-side** (no server-side image processing)
- Cropper is **handle-less** (drag the entire crop box, no resize handles)
- Cropper is **always square** (1:1 aspect ratio)

---

## 2. TECHNOLOGY STACK

### 2.1 Frontend
- **Framework**: React 19
- **Build Tool**: Create React App (CRA) with CRACO
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Icons**: Lucide React
- **Routing**: React Router DOM 7

### 2.2 Backend
- **Framework**: FastAPI (Python)
- **Purpose**: Minimal - only serves basic API endpoints, no image processing
- **Database**: MongoDB (Motor async driver) - currently unused for main functionality

### 2.3 Key Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.5.1",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.507.0",
  "@radix-ui/react-slider": "^1.3.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.2.0"
}
```

---

## 3. APPLICATION ARCHITECTURE

### 3.1 Component Hierarchy
```
App.js
└── PixelArtConverter.jsx (Main Page - State Management)
    ├── UploadZone.jsx (Initial upload screen)
    ├── PlainCropper.jsx (Image cropping with overlay)
    ├── PixelStudio.jsx (Editing workspace)
    │   └── ImageAdjustments.jsx (Slider controls)
    └── Action Buttons (Confirm, Add to Cart)
```

### 3.2 State Management
All state is managed in the main `PixelArtConverter.jsx` component:

```javascript
// Core State
const [sourceImage, setSourceImage] = useState(null);           // Original uploaded image (HTMLImageElement)
const [pixelData, setPixelData] = useState(null);               // 32x32 ImageData object
const [cropperVisible, setCropperVisible] = useState(true);     // Toggle cropper visibility
const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 }); // Crop position
const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 }); // Displayed image size
const [processing, setProcessing] = useState(false);            // Loading state
const [adjustments, setAdjustments] = useState({
  brightness: 0,    // -100 to 100
  contrast: 0,      // -100 to 100
  saturation: 0,    // -100 to 100
  hue: 0            // 0 to 360
});
```

### 3.3 Data Flow
```
1. User uploads image → sourceImage state
2. Cropper renders → calculates displayDimensions, initializes cropBox
3. User drags crop box → cropBox updates → triggers processImage()
4. processImage():
   a. Extract cropped region from sourceImage using cropBox + displayDimensions
   b. Apply adjustments (brightness, contrast, etc.)
   c. Run advancedPixelate() algorithm
   d. Set pixelData (32x32 ImageData)
5. PixelStudio renders pixelData to canvas
6. User edits pixels → pixelData updates
```

---

## 4. USER FLOW

### 4.1 Initial State (No Image)
- Display centered title: "Build your custom frame"
- Subtitle: "Upload an image to get started"
- Upload zone with drag-and-drop + browse button

### 4.2 After Image Upload
1. **Header Row**: "Customize Your Frame" title + "New Image" button
2. **Original Image Section**:
   - Header: "Original Image" + "Hide/Show Cropper" button
   - Cropper overlay on image (or plain image if cropper hidden)
3. **Processing Indicator**: Spinner with "Processing with advanced algorithms..."
4. **Pixel Studio Section** (appears after processing):
   - Left sidebar: Image Adjustments sliders
   - Main area: 32x32 pixel canvas with grid
   - Tools bar: Paint, Fill, Pick, Undo, Redo
   - Color palette: 40-color grid
5. **Action Buttons**: "Confirm Custom Frame" + "Add to Cart"
6. **Footer Tip**: "Adjust sliders for real-time changes • Use tools to perfect your art • Zoom for precise mobile editing"

---

## 5. FRONTEND COMPONENTS SPECIFICATION

### 5.1 UploadZone.jsx
**Purpose**: File upload interface

**UI Elements**:
- Dashed border container (border-2 border-dashed)
- Upload icon (Lucide `Upload`) in circular background
- "Upload an Image" heading
- "Drag and drop or click to browse" subtext
- "Supported formats: JPG, PNG, GIF, WebP, BMP" hint
- "Browse Files" button with Image icon

**Behavior**:
- Entire zone is clickable
- Supports drag-and-drop
- Accepts any image/* file type
- On file select: creates HTMLImageElement, calls onImageUpload(img)

**Data Test IDs**:
- `upload-zone` - main container
- `browse-btn` - browse button
- `file-input` - hidden file input

```javascript
// Key implementation
const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => onImageUpload(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};
```

---

### 5.2 PlainCropper.jsx
**Purpose**: Handle-less, draggable square crop tool

**Props**:
```typescript
interface PlainCropperProps {
  image: HTMLImageElement;           // Source image
  cropBox: { x: number; y: number; width: number; height: number };
  onCropBoxChange: (cropBox, dimensions) => void;
  visible: boolean;                  // Show/hide cropper
}
```

**UI Elements**:
- Container div with relative positioning
- Displayed image (scaled to fit max 600px width)
- Semi-transparent overlay (rgba(0,0,0,0.6)) on non-cropped areas
- Square crop box with accent-colored border (border-2 border-accent)
- Grab cursor on crop box

**Behavior**:
1. On image load: Calculate display dimensions (max 600px width, maintain aspect ratio)
2. Initialize crop box: 60% of smallest dimension, centered
3. Crop box is SQUARE ONLY (width === height)
4. NO resize handles - user can only DRAG the entire box
5. Constrain movement within image bounds
6. Support both mouse and touch events

**Critical Implementation Details**:
```javascript
// Dimension calculation
const handleImageLoad = (e) => {
  const img = e.target;
  const containerWidth = Math.min(600, window.innerWidth - 64);
  const imgAspect = img.naturalWidth / img.naturalHeight;
  
  let displayWidth, displayHeight;
  if (imgAspect > 1) {
    displayWidth = containerWidth;
    displayHeight = containerWidth / imgAspect;
  } else {
    displayHeight = containerWidth;
    displayWidth = containerWidth * imgAspect;
  }
  
  // Initialize centered square crop box
  const size = Math.min(displayWidth, displayHeight) * 0.6;
  onCropBoxChange({
    x: (displayWidth - size) / 2,
    y: (displayHeight - size) / 2,
    width: size,
    height: size
  }, { width: displayWidth, height: displayHeight });
};
```

**Overlay Structure** (4 separate divs):
- Top overlay: `{ top: 0, left: 0, right: 0, height: cropBox.y }`
- Bottom overlay: `{ bottom: 0, left: 0, right: 0, height: imageDimensions.height - cropBox.y - cropBox.height }`
- Left overlay: `{ left: 0, top: cropBox.y, height: cropBox.height, width: cropBox.x }`
- Right overlay: `{ right: 0, top: cropBox.y, height: cropBox.height, width: imageDimensions.width - cropBox.x - cropBox.width }`

---

### 5.3 ImageAdjustments.jsx
**Purpose**: Real-time image adjustment sliders

**Props**:
```typescript
interface ImageAdjustmentsProps {
  adjustments: {
    brightness: number;  // -100 to 100, default 0
    contrast: number;    // -100 to 100, default 0
    saturation: number;  // -100 to 100, default 0
    hue: number;         // 0 to 360, default 0
  };
  onAdjustmentsChange: (adjustments) => void;
  onReset: () => void;
}
```

**UI Elements**:
- White card container with rounded corners
- Header: "Image Adjustments" + Reset button (with RotateCcw icon)
- 4 sliders with labels and current values:
  - Brightness: -100 to 100
  - Contrast: -100 to 100
  - Saturation: -100 to 100
  - Hue Shift: 0 to 360 (displayed with ° symbol)
- Footer text: "Adjustments apply in real-time" (italic, muted)

**Uses Shadcn Slider component**

---

### 5.4 PixelStudio.jsx
**Purpose**: Main editing workspace with canvas and tools

**Props**:
```typescript
interface PixelStudioProps {
  pixelData: ImageData;              // 32x32 pixel data
  onPixelDataChange: (ImageData) => void;
  adjustments: AdjustmentsObject;
  onAdjustmentsChange: (adjustments) => void;
  onResetAdjustments: () => void;
}
```

**Internal State**:
```javascript
const [tool, setTool] = useState('paint');     // 'paint' | 'fill' | 'pick'
const [selectedColor, setSelectedColor] = useState(DEFAULT_PALETTE[0]);
const [isDrawing, setIsDrawing] = useState(false);
const [history, setHistory] = useState([]);    // Array of ImageData snapshots
const [historyIndex, setHistoryIndex] = useState(-1);
const [zoom, setZoom] = useState(1);           // 0.5 to 3
const [scale] = useState(16);                  // Base pixel size
```

**Layout** (4-column grid on large screens):
- Column 1: ImageAdjustments component
- Columns 2-4: Canvas container

**Canvas Rendering**:
```javascript
const drawCanvas = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const size = 32;
  const displayScale = scale * zoom;  // 16 * zoom
  
  canvas.width = size * displayScale;
  canvas.height = size * displayScale;
  
  ctx.imageSmoothingEnabled = false;
  
  // Draw each pixel as a rectangle
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const r = pixelData.data[idx];
      const g = pixelData.data[idx + 1];
      const b = pixelData.data[idx + 2];
      
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * displayScale, y * displayScale, displayScale, displayScale);
    }
  }
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * displayScale, 0);
    ctx.lineTo(i * displayScale, size * displayScale);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * displayScale);
    ctx.lineTo(size * displayScale, i * displayScale);
    ctx.stroke();
  }
};
```

**Tools**:
1. **Paint Tool**: Click/drag to color individual pixels
2. **Fill Tool**: Flood fill algorithm (replaces connected same-color pixels)
3. **Pick Tool**: Click to sample color, automatically switches to Paint

**Flood Fill Algorithm**:
```javascript
const floodFill = (startX, startY) => {
  const newData = new Uint8ClampedArray(pixelData.data);
  const startIdx = (startY * 32 + startX) * 4;
  const targetColor = { r: newData[startIdx], g: newData[startIdx + 1], b: newData[startIdx + 2] };
  const fillColor = hexToRgb(selectedColor);
  
  if (!fillColor) return;
  if (targetColor.r === fillColor.r && targetColor.g === fillColor.g && targetColor.b === fillColor.b) return;
  
  const stack = [[startX, startY]];
  const visited = new Set();
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;
    if (visited.has(key) || x < 0 || x >= 32 || y < 0 || y >= 32) continue;
    
    const idx = (y * 32 + x) * 4;
    if (newData[idx] !== targetColor.r || newData[idx + 1] !== targetColor.g || newData[idx + 2] !== targetColor.b) continue;
    
    visited.add(key);
    newData[idx] = fillColor.r;
    newData[idx + 1] = fillColor.g;
    newData[idx + 2] = fillColor.b;
    
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  onPixelDataChange(new ImageData(newData, 32, 32));
  saveHistory();
};
```

**UI Sections**:
1. Canvas header: "Pixel Art (32x32)" + Zoom controls (ZoomOut, percentage, ZoomIn)
2. Tools bar: Paint, Fill, Pick buttons + divider + Undo, Redo buttons
3. Color palette: 10-column grid of 40 colors + selected color indicator

---

## 6. IMAGE PROCESSING ALGORITHMS

### 6.1 Main Processing Pipeline (advancedPixelate.js)

```javascript
export function advancedPixelate(image, size = 32, useDithering = true) {
  // Step 1: Draw original to temp canvas
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx.drawImage(image, 0, 0);
  
  // Step 2: High-quality downsample to 32x32
  const downsampled = downsampleWithAntialiasing(tempCanvas, size);
  
  // Step 3: Extract optimal 40-color palette using k-means
  const palette = kMeansQuantize(downsampled, 40);
  
  // Step 4: Apply Floyd-Steinberg dithering
  let finalImageData;
  if (useDithering) {
    finalImageData = floydSteinbergDither(downsampled, palette);
  } else {
    // Direct quantization without dithering
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
```

### 6.2 K-Means Color Quantization

**Purpose**: Extract the optimal 40 colors from the image

```javascript
function kMeansQuantize(imageData, k = 40) {
  const pixels = [];
  const data = imageData.data;
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }
  
  // Initialize centroids from DEFAULT_PALETTE
  let centroids = DEFAULT_PALETTE.slice(0, k).map(hex => hexToRgb(hex));
  
  // Run 10 iterations
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
    
    // Update centroids to cluster means
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0];
      const sum = cluster.reduce((acc, p) => ({
        r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b
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
```

### 6.3 Floyd-Steinberg Dithering

**Purpose**: Create smooth color transitions by distributing quantization error to neighboring pixels

```javascript
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
      
      // Distribute error using Floyd-Steinberg coefficients
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
      
      // Floyd-Steinberg error distribution pattern:
      //        X   7/16
      // 3/16  5/16  1/16
      distributeError(1, 0, 7/16);   // Right
      distributeError(-1, 1, 3/16);  // Bottom-left
      distributeError(0, 1, 5/16);   // Bottom
      distributeError(1, 1, 1/16);   // Bottom-right
    }
  }
  
  return new ImageData(data, width, height);
}
```

### 6.4 Perceptually-Weighted Color Distance

**Purpose**: Better color matching that accounts for human perception

```javascript
function findNearestPaletteColor(r, g, b, palette) {
  let minDist = Infinity;
  let nearest = palette[0];
  
  palette.forEach(hexColor => {
    const c = hexToRgb(hexColor);
    if (!c) return;
    
    // Weighted Euclidean distance (green is most perceptually important)
    const dist = Math.sqrt(
      2 * Math.pow(r - c.r, 2) +   // Red weight: 2
      4 * Math.pow(g - c.g, 2) +   // Green weight: 4
      3 * Math.pow(b - c.b, 2)     // Blue weight: 3
    );
    
    if (dist < minDist) {
      minDist = dist;
      nearest = hexColor;
    }
  });
  
  return hexToRgb(nearest);
}
```

### 6.5 Image Adjustments (imageAdjustments.js)

```javascript
export function applyImageAdjustments(image, adjustments) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const brightness = adjustments.brightness / 100;
  const contrast = (adjustments.contrast + 100) / 100;
  const saturation = (adjustments.saturation + 100) / 100;
  const hue = adjustments.hue;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Apply brightness
    r += brightness * 255;
    g += brightness * 255;
    b += brightness * 255;
    
    // Apply contrast
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
    
    // Convert to HSL for saturation and hue
    const hsl = rgbToHsl(r, g, b);
    hsl.s = Math.max(0, Math.min(1, hsl.s * saturation));
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
```

---

## 7. COLOR SYSTEM & PALETTE

### 7.1 Fixed 40-Color Palette

The palette is carefully designed for pixel art with good coverage of:
- Darks & depths (5 colors)
- Neutrals & lights (5 colors)
- Red family (5 colors)
- Orange family (4 colors)
- Yellow family (3 colors)
- Green family (5 colors)
- Blue family (6 colors)
- Purple/Magenta family (4 colors)
- Skin/Earth tones (3 colors)

```javascript
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
```

### 7.2 Color Utility Functions (colorUtils.js)

```javascript
// Hex to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// RGB to Hex
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Euclidean color distance
function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

// Find nearest palette color
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
```

---

## 8. UI/UX DESIGN SYSTEM

### 8.1 Color Tokens (CSS Variables)

```css
:root {
  --background: 43 33% 97%;           /* Warm off-white */
  --foreground: 24 10% 10%;           /* Near black */
  --card: 0 0% 100%;                   /* Pure white */
  --primary: 24 95% 53%;               /* Orange accent */
  --accent: 24 95% 53%;                /* Same as primary */
  --border: 20 6% 90%;                 /* Light gray */
  --muted-foreground: 25 5% 45%;       /* Medium gray */
  --radius: 0.5rem;
}
```

### 8.2 Custom Colors (Tailwind)

```javascript
// tailwind.config.js
colors: {
  'background-primary': '#FDFBF7',   // Cream white
  'background-secondary': '#F5F5F0', // Light warm gray
  'text-primary': '#1C1917',         // Dark charcoal
  'text-secondary': '#78716C',       // Medium gray
  'text-muted': '#A8A29E'            // Light gray
}
```

### 8.3 Typography

**Fonts** (loaded from Google Fonts):
- **Headings**: Manrope (weights: 400, 600, 800)
- **Body**: Inter (weights: 400, 500, 600)
- **Monospace**: JetBrains Mono (weights: 400, 500)

**Usage**:
- `.font-manrope` for headings and emphasis
- Default body uses Inter
- `.font-mono` or `.font-jetbrains` for code/values

### 8.4 Component Styling Patterns

**Cards**:
```css
bg-white rounded-xl border border-border p-6 shadow-sm
```

**Buttons (Accent)**:
```css
bg-accent hover:bg-accent-hover text-white font-semibold
```

**Buttons (Outline)**:
```css
border-accent text-accent hover:bg-accent hover:text-white
```

**Active Tool Button**:
```css
bg-accent text-white
```

**Sliders**: Use Shadcn Slider component with accent color

### 8.5 Responsive Breakpoints

- Mobile-first approach
- `sm:` - 640px (small phones)
- `md:` - 768px (tablets)
- `lg:` - 1024px (desktops) - used for sidebar layout switch

### 8.6 Key Layout Classes

**Main container**:
```css
min-h-screen bg-background-primary py-8
max-w-7xl mx-auto px-4 md:px-8
```

**Grid for Pixel Studio**:
```css
grid grid-cols-1 lg:grid-cols-4 gap-4
/* Adjustments: lg:col-span-1 */
/* Canvas: lg:col-span-3 */
```

**Color palette grid**:
```css
grid grid-cols-10 gap-2
```

---

## 9. FILE STRUCTURE

```
/app
├── backend/
│   ├── .env                    # MONGO_URL, DB_NAME
│   ├── server.py               # FastAPI minimal server
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn components (button, slider, etc.)
│   │   │   ├── UploadZone.jsx
│   │   │   ├── PlainCropper.jsx
│   │   │   ├── PixelStudio.jsx
│   │   │   ├── ImageAdjustments.jsx
│   │   │   └── PixelEditor.jsx (legacy, not used)
│   │   ├── pages/
│   │   │   └── PixelArtConverter.jsx
│   │   ├── utils/
│   │   │   ├── colorUtils.js
│   │   │   ├── advancedPixelate.js
│   │   │   ├── imageAdjustments.js
│   │   │   └── pixelateImage.js (legacy, not used)
│   │   ├── lib/
│   │   │   └── utils.js        # cn() helper for Tailwind
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css           # Tailwind + custom styles
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── package.json
```

---

## 10. IMPLEMENTATION DETAILS

### 10.1 Critical Race Condition Fix

The image processing uses a timeout to debounce rapid crop box changes:

```javascript
const processingTimeoutRef = useRef(null);

const processImage = () => {
  const croppedImg = getCroppedImage();
  if (!croppedImg) return;
  
  setProcessing(true);
  
  if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
  
  processingTimeoutRef.current = setTimeout(() => {
    // Wait for cropped image to load before processing
    const processWithImage = () => {
      try {
        const adjustedCanvas = applyImageAdjustments(croppedImg, adjustments);
        const adjustedImg = new Image();
        
        const processAdjusted = () => {
          const imageData = advancedPixelate(adjustedImg, 32, true);
          setPixelData(imageData);
          setProcessing(false);
        };
        
        adjustedImg.onload = processAdjusted;
        adjustedImg.src = adjustedCanvas.toDataURL();
        
        // Handle synchronous load (data URLs)
        if (adjustedImg.complete) processAdjusted();
      } catch (error) {
        console.error('Processing error:', error);
        setProcessing(false);
      }
    };
    
    croppedImg.onload = processWithImage;
    if (croppedImg.complete) processWithImage();
  }, 150);  // 150ms debounce
};
```

### 10.2 Crop Box to Image Coordinate Conversion

The cropper displays a scaled version of the image. Convert crop coordinates:

```javascript
const getCroppedImage = () => {
  if (!sourceImage || cropBox.width === 0 || displayDimensions.width === 0) return null;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate scale factors
  const scaleX = sourceImage.width / displayDimensions.width;
  const scaleY = sourceImage.height / displayDimensions.height;
  
  // Convert display coordinates to actual image coordinates
  const cropX = cropBox.x * scaleX;
  const cropY = cropBox.y * scaleY;
  const cropWidth = cropBox.width * scaleX;
  const cropHeight = cropBox.height * scaleY;
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.drawImage(sourceImage, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
};
```

### 10.3 Effect Dependencies

```javascript
// Trigger reprocessing when crop or adjustments change
useEffect(() => {
  if (sourceImage && cropBox.width > 0) {
    processImage();
  }
}, [cropBox, adjustments]);
```

### 10.4 Canvas Pixel Art Rendering Style

```css
canvas {
  image-rendering: pixelated;
}
```

Also in JavaScript:
```javascript
ctx.imageSmoothingEnabled = false;
```

### 10.5 Touch Support for Mobile

The cropper supports both mouse and touch:

```javascript
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}
onMouseLeave={handleMouseUp}
onTouchStart={handleMouseDown}
onTouchMove={handleMouseMove}
onTouchEnd={handleMouseUp}
```

With touch-action CSS:
```javascript
style={{ touchAction: 'none' }}
```

---

## SUMMARY

This application is a sophisticated browser-based pixel art converter with:

1. **Advanced image processing** using k-means clustering and Floyd-Steinberg dithering
2. **Real-time adjustments** via client-side canvas manipulation
3. **Complete editing suite** with paint, fill, and color picker tools
4. **Handle-less cropper** for intuitive square selection
5. **Fixed 40-color professional palette** for consistent results
6. **Responsive design** that works on mobile and desktop

The entire processing pipeline runs in the browser with no server-side image processing required. The backend exists only as a placeholder for potential future e-commerce integration.

**Branding**: "Build your custom frame"
**Output**: Always 32x32 pixels
**Palette**: Fixed 40 colors (not user-customizable)

---

*Document generated for complete application replication. All algorithms, components, and styling specifications are included.*
