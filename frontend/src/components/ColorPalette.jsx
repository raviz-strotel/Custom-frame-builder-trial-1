import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';
import { DEFAULT_PALETTE } from '@/utils/colorUtils';

export default function ColorPalette({ colors, onColorsChange }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleColorClick = (index) => {
    setEditingIndex(index);
  };

  const handleColorChange = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor.toUpperCase();
    onColorsChange(newColors);
  };

  const resetToDefault = () => {
    onColorsChange([...DEFAULT_PALETTE]);
    setEditingIndex(null);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="font-manrope font-semibold text-lg text-text-primary">Color Palette</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
          className="text-text-secondary hover:text-accent"
          data-testid="reset-palette-btn"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <p className="text-sm text-text-secondary mb-4">Click any color to customize</p>
      
      <div className="grid grid-cols-5 gap-3">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-md cursor-pointer border-2 transition-all hover:scale-110 hover:shadow-md"
              style={{
                backgroundColor: color,
                borderColor: editingIndex === index ? '#F97316' : 'transparent'
              }}
              onClick={() => handleColorClick(index)}
              data-testid={`color-swatch-${index}`}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
                data-testid={`color-input-${index}`}
              />
            </div>
            <span className="text-xs font-jetbrains text-text-muted">{color}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
        <p className="text-xs text-text-secondary">
          Images will be converted using only these {colors.length} colors
        </p>
      </div>
    </div>
  );
}