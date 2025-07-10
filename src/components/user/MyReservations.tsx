import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Download,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

const mockReservations = [
  {
    id: 1,
    carName: 'BMW X5',
    carImage: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop',
    location: 'Downtown Location',
    startDate: '2024-12-15',
    endDate: '2024-12-18',
    totalPrice: 240,
    status: 'active',
    bookingId: 'RNT-001',
  },
  {
    id: 2,
    carName: 'Mercedes C-Class',
    carImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    location: 'Airport Location',
    startDate: '2024-12-22',
    endDate: '2024-12-25',
    totalPrice: 180,
    status: 'upcoming',
    bookingId: 'RNT-002',
  },
  {
    id: 3,
    carName: 'Audi A4',
    carImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=200&fit=crop',
    location: 'City Center',
    startDate: '2024-11-20',
    endDate: '2024-11-23',
    totalPrice: 160,
    status: 'completed',
    bookingId: 'RNT-003',
    rating: 5,
  },
];

export const MyReservations = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservations = selectedTab === 'all' 
    ? mockReservations 
    : mockReservations.filter(r => r.status === selectedTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-gray-600 mt-2">Track and manage your car rentals</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Reservations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Car Image */}
                  <img
                    src={reservation.carImage}
                    alt={reservation.carName}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />

                  {/* Reservation Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{reservation.carName}</h3>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{reservation.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Booking ID: {reservation.bookingId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{reservation.startDate} to {reservation.endDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg text-gray-900">
                          ${reservation.totalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Rating for completed reservations */}
                    {reservation.status === 'completed' && reservation.rating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Your rating:</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < reservation.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 min-w-[120px]">
                    {reservation.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {reservation.status === 'upcoming' && (
                      <>
                        <Button size="sm" variant="outline">
                          Modify
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {reservation.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                        <Button size="sm" variant="outline">
                          Book Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredReservations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reservations found
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedTab === 'all' 
                    ? "You haven't made any reservations yet."
                    : `No ${selectedTab} reservations found.`
                  }
                </p>
                <Button asChild>
                  <a href="/cars">Browse Cars</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
