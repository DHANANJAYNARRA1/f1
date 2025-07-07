import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to EcoSolutions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sustainable products across agriculture, health, finance, medical, and education sectors.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => setLocation('/auth')}
              size="lg"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-login')}
              size="lg"
            >
              Admin Login
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Hydroponics</h3>
            <p className="text-gray-600">Advanced soil-less farming solutions for sustainable agriculture.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">ECG Systems</h3>
            <p className="text-gray-600">Cutting-edge cardiac monitoring technology for healthcare.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">HPS Technology</h3>
            <p className="text-gray-600">High-performance systems for various industrial applications.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Terrace Gardens</h3>
            <p className="text-gray-600">Urban farming solutions for sustainable food production.</p>
          </div>
        </div>
      </div>
    </div>
  );
}