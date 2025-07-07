
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookingForms = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch booking forms for a specific booking
  const fetchBookingForms = async (bookingId: string) => {
    const { data, error } = await supabase
      .from('booking_forms')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  };

  // Fetch all booking forms
  const {
    data: bookingForms = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['booking-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_forms')
        .select(`
          *,
          bookings (
            id,
            customer_id,
            vehicle_id,
            start_date,
            end_date,
            status,
            total_amount,
            customers (
              name,
              phone
            ),
            vehicles (
              brand,
              model,
              year,
              license_plate
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    }
  });

  // Update booking form mutation
  const updateBookingFormMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('booking_forms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-forms'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Form Updated",
        description: "Booking form has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Form",
        description: error.message || "Failed to update booking form",
      });
    }
  });

  // Get forms for a specific booking
  const getBookingForms = (bookingId: string) => {
    return bookingForms.filter(form => form.booking_id === bookingId);
  };

  // Get delivery form for a booking
  const getDeliveryForm = (bookingId: string) => {
    return bookingForms.find(form => form.booking_id === bookingId && form.form_type === 'delivery');
  };

  // Get pickup form for a booking
  const getPickupForm = (bookingId: string) => {
    return bookingForms.find(form => form.booking_id === bookingId && form.form_type === 'pickup');
  };

  return {
    bookingForms,
    isLoading,
    error,
    updateBookingForm: updateBookingFormMutation.mutate,
    isUpdating: updateBookingFormMutation.isPending,
    getBookingForms,
    getDeliveryForm,
    getPickupForm,
    fetchBookingForms,
  };
};
