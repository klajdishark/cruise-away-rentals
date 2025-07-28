import React, {useEffect, useState} from 'react';
import {formatLocalDate} from '@/lib/utils';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertTriangle} from 'lucide-react';
import {useCustomers} from '@/hooks/useCustomers';
import {useVehicles} from '@/hooks/useVehicles';
import {useVehicleAvailability} from '@/hooks/useVehicleAvailability';
import {Tables} from '@/integrations/supabase/types';
import {CalendarBooking} from './CalendarView';

const bookingSchema = z.object({
    customer_id: z.string().min(1, 'Customer selection is required'),
    vehicle_id: z.string().min(1, 'Vehicle selection is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    pickup_location: z.string().min(1, 'Pickup location is required'),
    dropoff_location: z.string().min(1, 'Dropoff location is required'),
    daily_rate: z.number().min(0, 'Daily rate must be a positive number'),
    status: z.enum(['pending', 'confirmed', 'active', 'completed', 'canceled']),
    booking_type: z.enum(['online', 'offline']).default('offline'),
    notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;
type Booking = Tables<'bookings'>;

interface BookingFormProps {
    booking?: CalendarBooking;
    initialDates?: {startDate: string, endDate: string};
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export const BookingForm = ({booking, initialDates, onSubmit, onCancel}: BookingFormProps) => {
    const {customers, isLoading: customersLoading} = useCustomers();
    const {vehicles, loading: vehiclesLoading} = useVehicles();
    const {checkAvailability, isChecking} = useVehicleAvailability();

    const [isVehicleAvailable, setIsVehicleAvailable] = useState(true);
    const [availabilityMessage, setAvailabilityMessage] = useState('');

    console.log(booking);

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customer_id: booking?.customer_id || '',
            vehicle_id: booking?.vehicle_id || '',
            start_date: booking?.startDate || (initialDates ? initialDates.startDate : ''),
            end_date: booking?.endDate || (initialDates ? initialDates.endDate : ''),
            start_time: booking?.startTime || '09:00:00',
            end_time: booking?.endTime || '09:00:00',
            pickup_location: booking?.pickupLocation || '',
            dropoff_location: booking?.dropoffLocation || '',
            daily_rate: booking?.dailyRate || 0,
            status: booking?.status || 'pending',
            booking_type: booking?.bookingType || 'offline',
            notes: booking?.notes || '',
        },
    });
    
    // Update form values when initialDates change
    useEffect(() => {
        if (initialDates && !booking) {
            form.setValue('start_date', formatLocalDate(new Date(initialDates.startDate)));
            form.setValue('end_date', formatLocalDate(new Date(initialDates.endDate)));
        }
    }, [initialDates, booking, form]);

    useEffect(() => {
        console.log('BookingForm initialDates:', initialDates);
        if (initialDates) {
            console.log('Setting form dates:', initialDates.startDate, initialDates.endDate);
            form.setValue('start_date', formatLocalDate(new Date(initialDates.startDate)));
            form.setValue('end_date', formatLocalDate(new Date(initialDates.endDate)));
        }
    }, [initialDates, form]);

    // Watch for changes in vehicle, start date, and end date
    const selectedVehicleId = form.watch('vehicle_id');
    const startDate = form.watch('start_date');
    const endDate = form.watch('end_date');

    // Auto-fill daily rate when vehicle is selected
    useEffect(() => {
        if (selectedVehicleId && vehicles.length > 0) {
            const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
            if (selectedVehicle) {
                form.setValue('daily_rate', selectedVehicle.price);
            }
        }
    }, [selectedVehicleId, vehicles, form]);

    // Check availability when vehicle or dates change
    useEffect(() => {
        const performAvailabilityCheck = async () => {
            if (selectedVehicleId && startDate && endDate) {
                console.log('Performing availability check for:', {selectedVehicleId, startDate, endDate});

                const isAvailable = await checkAvailability({
                    vehicleId: selectedVehicleId,
                    startDate,
                    endDate,
                    excludeBookingId: booking?.id
                });

                console.log('Availability result:', isAvailable);
                setIsVehicleAvailable(isAvailable);

                if (!isAvailable) {
                    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
                    const vehicleName = selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Selected vehicle';
                    setAvailabilityMessage(
                        `${vehicleName} is not available from ${startDate} to ${endDate}. Please select different dates or choose another vehicle.`
                    );
                } else {
                    setAvailabilityMessage('');
                }
            } else {
                console.log('Resetting availability - missing required fields');
                setIsVehicleAvailable(true);
                setAvailabilityMessage('');
            }
        };

        performAvailabilityCheck();
    }, [selectedVehicleId, startDate, endDate, booking?.id]); // Removed checkAvailability and vehicles from dependencies

    const handleSubmit = (data: BookingFormData) => {
        if (!isVehicleAvailable) {
            return; // Prevent submission if vehicle is not available
        }
        onSubmit(data);
    };

    if (customersLoading || vehiclesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Availability Alert */}
                {!isVehicleAvailable && availabilityMessage && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription>{availabilityMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="customer_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name} - {customer.phone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="vehicle_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Vehicle</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vehicles.filter(v => v.status === 'active').map((vehicle) => (
                                            <SelectItem key={vehicle.id} value={vehicle.id}>
                                                {vehicle.brand} {vehicle.model} {vehicle.year} - ${vehicle.price}/day
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_time"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pickup_location"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Pickup Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter pickup location" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dropoff_location"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Dropoff Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter dropoff location" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="daily_rate"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Daily Rate ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="canceled">Canceled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="booking_type"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Booking Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select booking type"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline (Admin)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any additional notes about the booking..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isVehicleAvailable || isChecking}
                    >
                        {isChecking ? 'Checking availability...' : booking ? 'Update Booking' : 'Create Booking'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
