import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import UploadZone from '@/components/UploadZone';
import ColorPalette from '@/components/ColorPalette';
import PixelPreview from '@/components/PixelPreview';
import { DEFAULT_PALETTE } from '@/utils/colorUtils';
import { pixelateImage } from '@/utils/pixelateImage';
import { Sparkles } from 'lucide-react';

export default function PixelArtConverter() {
  const [sourceImage, setSourceImage] = useState(null);
  const [pixelSize, setPixelSize] = useState('32');
  const [palette, setPalette] = useState([...DEFAULT_PALETTE]);
  const [pixelatedData, setPixelatedData] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);

  const handleImageUpload = (img) => {
    setSourceImage(img);
    
    // Create original preview
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = parseInt(pixelSize);
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    setOriginalImageData(ctx.getImageData(0, 0, size, size));
  };

  // Reprocess image when pixel size or palette changes
  useEffect(() => {
    if (sourceImage) {
      const size = parseInt(pixelSize);
      const imageData = pixelateImage(sourceImage, size, palette);
      setPixelatedData(imageData);
      
      // Update original preview with new size
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(sourceImage, 0, 0, size, size);
      setOriginalImageData(ctx.getImageData(0, 0, size, size));
    }
  }, [sourceImage, pixelSize, palette]);

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-manrope font-bold text-2xl md:text-3xl text-text-primary">
                PixelForge
              </h1>
              <p className="text-sm text-text-secondary">Transform images into pixel art</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Zone */}
            {!sourceImage && <UploadZone onImageUpload={handleImageUpload} />}
            
            {sourceImage && (
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-manrope font-semibold text-lg text-text-primary">
                    Image Loaded
                  </h3>
                  <button
                    onClick={() => {
                      setSourceImage(null);
                      setPixelatedData(null);
                      setOriginalImageData(null);
                    }}
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                    data-testid="remove-image-btn"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-text-secondary">✓ Ready to convert</p>
              </div>
            )}

            {/* Pixel Size Selector */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <Label className="font-manrope font-semibold text-base text-text-primary mb-4 block">
                Pixel Size
              </Label>
              <RadioGroup value={pixelSize} onValueChange={setPixelSize} data-testid="pixel-size-selector">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                    <RadioGroupItem value="16" id="size-16" data-testid="size-16" />
                    <Label htmlFor="size-16" className="cursor-pointer flex-1">
                      <span className="font-jetbrains text-sm text-text-primary">16 × 16</span>
                      <span className="text-xs text-text-muted ml-2">Retro</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                    <RadioGroupItem value="32" id="size-32" data-testid="size-32" />
                    <Label htmlFor="size-32" className="cursor-pointer flex-1">
                      <span className="font-jetbrains text-sm text-text-primary">32 × 32</span>
                      <span className="text-xs text-text-muted ml-2">Standard</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Color Palette */}
            <ColorPalette colors={palette} onColorsChange={setPalette} />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div data-testid="original-preview">
                <PixelPreview
                  imageData={originalImageData}
                  pixelSize={parseInt(pixelSize)}
                  title="Original"
                />
              </div>

              {/* Pixelated Preview */}
              <div data-testid="converted-preview">
                <PixelPreview
                  imageData={pixelatedData}
                  pixelSize={parseInt(pixelSize)}
                  title="Pixel Art"
                />
              </div>
            </div>

            {pixelatedData && (
              <div className="mt-6 p-6 bg-white rounded-xl border border-border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-manrope font-semibold text-base text-text-primary mb-1">
                      Conversion Complete
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Your image has been converted to {pixelSize} × {pixelSize} pixel art using {palette.length} colors.
                      Adjust the color palette or pixel size to see different results.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}