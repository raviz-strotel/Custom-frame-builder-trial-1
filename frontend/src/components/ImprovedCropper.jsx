import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

export default function ImprovedCropper({ image, onCropComplete, onCancel }) {
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [dragState, setDragState] = useState({ type: null, startX: 0, startY: 0, startBox: null });
  const [imageSrc, setImageSrc] = useState('');
  const [hoveredHandle, setHoveredHandle] = useState(null);

  useEffect(() => {
    if (image) setImageSrc(image.src);
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
    
    const size = Math.min(displayWidth, displayHeight) * 0.6;
    setCropBox({
      x: (displayWidth - size) / 2,
      y: (displayHeight - size) / 2,
      width: size,
      height: size
    });
  };

  const getHandle = (x, y) => {
    const hitSize = 40; // Larger hit area
    const { x: bx, y: by, width, height } = cropBox;
    
    // Corners (priority)
    if (Math.abs(x - bx) < hitSize && Math.abs(y - by) < hitSize) return 'nw';
    if (Math.abs(x - (bx + width)) < hitSize && Math.abs(y - by) < hitSize) return 'ne';
    if (Math.abs(x - bx) < hitSize && Math.abs(y - (by + height)) < hitSize) return 'sw';
    if (Math.abs(x - (bx + width)) < hitSize && Math.abs(y - (by + height)) < hitSize) return 'se';
    
    // Edges
    if (Math.abs(x - bx) < 15 && y > by + 20 && y < by + height - 20) return 'w';
    if (Math.abs(x - (bx + width)) < 15 && y > by + 20 && y < by + height - 20) return 'e';
    if (Math.abs(y - by) < 15 && x > bx + 20 && x < bx + width - 20) return 'n';
    if (Math.abs(y - (by + height)) < 15 && x > bx + 20 && x < bx + width - 20) return 's';
    
    // Inside box
    if (x >= bx && x <= bx + width && y >= by && y <= by + height) return 'move';
    
    return null;
  };

  const handlePointerDown = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const handle = getHandle(x, y);
    if (handle) {
      e.preventDefault();
      setDragState({
        type: handle,
        startX: x,
        startY: y,
        startBox: { ...cropBox }
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!dragState.type) {
      // Update hover state
      const touch = e.touches ? e.touches[0] : e;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        setHoveredHandle(getHandle(x, y));
      }
      return;
    }
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const dx = x - dragState.startX;
    const dy = y - dragState.startY;
    const { startBox } = dragState;
    
    if (dragState.type === 'move') {
      let newX = startBox.x + dx;
      let newY = startBox.y + dy;
      newX = Math.max(0, Math.min(newX, imageDimensions.width - cropBox.width));
      newY = Math.max(0, Math.min(newY, imageDimensions.height - cropBox.height));
      setCropBox({ ...cropBox, x: newX, y: newY });
    } else {
      // Resize
      let newBox = { ...startBox };
      const minSize = 100;
      
      switch (dragState.type) {
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
      
      // Keep square
      const size = Math.min(newBox.width, newBox.height);
      newBox.width = size;
      newBox.height = size;
      
      // Constrain
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
    setDragState({ type: null, startX: 0, startY: 0, startBox: null });
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

  const getCursor = () => {
    if (!hoveredHandle) return 'default';
    if (hoveredHandle === 'move') return 'grab';
    if (['nw', 'se'].includes(hoveredHandle)) return 'nwse-resize';
    if (['ne', 'sw'].includes(hoveredHandle)) return 'nesw-resize';
    if (['n', 's'].includes(hoveredHandle)) return 'ns-resize';
    if (['e', 'w'].includes(hoveredHandle)) return 'ew-resize';
    return 'default';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-manrope font-semibold text-lg text-text-primary mb-2">Select Area</h3>
        <p className="text-sm text-text-secondary mb-4">Drag box to move • Drag corners/edges to resize</p>
        
        <div 
          ref={containerRef}
          className="relative mx-auto flex justify-center items-center select-none"
          style={{ minHeight: '400px', touchAction: 'none', cursor: dragState.type ? 'grabbing' : getCursor() }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
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
                className="absolute border-3 border-accent"
                style={{ left: cropBox.x, top: cropBox.y, width: cropBox.width, height: cropBox.height }}
              >
                {/* Corner handles - larger and more visible */}
                <div className="absolute w-6 h-6 bg-accent rounded-full border-3 border-white shadow-lg" style={{ left: -12, top: -12 }} />
                <div className="absolute w-6 h-6 bg-accent rounded-full border-3 border-white shadow-lg" style={{ right: -12, top: -12 }} />
                <div className="absolute w-6 h-6 bg-accent rounded-full border-3 border-white shadow-lg" style={{ left: -12, bottom: -12 }} />
                <div className="absolute w-6 h-6 bg-accent rounded-full border-3 border-white shadow-lg" style={{ right: -12, bottom: -12 }} />
                
                {/* Edge handles */}
                <div className="absolute w-2 h-8 bg-accent rounded" style={{ left: '50%', top: -4, transform: 'translateX(-50%)' }} />
                <div className="absolute w-2 h-8 bg-accent rounded" style={{ left: '50%', bottom: -4, transform: 'translateX(-50%)' }} />
                <div className="absolute w-8 h-2 bg-accent rounded" style={{ top: '50%', left: -4, transform: 'translateY(-50%)' }} />
                <div className="absolute w-8 h-2 bg-accent rounded" style={{ top: '50%', right: -4, transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirmCrop} disabled={imageDimensions.width === 0} className="bg-accent hover:bg-accent-hover text-white">
            <Crop className="w-4 h-4 mr-2" />Continue to Editor
          </Button>
        </div>
      </div>
    </div>
  );
}