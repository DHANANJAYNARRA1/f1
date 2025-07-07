import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">EcoSolutions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Sustainable Solutions for a Better Future
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Discover innovative products across agriculture, health, finance, medical, and education sectors.
            Join our platform to explore cutting-edge solutions and connect with industry leaders.
          </p>
          <div className="mt-10">
            <Link href="/auth">
              <Button size="lg" className="mr-4">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
          <p className="mt-4 text-lg text-gray-600">
            Innovative solutions designed to make a positive impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Hydroponics</CardTitle>
              <CardDescription>
                Advanced soil-less farming technology for sustainable agriculture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg"
                alt="Hydroponics"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-gray-600">
                Revolutionary farming method that uses nutrient-rich water instead of soil.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>ECG Monitoring</CardTitle>
              <CardDescription>
                Advanced cardiac monitoring solutions for healthcare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg"
                alt="ECG Monitoring"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-gray-600">
                State-of-the-art ECG monitoring devices for accurate cardiac assessment.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>HPS Technology</CardTitle>
              <CardDescription>
                High-pressure sodium lighting for optimal plant growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="https://images.pexels.com/photos/4503268/pexels-photo-4503268.jpeg"
                alt="HPS Technology"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-gray-600">
                Efficient lighting solutions for indoor farming and greenhouse applications.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Terrace Garden</CardTitle>
              <CardDescription>
                Urban gardening solutions for sustainable living
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="https://images.pexels.com/photos/4503274/pexels-photo-4503274.jpeg"
                alt="Terrace Garden"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-gray-600">
                Complete terrace gardening systems for urban sustainability.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">EcoSolutions</h3>
            <p className="text-gray-400">
              Building a sustainable future through innovative technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}