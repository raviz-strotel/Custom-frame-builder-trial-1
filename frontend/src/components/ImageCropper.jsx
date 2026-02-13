import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropSize, setCropSize] = useState(300);

  useEffect(() => {
    if (image && imageRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      
      // Calculate displayed image dimensions
      const containerWidth = Math.min(600, container.clientWidth - 32);
      const imgAspect = image.width / image.height;
      
      let displayWidth, displayHeight;
      if (imgAspect > 1) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / imgAspect;
      } else {
        displayHeight = containerWidth;
        displayWidth = containerWidth * imgAspect;
      }
      
      setImageDimensions({ width: displayWidth, height: displayHeight });
      
      // Set crop size to 80% of smaller dimension
      const size = Math.min(displayWidth, displayHeight) * 0.8;
      setCropSize(size);
      
      // Center the crop box
      setCropPosition({
        x: (displayWidth - size) / 2,
        y: (displayHeight - size) / 2
      });
      
      setImageLoaded(true);
    }
  }, [image]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    // Check if click is inside crop box
    if (
      x >= cropPosition.x &&
      x <= cropPosition.x + cropSize &&
      y >= cropPosition.y &&
      y <= cropPosition.y + cropSize
    ) {
      setIsDragging(true);
      setDragStart({
        x: x - cropPosition.x,
        y: y - cropPosition.y
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    let newX = x - dragStart.x;
    let newY = y - dragStart.y;
    
    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, imageDimensions.width - cropSize));
    newY = Math.max(0, Math.min(newY, imageDimensions.height - cropSize));
    
    setCropPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate scale from displayed size to actual image size
    const scaleX = image.width / imageDimensions.width;
    const scaleY = image.height / imageDimensions.height;
    
    // Calculate crop area in original image coordinates
    const cropX = cropPosition.x * scaleX;
    const cropY = cropPosition.y * scaleY;
    const cropWidth = cropSize * scaleX;
    const cropHeight = cropSize * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    const croppedImage = new Image();
    croppedImage.onload = () => {
      onCropComplete(croppedImage);
    };
    croppedImage.src = canvas.toDataURL();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-manrope font-semibold text-lg text-text-primary mb-2">
          Position Your Image
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Drag the selection box to choose which part to convert
        </p>
        
        <div 
          ref={containerRef}
          className="relative mx-auto flex justify-center items-center touch-none"
          style={{ minHeight: '400px' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {imageLoaded && (
            <div className="relative" style={{ width: imageDimensions.width, height: imageDimensions.height }}>
              {/* Image */}
              <img
                ref={imageRef}
                src={image.src}
                alt="Upload"
                className="block w-full h-full object-cover rounded-lg"
                style={{ 
                  width: imageDimensions.width, 
                  height: imageDimensions.height,
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
              
              {/* Overlay - outside crop area */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top overlay */}
                <div 
                  className="absolute top-0 left-0 right-0 bg-black/50"
                  style={{ height: cropPosition.y }}
                />
                {/* Bottom overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black/50"
                  style={{ height: imageDimensions.height - cropPosition.y - cropSize }}
                />
                {/* Left overlay */}
                <div 
                  className="absolute left-0 bg-black/50"
                  style={{ 
                    top: cropPosition.y,
                    height: cropSize,
                    width: cropPosition.x
                  }}
                />
                {/* Right overlay */}
                <div 
                  className="absolute right-0 bg-black/50"
                  style={{ 
                    top: cropPosition.y,
                    height: cropSize,
                    width: imageDimensions.width - cropPosition.x - cropSize
                  }}
                />
              </div>
              
              {/* Crop box */}
              <div
                className={`absolute border-4 border-accent rounded-lg transition-shadow ${
                  isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab shadow-lg'
                }`}
                style={{
                  left: cropPosition.x,
                  top: cropPosition.y,
                  width: cropSize,
                  height: cropSize,
                  boxShadow: isDragging ? '0 0 0 2px rgba(249, 115, 22, 0.3)' : 'none'
                }}
                data-testid="crop-box"
              >
                {/* Corner indicators */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full border-2 border-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full border-2 border-white" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent rounded-full border-2 border-white" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent rounded-full border-2 border-white" />
                
                {/* Center drag hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-accent/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {isDragging ? 'Moving...' : 'Drag to Move'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            data-testid="cancel-crop-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCrop}
            className="bg-accent hover:bg-accent-hover text-white"
            data-testid="confirm-crop-btn"
          >
            <Crop className="w-4 h-4 mr-2" />
            Convert to Pixel Art
          </Button>
        </div>
      </div>
    </div>
  );
}
