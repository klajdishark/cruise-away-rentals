
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;
type BookingInsert = TablesInsert<'bookings'>;
type BookingUpdate = TablesUpdate<'bookings'>;

export const useBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all bookings with customer and vehicle details
  const {
    data: bookings = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone
          ),
          vehicles (
            id,
            brand,
            model,
            year,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      return data;
    }
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: Omit<BookingInsert, 'id' | 'created_at' | 'updated_at'>) => {
      // Calculate duration and total amount
      const startDate = new Date(bookingData.start_date);
      const endDate = new Date(bookingData.end_date);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalAmount = bookingData.daily_rate * durationDays;

      const finalBookingData = {
        ...bookingData,
        duration_days: durationDays,
        total_amount: totalAmount,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(finalBookingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking Created",
        description: "New booking has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Creating Booking",
        description: error.message || "Failed to create booking",
      });
    }
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: BookingUpdate & { id: string }) => {
      // Recalculate duration and total if dates or rate changed
      let finalUpdateData = { ...updateData };
      
      if (updateData.start_date || updateData.end_date || updateData.daily_rate) {
        // We need the current booking data to calculate properly
        const { data: currentBooking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .single();

        if (currentBooking) {
          const startDate = new Date(updateData.start_date || currentBooking.start_date);
          const endDate = new Date(updateData.end_date || currentBooking.end_date);
          const dailyRate = updateData.daily_rate || currentBooking.daily_rate;
          const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalAmount = dailyRate * durationDays;

          finalUpdateData = {
            ...finalUpdateData,
            duration_days: durationDays,
            total_amount: totalAmount,
          };
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking Updated",
        description: "Booking has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Booking",
        description: error.message || "Failed to update booking",
      });
    }
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }

      return bookingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking Deleted",
        description: "Booking has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Booking",
        description: error.message || "Failed to delete booking",
      });
    }
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    deleteBooking: deleteBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    isDeleting: deleteBookingMutation.isPending,
  };
};
