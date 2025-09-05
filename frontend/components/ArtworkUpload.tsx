import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ArtworkUpload() {
  const { dispatch } = useValidart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      dispatch({
        type: 'SET_BANNER',
        payload: { message: 'File too large. Maximum size is 10MB.', type: 'danger' }
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      dispatch({
        type: 'SET_BANNER',
        payload: { message: 'Invalid file type. Please upload JPG, PNG, or SVG.', type: 'danger' }
      });
      return;
    }

    // Create object URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        dispatch({
          type: 'SET_ARTWORK',
          payload: { artwork: e.target.result as string, file }
        });
        dispatch({ type: 'SET_BANNER', payload: null });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Upload Artwork</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.svg"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, SVG • Max 10MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
