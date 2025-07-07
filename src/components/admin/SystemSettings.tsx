
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, DollarSign, Shield, MapPin, Clock } from 'lucide-react';

const locations = [
  { id: 1, name: 'Downtown Branch', address: '123 Main St, City Center', status: 'active' },
  { id: 2, name: 'Airport Location', address: '456 Airport Blvd, Terminal A', status: 'active' },
  { id: 3, name: 'Mall Branch', address: '789 Shopping Mall Dr', status: 'active' },
  { id: 4, name: 'University Campus', address: '321 University Ave', status: 'inactive' },
];

export const SystemSettings = () => {
  const [minAge, setMinAge] = useState('21');
  const [maxMileage, setMaxMileage] = useState('200');
  const [cancellationHours, setCancellationHours] = useState('24');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure global system settings and policies</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Global Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Rental Policies
          </CardTitle>
          <CardDescription>Configure global rental policies and restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="min-age">Minimum Age Requirement</Label>
              <Input
                id="min-age"
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-mileage">Daily Mileage Limit</Label>
              <Input
                id="max-mileage"
                type="number"
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cancellation-hours">Cancellation Notice (hours)</Label>
              <Input
                id="cancellation-hours"
                type="number"
                value={cancellationHours}
                onChange={(e) => setCancellationHours(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Management
          </CardTitle>
          <CardDescription>Manage rental locations and service zones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-muted-foreground">{location.address}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                    {location.status}
                  </Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Add New Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing Configuration
          </CardTitle>
          <CardDescription>Configure pricing rules and seasonal adjustments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Base Tax Rate (%)</Label>
              <Input type="number" defaultValue="8.5" className="mt-1" />
            </div>
            <div>
              <Label>Security Deposit ($)</Label>
              <Input type="number" defaultValue="200" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            System Status
          </CardTitle>
          <CardDescription>Monitor and control system availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-muted-foreground">
                Temporarily disable bookings for system maintenance
              </div>
            </div>
            <Switch 
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.4GB</div>
              <div className="text-sm text-muted-foreground">Data Usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
