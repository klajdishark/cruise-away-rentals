
import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Tag, 
  Headphones, 
  Settings, 
  Shield 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { AdminView } from '@/pages/AdminDashboard';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet Management', icon: Car },
  { id: 'bookings', label: 'Booking Management', icon: Calendar },
  { id: 'customers', label: 'Customer Management', icon: Users },
  { id: 'payments', label: 'Payments & Invoicing', icon: CreditCard },
  { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'promotions', label: 'Promotions & Discounts', icon: Tag },
  { id: 'support', label: 'Support & Helpdesk', icon: Headphones },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'access-control', label: 'Admin Access Control', icon: Shield },
] as const;

export const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
  return (
    <Sidebar className="w-64 border-r">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">RentEasy Admin</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onViewChange(item.id as AdminView)}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
