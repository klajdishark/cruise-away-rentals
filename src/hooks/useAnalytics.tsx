
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

  // Dashboard metrics - using RPC function
  const { data: dashboardMetrics, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data, error } = await supabase.rpc('get_analytics_dashboard');
      
      if (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
      
      return data as DashboardMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Monthly analytics - using database view
  const { data: monthlyAnalytics, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-analytics'],
    queryFn: async (): Promise<MonthlyAnalytics[]> => {
      const { data, error } = await supabase
        .from('monthly_analytics')
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

  // Vehicle utilization - using database view
  const { data: vehicleUtilization, isLoading: utilizationLoading } = useQuery({
    queryKey: ['vehicle-utilization'],
    queryFn: async (): Promise<VehicleUtilization[]> => {
      const { data, error } = await supabase
        .from('vehicle_utilization_analytics')
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

  // Booking patterns - using database view
  const { data: bookingPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['booking-patterns'],
    queryFn: async (): Promise<BookingPattern[]> => {
      const { data, error } = await supabase
        .from('booking_patterns')
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

  // Vehicle category performance - using RPC function
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['vehicle-category-performance'],
    queryFn: async (): Promise<VehicleCategoryPerformance[]> => {
      const { data, error } = await supabase.rpc('get_vehicle_category_performance');
      
      if (error) {
        console.error('Error fetching category performance:', error);
        throw error;
      }
      
      return data || [];
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
          // Invalidate all analytics queries
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
