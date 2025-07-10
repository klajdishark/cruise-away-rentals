import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VehicleCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useVehicleCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['vehicle-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as VehicleCategory[];
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VehicleCategory> }) => {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (category: Omit<VehicleCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-categories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicle_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const updateCategory = (id: string, updates: Partial<VehicleCategory>) => {
    updateCategoryMutation.mutate({ id, updates });
  };

  const addCategory = (category: Omit<VehicleCategory, 'id' | 'created_at' | 'updated_at'>) => {
    addCategoryMutation.mutate(category);
  };

  const deleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  return {
    categories: categories || [],
    isLoading,
    error,
    updateCategory,
    addCategory,
    deleteCategory,
    isUpdating: updateCategoryMutation.isPending,
    isAdding: addCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
