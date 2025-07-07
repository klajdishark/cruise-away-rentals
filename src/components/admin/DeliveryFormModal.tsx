
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Car, Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ImageGallery } from './ImageGallery';
import { useVehicles } from '@/hooks/useVehicles';

const deliveryFormSchema = z.object({
  mileage_reading: z.number().min(0, 'Mileage must be a positive number'),
  fuel_level: z.number().min(0).max(100, 'Fuel level must be between 0 and 100'),
  damages: z.string().optional(),
  inspector_notes: z.string().optional(),
  inspector_signature: z.string().min(1, 'Inspector signature is required'),
  customer_signature: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  deliveryForm?: any;
  onSubmit: (data: any) => void;
}

export const DeliveryFormModal = ({ isOpen, onClose, booking, deliveryForm, onSubmit }: DeliveryFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectionImages, setInspectionImages] = useState<string[]>(
    deliveryForm?.photos ? (Array.isArray(deliveryForm.photos) ? deliveryForm.photos : []) : []
  );

  const { updateVehicle } = useVehicles();

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      mileage_reading: deliveryForm?.mileage_reading || 0,
      fuel_level: deliveryForm?.fuel_level || 100,
      damages: deliveryForm?.damages ? JSON.stringify(deliveryForm.damages) : '',
      inspector_notes: deliveryForm?.inspector_notes || '',
      inspector_signature: deliveryForm?.inspector_signature || '',
      customer_signature: deliveryForm?.customer_signature || '',
    },
  });

  const handleSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    try {
      // Update vehicle mileage if provided
      if (data.mileage_reading && booking?.vehicle_id) {
        await updateVehicle({
          id: booking.vehicle_id,
          mileage: data.mileage_reading
        });
      }

      const formData = {
        ...data,
        damages: data.damages ? JSON.parse(data.damages) : null,
        photos: inspectionImages,
        completed_at: new Date().toISOString(),
        completed_by: 'current_user_id', // This should be replaced with actual user ID
      };
      
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting delivery form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vehicle Delivery Inspection Form</DialogTitle>
          <DialogDescription>
            Complete the delivery inspection for the returned vehicle
          </DialogDescription>
        </DialogHeader>

        {/* Booking Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Rental Period:</span>
                  <span>
                    {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold">${booking.total_amount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Delivery Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mileage_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage Reading</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter current mileage"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuel_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Level (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter fuel percentage"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="damages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damages (if any)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Document any damages found (JSON format for detailed damage report)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspector_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspector Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes from the inspector"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Gallery for Inspection Photos */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Inspection Photos (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Upload photos of the vehicle condition, damages, or any other relevant inspection details
                </p>
              </div>
              <ImageGallery
                images={inspectionImages}
                onImagesChange={setInspectionImages}
                maxImages={10}
                maxFileSize={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inspector_signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Signature</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Inspector signature"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Signature (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer signature (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : deliveryForm ? 'Update Form' : 'Complete Delivery'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
