import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx';
import {RichTextEditor} from '@/components/admin/RichTextEditor.tsx';
import {ContractTemplatePreview} from '@/components/admin/ContractTemplatePreview.tsx';
import {supabase} from '@/integrations/supabase/client.ts';
import {useToast} from '@/hooks/use-toast.ts';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router-dom';

const templateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    template_content: z.string().min(1),
    is_active: z.boolean(),
});

interface TemplateData {
    id: string;
    name: string;
    description: string | null;
    template_content: string;
    is_active: boolean;
    is_current_version: boolean;
    created_at: string;
    updated_at: string;
    variables?: any;
}

interface TemplateFormData {
    name: string;
    description?: string;
    template_content: string;
    is_active: boolean;
}

export const ContractTemplateEdit = () => {
    const {id} = useParams();
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    const {data: template} = useQuery<TemplateData>({
        queryKey: ['contract-template', id],
        queryFn: async () => {
            const {data, error} = await supabase
                .from('contract_templates')
                .select('*')
                .eq('id', id)
                .eq('is_current_version', true)
                .single();

            if (error) throw error;
            return data;
        },
    });

    const form = useForm({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            description: '',
            template_content: '',
            is_active: true,
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
        }
    }, [template, form]);

    const handleSubmit = async (data: TemplateData) => {
        try {
            // First update all existing versions of this template to not current
            const {error: updateError} = await supabase
                .from('contract_templates')
                .update({is_current_version: false})
                .eq('id', id);

            if (updateError) throw updateError;

            // Then insert new version as current
            const {data: newVersion, error: insertError} = await supabase
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

            if (insertError || !newVersion) throw insertError || new Error('Failed to create new version');

            toast({
                title: "Template Updated",
                description: "New version of contract template has been created.",
            });

            queryClient.invalidateQueries({queryKey: ['contract-templates']});
            navigate('/admin/contract-templates');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update template",
            });
        }
    };

    if (!template) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit Contract Template</h1>
                <p className="text-muted-foreground">
                    Update the contract template information below
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
                                        height="500px"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between gap-2">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview Template
                            </Button>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/contract-templates')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update Template
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
