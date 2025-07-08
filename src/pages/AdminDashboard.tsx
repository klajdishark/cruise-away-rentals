
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { FleetManagement } from '@/components/admin/FleetManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { BookingManagement } from '@/components/admin/BookingManagement';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { PaymentsInvoicing } from '@/components/admin/PaymentsInvoicing';
import { ReportsAnalytics } from '@/components/admin/ReportsAnalytics';
import { SystemSettings } from '@/components/admin/SystemSettings';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="fleet" element={<FleetManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="payments" element={<PaymentsInvoicing />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<SystemSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
