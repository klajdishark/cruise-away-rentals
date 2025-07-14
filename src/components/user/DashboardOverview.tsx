import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ArrowRight, Calendar, Car, Clock, CreditCard, MapPin} from 'lucide-react';
import {Link} from 'react-router-dom';

export const DashboardOverview = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
                <p className="text-gray-600 mt-2">Here's what's happening with your rentals</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">+1 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Since joining</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$2,847</div>
                        <p className="text-xs text-muted-foreground">This year</p>
                    </CardContent>
                </Card>
            </div>

            {/* Current Reservations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Reservations</CardTitle>
                            <CardDescription>Your active and upcoming rentals</CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link to="/dashboard/reservations">
                                View All
                                <ArrowRight className="w-4 h-4 ml-2"/>
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Active Reservation */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=80&h=60&fit=crop"
                                    alt="BMW X5"
                                    className="w-16 h-12 object-cover rounded"
                                />
                                <div>
                                    <h4 className="font-semibold">BMW X5</h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4"/>
                                        <span>Downtown Location</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4"/>
                                        <span>Dec 15 - Dec 18, 2024</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="secondary" className="mb-2">Active</Badge>
                                <p className="text-lg font-bold">$240</p>
                            </div>
                        </div>

                        {/* Upcoming Reservation */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=60&fit=crop"
                                    alt="Mercedes C-Class"
                                    className="w-16 h-12 object-cover rounded"
                                />
                                <div>
                                    <h4 className="font-semibold">Mercedes C-Class</h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4"/>
                                        <span>Airport Location</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4"/>
                                        <span>Dec 22 - Dec 25, 2024</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="mb-2">Upcoming</Badge>
                                <p className="text-lg font-bold">$180</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your account and rentals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full">
                            <Link to="/cars">Book New Rental</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/dashboard/payments">Manage Payment Methods</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/dashboard/profile">Update Profile</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Membership Status</CardTitle>
                        <CardDescription>Your current membership benefits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge>Premium Member</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Points</span>
                                <span className="text-sm font-bold">1,250</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Next Reward</span>
                                <span className="text-sm text-gray-600">750 points away</span>
                            </div>
                            <Button variant="outline" className="w-full">
                                View Rewards
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
