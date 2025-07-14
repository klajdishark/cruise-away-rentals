import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';

interface Location {
    id: string;
    name: string;
    address: string;
    status: 'active' | 'inactive';
}

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: Omit<Location, 'id'> | Location) => void;
    location?: Location;
    isLoading?: boolean;
}

export const LocationModal = ({
                                  isOpen,
                                  onClose,
                                  onSave,
                                  location,
                                  isLoading = false
                              }: LocationModalProps) => {
    const [formData, setFormData] = useState({
        name: location?.name || '',
        address: location?.address || '',
        status: location?.status || 'active' as 'active' | 'inactive',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (location) {
            onSave({...location, ...formData});
        } else {
            onSave(formData);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            address: '',
            status: 'active',
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {location ? 'Edit Location' : 'Add New Location'}
                    </DialogTitle>
                    <DialogDescription>
                        {location
                            ? 'Update the location details below.'
                            : 'Enter the details for the new location.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Location Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                placeholder="Downtown Branch"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                                placeholder="123 Main St, City Center"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'active' | 'inactive') =>
                                    setFormData(prev => ({...prev, status: value}))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Location'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
