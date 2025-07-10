import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  User, 
  Car,
  LogOut,
  Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/reservations', label: 'My Reservations', icon: Calendar },
  { href: '/dashboard/payments', label: 'Payment Methods', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile Settings', icon: User },
];

export const UserSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">RentEasy</span>
        </Link>

        {/* User Info */}
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.email || 'User'
                }
              </p>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Panel Link (only for admins) */}
        {profile?.role === 'admin' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              asChild
            >
              <Link to="/admin">
                <Shield className="w-5 h-5 mr-3" />
                Admin Panel
              </Link>
            </Button>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
