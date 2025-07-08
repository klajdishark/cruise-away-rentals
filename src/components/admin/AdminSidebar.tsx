
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Percent,
  Tag
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/fleet', icon: Car, label: 'Fleet Management' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/promotions', icon: Percent, label: 'Promotions' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/support', icon: HelpCircle, label: 'Support' },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
