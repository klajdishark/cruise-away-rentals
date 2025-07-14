import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {ImageGallery} from './ImageGallery';
import {Vehicle} from '@/hooks/useVehicles';
import {useVehicleCategories} from '@/hooks/useVehicleCategories';
import {useLocations} from '@/hooks/useLocations';

const vehicleSchema = z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    price: z.number().min(1, 'Price must be greater than 0'),
    location: z.string().min(1, 'Location is required'),
    mileage: z.number().min(0, 'Mileage must be non-negative'),
    status: z.enum(['active', 'rented', 'maintenance', 'inactive']),
    description: z.string().optional(),
    fuel_type: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
    transmission: z.enum(['manual', 'automatic']),
    seats: z.number().min(1).max(15),
    color: z.string().min(1, 'Color is required'),
    license_plate: z.string().min(1, 'License plate is required'),
    category_id: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
    vehicle?: Vehicle;
    onSubmit: (data: VehicleFormData & { images?: string[] }) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const VehicleForm = ({vehicle, onSubmit, onCancel, isSubmitting = false}: VehicleFormProps) => {
    const [images, setImages] = useState<string[]>(
        vehicle?.images?.map(img => img.image_url) || []
    );
    const {categories} = useVehicleCategories();
    const {locations} = useLocations();

    const form = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: vehicle ? {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            location: vehicle.location,
            mileage: vehicle.mileage,
            status: vehicle.status,
            description: vehicle.description || '',
            fuel_type: vehicle.fuel_type,
            transmission: vehicle.transmission,
            seats: vehicle.seats,
            color: vehicle.color,
            license_plate: vehicle.license_plate,
            category_id: vehicle.category_id || 'none',
        } : {
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            price: 0,
            location: '',
            mileage: 0,
            status: 'active',
            description: '',
            fuel_type: 'gasoline',
            transmission: 'automatic',
            seats: 5,
            color: '',
            license_plate: '',
            category_id: 'none',
        },
    });

    const handleSubmit = (data: VehicleFormData) => {
        // Convert "none" back to undefined/empty for the API
        const submitData = {
            ...data,
            category_id: data.category_id === 'none' ? undefined : data.category_id,
            images
        };
        onSubmit(submitData);
    };

    const handleImagesChange = (newImages: string[]) => {
        setImages(newImages);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="Toyota, Honda, BMW..." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="model"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="Camry, Civic, X5..." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category_id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Category</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="year"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="2023"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Daily Rate ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="45"
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
                        name="location"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.name}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mileage"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Mileage</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="12500"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="rented">Rented</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fuel_type"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Fuel Type</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fuel type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gasoline">Gasoline</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="electric">Electric</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="transmission"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Transmission</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transmission"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                            <SelectItem value="manual">Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="seats"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Seats</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="5"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="color"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <Input placeholder="White, Black, Silver..." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="license_plate"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>License Plate</FormLabel>
                                <FormControl>
                                    <Input placeholder="ABC-123" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional details about the vehicle..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <FormLabel>Vehicle Images</FormLabel>
                    <ImageGallery
                        images={images}
                        onImagesChange={handleImagesChange}
                        maxImages={8}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
