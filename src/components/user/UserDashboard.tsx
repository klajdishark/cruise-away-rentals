import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserSidebar } from './UserSidebar';
import { DashboardOverview } from './DashboardOverview';
import { MyReservations } from './MyReservations';
import { PaymentMethods } from './PaymentMethods';
import { ProfileSettings } from './ProfileSettings';

export const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/reservations" element={<MyReservations />} />
            <Route path="/payments" element={<PaymentMethods />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
