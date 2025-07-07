
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Car, Clock, User, MapPin, FileText, Gauge, Droplets, AlertTriangle, Camera } from 'lucide-react';
import { format } from 'date-fns';

interface BookingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  deliveryForm?: any;
}

export const BookingReviewModal = ({ isOpen, onClose, booking, deliveryForm }: BookingReviewModalProps) => {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Review</DialogTitle>
          <DialogDescription>
            Detailed view of booking and inspection information
          </DialogDescription>
        </DialogHeader>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Booking ID:</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {booking.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Customer:</span>
                  <span>{booking.customers?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Vehicle:</span>
                  <span>
                    {booking.vehicles?.brand} {booking.vehicles?.model} {booking.vehicles?.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">License Plate:</span>
                  <span>{booking.vehicles?.license_plate}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Rental Period:</span>
                  <span>
                    {format(new Date(booking.start_date), 'MMM dd, yyyy')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Duration:</span>
                  <span>{booking.duration_days} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold text-lg">${booking.total_amount}</span>
                </div>
              </div>
            </div>
            
            {booking.notes && (
              <div className="mt-4">
                <span className="font-medium">Notes:</span>
                <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Form Information */}
        {deliveryForm && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Delivery Inspection Details
                  {deliveryForm.completed_at && (
                    <Badge variant="default" className="ml-2">Completed</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Vehicle condition and inspection details from delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Mileage Reading:</span>
                      <span>{deliveryForm.mileage_reading ? `${deliveryForm.mileage_reading.toLocaleString()} miles` : 'Not recorded'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Fuel Level:</span>
                      <span>{deliveryForm.fuel_level ? `${deliveryForm.fuel_level}%` : 'Not recorded'}</span>
                    </div>

                    {deliveryForm.damages && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Damages:</span>
                        </div>
                        <p className="text-sm bg-red-50 p-3 rounded border border-red-200">
                          {deliveryForm.damages}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {deliveryForm.inspector_notes && (
                      <div className="space-y-2">
                        <span className="font-medium">Inspector Notes:</span>
                        <p className="text-sm bg-gray-50 p-3 rounded border">
                          {deliveryForm.inspector_notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="font-medium">Signatures:</span>
                      <div className="space-y-1">
                        {deliveryForm.inspector_signature && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Inspector:</span> {deliveryForm.inspector_signature}
                          </div>
                        )}
                        {deliveryForm.customer_signature && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Customer:</span> {deliveryForm.customer_signature}
                          </div>
                        )}
                      </div>
                    </div>

                    {deliveryForm.completed_at && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed:</span> {format(new Date(deliveryForm.completed_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspection Photos */}
                {deliveryForm.photos && Array.isArray(deliveryForm.photos) && deliveryForm.photos.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Inspection Photos:</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {deliveryForm.photos.map((photo: string, index: number) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded border overflow-hidden">
                          <img
                            src={photo}
                            alt={`Inspection photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* No Inspection Form Message */}
        {!deliveryForm && booking.status === 'completed' && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Delivery Inspection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No delivery inspection form has been completed for this booking yet.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
