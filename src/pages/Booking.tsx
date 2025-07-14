import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AlertTriangle, Calendar, CreditCard, MapPin, User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription} from '@/components/ui/alert';
import Header from '@/components/Header';
import {toast} from '@/hooks/use-toast';
import {useVehicleAvailability} from '@/hooks/useVehicleAvailability';

const Booking = () => {
    const {carId} = useParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const {checkAvailability, isChecking} = useVehicleAvailability();
    const [isVehicleAvailable, setIsVehicleAvailable] = useState(true);
    const [availabilityMessage, setAvailabilityMessage] = useState('');

    // Mock car data (in real app, fetch by carId)
    const car = {
        id: 1,
        name: 'Toyota Camry',
        price: 45,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80',
        passengers: 5,
        transmission: 'Automatic',
        year: 2023,
    };

    const [bookingData, setBookingData] = useState({
        pickupDate: '',
        pickupTime: '',
        returnDate: '',
        returnTime: '',
        pickupLocation: '',
        returnLocation: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        specialRequests: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Check availability when dates change
    useEffect(() => {
        const performAvailabilityCheck = async () => {
            if (carId && bookingData.pickupDate && bookingData.returnDate) {
                const isAvailable = await checkAvailability({
                    vehicleId: carId,
                    startDate: bookingData.pickupDate,
                    endDate: bookingData.returnDate
                });

                setIsVehicleAvailable(isAvailable);

                if (!isAvailable) {
                    setAvailabilityMessage(
                        `${car.name} is not available from ${bookingData.pickupDate} to ${bookingData.returnDate}. Please select different dates.`
                    );
                } else {
                    setAvailabilityMessage('');
                }
            } else {
                setIsVehicleAvailable(true);
                setAvailabilityMessage('');
            }
        };

        performAvailabilityCheck();
    }, [carId, bookingData.pickupDate, bookingData.returnDate, checkAvailability, car.name]);

    const calculateTotalPrice = () => {
        if (!bookingData.pickupDate || !bookingData.returnDate) return car.price;

        const pickup = new Date(bookingData.pickupDate);
        const returnDate = new Date(bookingData.returnDate);
        const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

        return Math.max(1, days) * car.price;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVehicleAvailable) {
            toast({
                variant: "destructive",
                title: "Vehicle Not Available",
                description: availabilityMessage,
            });
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            toast({
                title: "Booking Confirmed!",
                description: "Your car rental has been successfully booked. Check your email for confirmation details.",
            });
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>

            <div className="pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
                        <p className="text-xl text-gray-600">Just a few more details and you're ready to go!</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Booking Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Availability Alert */}
                                {!isVehicleAvailable && availabilityMessage && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4"/>
                                        <AlertDescription>{availabilityMessage}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Rental Details */}
                                <Card className="border-0 shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-xl">
                                            <Calendar className="w-5 h-5 mr-2"/>
                                            Rental Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="pickupDate">Pickup Date</Label>
                                            <Input
                                                id="pickupDate"
                                                name="pickupDate"
                                                type="date"
                                                value={bookingData.pickupDate}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="pickupTime">Pickup Time</Label>
                                            <Input
                                                id="pickupTime"
                                                name="pickupTime"
                                                type="time"
                                                value={bookingData.pickupTime}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="returnDate">Return Date</Label>
                                            <Input
                                                id="returnDate"
                                                name="returnDate"
                                                type="date"
                                                value={bookingData.returnDate}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="returnTime">Return Time</Label>
                                            <Input
                                                id="returnTime"
                                                name="returnTime"
                                                type="time"
                                                value={bookingData.returnTime}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Location Details */}
                                <Card className="border-0 shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-xl">
                                            <MapPin className="w-5 h-5 mr-2"/>
                                            Pickup & Return Locations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="pickupLocation">Pickup Location</Label>
                                            <Input
                                                id="pickupLocation"
                                                name="pickupLocation"
                                                placeholder="Enter pickup address or select from map"
                                                value={bookingData.pickupLocation}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Google Maps integration coming soon for location selection
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="returnLocation">Return Location</Label>
                                            <Input
                                                id="returnLocation"
                                                name="returnLocation"
                                                placeholder="Enter return address or select from map"
                                                value={bookingData.returnLocation}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Personal Information */}
                                <Card className="border-0 shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-xl">
                                            <User className="w-5 h-5 mr-2"/>
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={bookingData.firstName}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={bookingData.lastName}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={bookingData.email}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={bookingData.phone}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="licenseNumber">Driver's License Number</Label>
                                            <Input
                                                id="licenseNumber"
                                                name="licenseNumber"
                                                value={bookingData.licenseNumber}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-full"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                                            <Textarea
                                                id="specialRequests"
                                                name="specialRequests"
                                                placeholder="Any special requests or additional information..."
                                                value={bookingData.specialRequests}
                                                onChange={handleInputChange}
                                                className="mt-1 rounded-2xl"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </div>

                        {/* Booking Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <Card className="border-0 shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Booking Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Car Details */}
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={car.image}
                                                alt={car.name}
                                                className="w-20 h-16 object-cover rounded-2xl"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{car.name}</h3>
                                                <p className="text-sm text-gray-600">{car.year} • {car.transmission}</p>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <User className="w-4 h-4 mr-1"/>
                                                    <span>{car.passengers} passengers</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Daily Rate</span>
                                                <span>${car.price}/day</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Duration</span>
                                                <span>
                          {bookingData.pickupDate && bookingData.returnDate
                              ? `${Math.max(1, Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24)))} days`
                              : '1 day'}
                        </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Taxes & Fees</span>
                                                <span>$15</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2">
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-blue-600">${calculateTotalPrice() + 15}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Button */}
                                        <div className="lg:col-span-2">
                                            <Button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold"
                                                disabled={isProcessing || !isVehicleAvailable || isChecking}
                                            >
                                                {isProcessing ? (
                                                    <div className="flex items-center">
                                                        <div
                                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Processing...
                                                    </div>
                                                ) : isChecking ? (
                                                    <div className="flex items-center">
                                                        <div
                                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Checking availability...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <CreditCard className="w-5 h-5 mr-2"/>
                                                        Pay with PayPal
                                                    </div>
                                                )}
                                            </Button>
                                        </div>

                                        <p className="text-xs text-gray-500 text-center">
                                            Secure payment powered by PayPal. Your payment information is encrypted and
                                            secure.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
