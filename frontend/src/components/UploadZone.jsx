import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadZone({ onImageUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-border hover:border-accent/50 transition-colors bg-white/50 rounded-xl p-12 text-center cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
      data-testid="upload-zone"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h3 className="font-manrope font-semibold text-lg text-text-primary mb-1">
            Upload an Image
          </h3>
          <p className="text-sm text-text-secondary mb-2">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-text-muted">
            Supported formats: JPG, PNG, GIF, WebP, BMP
          </p>
        </div>
        <Button
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          data-testid="browse-btn"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />
    </div>
  );
}