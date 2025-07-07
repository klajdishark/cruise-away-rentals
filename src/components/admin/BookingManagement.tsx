import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CheckCircle, Clock, Edit, Eye, Filter, Grid, Plus, Search, Trash2, XCircle, FileText } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { CalendarView } from './CalendarView';
import { DeliveryFormModal } from './DeliveryFormModal';
import { BookingReviewModal } from './BookingReviewModal';
import { useBookings } from '@/hooks/useBookings';
import { useBookingForms } from '@/hooks/useBookingForms';
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
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const BookingManagement = () => {
  const { 
    bookings, 
    isLoading, 
    createBooking, 
    updateBooking, 
    deleteBooking,
    isCreating,
    isUpdating,
    isDeleting
  } = useBookings();

  const {
    bookingForms,
    getDeliveryForm,
    createOrUpdateBookingForm,
    isUpdating: isUpdatingForm
  } = useBookingForms();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('table');
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState(false);
  const [selectedDeliveryBooking, setSelectedDeliveryBooking] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any | null>(null);

  // Debug logging to help identify issues
  console.log('Booking forms loaded:', bookingForms);
  console.log('Total bookings:', bookings.length);
  console.log('Completed bookings:', bookings.filter(b => b.status === 'completed').length);

  const filteredBookings = bookings.filter(booking => {
    const customerName = booking.customers?.name || '';
    const bookingId = booking.id || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateBooking = () => {
    setSelectedBooking(undefined);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (id: string) => {
    setBookingToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDeliveryForm = (booking: any) => {
    console.log('Opening delivery form for booking:', booking.id);
    setSelectedDeliveryBooking(booking);
    setIsDeliveryFormOpen(true);
  };

  const handleOpenReviewModal = (booking: any) => {
    console.log('Opening review modal for booking:', booking.id);
    setSelectedReviewBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleDeliveryFormSubmit = (formData: any) => {
    console.log('Submitting delivery form data:', formData);
    createOrUpdateBookingForm(formData);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete);
      setBookingToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmitBooking = (data: any) => {
    if (selectedBooking) {
      updateBooking({ id: selectedBooking.id, ...data });
    } else {
      createBooking(data);
    }
  };

  const handleApprove = (id: string) => {
    updateBooking({ id, status: 'confirmed' });
  };

  const handleReject = (id: string) => {
    updateBooking({ id, status: 'canceled' });
  };

  if (viewMode === 'calendar') {
    return <CalendarView />;
  }

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">Manage customer bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateBooking} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode(viewMode === 'calendar' ? 'table' : 'calendar')}
          >
            {viewMode === 'calendar' ? (
              <>
                <Grid className="w-4 h-4 mr-2" />
                Table View
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Completed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage customer reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
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
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const deliveryForm = getDeliveryForm(booking.id);
                const hasDeliveryForm = !!deliveryForm;
                const isDeliveryFormCompleted = deliveryForm?.completed_at;
                
                // Debug logging for each booking
                console.log(`Booking ${booking.id}:`, {
                  status: booking.status,
                  hasDeliveryForm,
                  isDeliveryFormCompleted,
                  deliveryForm
                });

                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.slice(0, 8)}...</TableCell>
                    <TableCell>{booking.customers?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {booking.vehicles ? 
                        `${booking.vehicles.brand} ${booking.vehicles.model} ${booking.vehicles.year}` : 
                        'Unknown Vehicle'
                      }
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd')}
                        </div>
                        <div className="text-xs text-muted-foreground">{booking.duration_days} days</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        {booking.status === 'completed' && (
                          <Badge variant={isDeliveryFormCompleted ? 'default' : 'secondary'} className="text-xs">
                            {isDeliveryFormCompleted ? 'Form Complete' : 'Form Pending'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${booking.total_amount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenReviewModal(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBooking(booking)}
                          disabled={isUpdating}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(booking.id)}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleReject(booking.id)}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {/* Show delivery form button for completed bookings only if not completed */}
                        {booking.status === 'completed' && !isDeliveryFormCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600"
                            onClick={() => handleOpenDeliveryForm(booking)}
                            disabled={isUpdatingForm}
                            title={hasDeliveryForm ? 'Complete Delivery Form' : 'Create Delivery Form'}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        onSubmit={handleSubmitBooking}
      />

      <DeliveryFormModal
        isOpen={isDeliveryFormOpen}
        onClose={() => setIsDeliveryFormOpen(false)}
        booking={selectedDeliveryBooking}
        deliveryForm={selectedDeliveryBooking ? getDeliveryForm(selectedDeliveryBooking.id) : undefined}
        onSubmit={handleDeliveryFormSubmit}
      />

      <BookingReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={selectedReviewBooking}
        deliveryForm={selectedReviewBooking ? getDeliveryForm(selectedReviewBooking.id) : undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
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
