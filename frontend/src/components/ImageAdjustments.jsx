import React from 'react';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageAdjustments({ adjustments, onAdjustmentsChange, onReset }) {
  const handleChange = (key, value) => {
    onAdjustmentsChange({ ...adjustments, [key]: value[0] });
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-manrope font-semibold text-lg text-text-primary">Image Adjustments</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-text-secondary hover:text-accent">
          <RotateCcw className="w-4 h-4 mr-1" />Reset
        </Button>
      </div>
      
      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Brightness</label>
            <span className="text-sm font-mono text-text-muted">{adjustments.brightness}</span>
          </div>
          <Slider
            value={[adjustments.brightness]}
            onValueChange={(v) => handleChange('brightness', v)}
            min={-100}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Contrast</label>
            <span className="text-sm font-mono text-text-muted">{adjustments.contrast}</span>
          </div>
          <Slider
            value={[adjustments.contrast]}
            onValueChange={(v) => handleChange('contrast', v)}
            min={-100}
            max={100}
            step={1}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Saturation</label>
            <span className="text-sm font-mono text-text-muted">{adjustments.saturation}</span>
          </div>
          <Slider
            value={[adjustments.saturation]}
            onValueChange={(v) => handleChange('saturation', v)}
            min={-100}
            max={100}
            step={1}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Hue Shift</label>
            <span className="text-sm font-mono text-text-muted">{adjustments.hue}°</span>
          </div>
          <Slider
            value={[adjustments.hue]}
            onValueChange={(v) => handleChange('hue', v)}
            min={0}
            max={360}
            step={1}
          />
        </div>
      </div>
      
      <p className="text-xs text-text-muted italic">Adjustments apply in real-time</p>
    </div>
  );
}