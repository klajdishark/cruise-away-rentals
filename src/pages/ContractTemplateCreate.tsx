import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {RichTextEditor} from '@/components/admin/RichTextEditor';
import {ContractTemplatePreview} from '@/components/admin/ContractTemplatePreview';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';
import {useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';

const templateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    template_content: z.string().min(1, 'Template content is required'),
    is_active: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export const ContractTemplateCreate = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    const form = useForm<TemplateFormData>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            description: '',
            template_content: '',
            is_active: true,
        },
    });

    const handleSubmit = async (data: TemplateFormData) => {
        try {
            const { data: newTemplate, error: createError } = await supabase
                .from('contract_templates')
                .insert({
                    name: data.name,
                    description: data.description || null,
                    template_content: data.template_content,
                    is_active: data.is_active,
                    is_current_version: true
                })
                .select()
                .single();

            if (createError || !newTemplate) throw createError || new Error('Failed to create template');


            toast({
                title: "Template Created",
                description: "New contract template has been successfully created.",
            });

            queryClient.invalidateQueries({queryKey: ['contract-templates']});
            navigate('/admin/contract-templates');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create template",
            });
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Create New Contract Template</h1>
                <p className="text-muted-foreground">
                    Create a new contract template with placeholders
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Standard Rental Agreement" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brief description of this template" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template_content"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Template Content</FormLabel>
                                <FormDescription>
                                    Write your contract template using HTML. Use placeholders
                                    like {'{{customer_name}}'} for dynamic content.
                                </FormDescription>
                                <FormControl>
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Enter your contract template with HTML formatting and placeholders..."
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPreviewOpen(true)}
                        >
                            Preview Template
                        </Button>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/contract-templates')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Template
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            <ContractTemplatePreview
                content={form.watch('template_content')}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    );
};
