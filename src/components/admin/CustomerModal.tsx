import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSubmit: (data: any) => void;
}

export const CustomerModal = ({ isOpen, onClose, customer, onSubmit }: CustomerModalProps) => {
  const handleSubmit = (data: any) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogDescription>
            {customer 
              ? 'Update the customer information below.' 
              : 'Fill in the details to add a new customer to your system.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
