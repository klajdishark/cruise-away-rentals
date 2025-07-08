
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookings } from '@/hooks/useBookings';
import { useContracts } from '@/hooks/useContracts';

const contractSchema = z.object({
  booking_id: z.string().min(1, 'Booking is required'),
  template_id: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'pending_signature', 'signed', 'cancelled']).optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: {
    id: string;
    booking_id: string;
    template_id?: string;
    content: string;
    status: string;
  };
  onSubmit: (data: ContractFormData) => void;
}

export const ContractModal = ({ 
  isOpen, 
  onClose, 
  contract, 
  onSubmit 
}: ContractModalProps) => {
  const { bookings } = useBookings();
  const { templates } = useContracts();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      booking_id: contract?.booking_id || '',
      template_id: contract?.template_id || '',
      content: contract?.content || '',
      status: contract?.status as any || 'draft',
    },
  });

  React.useEffect(() => {
    if (contract) {
      form.reset({
        booking_id: contract.booking_id,
        template_id: contract.template_id || '',
        content: contract.content,
        status: contract.status as any,
      });
    } else {
      form.reset({
        booking_id: '',
        template_id: '',
        content: '',
        status: 'draft',
      });
    }
  }, [contract, form]);

  const handleSubmit = (data: ContractFormData) => {
    onSubmit(data);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Filter bookings that don't already have contracts
  const availableBookings = bookings.filter(booking => 
    !contract || booking.id === contract.booking_id
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit Contract' : 'Create New Contract'}
          </DialogTitle>
          <DialogDescription>
            {contract 
              ? 'Update the contract information below.' 
              : 'Create a new contract for a booking.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="booking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a booking" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBookings.map((booking) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.customers?.name} - {booking.vehicles?.brand} {booking.vehicles?.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {contract && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_signature">Pending Signature</SelectItem>
                        <SelectItem value="signed">Signed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Content (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Custom contract content (leave empty to use template)"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {contract ? 'Update Contract' : 'Create Contract'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
