import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, User, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, redirect based on selected user type
    if (userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">RentEasy Login</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={userType === 'user' ? 'default' : 'outline'}
                  className="flex items-center justify-center space-x-2"
                  onClick={() => setUserType('user')}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </Button>
                <Button
                  type="button"
                  variant={userType === 'admin' ? 'default' : 'outline'}
                  className="flex items-center justify-center space-x-2"
                  onClick={() => setUserType('admin')}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={userType === 'admin' ? 'admin@renteasy.com' : 'customer@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In as {userType === 'admin' ? 'Admin' : 'Customer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
