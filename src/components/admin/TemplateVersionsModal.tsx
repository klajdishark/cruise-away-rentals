import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Version {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_current_version: boolean;
}

export function TemplateVersionsModal(props: {
  isOpen: boolean;
  templateId: string | null;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchVersions = async () => {
    if (!props.templateId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('id, name, created_at, is_current_version, description')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVersions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load versions",
      });
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentVersion = async (versionId: string) => {
    try {
      // Start transaction
      // First set all versions to not current
      const { error } = await supabase
        .from('contract_templates')
        .update({ is_current_version: false })
        .neq('id', versionId);

      if (error) throw error;

      // Then set selected version to current
      const { error: setError } = await supabase
        .from('contract_templates')
        .update({ is_current_version: true })
        .eq('id', versionId);

      if (setError) throw setError;
      
      toast({
        title: "Version Updated",
        description: "Selected version is now active",
      });
      fetchVersions();
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update version",
      });
    }
  };

  useEffect(() => {
    if (props.isOpen) fetchVersions();
  }, [props.isOpen, props.templateId]);

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Template Versions</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.description || '-'}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {v.is_current_version ? (
                        <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          Current Version
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetCurrentVersion(v.id)}
                          className="hover:bg-blue-50"
                        >
                          Restore
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
