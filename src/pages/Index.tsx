import React from 'react';
import {Link} from 'react-router-dom';
import {Car, Clock, MapPin, Shield} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import Header from '@/components/Header';
import FeaturedCars from '@/components/FeaturedCars';

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <Header/>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                        Your Perfect
                        <span className="text-blue-600"> Ride</span>
                        <br/>
                        Awaits
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover premium car rentals for every journey. From compact city cars to luxury vehicles,
                        find your ideal ride with just a few clicks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg">
                            <Link to="/cars">Browse Cars</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg"
                                className="px-8 py-4 rounded-full text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                            <Link to="/how-it-works">How It Works</Link>
                        </Button>
                    </div>
                </div>

                {/* Floating hero image */}
                <div className="absolute top-32 right-10 hidden lg:block opacity-20">
                    <div
                        className="w-96 h-64 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl transform rotate-12"></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                        <p className="text-xl text-gray-600">Experience hassle-free car rentals with premium service</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl">
                            <CardContent className="p-8 text-center">
                                <div
                                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Car className="w-8 h-8 text-blue-600"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Fleet</h3>
                                <p className="text-gray-600">Choose from our carefully maintained collection of modern
                                    vehicles</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl">
                            <CardContent className="p-8 text-center">
                                <div
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-8 h-8 text-green-600"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Pickup</h3>
                                <p className="text-gray-600">Multiple convenient locations with Google Maps
                                    integration</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl">
                            <CardContent className="p-8 text-center">
                                <div
                                    className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-8 h-8 text-purple-600"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payment</h3>
                                <p className="text-gray-600">Safe and secure payments with PayPal integration</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl">
                            <CardContent className="p-8 text-center">
                                <div
                                    className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-8 h-8 text-orange-600"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
                                <p className="text-gray-600">Round-the-clock customer support for your peace of mind</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Featured Cars */}
            <FeaturedCars/>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Hit the Road?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of satisfied customers and book your perfect ride today
                    </p>
                    <Button asChild size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold">
                        <Link to="/cars">Start Your Journey</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Index;
