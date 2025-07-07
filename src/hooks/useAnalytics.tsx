
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  // Dashboard metrics - using direct SQL query since the function isn't in types yet
  const { data: dashboardMetrics, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data, error } = await supabase
        .rpc('get_analytics_dashboard' as any);
      
      if (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
      
      return data as DashboardMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Monthly analytics - using direct SQL query to access the view
  const { data: monthlyAnalytics, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-analytics'],
    queryFn: async (): Promise<MonthlyAnalytics[]> => {
      const { data, error } = await supabase
        .from('monthly_analytics' as any)
        .select('*')
        .order('month', { ascending: false })
        .limit(12);
      
      if (error) {
        console.error('Error fetching monthly analytics:', error);
        throw error;
      }
      
      return data?.map((item: any) => ({
        ...item,
        month: new Date(item.month).toLocaleDateString('en-US', { 
          month: 'short',
          year: 'numeric'
        })
      })) || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Vehicle utilization - using direct SQL query to access the view
  const { data: vehicleUtilization, isLoading: utilizationLoading } = useQuery({
    queryKey: ['vehicle-utilization'],
    queryFn: async (): Promise<any> => {
      const { data, error } = await supabase
        .from('vehicle_utilization_analytics' as any)
        .select('*')
        .order('utilization_percentage', { ascending: false });
      
      if (error) {
        console.error('Error fetching vehicle utilization:', error);
        throw error;
      }
      
      return data || [];
    },
    refetchInterval: 60000,
  });

  // Booking patterns - using direct SQL query to access the view
  const { data: bookingPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['booking-patterns'],
    queryFn: async (): Promise<any> => {
      const { data, error } = await supabase
        .from('booking_patterns' as any)
        .select('*')
        .order('pattern_type, pattern_key');
      
      if (error) {
        console.error('Error fetching booking patterns:', error);
        throw error;
      }
      
      return data || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Vehicle category performance - using direct SQL query
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['vehicle-category-performance'],
    queryFn: async (): Promise<VehicleCategoryPerformance[]> => {
      const { data, error } = await supabase
        .rpc('get_vehicle_category_performance' as any);
      
      if (error) {
        console.error('Error fetching category performance:', error);
        throw error;
      }
      
      return data || [];
    },
    refetchInterval: 300000,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          // Invalidate analytics queries when bookings change
          console.log('Bookings changed, refreshing analytics...');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          console.log('Customers changed, refreshing analytics...');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          console.log('Vehicles changed, refreshing analytics...');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    dashboardMetrics,
    monthlyAnalytics,
    vehicleUtilization,
    bookingPatterns,
    categoryPerformance,
    isLoading: dashboardLoading || monthlyLoading || utilizationLoading || patternsLoading || categoryLoading,
  };
};
