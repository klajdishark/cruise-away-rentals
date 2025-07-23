import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';

export const useBookingForms = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    // Fetch all booking forms
    const {
        data: bookingForms = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['booking-forms'],
        queryFn: async () => {
            const {data, error} = await supabase
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
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error fetching booking forms:', error);
                throw error;
            }

            console.log('Fetched booking forms:', data);
            return data || [];
        }
    });

    // Create or update booking form mutation
    const createOrUpdateBookingFormMutation = useMutation({
        mutationFn: async (formData: any) => {
            console.log('Mutation received data:', formData);

            // Check if a delivery form already exists for this booking
            const {data: existingForm, error: checkError} = await supabase
                .from('booking_forms')
                .select('id')
                .eq('booking_id', formData.booking_id)
                .eq('form_type', 'delivery')
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing form:', checkError);
                throw checkError;
            }

            console.log('Existing form check result:', existingForm);

            if (existingForm) {
                // Update existing form
                console.log('Updating existing form with ID:', existingForm.id);
                const {data, error} = await supabase
                    .from('booking_forms')
                    .update({
                        mileage_reading: formData.mileage_reading,
                        fuel_level: formData.fuel_level,
                        damages: formData.damages,
                        inspector_notes: formData.inspector_notes,
                        inspector_signature: formData.inspector_signature,
                        customer_signature: formData.customer_signature,
                        photos: formData.photos,
                        completed_at: formData.completed_at,
                        completed_by: formData.completed_by,
                    })
                    .eq('id', existingForm.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating form:', error);
                    throw error;
                }

                console.log('Form updated successfully:', data);
                return data;
            } else {
                // Create new form
                console.log('Creating new form');
                const {data, error} = await supabase
                    .from('booking_forms')
                    .insert([formData])
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating form:', error);
                    throw error;
                }

                console.log('Form created successfully:', data);
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['booking-forms']});
            queryClient.invalidateQueries({queryKey: ['bookings']});
            toast({
                title: "Form Saved",
                description: "Delivery form has been successfully saved.",
            });
        },
        onError: (error: any) => {
            console.error('Mutation error:', error);
            toast({
                variant: "destructive",
                title: "Error Saving Form",
                description: error.message || "Failed to save delivery form",
            });
        }
    });

    // Get forms for a specific booking
    const getBookingForms = (bookingId: string) => {
        return bookingForms.filter(form => form.booking_id === bookingId);
    };

    // Get delivery form for a booking
    const getDeliveryForm = (bookingId: string) => {
        const form = bookingForms.find(form => form.booking_id === bookingId && form.form_type === 'delivery');
        return form;
    };

    // Get pickup form for a booking
    const getPickupForm = (bookingId: string) => {
        return bookingForms.find(form => form.booking_id === bookingId && form.form_type === 'pickup');
    };

    return {
        bookingForms,
        isLoading,
        error,
        createOrUpdateBookingForm: createOrUpdateBookingFormMutation.mutate,
        isUpdating: createOrUpdateBookingFormMutation.isPending,
        getBookingForms,
        getDeliveryForm,
        getPickupForm,
    };
};
