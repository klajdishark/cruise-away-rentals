import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ContractTemplatePreviewProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: () => void;
}

export const ContractTemplatePreview = ({ 
  content, 
  isOpen, 
  onClose,
  onGenerate
}: ContractTemplatePreviewProps) => {
  // In a real implementation, this would replace placeholders with sample data
  const previewContent = content
    .replace(/\{\{[\w_]+\}\}/g, match => {
      const placeholder = match.slice(2, -2);
      switch (placeholder) {
        case 'contract_number': return 'CN-2023-001';
        case 'contract_date': return 'January 15, 2023';
        case 'customer_name': return 'John Doe';
        case 'customer_email': return 'john.doe@example.com';
        case 'vehicle_brand': return 'Toyota';
        case 'vehicle_model': return 'Camry';
        default: return `[${placeholder}]`;
      }
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contract Preview</DialogTitle>
        </DialogHeader>
        
        <div 
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onGenerate && (
            <Button onClick={onGenerate}>
              Generate Contract
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
