import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Car, Calendar } from 'lucide-react';

const FeaturedCars = () => {
  const cars = [
    {
      id: 1,
      name: 'Toyota Camry',
      category: 'Sedan',
      price: 45,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80',
      passengers: 5,
      transmission: 'Automatic',
      year: 2023,
    },
    {
      id: 2,
      name: 'Honda CR-V',
      category: 'SUV',
      price: 65,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&q=80',
      passengers: 7,
      transmission: 'Automatic',
      year: 2023,
    },
    {
      id: 3,
      name: 'BMW 3 Series',
      category: 'Luxury',
      price: 95,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80',
      passengers: 5,
      transmission: 'Automatic',
      year: 2023,
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Vehicles</h2>
          <p className="text-xl text-gray-600">Discover our most popular rental cars</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <Card key={car.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
              <div className="relative overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-gray-900">{car.category}</span>
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
                
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                  <Link to={`/booking/${car.id}`}>
                    Book Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="px-8 py-4 rounded-full text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
            <Link to="/cars">View All Cars</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
