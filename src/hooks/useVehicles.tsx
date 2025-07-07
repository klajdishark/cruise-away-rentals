
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
  created_at: string;
  updated_at: string;
  images?: VehicleImage[];
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles with their images
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            vehicle_id,
            image_url,
            display_order,
            created_at
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

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'images'>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (error) {
        console.error('Error adding vehicle:', error);
        toast.error('Failed to add vehicle');
        return null;
      }

      toast.success('Vehicle added successfully');
      await fetchVehicles(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
      return null;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vehicle:', error);
        toast.error('Failed to update vehicle');
        return null;
      }

      toast.success('Vehicle updated successfully');
      await fetchVehicles(); // Refresh the list
      return data;
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

  const uploadVehicleImage = async (vehicleId: string, file: File, displayOrder: number = 0) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/${Date.now()}.${fileExt}`;

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

      // Save image record to database
      const { data: imageData, error: imageError } = await supabase
        .from('vehicle_images')
        .insert([{
          vehicle_id: vehicleId,
          image_url: publicUrl,
          display_order: displayOrder
        }])
        .select()
        .single();

      if (imageError) {
        console.error('Error saving image record:', imageError);
        toast.error('Failed to save image record');
        return null;
      }

      return imageData;
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
      const filePath = urlParts.slice(-2).join('/'); // Get last two parts (vehicleId/filename)

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
  };
};
