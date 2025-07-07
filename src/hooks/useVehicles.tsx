import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'rented' | 'maintenance' | 'inactive';
  price: number;
  location: string;
  mileage: number;
  description?: string;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  color: string;
  license_plate: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  images?: VehicleImage[];
  vehicle_categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  display_order: number;
  is_default: boolean;
  created_at: string;
}

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles with their images and categories
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            vehicle_id,
            image_url,
            display_order,
            is_default,
            created_at
          ),
          vehicle_categories (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError);
        toast.error('Failed to load vehicles');
        return;
      }

      // Transform the data to match our interface
      const transformedVehicles: Vehicle[] = vehiclesData.map(vehicle => ({
        ...vehicle,
        images: vehicle.vehicle_images?.sort((a: VehicleImage, b: VehicleImage) => 
          a.display_order - b.display_order
        ) || []
      }));

      setVehicles(transformedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'images'> & { images?: string[] }) => {
    try {
      console.log('Adding vehicle with data:', vehicleData);
      
      // Separate images from vehicle data
      const { images, ...vehicleOnly } = vehicleData;
      
      // Insert vehicle without images
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([vehicleOnly])
        .select()
        .single();

      if (vehicleError) {
        console.error('Error adding vehicle:', vehicleError);
        toast.error('Failed to add vehicle');
        return null;
      }

      console.log('Vehicle added successfully:', newVehicle);

      // Add images if provided
      if (images && images.length > 0) {
        const imageRecords = images.map((imageUrl: string, index: number) => ({
          vehicle_id: newVehicle.id,
          image_url: imageUrl,
          display_order: index,
          // The trigger will automatically set is_default for the first image
        }));

        console.log('Inserting image records:', imageRecords);

        const { error: imagesError } = await supabase
          .from('vehicle_images')
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error adding vehicle images:', imagesError);
          toast.error('Vehicle added but failed to add images');
        } else {
          console.log('Images added successfully');
        }
      }

      toast.success('Vehicle added successfully');
      await fetchVehicles(); // Refresh the list
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
      return null;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle> & { images?: string[] }) => {
    try {
      console.log('Updating vehicle with data:', vehicleData);
      
      // Separate images from vehicle data
      const { images, ...vehicleOnly } = vehicleData;
      
      // Update vehicle without images
      const { data: updatedVehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .update(vehicleOnly)
        .eq('id', id)
        .select()
        .single();

      if (vehicleError) {
        console.error('Error updating vehicle:', vehicleError);
        toast.error('Failed to update vehicle');
        return null;
      }

      // Handle images if provided
      if (images !== undefined) {
        // Delete existing images
        const { error: deleteError } = await supabase
          .from('vehicle_images')
          .delete()
          .eq('vehicle_id', id);

        if (deleteError) {
          console.error('Error deleting old images:', deleteError);
        }

        // Add new images
        if (images.length > 0) {
          const imageRecords = images.map((imageUrl: string, index: number) => ({
            vehicle_id: id,
            image_url: imageUrl,
            display_order: index,
            // The trigger will automatically set is_default for the first image
          }));

          const { error: imagesError } = await supabase
            .from('vehicle_images')
            .insert(imageRecords);

          if (imagesError) {
            console.error('Error adding new vehicle images:', imagesError);
            toast.error('Vehicle updated but failed to update images');
          }
        }
      }

      toast.success('Vehicle updated successfully');
      await fetchVehicles(); // Refresh the list
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
      return null;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
        return false;
      }

      toast.success('Vehicle deleted successfully');
      await fetchVehicles(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
      return false;
    }
  };

  const uploadVehicleImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      console.log('Uploading image to Supabase storage:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image');
        return null;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading vehicle image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const deleteVehicleImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts[urlParts.length - 1]; // Get the filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vehicle-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('vehicle_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Error deleting image record:', dbError);
        toast.error('Failed to delete image');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting vehicle image:', error);
      toast.error('Failed to delete image');
      return false;
    }
  };

  const setDefaultImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_images')
        .update({ is_default: true })
        .eq('id', imageId);

      if (error) {
        console.error('Error setting default image:', error);
        toast.error('Failed to set default image');
        return false;
      }

      toast.success('Default image updated');
      await fetchVehicles(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error setting default image:', error);
      toast.error('Failed to set default image');
      return false;
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchVehicles();
    }
  }, [profile]);

  return {
    vehicles,
    loading,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    uploadVehicleImage,
    deleteVehicleImage,
    setDefaultImage,
  };
};
