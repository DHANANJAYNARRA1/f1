import { useState, useEffect } from "react";
import { ArrowRight, DollarSign, Gem, Shield, TrendingUp, Handshake, Briefcase, Lock, Star, Users, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";

export default function InvestorPage() {
  const [clickedCards, setClickedCards] = useState(new Set());
  const [clickedProducts, setClickedProducts] = useState(new Set());
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Sample featured products to showcase (static, not interactive before sign-in)
  const featuredProducts = [
    { id: 1, name: "Cutting-edge AI Solution", image: "https://placehold.co/300x200/22C55E/FFFFFF?text=AgriTech", category: "Technology" },
    { id: 2, name: "Sustainable Energy Grid", image: "https://placehold.co/300x200/3B82F6/FFFFFF?text=GreenTech", category: "Green Energy" },
    { id: 3, name: "Revolutionary HealthTech", image: "https://placehold.co/300x200/8B5CF6/FFFFFF?text=HealthTech", category: "Healthcare" },
    { id: 4, name: "Global E-commerce", image: "https://placehold.co/300x200/F97316/FFFFFF?text=EduTech", category: "E-commerce" },
  ];

  // Multiple investor testimonials for carousel
  const investorTestimonials = [
    {
      quote: "Thanks to this platform, I invested $20K and saw a 3x return in just 14 months! The vetted deals are truly exceptional.",
      author: "Alexandra P.",
      title: "Venture Capitalist",
      roi: "300% ROI"
    },
    {
      quote: "The anonymous feature allowed me to evaluate opportunities without bias. Found my best investment yet - a 5x return in 18 months!",
      author: "Michael Chen",
      title: "Angel Investor",
      roi: "500% ROI"
    },
    {
      quote: "Incredible platform! The due diligence is thorough and the early access to innovations has transformed my portfolio performance.",
      author: "Sarah Martinez",
      title: "Investment Advisor",
      roi: "420% ROI"
    },
    {
      quote: "I've been investing for 20 years, and this platform consistently delivers the highest quality opportunities I've seen.",
      author: "David Thompson",
      title: "Private Equity Partner",
      roi: "380% ROI"
    }
  ];

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % investorTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [investorTestimonials.length]);

  const handleCardClick = (cardId: string) => {
    setClickedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleProductClick = (productId: number) => {
    setClickedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % investorTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + investorTestimonials.length) % investorTestimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section: Immediate Value & Call to Action */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
        {/* Background gradient overlay for subtle effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5 z-0"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Discover & Invest in Tomorrow's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Breakthrough Products</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Access vetted innovations before they hit the mainstream. Your gateway to high-potential, curated opportunities.
            </p>

            {/* Key Metrics Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  clickedCards.has('metric-1')
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-2xl'
                    : 'bg-white/70 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 text-gray-900'
                } backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center`}
                onClick={() => handleCardClick('metric-1')}
              >
                <DollarSign className={`h-10 w-10 mb-3 ${clickedCards.has('metric-1') ? 'text-white' : 'text-green-600'}`} />
                <div className="text-3xl font-bold mb-1">~45%</div>
                <p className={`text-sm ${clickedCards.has('metric-1') ? 'text-green-100' : 'text-gray-600'}`}>Average Annual Returns</p>
              </div>
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  clickedCards.has('metric-2')
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl'
                    : 'bg-white/70 hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200 text-gray-900'
                } backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center`}
                onClick={() => handleCardClick('metric-2')}
              >
                <Gem className={`h-10 w-10 mb-3 ${clickedCards.has('metric-2') ? 'text-white' : 'text-blue-600'}`} />
                <div className="text-3xl font-bold mb-1">1,200+</div>
                <p className={`text-sm ${clickedCards.has('metric-2') ? 'text-blue-100' : 'text-gray-600'}`}>Verified Products</p>
              </div>
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  clickedCards.has('metric-3')
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl'
                    : 'bg-white/70 hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200 text-gray-900'
                } backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center`}
                onClick={() => handleCardClick('metric-3')}
              >
                <CheckCircle className={`h-10 w-10 mb-3 ${clickedCards.has('metric-3') ? 'text-white' : 'text-purple-600'}`} />
                <div className="text-3xl font-bold mb-1">95%</div>
                <p className={`text-sm ${clickedCards.has('metric-3') ? 'text-purple-100' : 'text-gray-600'}`}>Founder Success Rate</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-5 text-xl font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  Start Investing Today <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-10 py-5 text-xl font-semibold rounded-full transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest With Us: Core Value Proposition */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
            Your Edge in Innovation Investing
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Early Access */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('value-1')
                  ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-2xl border-green-700'
                  : 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-200 hover:to-green-300 border-green-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('value-1')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('value-1') ? 'bg-white' : 'bg-green-600'
              }`}>
                <TrendingUp className={`h-8 w-8 ${clickedCards.has('value-1') ? 'text-green-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Early Access</h3>
              <p className={`leading-relaxed ${clickedCards.has('value-1') ? 'text-green-100' : 'text-gray-700'}`}>
                Gain exclusive access to pre-vetted, high-potential products before they go mainstream.
              </p>
            </div>
            
            {/* Anonymity & Control */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('value-2')
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl border-blue-700'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-200 hover:to-blue-300 border-blue-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('value-2')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('value-2') ? 'bg-white' : 'bg-blue-600'
              }`}>
                <Lock className={`h-8 w-8 ${clickedCards.has('value-2') ? 'text-blue-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Anonymous Engagement</h3>
              <p className={`leading-relaxed ${clickedCards.has('value-2') ? 'text-blue-100' : 'text-gray-700'}`}>
                Engage with founders discreetly until you're ready to reveal identities.
              </p>
            </div>
            
            {/* Diversified Portfolio */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('value-3')
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl border-purple-700'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-200 hover:to-purple-300 border-purple-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('value-3')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('value-3') ? 'bg-white' : 'bg-purple-600'
              }`}>
                <Briefcase className={`h-8 w-8 ${clickedCards.has('value-3') ? 'text-purple-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Diverse Opportunities</h3>
              <p className={`leading-relaxed ${clickedCards.has('value-3') ? 'text-purple-100' : 'text-gray-700'}`}>
                Invest across multiple high-growth industries with flexible minimums.
              </p>
            </div>
            
            {/* High Potential Returns */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('value-4')
                  ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white shadow-2xl border-yellow-700'
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-200 hover:to-yellow-300 border-yellow-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('value-4')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('value-4') ? 'bg-white' : 'bg-yellow-600'
              }`}>
                <DollarSign className={`h-8 w-8 ${clickedCards.has('value-4') ? 'text-yellow-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Exceptional ROI</h3>
              <p className={`leading-relaxed ${clickedCards.has('value-4') ? 'text-yellow-100' : 'text-gray-700'}`}>
                Unlock the potential for significant returns on groundbreaking innovations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase (Visual, Non-Interactive) */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            A Glimpse of Tomorrow's Successes
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Discover a sample of the innovative products awaiting your investment. Full access upon sign-in.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`cursor-pointer rounded-xl shadow-lg overflow-hidden border transition-all duration-300 transform hover:scale-105 ${
                  clickedProducts.has(product.id)
                    ? 'bg-gradient-to-br from-green-600 to-blue-600 border-green-500 shadow-2xl'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                }`}
                onClick={() => handleProductClick(product.id)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/300x200/000000/FFFFFF?text=${product.category.replace(/\s/g, '+')}`;
                  }}
                />
                <div className="p-6 text-left">
                  <h3 className="text-2xl font-semibold mb-2 text-white">{product.name}</h3>
                  <p className={`text-sm mb-4 ${clickedProducts.has(product.id) ? 'text-green-100' : 'text-gray-400'}`}>
                    {product.category}
                  </p>
                  <Link href="/auth">
                    <Button
                      variant="outline"
                      className={`w-full transition-all duration-300 ${
                        clickedProducts.has(product.id)
                          ? 'border-white text-white hover:bg-white hover:text-green-600'
                          : 'border-green-500 text-green-400 hover:bg-green-900 hover:text-green-300'
                      }`}
                    >
                      View Details (Login Required)
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Link href="/auth">
            <Button
              className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-5 text-xl font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Unlock All Opportunities <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust & Security: Building Confidence */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
            Invest with Confidence. Your Security is Our Priority.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Rigorous Due Diligence */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('trust-1')
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl border-red-700'
                  : 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-200 hover:to-red-300 border-red-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('trust-1')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('trust-1') ? 'bg-white' : 'bg-red-600'
              }`}>
                <Shield className={`h-8 w-8 ${clickedCards.has('trust-1') ? 'text-red-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rigorous Due Diligence</h3>
              <p className={`leading-relaxed ${clickedCards.has('trust-1') ? 'text-red-100' : 'text-gray-700'}`}>
                Every product and founder is thoroughly vetted by our expert team.
              </p>
            </div>
            
            {/* Secure Transactions */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('trust-2')
                  ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-2xl border-cyan-700'
                  : 'bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-200 hover:to-cyan-300 border-cyan-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('trust-2')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('trust-2') ? 'bg-white' : 'bg-cyan-600'
              }`}>
                <Handshake className={`h-8 w-8 ${clickedCards.has('trust-2') ? 'text-cyan-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure Transactions</h3>
              <p className={`leading-relaxed ${clickedCards.has('trust-2') ? 'text-cyan-100' : 'text-gray-700'}`}>
                Your investments are protected by industry-leading escrow services.
              </p>
            </div>
            
            {/* Privacy Protected */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('trust-3')
                  ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white shadow-2xl border-yellow-700'
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-200 hover:to-yellow-300 border-yellow-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('trust-3')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('trust-3') ? 'bg-white' : 'bg-yellow-600'
              }`}>
                <Lock className={`h-8 w-8 ${clickedCards.has('trust-3') ? 'text-yellow-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Privacy Protected</h3>
              <p className={`leading-relaxed ${clickedCards.has('trust-3') ? 'text-yellow-100' : 'text-gray-700'}`}>
                Maintain anonymity until you mutually agree to reveal your identity.
              </p>
            </div>
            
            {/* Regulatory Adherence */}
            <div 
              className={`cursor-pointer text-center p-6 rounded-xl shadow-md border transition-all duration-300 transform hover:scale-105 ${
                clickedCards.has('trust-4')
                  ? 'bg-gradient-to-br from-lime-600 to-lime-700 text-white shadow-2xl border-lime-700'
                  : 'bg-gradient-to-br from-lime-50 to-lime-100 hover:from-lime-200 hover:to-lime-300 border-lime-200 text-gray-900'
              }`}
              onClick={() => handleCardClick('trust-4')}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                clickedCards.has('trust-4') ? 'bg-white' : 'bg-lime-600'
              }`}>
                <Users className={`h-8 w-8 ${clickedCards.has('trust-4') ? 'text-lime-600' : 'text-white'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Regulatory Adherence</h3>
              <p className={`leading-relaxed ${clickedCards.has('trust-4') ? 'text-lime-100' : 'text-gray-700'}`}>
                Operating with strict legal compliance and transparent practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof: Testimonial Carousel */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            What Our Investors Say
          </h2>
          
          {/* Carousel Container */}
          <div className="relative">
            <div className="bg-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-700 min-h-[300px] flex flex-col justify-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-7 w-7 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Testimonial Content */}
              <div className="transition-all duration-500 ease-in-out">
                <blockquote className="text-2xl md:text-3xl italic leading-relaxed mb-6">
                  "{investorTestimonials[currentTestimonial].quote}"
                </blockquote>
                <p className="text-xl font-semibold text-green-400 mb-2">
                  - {investorTestimonials[currentTestimonial].author}, {investorTestimonials[currentTestimonial].title}
                </p>
                <p className="text-lg text-gray-400">
                  Achieved: <span className="font-bold text-yellow-400">{investorTestimonials[currentTestimonial].roi}</span>
                </p>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-all duration-300 shadow-lg"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-all duration-300 shadow-lg"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Dot Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {investorTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-green-400 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <p className="text-gray-400 mt-10 text-lg">
            Join over 2,500 successful investors who've already discovered their next unicorn on our platform!
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-100 via-white to-green-100">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Invest in the Future?
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Start your journey with minimal commitment and unlock a world of innovation.
          </p>
          <Link href="/auth">
            <Button
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-6 text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Get Started Now <ArrowRight className="ml-4 h-7 w-7" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}