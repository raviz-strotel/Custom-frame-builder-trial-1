import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

export default function SmoothCropper({ image, onCropComplete, onCancel }) {
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [dragState, setDragState] = useState({ isDragging: false, isResizing: false, handle: null, startX: 0, startY: 0, startBox: null });
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (image) {
      setImageSrc(image.src);
    }
  }, [image]);

  const handleImageLoad = (e) => {
    const img = e.target;
    const containerWidth = Math.min(700, window.innerWidth - 64);
    const imgAspect = img.naturalWidth / img.naturalHeight;
    
    let displayWidth, displayHeight;
    if (imgAspect > 1) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imgAspect;
    } else {
      displayHeight = containerWidth;
      displayWidth = containerWidth * imgAspect;
    }
    
    setImageDimensions({ width: displayWidth, height: displayHeight });
    
    // Set initial crop to 60% of smaller dimension
    const size = Math.min(displayWidth, displayHeight) * 0.6;
    setCropBox({
      x: (displayWidth - size) / 2,
      y: (displayHeight - size) / 2,
      width: size,
      height: size
    });
  };

  const getResizeHandle = (x, y) => {
    const handleSize = 20;
    const { x: bx, y: by, width, height } = cropBox;
    
    // Check corners first
    if (Math.abs(x - bx) < handleSize && Math.abs(y - by) < handleSize) return 'nw';
    if (Math.abs(x - (bx + width)) < handleSize && Math.abs(y - by) < handleSize) return 'ne';
    if (Math.abs(x - bx) < handleSize && Math.abs(y - (by + height)) < handleSize) return 'sw';
    if (Math.abs(x - (bx + width)) < handleSize && Math.abs(y - (by + height)) < handleSize) return 'se';
    
    // Check edges
    if (Math.abs(x - bx) < handleSize && y > by && y < by + height) return 'w';
    if (Math.abs(x - (bx + width)) < handleSize && y > by && y < by + height) return 'e';
    if (Math.abs(y - by) < handleSize && x > bx && x < bx + width) return 'n';
    if (Math.abs(y - (by + height)) < handleSize && x > bx && x < bx + width) return 's';
    
    return null;
  };

  const handlePointerDown = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const handle = getResizeHandle(x, y);
    
    if (handle) {
      e.preventDefault();
      setDragState({
        isDragging: false,
        isResizing: true,
        handle,
        startX: x,
        startY: y,
        startBox: { ...cropBox }
      });
    } else if (x >= cropBox.x && x <= cropBox.x + cropBox.width && y >= cropBox.y && y <= cropBox.y + cropBox.height) {
      e.preventDefault();
      setDragState({
        isDragging: true,
        isResizing: false,
        handle: null,
        startX: x - cropBox.x,
        startY: y - cropBox.y,
        startBox: { ...cropBox }
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!dragState.isDragging && !dragState.isResizing) return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (dragState.isDragging) {
      let newX = x - dragState.startX;
      let newY = y - dragState.startY;
      
      newX = Math.max(0, Math.min(newX, imageDimensions.width - cropBox.width));
      newY = Math.max(0, Math.min(newY, imageDimensions.height - cropBox.height));
      
      setCropBox({ ...cropBox, x: newX, y: newY });
    } else if (dragState.isResizing) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      const { startBox, handle } = dragState;
      let newBox = { ...startBox };
      
      const minSize = 100;
      
      switch (handle) {
        case 'nw':
          newBox.width = Math.max(minSize, startBox.width - dx);
          newBox.height = Math.max(minSize, startBox.height - dy);
          newBox.x = startBox.x + (startBox.width - newBox.width);
          newBox.y = startBox.y + (startBox.height - newBox.height);
          break;
        case 'ne':
          newBox.width = Math.max(minSize, startBox.width + dx);
          newBox.height = Math.max(minSize, startBox.height - dy);
          newBox.y = startBox.y + (startBox.height - newBox.height);
          break;
        case 'sw':
          newBox.width = Math.max(minSize, startBox.width - dx);
          newBox.height = Math.max(minSize, startBox.height + dy);
          newBox.x = startBox.x + (startBox.width - newBox.width);
          break;
        case 'se':
          newBox.width = Math.max(minSize, startBox.width + dx);
          newBox.height = Math.max(minSize, startBox.height + dy);
          break;
        case 'n':
          newBox.height = Math.max(minSize, startBox.height - dy);
          newBox.y = startBox.y + (startBox.height - newBox.height);
          break;
        case 's':
          newBox.height = Math.max(minSize, startBox.height + dy);
          break;
        case 'w':
          newBox.width = Math.max(minSize, startBox.width - dx);
          newBox.x = startBox.x + (startBox.width - newBox.width);
          break;
        case 'e':
          newBox.width = Math.max(minSize, startBox.width + dx);
          break;
      }
      
      // Keep square aspect ratio
      const size = Math.min(newBox.width, newBox.height);
      newBox.width = size;
      newBox.height = size;
      
      // Constrain to image bounds
      if (newBox.x < 0) newBox.x = 0;
      if (newBox.y < 0) newBox.y = 0;
      if (newBox.x + newBox.width > imageDimensions.width) {
        newBox.width = imageDimensions.width - newBox.x;
        newBox.height = newBox.width;
      }
      if (newBox.y + newBox.height > imageDimensions.height) {
        newBox.height = imageDimensions.height - newBox.y;
        newBox.width = newBox.height;
      }
      
      setCropBox(newBox);
    }
  };

  const handlePointerUp = () => {
    setDragState({ isDragging: false, isResizing: false, handle: null, startX: 0, startY: 0, startBox: null });
  };

  const handleConfirmCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scaleX = image.width / imageDimensions.width;
    const scaleY = image.height / imageDimensions.height;
    
    const cropX = cropBox.x * scaleX;
    const cropY = cropBox.y * scaleY;
    const cropWidth = cropBox.width * scaleX;
    const cropHeight = cropBox.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    const croppedImage = new Image();
    croppedImage.onload = () => onCropComplete(croppedImage);
    croppedImage.src = canvas.toDataURL();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-manrope font-semibold text-lg text-text-primary mb-2">Select Area</h3>
        <p className="text-sm text-text-secondary mb-4">Drag to move • Drag corners/edges to resize</p>
        
        <div 
          ref={containerRef}
          className="relative mx-auto flex justify-center items-center select-none"
          style={{ minHeight: '400px', touchAction: 'none', cursor: dragState.isDragging ? 'grabbing' : 'default' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
        >
          <img src={imageSrc} alt="" onLoad={handleImageLoad} className="hidden" />
          
          {imageDimensions.width > 0 && (
            <div className="relative" style={{ width: imageDimensions.width, height: imageDimensions.height }}>
              <img src={imageSrc} alt="Upload" className="block w-full h-full object-cover rounded-lg" draggable={false} />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: cropBox.y }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: imageDimensions.height - cropBox.y - cropBox.height }} />
                <div className="absolute left-0 bg-black/60" style={{ top: cropBox.y, height: cropBox.height, width: cropBox.x }} />
                <div className="absolute right-0 bg-black/60" style={{ top: cropBox.y, height: cropBox.height, width: imageDimensions.width - cropBox.x - cropBox.width }} />
              </div>
              
              <div
                className="absolute border-2 border-accent"
                style={{ left: cropBox.x, top: cropBox.y, width: cropBox.width, height: cropBox.height, cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
                data-testid="crop-box"
              >
                <div className="absolute w-3 h-3 bg-white border-2 border-accent rounded-full" style={{ left: -6, top: -6, cursor: 'nw-resize' }} />
                <div className="absolute w-3 h-3 bg-white border-2 border-accent rounded-full" style={{ right: -6, top: -6, cursor: 'ne-resize' }} />
                <div className="absolute w-3 h-3 bg-white border-2 border-accent rounded-full" style={{ left: -6, bottom: -6, cursor: 'sw-resize' }} />
                <div className="absolute w-3 h-3 bg-white border-2 border-accent rounded-full" style={{ right: -6, bottom: -6, cursor: 'se-resize' }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirmCrop} disabled={imageDimensions.width === 0} className="bg-accent hover:bg-accent-hover text-white" data-testid="confirm-crop-btn">
            <Crop className="w-4 h-4 mr-2" />Convert to Pixel Art
          </Button>
        </div>
      </div>
    </div>
  );
}