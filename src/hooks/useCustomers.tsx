import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;
type CustomerInsert = TablesInsert<'customers'>;
type CustomerUpdate = TablesUpdate<'customers'>;

export const useCustomers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all customers
  const {
    data: customers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data;
    }
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<CustomerInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer Created",
        description: "New customer has been successfully added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Creating Customer",
        description: error.message || "Failed to create customer",
      });
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: CustomerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Customer",
        description: error.message || "Failed to update customer",
      });
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      return customerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer Deleted",
        description: "Customer has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Customer",
        description: error.message || "Failed to delete customer",
      });
    }
  });

  return {
    customers,
    isLoading,
    error,
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
  };
};
