
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Image } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageGallery = ({ images, onImagesChange, maxImages = 8 }: ImageGalleryProps) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);

  const handleAddImage = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      onImagesChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
      setIsAddingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddImage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="relative group">
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
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {images.length < maxImages && (
          <Card className="border-dashed border-2">
            <CardContent className="p-2">
              <div className="aspect-square flex items-center justify-center">
                {isAddingImage ? (
                  <div className="w-full space-y-2">
                    <Input
                      type="url"
                      placeholder="Image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddImage}
                        className="flex-1 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingImage(false);
                          setNewImageUrl('');
                        }}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                    onClick={() => setIsAddingImage(true)}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs">Add Image</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {images.length} of {maxImages} images added
      </div>
    </div>
  );
};
