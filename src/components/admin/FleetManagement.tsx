
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Car, Settings, Calendar, Edit, Trash } from 'lucide-react';
import { VehicleModal } from './VehicleModal';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'rented' | 'maintenance' | 'inactive';
  price: number;
  location: string;
  mileage: number;
  nextService: string;
  description?: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  color: string;
  licensePlate: string;
}

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    status: 'active',
    price: 45,
    location: 'Downtown',
    mileage: 12500,
    nextService: '2024-02-15',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seats: 5,
    color: 'Silver',
    licensePlate: 'ABC-123',
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    status: 'rented',
    price: 40,
    location: 'Airport',
    mileage: 18200,
    nextService: '2024-03-20',
    fuelType: 'gasoline',
    transmission: 'manual',
    seats: 5,
    color: 'White',
    licensePlate: 'DEF-456',
  },
  {
    id: 3,
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    status: 'maintenance',
    price: 85,
    location: 'Downtown',
    mileage: 8900,
    nextService: '2024-01-30',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seats: 7,
    color: 'Black',
    licensePlate: 'GHI-789',
  },
  {
    id: 4,
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    status: 'active',
    price: 75,
    location: 'Mall',
    mileage: 5600,
    nextService: '2024-04-10',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    color: 'Red',
    licensePlate: 'JKL-012',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'rented':
      return 'bg-blue-100 text-blue-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const FleetManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const { toast } = useToast();

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    setEditingVehicle(undefined);
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle?.status === 'rented') {
      toast({
        title: "Cannot Delete Vehicle",
        description: "This vehicle is currently rented and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast({
      title: "Vehicle Deleted",
      description: "The vehicle has been successfully removed from your fleet.",
    });
  };

  const handleSubmitVehicle = (data: any) => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id 
          ? { ...v, ...data }
          : v
      ));
      toast({
        title: "Vehicle Updated",
        description: "The vehicle information has been successfully updated.",
      });
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        ...data,
        id: Math.max(...vehicles.map(v => v.id)) + 1,
        nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      };
      setVehicles(prev => [...prev, newVehicle]);
      toast({
        title: "Vehicle Added",
        description: "The new vehicle has been successfully added to your fleet.",
      });
    }
  };

  const getFleetStats = () => {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'active').length;
    const rented = vehicles.filter(v => v.status === 'rented').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    
    return { total, available, rented, maintenance };
  };

  const stats = getFleetStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your vehicle inventory and maintenance</p>
        </div>
        <Button onClick={handleAddVehicle}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Fleet Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready for rental</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Rented</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rented}</div>
            <p className="text-xs text-muted-foreground">Out with customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Settings className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inventory</CardTitle>
          <CardDescription>Manage and monitor your entire fleet</CardDescription>
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.color}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${vehicle.price}</TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        disabled={vehicle.status === 'rented'}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
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
        onSubmit={handleSubmitVehicle}
      />
    </div>
  );
};
