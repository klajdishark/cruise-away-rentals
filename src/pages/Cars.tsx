
import React, { useState } from 'react';
import { Search, User, Car, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const cars = [
    {
      id: 1,
      name: 'Toyota Camry',
      category: 'sedan',
      price: 45,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80',
      passengers: 5,
      transmission: 'Automatic',
      year: 2023,
      available: true,
    },
    {
      id: 2,
      name: 'Honda CR-V',
      category: 'suv',
      price: 65,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&q=80',
      passengers: 7,
      transmission: 'Automatic',
      year: 2023,
      available: true,
    },
    {
      id: 3,
      name: 'BMW 3 Series',
      category: 'luxury',
      price: 95,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80',
      passengers: 5,
      transmission: 'Automatic',
      year: 2023,
      available: true,
    },
    {
      id: 4,
      name: 'Ford Mustang',
      category: 'sports',
      price: 85,
      image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500&q=80',
      passengers: 4,
      transmission: 'Manual',
      year: 2023,
      available: false,
    },
    {
      id: 5,
      name: 'Tesla Model 3',
      category: 'electric',
      price: 75,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&q=80',
      passengers: 5,
      transmission: 'Automatic',
      year: 2023,
      available: true,
    },
    {
      id: 6,
      name: 'Chevrolet Tahoe',
      category: 'suv',
      price: 85,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&q=80',
      passengers: 8,
      transmission: 'Automatic',
      year: 2023,
      available: true,
    },
  ];

  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'low' && car.price < 50) ||
      (priceRange === 'medium' && car.price >= 50 && car.price < 80) ||
      (priceRange === 'high' && car.price >= 80);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Fleet</h1>
            <p className="text-xl text-gray-600">Choose from our wide selection of premium vehicles</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-full border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="rounded-full border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $50/day</SelectItem>
                  <SelectItem value="medium">$50-$80/day</SelectItem>
                  <SelectItem value="high">$80+/day</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <Card key={car.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      car.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {car.available ? 'Available' : 'Rented'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-900 capitalize">{car.category}</span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{car.name}</h3>
                      <p className="text-gray-600">{car.year}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">${car.price}</span>
                      <p className="text-sm text-gray-600">/day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{car.passengers} seats</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-1" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{car.year}</span>
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    className={`w-full rounded-full ${
                      car.available 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!car.available}
                  >
                    <Link to={car.available ? `/booking/${car.id}` : '#'}>
                      {car.available ? 'Book Now' : 'Not Available'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No cars match your search criteria.</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cars;
