import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crop, RotateCcw } from 'lucide-react';

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const [cropArea, setCropArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const containerWidth = 600;
      const scale = containerWidth / Math.max(image.width, image.height);
      
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Set default crop to center square
      const size = Math.min(canvas.width, canvas.height) * 0.8;
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;
      setCropArea({ x, y, width: size, height: size });
    }
  }, [image]);

  useEffect(() => {
    if (cropArea && canvasRef.current) {
      drawCanvas();
    }
  }, [cropArea]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const containerWidth = 600;
    const scale = containerWidth / Math.max(image.width, image.height);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area
    if (cropArea) {
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.drawImage(
        image,
        cropArea.x / scale, cropArea.y / scale, cropArea.width / scale, cropArea.height / scale,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height
      );
      
      // Draw border
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    const size = Math.min(width, height);
    
    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: size,
      height: size
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = () => {
    if (!cropArea) return;
    
    const canvas = canvasRef.current;
    const containerWidth = 600;
    const scale = containerWidth / Math.max(image.width, image.height);
    
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = cropArea.width / scale;
    croppedCanvas.height = cropArea.height / scale;
    
    ctx.drawImage(
      image,
      cropArea.x / scale, cropArea.y / scale, cropArea.width / scale, cropArea.height / scale,
      0, 0, croppedCanvas.width, croppedCanvas.height
    );
    
    const croppedImage = new Image();
    croppedImage.onload = () => {
      onCropComplete(croppedImage);
    };
    croppedImage.src = croppedCanvas.toDataURL();
  };

  const resetCrop = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const size = Math.min(canvas.width, canvas.height) * 0.8;
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;
      setCropArea({ x, y, width: size, height: size });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <h3 className="font-manrope font-semibold text-lg text-text-primary mb-3">
          Select Area to Convert
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Drag to select a square area of the image for pixel art conversion
        </p>
        
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="border border-border rounded cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            data-testid="crop-canvas"
          />
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={resetCrop}
            data-testid="reset-crop-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Selection
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