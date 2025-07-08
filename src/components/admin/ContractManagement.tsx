
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Eye, Edit, Trash2, FileText, Download, Send } from 'lucide-react';
import { ContractModal } from './ContractModal';
import { ContractViewModal } from './ContractViewModal';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending_signature':
      return 'bg-yellow-100 text-yellow-800';
    case 'signed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ContractManagement = () => {
  const {
    contracts,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
    generatePDF,
    isCreating,
    isUpdating,
    isDeleting,
    isGeneratingPDF
  } = useContracts();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedViewContract, setSelectedViewContract] = useState<any | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const contractNumber = contract.contract_number || '';
    const customerName = contract.bookings?.customers?.name || '';
    const matchesSearch = contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateContract = () => {
    setSelectedContract(undefined);
    setIsModalOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleViewContract = (contract: any) => {
    setSelectedViewContract(contract);
    setIsViewModalOpen(true);
  };

  const handleDeleteContract = (id: string) => {
    setContractToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete);
      setContractToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmitContract = (data: any) => {
    if (selectedContract) {
      updateContract({ id: selectedContract.id, ...data });
    } else {
      createContract(data);
    }
  };

  const handleGeneratePDF = (contractId: string) => {
    generatePDF(contractId);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateContract({ id, status });
  };

  if (isLoading) {
    return <div>Loading contracts...</div>;
  }

  // Calculate statistics
  const totalContracts = contracts.length;
  const draftContracts = contracts.filter(c => c.status === 'draft').length;
  const pendingContracts = contracts.filter(c => c.status === 'pending_signature').length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground">Manage rental contracts and agreements</p>
        </div>
        <Button onClick={handleCreateContract} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Contract Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Contracts</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftContracts}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
            <Send className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContracts}</div>
            <p className="text-xs text-muted-foreground">Awaiting signature</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signedContracts}</div>
            <p className="text-xs text-muted-foreground">Fully executed</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
          <CardDescription>View and manage rental contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="signed">Signed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contract_number}</TableCell>
                  <TableCell>{contract.bookings?.customers?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    {contract.bookings?.vehicles ? 
                      `${contract.bookings.vehicles.brand} ${contract.bookings.vehicles.model} ${contract.bookings.vehicles.year}` : 
                      'Unknown Vehicle'
                    }
                  </TableCell>
                  <TableCell>
                    {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContract(contract)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContract(contract)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {contract.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeneratePDF(contract.id)}
                          disabled={isGeneratingPDF}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                      {contract.status === 'pending_signature' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(contract.id, 'signed')}
                          disabled={isUpdating}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContract(contract.id)}
                        disabled={isDeleting}
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

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
        onSubmit={handleSubmitContract}
      />

      <ContractViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contract={selectedViewContract}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract.
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
