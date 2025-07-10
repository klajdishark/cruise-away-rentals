
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { ContractTemplateModal } from './ContractTemplateModal';
import { useContracts } from '@/hooks/useContracts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const ContractTemplateManagement = () => {
  const { templates, isLoadingTemplates } = useContracts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template => {
    const name = template.name || '';
    const description = template.description || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        const { error } = await supabase
          .from('contract_templates')
          .delete()
          .eq('id', templateToDelete);

        if (error) throw error;

        toast({
          title: "Template Deleted",
          description: "Contract template has been successfully deleted.",
        });
        
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      } catch (error: any) {
        toast({
          variant: "destructive", 
          title: "Error",
          description: error.message || "Failed to delete template",
        });
      }
      setTemplateToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  if (isLoadingTemplates) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
          <p className="text-muted-foreground">Manage contract templates with placeholders</p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Available Placeholders Info */}
      <Card>
        <CardHeader>
          <CardTitle>Available Placeholders</CardTitle>
          <CardDescription>Use these placeholders in your contract templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <Badge variant="outline">{'{{contract_number}}'}</Badge>
            <Badge variant="outline">{'{{contract_date}}'}</Badge>
            <Badge variant="outline">{'{{customer_name}}'}</Badge>
            <Badge variant="outline">{'{{customer_email}}'}</Badge>
            <Badge variant="outline">{'{{customer_phone}}'}</Badge>
            <Badge variant="outline">{'{{customer_license}}'}</Badge>
            <Badge variant="outline">{'{{vehicle_brand}}'}</Badge>
            <Badge variant="outline">{'{{vehicle_model}}'}</Badge>
            <Badge variant="outline">{'{{vehicle_year}}'}</Badge>
            <Badge variant="outline">{'{{vehicle_license_plate}}'}</Badge>
            <Badge variant="outline">{'{{pickup_date}}'}</Badge>
            <Badge variant="outline">{'{{return_date}}'}</Badge>
            <Badge variant="outline">{'{{pickup_location}}'}</Badge>
            <Badge variant="outline">{'{{return_location}}'}</Badge>
            <Badge variant="outline">{'{{duration_days}}'}</Badge>
            <Badge variant="outline">{'{{daily_rate}}'}</Badge>
            <Badge variant="outline">{'{{total_amount}}'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>Manage your contract templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? (
                        <>
                          <ToggleRight className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(template.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ContractTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
