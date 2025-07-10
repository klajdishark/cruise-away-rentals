import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  revenue: {
    monthly: number;
    yearly: number;
  };
  bookings: {
    monthly: number;
    active: number;
  };
  fleet: {
    total: number;
    rented: number;
    utilization: number;
  };
  customers: {
    new: number;
    active: number;
  };
  performance: {
    cancellation_rate: number;
    avg_booking_value: number;
  };
}

interface MonthlyAnalytics {
  month: string;
  total_bookings: number;
  completed_bookings: number;
  canceled_bookings: number;
  revenue: number;
  avg_booking_value: number;
  unique_customers: number;
  cancellation_rate: number;
}

interface VehicleUtilization {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  total_bookings: number;
  completed_bookings: number;
  total_days_rented: number;
  total_revenue: number;
  avg_daily_rate: number;
  utilization_percentage: number;
}

interface BookingPattern {
  pattern_type: 'daily' | 'hourly';
  pattern_key: string;
  pattern_label: string;
  total_bookings: number;
}

interface VehicleCategoryPerformance {
  category: string;
  vehicle_count: number;
  total_bookings: number;
  total_revenue: number;
  avg_utilization: number;
}

export const useAnalytics = () => {
  const queryClient = useQueryClient();

  // Dashboard metrics - Calculate directly from existing tables
  const { data: dashboardMetrics, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        // Get revenue data
        const { data: revenueData } = await supabase
          .from('bookings')
          .select('total_amount, created_at, status')
          .in('status', ['completed', 'active']);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const monthlyRevenue = revenueData?.filter(booking => 
          new Date(booking.created_at) >= thirtyDaysAgo
        ).reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

        const yearlyRevenue = revenueData?.filter(booking => 
          new Date(booking.created_at) >= oneYearAgo
        ).reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

        // Get booking counts
        const { data: bookingCounts } = await supabase
          .from('bookings')
          .select('id, created_at, status');

        const monthlyBookings = bookingCounts?.filter(booking => 
          new Date(booking.created_at) >= thirtyDaysAgo
        ).length || 0;

        const activeBookings = bookingCounts?.filter(booking => 
          booking.status === 'active'
        ).length || 0;

        // Get fleet data
        const { data: fleetData } = await supabase
          .from('vehicles')
          .select('id, status');

        const totalVehicles = fleetData?.filter(v => v.status === 'active').length || 0;
        const rentedVehicles = fleetData?.filter(v => v.status === 'rented').length || 0;

        // Get customer data
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, created_at');

        const newCustomers = customerData?.filter(customer => 
          new Date(customer.created_at) >= thirtyDaysAgo
        ).length || 0;

        // Calculate performance metrics
        const recentBookings = bookingCounts?.filter(booking => 
          new Date(booking.created_at) >= thirtyDaysAgo
        ) || [];

        const canceledBookings = recentBookings.filter(booking => 
          booking.status === 'canceled'
        ).length;

        const cancellationRate = recentBookings.length > 0 ? 
          (canceledBookings / recentBookings.length) * 100 : 0;

        const avgBookingValue = recentBookings.length > 0 ? 
          monthlyRevenue / recentBookings.length : 0;

        return {
          revenue: {
            monthly: monthlyRevenue,
            yearly: yearlyRevenue
          },
          bookings: {
            monthly: monthlyBookings,
            active: activeBookings
          },
          fleet: {
            total: totalVehicles,
            rented: rentedVehicles,
            utilization: totalVehicles > 0 ? (rentedVehicles / totalVehicles) * 100 : 0
          },
          customers: {
            new: newCustomers,
            active: customerData?.length || 0
          },
          performance: {
            cancellation_rate: cancellationRate,
            avg_booking_value: avgBookingValue
          }
        };
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
  });

  // Monthly analytics - Calculate from existing tables
  const { data: monthlyAnalytics, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-analytics'],
    queryFn: async (): Promise<MonthlyAnalytics[]> => {
      try {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_amount, created_at, status, customer_id')
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (!bookings) return [];

        // Group by month
        const monthlyData: { [key: string]: MonthlyAnalytics } = {};

        bookings.forEach(booking => {
          const date = new Date(booking.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthLabel,
              total_bookings: 0,
              completed_bookings: 0,
              canceled_bookings: 0,
              revenue: 0,
              avg_booking_value: 0,
              unique_customers: 0,
              cancellation_rate: 0
            };
          }

          monthlyData[monthKey].total_bookings++;
          
          if (booking.status === 'completed') {
            monthlyData[monthKey].completed_bookings++;
          }
          
          if (booking.status === 'canceled') {
            monthlyData[monthKey].canceled_bookings++;
          }
          
          if (booking.status === 'completed' || booking.status === 'active') {
            monthlyData[monthKey].revenue += Number(booking.total_amount);
          }
        });

        // Calculate averages and rates
        Object.values(monthlyData).forEach(data => {
          data.avg_booking_value = data.total_bookings > 0 ? data.revenue / data.total_bookings : 0;
          data.cancellation_rate = data.total_bookings > 0 ? (data.canceled_bookings / data.total_bookings) * 100 : 0;
        });

        return Object.values(monthlyData)
          .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
          .slice(0, 12);
      } catch (error) {
        console.error('Error fetching monthly analytics:', error);
        throw error;
      }
    },
    refetchInterval: 60000,
  });

  // Vehicle utilization - Calculate from existing tables
  const { data: vehicleUtilization, isLoading: utilizationLoading } = useQuery({
    queryKey: ['vehicle-utilization'],
    queryFn: async (): Promise<VehicleUtilization[]> => {
      try {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, brand, model, year, status, price');

        if (!vehicles) return [];

        const { data: bookings } = await supabase
          .from('bookings')
          .select('vehicle_id, total_amount, duration_days, status, daily_rate')
          .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

        const utilizationData: VehicleUtilization[] = vehicles.map(vehicle => {
          const vehicleBookings = bookings?.filter(b => b.vehicle_id === vehicle.id) || [];
          const completedBookings = vehicleBookings.filter(b => b.status === 'completed');
          const totalDaysRented = completedBookings.reduce((sum, b) => sum + (b.duration_days || 0), 0);
          const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
          const avgDailyRate = completedBookings.length > 0 ? 
            completedBookings.reduce((sum, b) => sum + Number(b.daily_rate || 0), 0) / completedBookings.length : 0;

          return {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            status: vehicle.status,
            total_bookings: vehicleBookings.length,
            completed_bookings: completedBookings.length,
            total_days_rented: totalDaysRented,
            total_revenue: totalRevenue,
            avg_daily_rate: avgDailyRate,
            utilization_percentage: totalDaysRented > 0 ? (totalDaysRented / 180) * 100 : 0
          };
        });

        return utilizationData.sort((a, b) => b.utilization_percentage - a.utilization_percentage);
      } catch (error) {
        console.error('Error fetching vehicle utilization:', error);
        throw error;
      }
    },
    refetchInterval: 60000,
  });

  // Booking patterns - Calculate from existing tables
  const { data: bookingPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['booking-patterns'],
    queryFn: async (): Promise<BookingPattern[]> => {
      try {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('created_at, start_date')
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        if (!bookings) return [];

        const patterns: BookingPattern[] = [];

        // Daily patterns
        const dailyPatterns: { [key: string]: number } = {};
        const hourlyPatterns: { [key: string]: number } = {};

        bookings.forEach(booking => {
          const createdDate = new Date(booking.created_at);
          const startDate = new Date(booking.start_date);
          
          // Day of week pattern
          const dayOfWeek = startDate.getDay();
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = dayNames[dayOfWeek];
          dailyPatterns[dayName] = (dailyPatterns[dayName] || 0) + 1;

          // Hour pattern
          const hour = createdDate.getHours();
          const hourDisplay = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
          hourlyPatterns[hourDisplay] = (hourlyPatterns[hourDisplay] || 0) + 1;
        });

        // Convert to array format
        Object.entries(dailyPatterns).forEach(([day, count]) => {
          patterns.push({
            pattern_type: 'daily',
            pattern_key: day,
            pattern_label: day,
            total_bookings: count
          });
        });

        Object.entries(hourlyPatterns).forEach(([hour, count]) => {
          patterns.push({
            pattern_type: 'hourly',
            pattern_key: hour,
            pattern_label: hour,
            total_bookings: count
          });
        });

        return patterns;
      } catch (error) {
        console.error('Error fetching booking patterns:', error);
        throw error;
      }
    },
    refetchInterval: 300000,
  });

  // Category performance - Calculate from existing tables
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['vehicle-category-performance'],
    queryFn: async (): Promise<VehicleCategoryPerformance[]> => {
      try {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, brand, model, price, seats');

        if (!vehicles) return [];

        const { data: bookings } = await supabase
          .from('bookings')
          .select('vehicle_id, total_amount, duration_days, status')
          .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

        // Categorize vehicles
        const categories: { [key: string]: VehicleCategoryPerformance } = {};

        vehicles.forEach(vehicle => {
          let category = 'Mid-size';
          if (vehicle.brand.toLowerCase().includes('economy') || vehicle.price < 50) {
            category = 'Economy';
          } else if (vehicle.brand.toLowerCase().includes('luxury') || vehicle.price > 150) {
            category = 'Luxury';
          } else if (vehicle.brand.toLowerCase().includes('suv') || vehicle.seats > 5) {
            category = 'SUV';
          } else if (vehicle.price >= 100) {
            category = 'Full-size';
          } else if (vehicle.price >= 50 && vehicle.price < 80) {
            category = 'Compact';
          }

          if (!categories[category]) {
            categories[category] = {
              category,
              vehicle_count: 0,
              total_bookings: 0,
              total_revenue: 0,
              avg_utilization: 0
            };
          }

          categories[category].vehicle_count++;

          const vehicleBookings = bookings?.filter(b => b.vehicle_id === vehicle.id) || [];
          categories[category].total_bookings += vehicleBookings.length;
          
          const revenue = vehicleBookings
            .filter(b => b.status === 'completed' || b.status === 'active')
            .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
          
          categories[category].total_revenue += revenue;
        });

        return Object.values(categories).sort((a, b) => b.total_revenue - a.total_revenue);
      } catch (error) {
        console.error('Error fetching category performance:', error);
        throw error;
      }
    },
    refetchInterval: 300000,
  });

  // Set up real-time subscriptions for data changes
  useEffect(() => {
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          console.log('Bookings changed, refreshing analytics...');
          queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['monthly-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['vehicle-utilization'] });
          queryClient.invalidateQueries({ queryKey: ['booking-patterns'] });
          queryClient.invalidateQueries({ queryKey: ['vehicle-category-performance'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          console.log('Customers changed, refreshing analytics...');
          queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['monthly-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          console.log('Vehicles changed, refreshing analytics...');
          queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['vehicle-utilization'] });
          queryClient.invalidateQueries({ queryKey: ['vehicle-category-performance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    dashboardMetrics,
    monthlyAnalytics,
    vehicleUtilization,
    bookingPatterns,
    categoryPerformance,
    isLoading: dashboardLoading || monthlyLoading || utilizationLoading || patternsLoading || categoryLoading,
  };
};
