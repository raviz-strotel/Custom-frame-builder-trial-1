import React, { useEffect, useRef } from 'react';
import { drawPixelatedImage } from '@/utils/pixelateImage';

export default function PixelPreview({ imageData, pixelSize, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (imageData && canvasRef.current) {
      drawPixelatedImage(canvasRef.current, imageData, 400);
    }
  }, [imageData]);

  return (
    <div className="flex flex-col">
      {title && (
        <h3 className="font-manrope font-semibold text-base text-text-primary mb-3">
          {title}
        </h3>
      )}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm aspect-square flex items-center justify-center">
        {imageData ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'pixelated' }}
            data-testid="pixel-preview-canvas"
          />
        ) : (
          <div className="text-center text-text-muted p-8">
            <p className="text-sm">Preview will appear here</p>
          </div>
        )}
      </div>
      {imageData && (
        <p className="text-xs font-jetbrains text-text-muted mt-2 text-center">
          {pixelSize} × {pixelSize} pixels
        </p>
      )}
    </div>
  );
}