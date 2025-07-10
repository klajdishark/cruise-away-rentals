import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const useLocations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Location[];
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Location> }) => {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive",
      });
    },
  });

  const updateLocation = (id: string, updates: Partial<Location>) => {
    updateLocationMutation.mutate({ id, updates });
  };

  const addLocation = (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    addLocationMutation.mutate(location);
  };

  return {
    locations: locations || [],
    isLoading,
    error,
    updateLocation,
    addLocation,
    isUpdating: updateLocationMutation.isPending,
    isAdding: addLocationMutation.isPending,
  };
};
