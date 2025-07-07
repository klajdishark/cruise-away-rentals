
-- Create analytics database views and functions for the Reports & Analytics system

-- 1. Create a view for monthly revenue and booking metrics
CREATE OR REPLACE VIEW monthly_analytics AS
WITH monthly_data AS (
  SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
    COUNT(*) FILTER (WHERE status = 'canceled') as canceled_bookings,
    SUM(total_amount) FILTER (WHERE status IN ('completed', 'active')) as revenue,
    AVG(total_amount) FILTER (WHERE status IN ('completed', 'active')) as avg_booking_value,
    COUNT(DISTINCT customer_id) as unique_customers
  FROM bookings 
  WHERE created_at >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
  month,
  total_bookings,
  completed_bookings,
  canceled_bookings,
  COALESCE(revenue, 0) as revenue,
  COALESCE(avg_booking_value, 0) as avg_booking_value,
  unique_customers,
  CASE 
    WHEN total_bookings > 0 THEN (canceled_bookings::float / total_bookings * 100)
    ELSE 0 
  END as cancellation_rate
FROM monthly_data
ORDER BY month DESC;

-- 2. Create a view for vehicle utilization analytics
CREATE OR REPLACE VIEW vehicle_utilization_analytics AS
WITH vehicle_stats AS (
  SELECT 
    v.id,
    v.brand,
    v.model,
    v.year,
    v.status,
    COUNT(b.id) as total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
    SUM(b.duration_days) FILTER (WHERE b.status IN ('completed', 'active')) as total_days_rented,
    SUM(b.total_amount) FILTER (WHERE b.status IN ('completed', 'active')) as total_revenue,
    AVG(b.daily_rate) as avg_daily_rate
  FROM vehicles v
  LEFT JOIN bookings b ON v.id = b.vehicle_id
  WHERE b.created_at >= NOW() - INTERVAL '6 months' OR b.created_at IS NULL
  GROUP BY v.id, v.brand, v.model, v.year, v.status
),
total_days AS (
  SELECT EXTRACT(days FROM NOW() - (NOW() - INTERVAL '6 months')) as period_days
)
SELECT 
  vs.*,
  CASE 
    WHEN td.period_days > 0 THEN (vs.total_days_rented::float / td.period_days * 100)
    ELSE 0 
  END as utilization_percentage
FROM vehicle_stats vs, total_days td
ORDER BY utilization_percentage DESC;

-- 3. Create a view for booking patterns and peak hours
CREATE OR REPLACE VIEW booking_patterns AS
WITH hourly_bookings AS (
  SELECT 
    EXTRACT(hour FROM created_at) as booking_hour,
    EXTRACT(dow FROM start_date) as day_of_week,
    COUNT(*) as booking_count
  FROM bookings 
  WHERE created_at >= NOW() - INTERVAL '3 months'
  GROUP BY EXTRACT(hour FROM created_at), EXTRACT(dow FROM start_date)
),
daily_patterns AS (
  SELECT 
    day_of_week,
    CASE 
      WHEN day_of_week = 0 THEN 'Sunday'
      WHEN day_of_week = 1 THEN 'Monday'
      WHEN day_of_week = 2 THEN 'Tuesday'
      WHEN day_of_week = 3 THEN 'Wednesday'
      WHEN day_of_week = 4 THEN 'Thursday'
      WHEN day_of_week = 5 THEN 'Friday'
      WHEN day_of_week = 6 THEN 'Saturday'
    END as day_name,
    SUM(booking_count) as total_bookings
  FROM hourly_bookings
  GROUP BY day_of_week
),
peak_hours AS (
  SELECT 
    booking_hour,
    CASE 
      WHEN booking_hour < 12 THEN booking_hour || ' AM'
      WHEN booking_hour = 12 THEN '12 PM'
      ELSE (booking_hour - 12) || ' PM'
    END as hour_display,
    SUM(booking_count) as total_bookings
  FROM hourly_bookings
  GROUP BY booking_hour
)
SELECT 
  'daily' as pattern_type,
  day_of_week::text as pattern_key,
  day_name as pattern_label,
  total_bookings
FROM daily_patterns
UNION ALL
SELECT 
  'hourly' as pattern_type,
  booking_hour::text as pattern_key,
  hour_display as pattern_label,
  total_bookings
FROM peak_hours
ORDER BY pattern_type, pattern_key::int;

-- 4. Create a function to get real-time analytics dashboard data
CREATE OR REPLACE FUNCTION get_analytics_dashboard()
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  WITH dashboard_metrics AS (
    SELECT 
      -- Revenue metrics
      (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status IN ('completed', 'active') AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue,
      (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status IN ('completed', 'active') AND created_at >= NOW() - INTERVAL '1 year') as yearly_revenue,
      
      -- Booking metrics
      (SELECT COUNT(*) FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'active') as active_bookings,
      
      -- Fleet metrics
      (SELECT COUNT(*) FROM vehicles WHERE status = 'active') as total_vehicles,
      (SELECT COUNT(*) FROM vehicles WHERE status = 'rented') as rented_vehicles,
      
      -- Customer metrics
      (SELECT COUNT(*) FROM customers WHERE created_at >= NOW() - INTERVAL '30 days') as new_customers,
      (SELECT COUNT(DISTINCT customer_id) FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days') as active_customers,
      
      -- Performance metrics
      (SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE status = 'canceled')::float / COUNT(*) * 100
          ELSE 0 
        END 
       FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days') as cancellation_rate,
      
      (SELECT AVG(total_amount) FROM bookings WHERE status IN ('completed', 'active') AND created_at >= NOW() - INTERVAL '30 days') as avg_booking_value
  )
  SELECT json_build_object(
    'revenue', json_build_object(
      'monthly', monthly_revenue,
      'yearly', yearly_revenue
    ),
    'bookings', json_build_object(
      'monthly', monthly_bookings,
      'active', active_bookings
    ),
    'fleet', json_build_object(
      'total', total_vehicles,
      'rented', rented_vehicles,
      'utilization', CASE WHEN total_vehicles > 0 THEN (rented_vehicles::float / total_vehicles * 100) ELSE 0 END
    ),
    'customers', json_build_object(
      'new', new_customers,
      'active', active_customers
    ),
    'performance', json_build_object(
      'cancellation_rate', cancellation_rate,
      'avg_booking_value', avg_booking_value
    )
  ) INTO result
  FROM dashboard_metrics;
  
  RETURN result;
END;
$$;

-- 5. Create a function to get vehicle category performance
CREATE OR REPLACE FUNCTION get_vehicle_category_performance()
RETURNS TABLE (
  category TEXT,
  vehicle_count BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  avg_utilization NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH vehicle_categories AS (
    SELECT 
      v.id,
      CASE 
        WHEN v.brand ILIKE '%economy%' OR v.model ILIKE '%economy%' OR v.price < 50 THEN 'Economy'
        WHEN v.brand ILIKE '%compact%' OR v.model ILIKE '%compact%' OR (v.price >= 50 AND v.price < 80) THEN 'Compact'
        WHEN v.brand ILIKE '%luxury%' OR v.model ILIKE '%luxury%' OR v.price > 150 THEN 'Luxury'
        WHEN v.brand ILIKE '%suv%' OR v.model ILIKE '%suv%' OR v.seats > 5 THEN 'SUV'
        WHEN v.price >= 100 THEN 'Full-size'
        ELSE 'Mid-size'
      END as category,
      v.price,
      v.status
    FROM vehicles v
  ),
  category_stats AS (
    SELECT 
      vc.category,
      COUNT(DISTINCT vc.id) as vehicle_count,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(b.total_amount) FILTER (WHERE b.status IN ('completed', 'active')), 0) as total_revenue,
      COALESCE(AVG(
        CASE 
          WHEN EXTRACT(days FROM NOW() - (NOW() - INTERVAL '6 months')) > 0 
          THEN (SUM(b.duration_days) FILTER (WHERE b.status IN ('completed', 'active'))::float / EXTRACT(days FROM NOW() - (NOW() - INTERVAL '6 months')) * 100)
          ELSE 0 
        END
      ), 0) as avg_utilization
    FROM vehicle_categories vc
    LEFT JOIN bookings b ON vc.id = b.vehicle_id AND b.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY vc.category
  )
  SELECT 
    cs.category,
    cs.vehicle_count,
    cs.total_bookings,
    cs.total_revenue,
    cs.avg_utilization
  FROM category_stats cs
  ORDER BY cs.total_revenue DESC;
END;
$$;

-- Enable realtime for analytics tables
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE customers REPLICA IDENTITY FULL;
ALTER TABLE vehicles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE customers; 
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
