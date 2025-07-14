import React from 'react';
import {Calendar, Car, CreditCard, MapPin, Search, Shield} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import Header from '@/components/Header';
import {Link} from 'react-router-dom';

const HowItWorks = () => {
    const steps = [
        {
            step: 1,
            icon: Search,
            title: 'Browse & Select',
            description: 'Search through our extensive fleet of premium vehicles and find the perfect car for your needs.',
            color: 'bg-blue-500',
        },
        {
            step: 2,
            icon: Calendar,
            title: 'Choose Dates',
            description: 'Select your pickup and return dates, times, and locations to fit your schedule perfectly.',
            color: 'bg-green-500',
        },
        {
            step: 3,
            icon: CreditCard,
            title: 'Secure Payment',
            description: 'Complete your booking with our secure PayPal integration for a safe and hassle-free experience.',
            color: 'bg-purple-500',
        },
        {
            step: 4,
            icon: Car,
            title: 'Hit the Road',
            description: 'Pick up your car at the designated location and enjoy your journey with complete peace of mind.',
            color: 'bg-orange-500',
        },
    ];

    const features = [
        {
            icon: MapPin,
            title: 'Multiple Locations',
            description: 'Convenient pickup and drop-off locations throughout the city, including airports and downtown areas.',
        },
        {
            icon: Shield,
            title: 'Fully Insured',
            description: 'All our vehicles come with comprehensive insurance coverage for your complete protection.',
        },
        {
            icon: Car,
            title: 'Premium Fleet',
            description: 'Regularly maintained, modern vehicles from top brands ensuring reliability and comfort.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>

            <div className="pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            How It <span className="text-blue-600">Works</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Renting a car has never been easier. Follow these simple steps to get on the road in
                            minutes.
                        </p>
                    </div>

                    {/* Steps Section */}
                    <div className="mb-20">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <Card key={step.step}
                                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl relative overflow-hidden group">
                                    <CardContent className="p-8 text-center">
                                        {/* Step Number */}
                                        <div
                                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">{step.step}</span>
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <step.icon className="w-8 h-8 text-white"/>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RentEasy?</h2>
                            <p className="text-xl text-gray-600">Experience the difference with our premium service</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <Card key={index}
                                      className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl">
                                    <CardContent className="p-8 text-center">
                                        <div
                                            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <feature.icon className="w-8 h-8 text-blue-600"/>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-16">
                        <Card className="border-0 shadow-lg rounded-3xl">
                            <CardContent className="p-12">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked
                                        Questions</h2>
                                    <p className="text-xl text-gray-600">Get answers to common questions about our
                                        service</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What documents do I
                                            need?</h3>
                                        <p className="text-gray-600 mb-6">You'll need a valid driver's license, credit
                                            card, and proof of insurance. International visitors may need an
                                            International Driving Permit.</p>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I modify my
                                            booking?</h3>
                                        <p className="text-gray-600 mb-6">Yes, you can modify your booking up to 24
                                            hours before pickup through your dashboard or by contacting our support
                                            team.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the
                                            price?</h3>
                                        <p className="text-gray-600 mb-6">The price includes basic insurance, unlimited
                                            mileage, and 24/7 roadside assistance. Additional coverage options are
                                            available.</p>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I return the
                                            car late?</h3>
                                        <p className="text-gray-600 mb-6">Late returns are subject to additional
                                            charges. We offer a 30-minute grace period, after which hourly rates
                                            apply.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800">
                            <CardContent className="p-12">
                                <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                                <p className="text-xl text-blue-100 mb-8">
                                    Join thousands of satisfied customers and book your perfect ride today
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button asChild size="lg"
                                            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold">
                                        <Link to="/cars">Browse Cars</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg"
                                            className="px-8 py-4 rounded-full text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600">
                                        <Link to="/contact">Contact Us</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
