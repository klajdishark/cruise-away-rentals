import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, User, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Cars' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">RentEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.href) ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to={profile.role === 'admin' ? '/admin' : '/dashboard'}>
                    {profile.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </>
                    )}
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      {profile.first_name || profile.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={profile.role === 'admin' ? '/admin' : '/dashboard'}>
                        {profile.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                  <Link to="/cars">Book Now</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive(link.href) ? 'text-blue-600' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user && profile ? (
                  <>
                    <div className="text-sm text-gray-600 font-medium">
                      {profile.first_name || profile.email}
                    </div>
                    <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                      <Link to={profile.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)}>
                        {profile.role === 'admin' ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Panel
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Dashboard
                          </>
                        )}
                      </Link>
                    </Button>
                    <Button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} variant="ghost" className="w-full justify-start rounded-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      <Link to="/cars" onClick={() => setIsMenuOpen(false)}>
                        Book Now
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
