import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff, Eye, ShoppingCart, CheckCircle } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import PlainCropper from '@/components/PlainCropper';
import PixelStudio from '@/components/PixelStudio';
import { advancedPixelate } from '@/utils/advancedPixelate';
import { applyImageAdjustments } from '@/utils/imageAdjustments';

export default function PixelArtConverter() {
  const [sourceImage, setSourceImage] = useState(null);
  const [pixelData, setPixelData] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(true);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [processing, setProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0
  });
  const processingTimeoutRef = useRef(null);
  const croppedImageRef = useRef(null);

  const handleImageUpload = (img) => {
    setSourceImage(img);
    setCropperVisible(true);
    setPixelData(null);
  };

  const getCroppedImage = () => {
    if (!sourceImage || cropBox.width === 0) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const imgElement = document.querySelector('img[alt="Uploaded"]');
    if (!imgElement) return null;
    
    const displayWidth = imgElement.width;
    const displayHeight = imgElement.height;
    const scaleX = sourceImage.width / displayWidth;
    const scaleY = sourceImage.height / displayHeight;
    
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

  const processImage = () => {
    const croppedImg = getCroppedImage();
    if (!croppedImg) return;
    
    setProcessing(true);
    
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    
    processingTimeoutRef.current = setTimeout(() => {
      croppedImg.onload = () => {
        try {
          const adjustedCanvas = applyImageAdjustments(croppedImg, adjustments);
          const adjustedImg = new Image();
          adjustedImg.onload = () => {
            croppedImageRef.current = adjustedImg;
            const imageData = advancedPixelate(adjustedImg, 32, true);
            setPixelData(imageData);
            setProcessing(false);
          };
          adjustedImg.src = adjustedCanvas.toDataURL();
        } catch (error) {
          console.error('Processing error:', error);
          setProcessing(false);
        }
      };
    }, 150);
  };

  useEffect(() => {
    if (sourceImage && cropBox.width > 0) {
      processImage();
    }
  }, [cropBox, adjustments]);

  const handleResetAdjustments = () => {
    setAdjustments({ brightness: 0, contrast: 0, saturation: 0, hue: 0 });
  };

  const handleStartOver = () => {
    setSourceImage(null);
    setPixelData(null);
    setCropBox({ x: 0, y: 0, width: 0, height: 0 });
    handleResetAdjustments();
  };

  const handleConfirm = () => {
    alert('Custom frame confirmed! Ready for integration.');
  };

  const handleAddToCart = () => {
    alert('Added to cart! This will integrate with your e-commerce workflow.');
  };

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {!sourceImage ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="font-manrope font-bold text-3xl text-text-primary mb-2">Pixel Art Studio</h1>
              <p className="text-text-secondary">Create custom 32x32 pixel art frames</p>
            </div>
            <UploadZone onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-manrope font-bold text-2xl text-text-primary">Create Your Frame</h2>
              <Button variant="outline" onClick={handleStartOver}>New Image</Button>
            </div>
            
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-manrope font-semibold text-lg">Original Image</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCropperVisible(!cropperVisible)}
                >
                  {cropperVisible ? (
                    <><EyeOff className="w-4 h-4 mr-2" />Hide Cropper</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-2" />Show Cropper</>
                  )}
                </Button>
              </div>
              
              <div className="flex justify-center">
                <PlainCropper
                  image={sourceImage}
                  cropBox={cropBox}
                  onCropBoxChange={setCropBox}
                  visible={cropperVisible}
                />
              </div>
              
              {!cropperVisible && sourceImage && (
                <div className="flex justify-center">
                  <img
                    src={sourceImage.src}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              )}
            </div>
            
            {processing && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">Processing with advanced algorithms...</p>
              </div>
            )}
            
            {pixelData && (
              <>
                <PixelStudio
                  pixelData={pixelData}
                  onPixelDataChange={setPixelData}
                  adjustments={adjustments}
                  onAdjustmentsChange={setAdjustments}
                  onResetAdjustments={handleResetAdjustments}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleConfirm}
                    size="lg"
                    className="bg-accent hover:bg-accent-hover text-white font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Custom Frame
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
                
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary text-center">
                    Adjust sliders for real-time changes • Use tools to perfect your art • Zoom for precise mobile editing
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
