import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Tables } from '@/integrations/supabase/types';

export const useContracts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createContractForBooking = useMutation({
    mutationFn: async (data: {
      bookingId: string;
      templateId?: string;
      autoGeneratePDF?: boolean;
    }) => {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, customers(*), vehicles(*)')
        .eq('id', data.bookingId)
        .single();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get template (use default if not specified)
      const { data: template } = data.templateId
        ? await supabase
            .from('contract_templates')
            .select('*')
            .eq('id', data.templateId)
            .single()
        : await supabase
            .from('contract_templates')
            .select('*')
            .eq('is_active', true)
            .single();

      if (!template) {
        throw new Error('No active contract template found');
      }

      // Create contract record
      const contractData = {
        booking_id: data.bookingId,
        template_id: template.id,
        status: 'draft',
        content: template.template_content,
        variables: {
          customer_name: booking.customers?.name,
          customer_email: booking.customers?.email,
          vehicle_details: `${booking.vehicles?.brand} ${booking.vehicles?.model}`,
          pickup_date: booking.start_date,
          return_date: booking.end_date,
          total_amount: booking.total_amount,
        },
      };

      // Store contract data in booking notes field since contract_data isn't in schema
      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update({
          notes: JSON.stringify({
            ...(booking.notes ? JSON.parse(booking.notes) : {}),
            contract_data: contractData
          })
        })
        .eq('id', data.bookingId)
        .select()
        .single();

      if (error) throw error;

      if (data.autoGeneratePDF) {
        // Generate PDF would be handled by a separate function
        // await generateContractPDF(updatedBooking.id);
      }

      return {
        ...updatedBooking,
        contract_data: contractData
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Contract created',
        description: 'The contract has been successfully created',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating contract',
        description: error.message,
      });
    },
  });

  return {
    createContractForBooking,
    isCreatingForBooking: createContractForBooking.isPending,
  };
};
