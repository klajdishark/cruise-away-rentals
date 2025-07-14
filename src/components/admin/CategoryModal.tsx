import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
    description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: {
        id: string;
        name: string;
        description?: string;
    };
    onSubmit: (data: CategoryFormData) => void;
    isSubmitting?: boolean;
}

export const CategoryModal = ({
                                  isOpen,
                                  onClose,
                                  category,
                                  onSubmit,
                                  isSubmitting = false
                              }: CategoryModalProps) => {
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || '',
            description: category?.description || '',
        },
    });

    React.useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description || '',
            });
        } else {
            form.reset({
                name: '',
                description: '',
            });
        }
    }, [category, form]);

    const handleSubmit = (data: CategoryFormData) => {
        onSubmit(data);
        if (!isSubmitting) {
            form.reset();
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? 'Update the category information below.'
                            : 'Create a new category to organize your vehicles.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., SUV, Economy, Luxury..." {...field} />
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
                                        <Textarea
                                            placeholder="Brief description of this category..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
