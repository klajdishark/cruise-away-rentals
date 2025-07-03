
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { FleetManagement } from '@/components/admin/FleetManagement';
import { BookingManagement } from '@/components/admin/BookingManagement';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { PaymentsInvoicing } from '@/components/admin/PaymentsInvoicing';
import { ReportsAnalytics } from '@/components/admin/ReportsAnalytics';
import { PromotionsDiscounts } from '@/components/admin/PromotionsDiscounts';
import { SupportHelpdesk } from '@/components/admin/SupportHelpdesk';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { AdminAccessControl } from '@/components/admin/AdminAccessControl';
import { SidebarProvider } from '@/components/ui/sidebar';

export type AdminView = 
  | 'overview'
  | 'fleet'
  | 'bookings'
  | 'customers'
  | 'payments'
  | 'analytics'
  | 'promotions'
  | 'support'
  | 'settings'
  | 'access-control';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'fleet':
        return <FleetManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'payments':
        return <PaymentsInvoicing />;
      case 'analytics':
        return <ReportsAnalytics />;
      case 'promotions':
        return <PromotionsDiscounts />;
      case 'support':
        return <SupportHelpdesk />;
      case 'settings':
        return <SystemSettings />;
      case 'access-control':
        return <AdminAccessControl />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
