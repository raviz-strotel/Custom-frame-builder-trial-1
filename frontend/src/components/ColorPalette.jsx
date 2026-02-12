import React from 'react';
import { Palette } from 'lucide-react';

export default function ColorPalette({ colors }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-accent" />
        <h3 className="font-manrope font-semibold text-lg text-text-primary">Color Palette</h3>
      </div>
      
      <p className="text-sm text-text-secondary mb-4">Fixed 20-color palette</p>
      
      <div className="grid grid-cols-5 gap-3">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-md border border-border/50"
              style={{ backgroundColor: color }}
              data-testid={`color-swatch-${index}`}
            />
            <span className="text-xs font-jetbrains text-text-muted">{color}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
        <p className="text-xs text-text-secondary">
          All images are converted using this fixed {colors.length}-color palette
        </p>
      </div>
    </div>
  );
}