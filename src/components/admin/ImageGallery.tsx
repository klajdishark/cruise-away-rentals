import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, X, Upload, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useVehicles } from '@/hooks/useVehicles';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadProgress {
  [key: string]: number;
}

export const ImageGallery = ({ 
  images, 
  onImagesChange, 
  maxImages = 8,
  maxFileSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: ImageGalleryProps) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadVehicleImage } = useVehicles();

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxFileSize}MB`;
    }
    
    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`Can only upload ${remainingSlots} more image(s)`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length === 0) return;

    // Process valid files
    const uploadPromises = validFiles.map(async (file) => {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress < 90) {
              return { ...prev, [fileId]: currentProgress + Math.random() * 20 };
            }
            return prev;
          });
        }, 200);

        const uploadedUrl = await uploadVehicleImage(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);

        return uploadedUrl;
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
    
    if (successfulUploads.length > 0) {
      onImagesChange([...images, ...successfulUploads]);
      toast.success(`Successfully uploaded ${successfulUploads.length} image(s)`);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    toast.success('Image removed');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
    toast.success('Images reordered');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isUploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Uploading images...</div>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate">{fileId.split('-')[0]}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card 
            key={index} 
            className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                <img
                  src={image}
                  alt={`Vehicle image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {index === 0 && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                  {index + 1}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {images.length < maxImages && (
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-2">
              <div className="aspect-square flex items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-primary/5"
                  onClick={openFileDialog}
                  disabled={isUploading}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs text-center">
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{images.length} of {maxImages} images</span>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Max {maxFileSize}MB, {allowedTypes.map(type => type.split('/')[1]).join(', ')}</span>
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="text-xs text-muted-foreground">
          💡 Drag and drop images to reorder them. The first image <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400" /> will be the default.
        </div>
      )}
    </div>
  );
};
