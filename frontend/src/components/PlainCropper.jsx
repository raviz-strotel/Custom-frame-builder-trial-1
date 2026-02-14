import React, { useRef, useEffect, useState } from 'react';

export default function PlainCropper({ image, cropBox, onCropBoxChange, visible }) {
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (image) setImageSrc(image.src);
  }, [image]);

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
    
    setImageDimensions({ width: displayWidth, height: displayHeight });
    
    // Initialize centered crop box if not set
    if (!cropBox || cropBox.width === 0) {
      const size = Math.min(displayWidth, displayHeight) * 0.6;
      onCropBoxChange({
        x: (displayWidth - size) / 2,
        y: (displayHeight - size) / 2,
        width: size,
        height: size
      }, { width: displayWidth, height: displayHeight });
    }
  };

  const handleMouseDown = (e) => {
    if (!visible) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;
    const relX = x - rect.left;
    const relY = y - rect.top;
    
    // Check if click is inside crop box
    if (relX >= cropBox.x && relX <= cropBox.x + cropBox.width &&
        relY >= cropBox.y && relY <= cropBox.y + cropBox.height) {
      e.preventDefault();
      setIsDragging(true);
      setDragOffset({
        x: relX - cropBox.x,
        y: relY - cropBox.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !visible) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;
    const relX = x - rect.left;
    const relY = y - rect.top;
    
    let newX = relX - dragOffset.x;
    let newY = relY - dragOffset.y;
    
    // Constrain to bounds
    newX = Math.max(0, Math.min(newX, imageDimensions.width - cropBox.width));
    newY = Math.max(0, Math.min(newY, imageDimensions.height - cropBox.height));
    
    onCropBoxChange({ ...cropBox, x: newX, y: newY }, imageDimensions);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Always render hidden image for dimension loading
  if (!imageSrc) return null;

  return (
    <>
      {/* Hidden image for loading dimensions - always rendered */}
      <img 
        src={imageSrc} 
        alt="" 
        onLoad={handleImageLoad} 
        style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }} 
      />
      
      {visible && imageDimensions.width > 0 && (
        <div 
          ref={containerRef}
          className="relative mx-auto select-none"
          style={{ 
            width: imageDimensions.width, 
            height: imageDimensions.height, 
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover rounded-lg" draggable={false} />
          
          {/* Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: cropBox.y }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: imageDimensions.height - cropBox.y - cropBox.height }} />
            <div className="absolute left-0 bg-black/60" style={{ top: cropBox.y, height: cropBox.height, width: cropBox.x }} />
            <div className="absolute right-0 bg-black/60" style={{ top: cropBox.y, height: cropBox.height, width: imageDimensions.width - cropBox.x - cropBox.width }} />
          </div>
          
          {/* Plain square crop box */}
          <div
            className="absolute border-2 border-accent"
            style={{
              left: cropBox.x,
              top: cropBox.y,
              width: cropBox.width,
              height: cropBox.height,
              cursor: isDragging ? 'grabbing' : 'grab',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0)'
            }}
          />
        </div>
      )}
    </>
  );
}