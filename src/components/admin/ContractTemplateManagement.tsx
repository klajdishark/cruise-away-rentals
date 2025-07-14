import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Edit, History, Plus, Trash2} from 'lucide-react';
import {Switch} from '@/components/ui/switch';
import {Link} from 'react-router-dom';
import {useToast} from '@/hooks/use-toast';
import {TemplateVersionsModal} from './TemplateVersionsModal';

type ContractTemplate = {
    id: string;
    name: string;
    description: string | null;
    template_content: string;
    is_active: boolean;
    is_current_version: boolean;
    version_number: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
};

export const ContractTemplateManagement = () => {
    const {toast} = useToast();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [showVersionsModal, setShowVersionsModal] = useState(false);

    const {data: templates, isLoading, refetch} = useQuery({
        queryKey: ['contract-templates'],
        queryFn: async (): Promise<ContractTemplate[]> => {
            try {
                // First try querying with all fields
                let {data, error} = await supabase
                    .from('contract_templates')
                    .select('*')
                    .eq('is_current_version', true)
                    .order('created_at', {ascending: false});

                if (error) {
                    // If that fails, try with minimal required fields
                    const fallback = await supabase
                        .from('contract_templates')
                        .select('id, name, is_active, created_at, is_current_version')
                        .order('created_at', {ascending: false});

                    if (fallback.error) throw fallback.error;

                    return fallback.data?.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: null,
                        template_content: '',
                        is_active: t.is_active,
                        is_current_version: t.is_current_version || true,
                        version_number: 1,
                        parent_id: null,
                        created_at: t.created_at,
                        updated_at: t.created_at
                    })) || [];
                }

                return data?.map(t => {
                    const template: Partial<ContractTemplate> = {
                        id: t.id,
                        name: t.name,
                        description: t.description || null,
                        template_content: t.template_content || '',
                        is_active: t.is_active || false,
                        created_at: t.created_at,
                        updated_at: t.updated_at || t.created_at
                    };

                    // Add optional fields if they exist with proper typing
                    if ('is_current_version' in t) template.is_current_version = Boolean(t.is_current_version);
                    if ('version_number' in t) template.version_number = Number(t.version_number) || 1;
                    if ('parent_id' in t) template.parent_id = String(t.parent_id) || null;

                    return {
                        is_current_version: true,
                        version_number: 1,
                        parent_id: null,
                        ...template
                    } as ContractTemplate;
                }) || [];
            } catch (error) {
                console.error('Error fetching templates:', error);
                throw error;
            }
        }
    });

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const {error} = await supabase
                .from('contract_templates')
                .update({is_active: isActive})
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Template Updated",
                description: `Template has been ${isActive ? 'enabled' : 'disabled'}.`,
            });
            refetch();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update template status",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const {error} = await supabase
                .from('contract_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Template Deleted",
                description: "Contract template has been successfully deleted.",
            });
            refetch();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to delete template",
            });
        }
    };

    const handleShowVersions = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setShowVersionsModal(true);
    };

    if (isLoading) return <div>Loading templates...</div>;

    return (
        <div className="space-y-6">
            <TemplateVersionsModal
                isOpen={showVersionsModal}
                templateId={selectedTemplateId}
                onClose={() => setShowVersionsModal(false)}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
                    <p className="text-muted-foreground">Manage your contract templates</p>
                </div>
                {templates?.length === 0 && (
                    <Button asChild>
                        <Link to="/admin/contract-templates/create">
                            <Plus className="w-4 h-4 mr-2"/>
                            New Template
                        </Link>
                    </Button>
                )}
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates?.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">{template.name}</TableCell>
                                <TableCell>
                                    {template.is_active ? (
                                        <span className="text-green-600">Active</span>
                                    ) : (
                                        <span className="text-gray-500">Inactive</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {new Date(template.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        <Switch
                                            checked={template.is_active}
                                            onCheckedChange={() => handleToggleActive(template.id, !template.is_active)}
                                            className="data-[state=checked]:bg-green-600"
                                        />
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/admin/contract-templates/edit/${template.id}`}>
                                                <Edit className="w-4 h-4"/>
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleShowVersions(template.id)}
                                        >
                                            <History className="w-4 h-4"/>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
