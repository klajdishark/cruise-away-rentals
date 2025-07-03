
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Shield, Users, Eye, Settings, Key, Clock } from 'lucide-react';

const adminUsers = [
  {
    id: 'ADM001',
    name: 'John Smith',
    email: 'john.smith@renteasy.com',
    role: 'Super Admin',
    department: 'Management',
    status: 'active',
    lastLogin: '2024-01-20 14:30',
    permissions: ['all'],
  },
  {
    id: 'ADM002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@renteasy.com',
    role: 'Fleet Manager',
    department: 'Operations',
    status: 'active',
    lastLogin: '2024-01-20 11:45',
    permissions: ['fleet', 'bookings', 'customers'],
  },
  {
    id: 'ADM003',
    name: 'Mike Davis',
    email: 'mike.davis@renteasy.com',
    role: 'Support Agent',
    department: 'Customer Service',
    status: 'active',
    lastLogin: '2024-01-20 16:20',
    permissions: ['support', 'customers', 'bookings'],
  },
  {
    id: 'ADM004',
    name: 'Lisa Wilson',
    email: 'lisa.wilson@renteasy.com',
    role: 'Financial Officer',
    department: 'Finance',
    status: 'inactive',
    lastLogin: '2024-01-18 09:15',
    permissions: ['payments', 'analytics', 'promotions'],
  },
];

const roles = [
  {
    name: 'Super Admin',
    description: 'Full system access and control',
    permissions: ['Dashboard', 'Fleet', 'Bookings', 'Customers', 'Payments', 'Analytics', 'Promotions', 'Support', 'Settings', 'User Management'],
    userCount: 2,
  },
  {
    name: 'Fleet Manager',
    description: 'Vehicle and booking management',
    permissions: ['Dashboard', 'Fleet', 'Bookings', 'Customers', 'Analytics'],
    userCount: 3,
  },
  {
    name: 'Support Agent',
    description: 'Customer support and basic operations',
    permissions: ['Dashboard', 'Support', 'Customers', 'Bookings'],
    userCount: 8,
  },
  {
    name: 'Financial Officer',
    description: 'Financial operations and reporting',
    permissions: ['Dashboard', 'Payments', 'Analytics', 'Promotions'],
    userCount: 2,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Super Admin':
      return 'bg-purple-100 text-purple-800';
    case 'Fleet Manager':
      return 'bg-blue-100 text-blue-800';
    case 'Support Agent':
      return 'bg-green-100 text-green-800';
    case 'Financial Officer':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const AdminAccessControl = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredAdmins = adminUsers.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Access Control</h1>
          <p className="text-muted-foreground">Manage staff accounts and role-based permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Access Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Key className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Define and manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div key={role.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <Badge variant="outline">{role.userCount} users</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Duplicate</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Manage staff accounts and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admin users..."
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
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.id}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(admin.role)}>
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.department}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(admin.status)}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
          <CardDescription>Monitor login attempts and security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Successful login</div>
                <div className="text-sm text-muted-foreground">john.smith@renteasy.com from 192.168.1.100</div>
              </div>
              <div className="text-sm text-muted-foreground">2 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium">Failed login attempt</div>
                <div className="text-sm text-muted-foreground">unknown@example.com from 203.45.67.89</div>
              </div>
              <div className="text-sm text-muted-foreground">15 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Password changed</div>
                <div className="text-sm text-muted-foreground">sarah.johnson@renteasy.com</div>
              </div>
              <div className="text-sm text-muted-foreground">1 hour ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
