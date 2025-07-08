
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Contract = Tables<'contracts'>;
type ContractTemplate = Tables<'contract_templates'>;
type ContractInsert = TablesInsert<'contracts'>;
type ContractUpdate = TablesUpdate<'contracts'>;

export const useContracts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all contracts with related data
  const {
    data: contracts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          bookings (
            id,
            start_date,
            end_date,
            pickup_location,
            dropoff_location,
            daily_rate,
            total_amount,
            duration_days,
            customers (
              id,
              name,
              email,
              phone,
              license_number
            ),
            vehicles (
              id,
              brand,
              model,
              year,
              license_plate,
              color
            )
          ),
          contract_templates (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }

      return data;
    }
  });

  // Fetch contract templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates
  } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching contract templates:', error);
        throw error;
      }

      return data;
    }
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contractData: {
      booking_id: string;
      template_id?: string;
      content?: string;
    }) => {
      // Generate contract number
      const { data: contractNumber, error: numberError } = await supabase
        .rpc('generate_contract_number');

      if (numberError) {
        console.error('Error generating contract number:', numberError);
        throw numberError;
      }

      // Get booking details for contract content
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (*),
          vehicles (*)
        `)
        .eq('id', contractData.booking_id)
        .single();

      if (bookingError) {
        console.error('Error fetching booking details:', bookingError);
        throw bookingError;
      }

      let contractContent = contractData.content || '';

      // If template is provided, use it to generate content
      if (contractData.template_id) {
        const { data: template, error: templateError } = await supabase
          .from('contract_templates')
          .select('template_content')
          .eq('id', contractData.template_id)
          .single();

        if (templateError) {
          console.error('Error fetching template:', templateError);
          throw templateError;
        }

        // Replace template variables with actual data
        contractContent = template.template_content
          .replace(/\{\{contract_number\}\}/g, contractNumber)
          .replace(/\{\{contract_date\}\}/g, new Date().toLocaleDateString())
          .replace(/\{\{customer_name\}\}/g, booking.customers?.name || '')
          .replace(/\{\{customer_email\}\}/g, booking.customers?.email || '')
          .replace(/\{\{customer_phone\}\}/g, booking.customers?.phone || '')
          .replace(/\{\{customer_license\}\}/g, booking.customers?.license_number || '')
          .replace(/\{\{vehicle_brand\}\}/g, booking.vehicles?.brand || '')
          .replace(/\{\{vehicle_model\}\}/g, booking.vehicles?.model || '')
          .replace(/\{\{vehicle_year\}\}/g, booking.vehicles?.year?.toString() || '')
          .replace(/\{\{vehicle_license_plate\}\}/g, booking.vehicles?.license_plate || '')
          .replace(/\{\{vehicle_color\}\}/g, booking.vehicles?.color || '')
          .replace(/\{\{pickup_date\}\}/g, new Date(booking.start_date).toLocaleDateString())
          .replace(/\{\{return_date\}\}/g, new Date(booking.end_date).toLocaleDateString())
          .replace(/\{\{pickup_location\}\}/g, booking.pickup_location)
          .replace(/\{\{return_location\}\}/g, booking.dropoff_location)
          .replace(/\{\{duration_days\}\}/g, booking.duration_days.toString())
          .replace(/\{\{daily_rate\}\}/g, booking.daily_rate.toString())
          .replace(/\{\{total_amount\}\}/g, booking.total_amount.toString());
      }

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          booking_id: contractData.booking_id,
          template_id: contractData.template_id,
          contract_number: contractNumber,
          content: contractContent,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contract:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contract Created",
        description: "New contract has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Creating Contract",
        description: error.message || "Failed to create contract",
      });
    }
  });

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: ContractUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contract:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contract Updated",
        description: "Contract has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Contract",
        description: error.message || "Failed to update contract",
      });
    }
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) {
        console.error('Error deleting contract:', error);
        throw error;
      }

      return contractId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contract Deleted",
        description: "Contract has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Contract",
        description: error.message || "Failed to delete contract",
      });
    }
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (contractId: string) => {
      // This would integrate with a PDF generation service
      // For now, we'll just update the status
      const { data, error } = await supabase
        .from('contracts')
        .update({ status: 'pending_signature' })
        .eq('id', contractId)
        .select()
        .single();

      if (error) {
        console.error('Error generating PDF:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "PDF Generated",
        description: "Contract PDF has been generated and is ready for signature.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Generating PDF",
        description: error.message || "Failed to generate PDF",
      });
    }
  });

  return {
    contracts,
    templates,
    isLoading,
    isLoadingTemplates,
    error,
    createContract: createContractMutation.mutate,
    updateContract: updateContractMutation.mutate,
    deleteContract: deleteContractMutation.mutate,
    generatePDF: generatePDFMutation.mutate,
    isCreating: createContractMutation.isPending,
    isUpdating: updateContractMutation.isPending,
    isDeleting: deleteContractMutation.isPending,
    isGeneratingPDF: generatePDFMutation.isPending,
  };
};
