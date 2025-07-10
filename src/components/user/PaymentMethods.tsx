import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';

const mockPaymentMethods = [
  {
    id: 1,
    type: 'credit',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: 2,
    type: 'credit',
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
];

export const PaymentMethods = () => {
  const [paymentMethods] = useState(mockPaymentMethods);

  const getBrandIcon = (brand: string) => {
    // In a real app, you'd have actual brand icons
    return <CreditCard className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-2">Manage your payment methods and billing information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getBrandIcon(method.brand)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {method.brand} •••• {method.last4}
                      </h3>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Update your billing address and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-gray-900">John Doe</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">john.doe@example.com</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="text-gray-900">123 Main St, City, State 12345</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-gray-900">+1 (555) 123-4567</p>
            </div>
          </div>
          <Button variant="outline">Update Billing Information</Button>
        </CardContent>
      </Card>
    </div>
  );
};
