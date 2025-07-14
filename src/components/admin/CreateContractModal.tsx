import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {useContracts} from '@/hooks/useContracts';

const createContractSchema = z.object({
    templateId: z.string().optional(),
    autoGeneratePDF: z.boolean().default(true),
});

type CreateContractFormData = z.infer<typeof createContractSchema>;

interface CreateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking?: any;
    onSubmit: (data: CreateContractFormData) => void;
}

export const CreateContractModal = ({
                                        isOpen,
                                        onClose,
                                        booking,
                                        onSubmit
                                    }: CreateContractModalProps) => {
    const {templates} = useContracts();

    const form = useForm<CreateContractFormData>({
        resolver: zodResolver(createContractSchema),
        defaultValues: {
            templateId: '',
            autoGeneratePDF: true,
        },
    });

    const handleSubmit = (data: CreateContractFormData) => {
        const processedData = {
            ...data,
            templateId: data.templateId === 'default' ? undefined : data.templateId
        };
        onSubmit(processedData);
        onClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Contract</DialogTitle>
                    <DialogDescription>
                        Create a new contract for booking {booking.id.slice(0, 8)}...
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Booking Details</h4>
                        <div className="text-sm space-y-1">
                            <p><strong>Customer:</strong> {booking.customers?.name}</p>
                            <p><strong>Vehicle:</strong> {booking.vehicles?.brand} {booking.vehicles?.model}</p>
                            <p><strong>Duration:</strong> {booking.duration_days} days</p>
                            <p><strong>Total:</strong> ${booking.total_amount}</p>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="templateId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Contract Template</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a template"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="default">Use Default Template</SelectItem>
                                                {templates.filter(t => t.is_active).map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose a template for the contract or use the default one
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="autoGeneratePDF"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Auto-Generate PDF</FormLabel>
                                            <FormDescription>
                                                Automatically generate and attach PDF after creating contract
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

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Contract
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
