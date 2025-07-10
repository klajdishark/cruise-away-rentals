import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Car, DollarSign, AlertCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const { 
    dashboardMetrics, 
    monthlyAnalytics, 
    vehicleUtilization, 
    bookingPatterns, 
    categoryPerformance,
    isLoading 
  } = useAnalytics();

  console.log('Analytics data:', {
    dashboardMetrics,
    monthlyAnalytics,
    vehicleUtilization,
    bookingPatterns,
    categoryPerformance,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Loading business insights and performance metrics...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Process booking patterns for charts
  const peakHours = bookingPatterns
    ?.filter(p => p.pattern_type === 'hourly')
    .map(p => ({
      hour: p.pattern_label,
      bookings: p.total_bookings
    })) || [];

  const dailyPatterns = bookingPatterns
    ?.filter(p => p.pattern_type === 'daily')
    .map(p => ({
      day: p.pattern_label,
      bookings: p.total_bookings
    })) || [];

  // Process monthly analytics for charts
  const revenueData = monthlyAnalytics?.slice(0, 6).reverse().map(item => ({
    month: item.month,
    revenue: parseFloat(item.revenue.toString()),
    bookings: item.total_bookings
  })) || [];

  // Process category performance for pie chart
  const customerSegmentation = categoryPerformance?.slice(0, 6).map((cat, index) => ({
    name: cat.category,
    value: parseFloat(cat.total_revenue.toString()),
    color: COLORS[index % COLORS.length]
  })) || [];

  // Show message if no data available
  const hasData = dashboardMetrics || monthlyAnalytics?.length || vehicleUtilization?.length || bookingPatterns?.length || categoryPerformance?.length;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Business insights and performance metrics</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Analytics data will appear here once you have bookings, customers, and vehicles in your system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardMetrics?.revenue.yearly?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${dashboardMetrics?.revenue.monthly?.toLocaleString() || '0'} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics?.fleet.utilization?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics?.fleet.rented || 0} of {dashboardMetrics?.fleet.total || 0} vehicles rented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics?.bookings.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics?.bookings.monthly || 0} bookings this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardMetrics?.performance.avg_booking_value?.toFixed(0) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics?.customers.new || 0} new customers this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Bookings Trend */}
      {revenueData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Monthly bookings and growth patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vehicle Utilization and Customer Segmentation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization by Category</CardTitle>
            <CardDescription>How different vehicle types are performing</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryPerformance && categoryPerformance.length > 0 ? (
              <div className="space-y-4">
                {categoryPerformance.slice(0, 6).map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{item.category}</div>
                      <Badge variant="secondary">{item.vehicle_count} vehicles</Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(Number(item.avg_utilization) || 0, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{Number(item.avg_utilization || 0).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No vehicle data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Vehicle Category</CardTitle>
            <CardDescription>Breakdown of revenue by vehicle type</CardDescription>
          </CardHeader>
          <CardContent>
            {customerSegmentation.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerSegmentation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value?.toLocaleString()}`}
                  >
                    {customerSegmentation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No revenue data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      {peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Peak Booking Hours</CardTitle>
            <CardDescription>Booking distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardMetrics?.performance.cancellation_rate?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fleet Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehicleUtilization?.length ? 
                (vehicleUtilization.reduce((acc, v) => acc + Number(v.utilization_percentage || 0), 0) / vehicleUtilization.length).toFixed(1) 
                : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardMetrics?.customers.new || 0}
            </div>
            <p className="text-xs text-muted-foreground">New customers this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
