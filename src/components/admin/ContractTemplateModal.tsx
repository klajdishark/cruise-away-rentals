import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { RichTextEditor } from './RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  template_content: z.string().min(1, 'Template content is required'),
  is_active: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface ContractTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
}

export const ContractTemplateModal = ({ 
  isOpen, 
  onClose, 
  template 
}: ContractTemplateModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      template_content: template?.template_content || '',
      is_active: template?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description || '',
        template_content: template.template_content,
        is_active: template.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        template_content: '',
        is_active: true,
      });
    }
  }, [template, form]);

  const handleSubmit = async (data: TemplateFormData) => {
    try {
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('contract_templates')
          .update(data)
          .eq('id', template.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "Contract template has been successfully updated.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('contract_templates')
          .insert({
            name: data.name,
            description: data.description || null,
            template_content: data.template_content,
            is_active: data.is_active
          });

        if (error) throw error;

        toast({
          title: "Template Created",
          description: "New contract template has been successfully created.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save template",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Contract Template' : 'Create New Contract Template'}
          </DialogTitle>
          <DialogDescription>
            {template 
              ? 'Update the contract template information below.' 
              : 'Create a new contract template with placeholders.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Rental Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Template</FormLabel>
                      <FormDescription>
                        Enable this template for use in contract generation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of this template" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content</FormLabel>
                  <FormDescription>
                    Write your contract template using HTML. Use placeholders like {'{{customer_name}}'} for dynamic content.
                  </FormDescription>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your contract template with HTML formatting and placeholders..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {template ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
