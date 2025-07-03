
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Filter, Eye, Plus, Edit, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  licenseNumber: string;
  licenseExpiry: string;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'verified' | 'vip' | 'flagged' | 'suspended';
  licenseStatus: 'verified' | 'pending' | 'rejected';
  notes?: string;
}

const initialCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    licenseNumber: 'DL123456789',
    licenseExpiry: '2026-12-31',
    joinDate: '2023-12-15',
    totalBookings: 12,
    totalSpent: 2840,
    status: 'verified',
    licenseStatus: 'verified',
  },
  {
    id: 'CUST002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 987-6543',
    licenseNumber: 'DL987654321',
    licenseExpiry: '2025-08-15',
    joinDate: '2023-11-20',
    totalBookings: 8,
    totalSpent: 1920,
    status: 'active',
    licenseStatus: 'pending',
  },
  {
    id: 'CUST003',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1 (555) 456-7890',
    licenseNumber: 'DL456789123',
    licenseExpiry: '2027-03-20',
    joinDate: '2023-10-05',
    totalBookings: 25,
    totalSpent: 5680,
    status: 'vip',
    licenseStatus: 'verified',
  },
  {
    id: 'CUST004',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 234-5678',
    licenseNumber: 'DL234567890',
    licenseExpiry: '2024-11-10',
    joinDate: '2024-01-10',
    totalBookings: 2,
    totalSpent: 340,
    status: 'flagged',
    licenseStatus: 'rejected',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'vip':
      return 'bg-purple-100 text-purple-800';
    case 'flagged':
      return 'bg-red-100 text-red-800';
    case 'suspended':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getLicenseStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const { toast } = useToast();

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(customer => customer.id !== customerId));
    toast({
      title: "Customer Deleted",
      description: "Customer has been successfully removed from the system.",
    });
  };

  const handleSubmitCustomer = (data: any) => {
    if (selectedCustomer) {
      // Update existing customer
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, ...data }
          : customer
      ));
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });
    } else {
      // Create new customer
      const newCustomer: Customer = {
        ...data,
        id: `CUST${String(customers.length + 1).padStart(3, '0')}`,
        joinDate: new Date().toISOString().split('T')[0],
        totalBookings: 0,
        totalSpent: 0,
      };
      setCustomers([...customers, newCustomer]);
      toast({
        title: "Customer Created",
        description: "New customer has been successfully added to the system.",
      });
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    // For now, just show customer details in a toast
    // In a real app, this could open a detailed view modal
    toast({
      title: `Customer: ${customer.name}`,
      description: `ID: ${customer.id} | Status: ${customer.status} | Bookings: ${customer.totalBookings}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer profiles and accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCustomer}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Export Customers
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.licenseStatus === 'verified').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((customers.filter(c => c.licenseStatus === 'verified').length / customers.length) * 100)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'vip').length}
            </div>
            <p className="text-xs text-muted-foreground">High-value customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Accounts</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'flagged').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>View and manage customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
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
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.joinDate}</TableCell>
                  <TableCell>{customer.totalBookings}</TableCell>
                  <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLicenseStatusColor(customer.licenseStatus)}>
                      {customer.licenseStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
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

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        onSubmit={handleSubmitCustomer}
      />
    </div>
  );
};
