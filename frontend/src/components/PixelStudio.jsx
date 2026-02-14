import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Droplet, Pipette, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';
import { DEFAULT_PALETTE } from '@/utils/colorUtils';
import ImageAdjustments from './ImageAdjustments';

export default function PixelStudio({ pixelData, onPixelDataChange, adjustments, onAdjustmentsChange, onResetAdjustments }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('paint');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PALETTE[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [scale] = useState(16);

  useEffect(() => {
    if (pixelData && canvasRef.current) drawCanvas();
  }, [pixelData, zoom]);

  useEffect(() => {
    if (pixelData && history.length === 0) saveHistory();
  }, [pixelData]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pixelData) return;
    
    const ctx = canvas.getContext('2d');
    const size = 32;
    const displayScale = scale * zoom;
    
    canvas.width = size * displayScale;
    canvas.height = size * displayScale;
    
    ctx.imageSmoothingEnabled = false;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const r = pixelData.data[idx];
        const g = pixelData.data[idx + 1];
        const b = pixelData.data[idx + 2];
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * displayScale, y * displayScale, displayScale, displayScale);
      }
    }
    
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * displayScale, 0);
      ctx.lineTo(i * displayScale, size * displayScale);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * displayScale);
      ctx.lineTo(size * displayScale, i * displayScale);
      ctx.stroke();
    }
  };

  const saveHistory = useCallback(() => {
    if (!pixelData) return;
    const newHistory = history.slice(0, historyIndex + 1);
    const dataCopy = new Uint8ClampedArray(pixelData.data);
    newHistory.push(new ImageData(dataCopy, 32, 32));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [pixelData, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onPixelDataChange(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onPixelDataChange(history[newIndex]);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleCanvasClick = (e) => {
    if (!pixelData) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const displayScale = scale * zoom;
    const x = Math.floor((e.clientX - rect.left) / displayScale);
    const y = Math.floor((e.clientY - rect.top) / displayScale);
    
    if (x < 0 || x >= 32 || y < 0 || y >= 32) return;
    
    if (tool === 'pick') {
      const idx = (y * 32 + x) * 4;
      const r = pixelData.data[idx];
      const g = pixelData.data[idx + 1];
      const b = pixelData.data[idx + 2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      setSelectedColor(hex);
      setTool('paint');
    } else if (tool === 'paint') {
      paintPixel(x, y);
    } else if (tool === 'fill') {
      floodFill(x, y);
    }
  };

  const paintPixel = (x, y) => {
    const newData = new ImageData(new Uint8ClampedArray(pixelData.data), 32, 32);
    const idx = (y * 32 + x) * 4;
    const rgb = hexToRgb(selectedColor);
    if (rgb) {
      newData.data[idx] = rgb.r;
      newData.data[idx + 1] = rgb.g;
      newData.data[idx + 2] = rgb.b;
      newData.data[idx + 3] = 255;
    }
    onPixelDataChange(newData);
    saveHistory();
  };

  const floodFill = (startX, startY) => {
    const newData = new Uint8ClampedArray(pixelData.data);
    const startIdx = (startY * 32 + startX) * 4;
    const targetColor = { r: newData[startIdx], g: newData[startIdx + 1], b: newData[startIdx + 2] };
    const fillColor = hexToRgb(selectedColor);
    if (!fillColor || (targetColor.r === fillColor.r && targetColor.g === fillColor.g && targetColor.b === fillColor.b)) return;
    
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key) || x < 0 || x >= 32 || y < 0 || y >= 32) continue;
      
      const idx = (y * 32 + x) * 4;
      if (newData[idx] !== targetColor.r || newData[idx + 1] !== targetColor.g || newData[idx + 2] !== targetColor.b) continue;
      
      visited.add(key);
      newData[idx] = fillColor.r;
      newData[idx + 1] = fillColor.g;
      newData[idx + 2] = fillColor.b;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    onPixelDataChange(new ImageData(newData, 32, 32));
    saveHistory();
  };

  const handleMouseMove = (e) => {
    if (isDrawing && tool === 'paint') handleCanvasClick(e);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Adjustments */}
        <div className="lg:col-span-1">
          <ImageAdjustments
            adjustments={adjustments}
            onAdjustmentsChange={onAdjustmentsChange}
            onReset={onResetAdjustments}
          />
        </div>
        
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-manrope font-semibold text-lg">Pixel Art (32×32)</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} disabled={zoom <= 0.5}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-text-muted px-2 py-1">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))} disabled={zoom >= 3}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div ref={containerRef} className="flex justify-center overflow-auto max-h-[600px]">
              <canvas
                ref={canvasRef}
                className="border border-border rounded cursor-crosshair"
                onClick={handleCanvasClick}
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseMove={handleMouseMove}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tools */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant={tool === 'paint' ? 'default' : 'outline'} size="default" onClick={() => setTool('paint')} className={tool === 'paint' ? 'bg-accent text-white' : ''}>
            <Paintbrush className="w-4 h-4 mr-2" />Paint
          </Button>
          <Button variant={tool === 'fill' ? 'default' : 'outline'} size="default" onClick={() => setTool('fill')} className={tool === 'fill' ? 'bg-accent text-white' : ''}>
            <Droplet className="w-4 h-4 mr-2" />Fill
          </Button>
          <Button variant={tool === 'pick' ? 'default' : 'outline'} size="default" onClick={() => setTool('pick')} className={tool === 'pick' ? 'bg-accent text-white' : ''}>
            <Pipette className="w-4 h-4 mr-2" />Pick
          </Button>
          
          <div className="border-l border-border h-8 mx-2" />
          
          <Button variant="outline" size="default" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="default" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Color Palette */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <h4 className="font-manrope font-semibold text-base text-text-primary mb-3">Color Palette</h4>
        <div className="grid grid-cols-10 gap-2">
          {DEFAULT_PALETTE.map((color, i) => (
            <button
              key={i}
              className={`w-full aspect-square rounded border-2 transition-transform hover:scale-110 ${
                selectedColor === color ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-text-secondary">Selected:</span>
          <div className="w-8 h-8 rounded border-2 border-accent" style={{ backgroundColor: selectedColor }} />
          <span className="text-sm font-mono text-text-muted">{selectedColor}</span>
        </div>
      </div>
    </div>
  );
}