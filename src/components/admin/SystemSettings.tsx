import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, DollarSign, Shield, MapPin, Clock, Plus, Edit, Loader2 } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useLocations } from '@/hooks/useLocations';
import { LocationModal } from './LocationModal';

export const SystemSettings = () => {
  const { getSetting, updateSetting, isLoading: settingsLoading, isUpdating } = useSystemSettings();
  const { locations, updateLocation, addLocation, isLoading: locationsLoading, isUpdating: locationUpdating, isAdding } = useLocations();
  
  const [localSettings, setLocalSettings] = useState({
    minAge: '',
    maxMileage: '',
    cancellationHours: '',
    baseTaxRate: '',
    securityDeposit: '',
    maintenanceMode: false,
  });

  const [locationModal, setLocationModal] = useState<{
    isOpen: boolean;
    location?: any;
  }>({ isOpen: false });

  // Initialize local settings when data loads
  React.useEffect(() => {
    if (!settingsLoading) {
      setLocalSettings({
        minAge: getSetting('min_age') || '21',
        maxMileage: getSetting('max_mileage') || '200',
        cancellationHours: getSetting('cancellation_hours') || '24',
        baseTaxRate: getSetting('base_tax_rate') || '8.5',
        securityDeposit: getSetting('security_deposit') || '200',
        maintenanceMode: getSetting('maintenance_mode') === 'true',
      });
    }
  }, [settingsLoading, getSetting]);

  const handleSaveAll = () => {
    updateSetting('min_age', localSettings.minAge);
    updateSetting('max_mileage', localSettings.maxMileage);
    updateSetting('cancellation_hours', localSettings.cancellationHours);
    updateSetting('base_tax_rate', localSettings.baseTaxRate);
    updateSetting('security_deposit', localSettings.securityDeposit);
    updateSetting('maintenance_mode', localSettings.maintenanceMode.toString());
  };

  const handleLocationSave = (location: any) => {
    if (location.id) {
      updateLocation(location.id, location);
    } else {
      addLocation(location);
    }
    setLocationModal({ isOpen: false });
  };

  const handleEditLocation = (location: any) => {
    setLocationModal({ isOpen: true, location });
  };

  const handleAddLocation = () => {
    setLocationModal({ isOpen: true });
  };

  if (settingsLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure global system settings and policies</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isUpdating}>
          <Settings className="w-4 h-4 mr-2" />
          {isUpdating ? 'Saving...' : 'Save All Changes'}
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
                value={localSettings.minAge}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, minAge: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-mileage">Daily Mileage Limit</Label>
              <Input
                id="max-mileage"
                type="number"
                value={localSettings.maxMileage}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, maxMileage: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cancellation-hours">Cancellation Notice (hours)</Label>
              <Input
                id="cancellation-hours"
                type="number"
                value={localSettings.cancellationHours}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, cancellationHours: e.target.value }))}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditLocation(location)}
                    disabled={locationUpdating}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleAddLocation}
              disabled={isAdding}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add New Location'}
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
              <Input 
                type="number" 
                value={localSettings.baseTaxRate}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, baseTaxRate: e.target.value }))}
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Security Deposit ($)</Label>
              <Input 
                type="number" 
                value={localSettings.securityDeposit}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, securityDeposit: e.target.value }))}
                className="mt-1" 
              />
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
              checked={localSettings.maintenanceMode}
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, maintenanceMode: checked }))}
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

      <LocationModal
        isOpen={locationModal.isOpen}
        onClose={() => setLocationModal({ isOpen: false })}
        onSave={handleLocationSave}
        location={locationModal.location}
        isLoading={locationUpdating || isAdding}
      />
    </div>
  );
};
