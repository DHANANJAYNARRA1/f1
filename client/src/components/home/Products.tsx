import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link } from "wouter";
import InterestModal from "../modals/InterestModal";
import { 
  ChevronRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Leaf,
  Heart,
  Banknote,
  Sprout,
  Stethoscope,
  GraduationCap,
  Plus,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react";

// Enhanced product categories with detailed information
const productCategories = [
  {
    id: "agritech",
    name: "AgriTech",
    description: "Revolutionary agricultural technology solutions transforming food production",
    icon: Sprout,
    gradient: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    products: [
      {
        id: "hydroponics",
        name: "Hydroponics Revolution",
        shortDesc: "Advanced soilless growing systems for sustainable agriculture",
        fullDescription: "Our cutting-edge hydroponic systems increase crop yields by 300% while using 90% less water than traditional farming. Perfect for urban environments and climate-controlled agriculture.",
        marketSize: "$15.77B by 2025",
        growth: "+22.5% CAGR",
        stage: "Beta Testing",
        funding: "$2.5M Seed Round",
        features: ["90% water reduction", "300% yield increase", "Year-round production", "Zero pesticides"],
        image: "https://images.squarespace-cdn.com/content/v1/5feb6d2cab06677bba637eba/8583eb15-9ee2-43d3-86ad-b2e785c13f92/vertical+farming+.png",
      }
    ]
  },
  {
    id: "healthtech",
    name: "HealthTech",
    description: "Next-generation healthcare technology revolutionizing patient care",
    icon: Heart,
    gradient: "from-red-500 to-pink-600",
    bgColor: "bg-red-50",
    products: [
      {
        id: "ecg",
        name: "ECG Smart Monitor",
        shortDesc: "AI-powered electrocardiogram monitoring systems",
        fullDescription: "Revolutionary ECG monitoring with real-time AI analysis, detecting cardiac anomalies 95% faster than traditional methods. Reduces hospital readmissions by 40%.",
        marketSize: "$8.3B by 2026",
        growth: "+18.2% CAGR",
        stage: "Clinical Trials",
        funding: "$5M Series A",
        features: ["95% faster detection", "40% fewer readmissions", "24/7 monitoring", "AI-powered alerts"],
        image: "https://imgs.search.brave.com/r6VeLlzo9ZCmLK1KO4prNU6MpxmoHNOBrWQT72KI7UQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTAw/Nzk3NzAzMi9waG90/by9oZWFydC1zaG93/cy1hLW1lZGljYWwt/d29ya2VyLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz05TkZK/NEVJdHpBeG5sSVE4/N3V6QW04bXJDMEhK/UzJHRk8wRVBlTFpt/ai1jPQ",
      }
    ]
  },
  {
    id: "fintech",
    name: "FinTech",
    description: "Disruptive financial technology solutions for the digital economy",
    icon: Banknote,
    gradient: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    products: [
      {
        id: "hps",
        name: "HPS Financial Engine",
        shortDesc: "High-performance computing solutions for financial institutions",
        fullDescription: "Ultra-fast transaction processing system handling 1M+ transactions per second with 99.99% uptime. Reduces processing costs by 60% for financial institutions.",
        marketSize: "$26.5B by 2025",
        growth: "+24.8% CAGR",
        stage: "Production Ready",
        funding: "$10M Series B",
        features: ["1M+ TPS capacity", "99.99% uptime", "60% cost reduction", "Real-time analytics"],
        image: "https://www.danslandscapingslo.com/wp-content/uploads/2015/03/San-Luis-Obispo-Landscaping-Company-001.jpg",
      }
    ]
  },
  {
    id: "greentech",
    name: "GreenTech",
    description: "Sustainable environmental technologies for a greener tomorrow",
    icon: Leaf,
    gradient: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50",
    products: [
      {
        id: "terrace-gardening",
        name: "Smart Terrace Gardens",
        shortDesc: "IoT-enabled urban farming solutions for residential spaces",
        fullDescription: "Transform any terrace into a productive garden with our IoT-powered system. Automated irrigation, nutrient management, and crop monitoring increase yields by 250%.",
        marketSize: "$4.2B by 2026",
        growth: "+15.3% CAGR",
        stage: "Market Launch",
        funding: "$1.8M Pre-Seed",
        features: ["250% yield increase", "Automated care", "Mobile app control", "Organic produce"],
        image: "https://images.immediate.co.uk/production/volatile/sites/10/2023/10/2048x1365-Small-Space-Garden-Ideas-SEO-GOTY-Competition-2017-Small-CarolineCassellPDB306170112-6edee23.jpg?quality=90&fit=700,466",
      }
    ]
  },
  {
    id: "medtech",
    name: "MedTech",
    description: "Breakthrough medical technologies saving lives worldwide",
    icon: Stethoscope,
    gradient: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    products: [
      {
        id: "med360",
        name: "Med360 Platform",
        shortDesc: "Comprehensive AI-driven medical monitoring ecosystem",
        fullDescription: "Complete patient monitoring platform with predictive analytics, reducing diagnostic errors by 85% and improving patient outcomes through continuous health tracking.",
        marketSize: "$12.8B by 2025",
        growth: "+19.7% CAGR",
        stage: "FDA Approval",
        funding: "$8M Series A",
        features: ["85% error reduction", "Predictive analytics", "Real-time monitoring", "Multi-device integration"],
        image: "https://media.licdn.com/dms/image/v2/D5612AQEmvw7tNsYSoQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1723525324999?e=2147483647&v=beta&t=gp43_b_SwmzcYpkSjnO41SyBK7UHrA2IqJIB9SqAI6w",
      }
    ]
  },
  {
    id: "edutech",
    name: "EduTech",
    description: "Transformative educational technology for the future of learning",
    icon: GraduationCap,
    gradient: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    products: [
      {
        id: "dschool",
        name: "D School Platform",
        shortDesc: "AI-powered personalized learning ecosystem",
        fullDescription: "Revolutionary learning platform using AI to personalize education for each student. Improves learning outcomes by 180% and reduces dropout rates by 45%.",
        marketSize: "$20.9B by 2025",
        growth: "+16.3% CAGR",
        stage: "Pilot Programs",
        funding: "$3.5M Seed Round",
        features: ["180% better outcomes", "45% dropout reduction", "AI personalization", "Multi-language support"],
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Taipei_Private_Yan_Ping_High_School_Playground.jpg",
      }
    ]
  }
];

export default function Products() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const handleInterest = (productId: string) => {
    console.log(`Product interest clicked: ${productId}`);
    setSelectedProduct(productId);
    setShowModal(true);
  };

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
         
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover groundbreaking technologies that are reshaping industries and creating unprecedented opportunities for investors and founders.
          </p>
        </div>

        {/* Products Grid */}
        <div className="space-y-20">
          {productCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="group">
                {/* Category Header */}
                <div className={`${category.bgColor} rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{category.name}</h3>
                      <p className="text-gray-600 text-lg">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-8">
                  {category.products.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02] transform"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Image Section */}
                        <div className="lg:w-2/5 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-64 lg:h-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-sm font-medium shadow-lg`}>
                            {product.stage}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="lg:w-3/5 p-6 lg:p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{product.name}</h4>
                              <p className="text-gray-600 text-lg mb-4">{product.shortDesc}</p>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Market Size</span>
                              </div>
                              <p className="font-bold text-green-800">{product.marketSize}</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Growth Rate</span>
                              </div>
                              <p className="font-bold text-blue-800">{product.growth}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">Funding</span>
                              </div>
                              <p className="font-bold text-purple-800">{product.funding}</p>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-orange-600" />
                                <span className="text-xs font-medium text-orange-700">Stage</span>
                              </div>
                              <p className="font-bold text-orange-800">{product.stage}</p>
                            </div>
                          </div>

                          {/* Expandable Description */}
                          <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed mb-3">
                              {expandedProducts.has(product.id) ? product.fullDescription : product.shortDesc}
                            </p>
                            <button
                              onClick={() => toggleExpanded(product.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                            >
                              {expandedProducts.has(product.id) ? 'Show Less' : 'Read More'}
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedProducts.has(product.id) ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Key Features */}
                          {expandedProducts.has(product.id) && (
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-800 mb-3">Key Features & Benefits:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {product.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                                    <span className="text-sm text-gray-700">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button                               
  onClick={() => handleInterest(product.id)}                               
  className={`bg-gradient-to-r ${category.gradient} hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-white font-medium py-2 px-3`}                             
>                               
  Express Interest                               
  <ArrowRight className="ml-2 w-4 h-4" />                             
</Button>
                            
                            <Link href="/auth">
                              <Button
                                variant="outline"
                                className="flex-1 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 font-medium py-3 group"
                              >
                                <Plus className="mr-2 w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                Join Platform
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 lg:p-12 text-white shadow-2xl">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Transform the Future?</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our ecosystem of innovators, investors, and founders building tomorrow's breakthrough technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/founder">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 transition-all duration-300 transform hover:scale-105">
                  For Founders
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/investor">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-3 px-8 transition-all duration-300 transform hover:scale-105">
                  For Investors
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedProduct && (
        <InterestModal
          product={{ _id: selectedProduct, anonymousId: selectedProduct }}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}