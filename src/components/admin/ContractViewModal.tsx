
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';

interface ContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
}

export const ContractViewModal = ({ 
  isOpen, 
  onClose, 
  contract 
}: ContractViewModalProps) => {
  if (!contract) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_signature':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadPDF = () => {
    // This would trigger PDF download
    console.log('Downloading PDF for contract:', contract.id);
  };

  const handleSendForSignature = () => {
    // This would send the contract for signature
    console.log('Sending contract for signature:', contract.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Contract Details</span>
            <Badge className={getStatusColor(contract.status)}>
              {contract.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Contract #{contract.contract_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Number</p>
                  <p className="font-medium">{contract.contract_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(contract.created_at), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="font-medium">{contract.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Template</p>
                  <p className="font-medium">{contract.contract_templates?.name || 'Custom'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          {contract.bookings && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="font-medium">{contract.bookings.customers?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                    <p className="font-medium">
                      {contract.bookings.vehicles?.brand} {contract.bookings.vehicles?.model} {contract.bookings.vehicles?.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rental Period</p>
                    <p className="font-medium">
                      {format(new Date(contract.bookings.start_date), 'MMM dd, yyyy')} - {format(new Date(contract.bookings.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="font-medium">${contract.bookings.total_amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature Information */}
          {(contract.customer_signed_at || contract.admin_signed_at) && (
            <Card>
              <CardHeader>
                <CardTitle>Signature Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Signed</p>
                    <p className="font-medium">
                      {contract.customer_signed_at 
                        ? format(new Date(contract.customer_signed_at), 'MMM dd, yyyy HH:mm')
                        : 'Not signed'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admin Signed</p>
                    <p className="font-medium">
                      {contract.admin_signed_at 
                        ? format(new Date(contract.admin_signed_at), 'MMM dd, yyyy HH:mm')
                        : 'Not signed'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <CardDescription>Preview of the contract content</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {contract.status === 'draft' && (
              <Button onClick={handleSendForSignature}>
                <Send className="w-4 h-4 mr-2" />
                Send for Signature
              </Button>
            )}
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
