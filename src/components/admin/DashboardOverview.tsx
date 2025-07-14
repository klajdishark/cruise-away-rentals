import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, Car, CreditCard, Users} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const revenueData = [
    {name: 'Mon', revenue: 2400},
    {name: 'Tue', revenue: 1398},
    {name: 'Wed', revenue: 9800},
    {name: 'Thu', revenue: 3908},
    {name: 'Fri', revenue: 4800},
    {name: 'Sat', revenue: 3800},
    {name: 'Sun', revenue: 4300},
];

const bookingTrends = [
    {name: 'Jan', bookings: 65},
    {name: 'Feb', bookings: 59},
    {name: 'Mar', bookings: 80},
    {name: 'Apr', bookings: 81},
    {name: 'May', bookings: 96},
    {name: 'Jun', bookings: 55},
];

const recentActivities = [
    {id: 1, type: 'booking', message: 'New booking for Tesla Model 3', time: '2 minutes ago'},
    {id: 2, type: 'user', message: 'New user registration: John Doe', time: '15 minutes ago'},
    {id: 3, type: 'return', message: 'Vehicle returned: BMW X5', time: '32 minutes ago'},
    {id: 4, type: 'support', message: 'Support ticket resolved #1234', time: '1 hour ago'},
];

const upcomingPickups = [
    {id: 1, customer: 'Alice Johnson', vehicle: 'Honda Civic', time: '10:00 AM', status: 'pending'},
    {id: 2, customer: 'Bob Smith', vehicle: 'Toyota Camry', time: '11:30 AM', status: 'confirmed'},
    {id: 3, customer: 'Carol Davis', vehicle: 'Ford Explorer', time: '2:00 PM', status: 'pending'},
];

export const DashboardOverview = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to your car rental admin dashboard</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+5%</span> from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$54,280</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+8%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">145</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+18%</span> from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                        <CardDescription>Daily revenue for the past week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="revenue" fill="#3b82f6"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking Trends</CardTitle>
                        <CardDescription>Monthly bookings over the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={bookingTrends}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity and Upcoming Pickups */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Pickups</CardTitle>
                        <CardDescription>Today's scheduled vehicle pickups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingPickups.map((pickup) => (
                                <div key={pickup.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{pickup.customer}</p>
                                        <p className="text-xs text-muted-foreground">{pickup.vehicle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{pickup.time}</p>
                                        <Badge variant={pickup.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {pickup.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
