
import React, { useState } from 'react';
import { Calendar, Car, CreditCard, User, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'March 2023',
  };

  // Mock booking data
  const bookings = [
    {
      id: 1,
      carName: 'Toyota Camry',
      carImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200&q=80',
      pickupDate: '2024-01-15',
      returnDate: '2024-01-18',
      pickupLocation: 'Downtown Branch',
      status: 'active',
      totalPrice: 195,
      bookingDate: '2024-01-10',
    },
    {
      id: 2,
      carName: 'Honda CR-V',
      carImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&q=80',
      pickupDate: '2023-12-20',
      returnDate: '2023-12-25',
      pickupLocation: 'Airport Branch',
      status: 'completed',
      totalPrice: 325,
      bookingDate: '2023-12-15',
    },
    {
      id: 3,
      carName: 'BMW 3 Series',
      carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80',
      pickupDate: '2023-11-10',
      returnDate: '2023-11-12',
      pickupLocation: 'City Center',
      status: 'completed',
      totalPrice: 190,
      bookingDate: '2023-11-05',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
            <p className="text-xl text-gray-600">Manage your rentals and account information</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">1</h3>
                <p className="text-gray-600">Active Rentals</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
                <p className="text-gray-600">Total Bookings</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">$710</h3>
                <p className="text-gray-600">Total Spent</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Gold</h3>
                <p className="text-gray-600">Member Status</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white p-1 rounded-full shadow-lg border-0">
              <TabsTrigger value="bookings" className="rounded-full px-6 py-2">My Bookings</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-full px-6 py-2">Profile</TabsTrigger>
              <TabsTrigger value="payment" className="rounded-full px-6 py-2">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-6">
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-2xl">My Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <img
                            src={booking.carImage}
                            alt={booking.carName}
                            className="w-full lg:w-32 h-24 object-cover rounded-2xl"
                          />
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{booking.carName}</h3>
                                <p className="text-gray-600">Booking #{booking.id.toString().padStart(6, '0')}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(booking.status)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{booking.pickupDate} to {booking.returnDate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{booking.pickupLocation}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <CreditCard className="w-4 h-4 mr-2" />
                                <span>${booking.totalPrice}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Booked {booking.bookingDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {booking.status === 'active' && (
                              <>
                                <Button variant="outline" className="rounded-full">
                                  Modify Booking
                                </Button>
                                <Button variant="destructive" className="rounded-full">
                                  Cancel Booking
                                </Button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <Button variant="outline" className="rounded-full">
                                View Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="p-3 bg-gray-50 rounded-full">{user.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="p-3 bg-gray-50 rounded-full">{user.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="p-3 bg-gray-50 rounded-full">{user.phone}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <div className="p-3 bg-gray-50 rounded-full">{user.joinDate}</div>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Methods Added</h3>
                    <p className="text-gray-600 mb-6">Add a payment method to speed up your bookings</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
