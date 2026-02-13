import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadZone from '@/components/UploadZone';
import ImprovedCropper from '@/components/ImprovedCropper';
import ImageAdjustments from '@/components/ImageAdjustments';
import PixelEditor from '@/components/PixelEditor';
import { advancedPixelate } from '@/utils/advancedPixelate';
import { applyImageAdjustments } from '@/utils/imageAdjustments';
import { CheckCircle2, Download } from 'lucide-react';

export default function PixelArtConverter() {
  const [sourceImage, setSourceImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [pixelData, setPixelData] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0
  });
  const [activeTab, setActiveTab] = useState('adjust');
  const adjustedImageRef = useRef(null);
  const processingTimeoutRef = useRef(null);

  const handleImageUpload = (img) => {
    setSourceImage(img);
    setShowCropper(true);
    setCroppedImage(null);
    setPixelData(null);
    setShowEditor(false);
  };

  const handleCropComplete = (croppedImg) => {
    setCroppedImage(croppedImg);
    setShowCropper(false);
    setShowEditor(true);
    processImage(croppedImg);
  };

  const processImage = (img) => {
    setProcessing(true);
    
    // Clear any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    // Process with small delay to keep UI responsive
    processingTimeoutRef.current = setTimeout(() => {
      try {
        // Apply adjustments first
        const adjustedCanvas = applyImageAdjustments(img, adjustments);
        const adjustedImg = new Image();
        adjustedImg.onload = () => {
          adjustedImageRef.current = adjustedImg;
          
          // Then pixelate
          const imageData = advancedPixelate(adjustedImg, 32, true);
          setPixelData(imageData);
          setProcessing(false);
        };
        adjustedImg.src = adjustedCanvas.toDataURL();
      } catch (error) {
        console.error('Processing error:', error);
        setProcessing(false);
      }
    }, 100);
  };

  // Real-time adjustment updates
  useEffect(() => {
    if (croppedImage && showEditor) {
      processImage(croppedImage);
    }
  }, [adjustments]);

  const handleResetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0
    });
  };

  const handleStartOver = () => {
    setSourceImage(null);
    setCroppedImage(null);
    setPixelData(null);
    setShowCropper(false);
    setShowEditor(false);
    handleResetAdjustments();
  };

  const handleDownload = () => {
    if (!pixelData) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 32;
    canvas.height = 32;
    ctx.putImageData(pixelData, 0, 0);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-art-32x32.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {!sourceImage && !showCropper && !showEditor && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="font-manrope font-bold text-3xl text-text-primary mb-2">Pixel Art Studio</h1>
              <p className="text-text-secondary">Create stunning 32×32 pixel art with full creative control</p>
            </div>
            <UploadZone onImageUpload={handleImageUpload} />
          </div>
        )}

        {showCropper && sourceImage && (
          <ImprovedCropper
            image={sourceImage}
            onCropComplete={handleCropComplete}
            onCancel={handleStartOver}
          />
        )}

        {showEditor && croppedImage && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-manrope font-bold text-2xl text-text-primary">Edit Your Pixel Art</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleStartOver}>New Image</Button>
                <Button onClick={handleDownload} className="bg-accent hover:bg-accent-hover text-white">
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Adjustments */}
              <div className="lg:col-span-1">
                <ImageAdjustments
                  adjustments={adjustments}
                  onAdjustmentsChange={setAdjustments}
                  onReset={handleResetAdjustments}
                />
                
                {processing && (
                  <div className="mt-4 bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
                    <p className="text-xs text-text-secondary">Processing...</p>
                  </div>
                )}
              </div>
              
              {/* Right: Editor */}
              <div className="lg:col-span-2">
                {pixelData && (
                  <PixelEditor
                    pixelData={pixelData}
                    onPixelDataChange={setPixelData}
                  />
                )}
              </div>
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <p className="text-sm text-text-secondary text-center">
                ✨ Adjust sliders for real-time changes • Use Paint, Fill, and Pick tools to perfect your art • Undo/Redo available
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}