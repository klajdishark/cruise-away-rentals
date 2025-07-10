import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Car, Settings } from 'lucide-react';
import { VehicleModal } from './VehicleModal';
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import { useFleetStats } from '@/hooks/useFleetStats';
import { useVehicleTable } from '@/hooks/useVehicleTable';
import { useVehicleActions } from '@/hooks/useVehicleActions';
import { Loader2 } from 'lucide-react';

export const FleetManagement = () => {
  const { vehicles, loading } = useVehicles();
  const stats = useFleetStats(vehicles);
  const { filteredVehicles, searchTerm, setSearchTerm } = useVehicleTable(vehicles);
  const { handleDelete, handleSubmit } = useVehicleActions();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<Vehicle | undefined>();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Vehicle Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your vehicle inventory and maintenance</p>
        </div>
        <Button onClick={() => {
          setEditingVehicle(undefined);
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards - Will be extracted in Phase 2 */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* ... existing stats cards implementation ... */}
      </div>

      {/* Vehicle Table - Will be extracted in Phase 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <Table>
            {/* ... existing table implementation ... */}
          </Table>
        </CardContent>
      </Card>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={editingVehicle}
        onSubmit={(data) => handleSubmit(data, editingVehicle).then(success => {
          if (success) setIsModalOpen(false);
        })}
      />
    </div>
  );
};
