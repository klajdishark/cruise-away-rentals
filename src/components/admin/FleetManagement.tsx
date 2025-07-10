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
import { Input } from '@/components/ui/input';

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">All vehicles in fleet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready for rental</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rented}</div>
            <p className="text-xs text-muted-foreground">Currently rented</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">In service</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Table */}
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
            <TableHeader>
              <TableRow>
                <TableHead>Make & Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'rented'
                        ? 'bg-blue-100 text-blue-800'
                        : vehicle.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </TableCell>
                  <TableCell>${vehicle.price}/day</TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingVehicle(vehicle);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
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
