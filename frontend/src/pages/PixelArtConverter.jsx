import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import UploadZone from '@/components/UploadZone';
import SmoothCropper from '@/components/SmoothCropper';
import { advancedPixelate, drawAdvancedPixelArt } from '@/utils/advancedPixelate';
import { CheckCircle2 } from 'lucide-react';

export default function PixelArtConverter() {
  const [sourceImage, setSourceImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [pixelatedData, setPixelatedData] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [processing, setProcessing] = useState(false);
  const canvasRef = React.useRef(null);

  const handleImageUpload = (img) => {
    setSourceImage(img);
    setShowCropper(true);
    setCroppedImage(null);
    setPixelatedData(null);
  };

  const handleCropComplete = async (croppedImg) => {
    setCroppedImage(croppedImg);
    setShowCropper(false);
    setProcessing(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        // Use advanced pixelation with dithering
        const imageData = advancedPixelate(croppedImg, 32, true);
        setPixelatedData(imageData);
      } catch (error) {
        console.error('Pixelation error:', error);
      } finally {
        setProcessing(false);
      }
    }, 100);
  };

  useEffect(() => {
    if (pixelatedData && canvasRef.current) {
      drawAdvancedPixelArt(canvasRef.current, pixelatedData, 512);
    }
  }, [pixelatedData]);

  const handleStartOver = () => {
    setSourceImage(null);
    setCroppedImage(null);
    setPixelatedData(null);
    setShowCropper(false);
  };

  const handleConfirm = () => {
    alert('Pixel art confirmed! Ready for integration.');
  };

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <main className="max-w-4xl mx-auto px-4 md:px-8">
        {!sourceImage && !showCropper && !pixelatedData && (
          <div className="space-y-6">
            <UploadZone onImageUpload={handleImageUpload} />
          </div>
        )}

        {showCropper && sourceImage && (
          <SmoothCropper
            image={sourceImage}
            onCropComplete={handleCropComplete}
            onCancel={handleStartOver}
          />
        )}

        {processing && (
          <div className="bg-white rounded-xl border border-border p-12 shadow-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary">Processing with advanced algorithms...</p>
          </div>
        )}

        {pixelatedData && !showCropper && !processing && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-manrope font-semibold text-lg text-text-primary mb-4 text-center">
                Pixel Art (32 × 32)
              </h3>
              
              <div className="flex justify-center mb-6">
                <div className="bg-background-secondary rounded-xl border border-border overflow-hidden shadow-sm inline-block">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                    style={{ imageRendering: 'pixelated' }}
                    data-testid="pixel-preview-canvas"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleStartOver} data-testid="start-over-btn">
                  Upload New Image
                </Button>
                <Button onClick={handleConfirm} className="bg-accent hover:bg-accent-hover text-white" data-testid="confirm-btn">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Confirm
                </Button>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <p className="text-sm text-text-secondary text-center">
                Processed with smart color quantization and Floyd-Steinberg dithering
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}