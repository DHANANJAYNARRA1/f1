import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const productSolutions = [
  {
    id: 1,
    name: "Hydroponics",
    description: "Advanced soilless growing systems for sustainable agriculture",
    image: "https://www.thespruce.com/thmb/mVB2PyzVWAKZOFi-5_0miZMVRc8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1482213411-90ec5837220d4cc8bd7888612c6c5e1f.jpg",
    problem: "Traditional soil-based agriculture faces challenges including water wastage, soil degradation, and limited growing space.",
    solution: "Our hydroponic systems use 90% less water than traditional farming, eliminate soil issues, and can be set up in urban environments with limited space. These systems provide faster plant growth and higher yields year-round.",
    benefits: [
      "90% water conservation compared to traditional farming",
      "Year-round crop production regardless of weather",
      "Higher yields in smaller spaces",
      "Pesticide-free and organic produce",
      "Reduced transportation costs for urban areas"
    ]
  },
  {
    id: 2,
    name: "ECG",
    description: "Innovative electrocardiogram monitoring systems",
    image: "https://www.powerfulmedical.com/wp-content/uploads/2020/11/ECG-digitalization-system1.jpg",
    problem: "Conventional ECG monitoring is often limited to clinical settings, expensive to deploy, and lacks real-time data analysis capabilities.",
    solution: "Our portable ECG solutions offer continuous monitoring outside hospitals, AI-powered early warning systems, and remote physician access. The technology helps identify cardiac events before they become life-threatening.",
    benefits: [
      "24/7 continuous cardiac monitoring at home",
      "AI-powered early detection of irregularities",
      "Instant alerts to healthcare providers",
      "Reduced hospital visits and healthcare costs",
      "Peace of mind for patients and families"
    ]
  },
  {
    id: 3,
    name: "HPS Systems",
    description: "High-performance computing solutions for enterprises",
    image: "https://www.bobvila.com/wp-content/uploads/2021/01/best_sprinkler_heads-main.jpg?quality=85&w=675",
    problem: "Businesses struggle with inefficient processing of large datasets, high energy consumption, and expensive hardware maintenance.",
    solution: "Our HPS systems deliver optimized performance using energy-efficient architectures, scalable cloud integration, and predictive maintenance. This dramatically reduces processing time and total cost of ownership.",
    benefits: [
      "60% faster data processing speeds",
      "40% reduction in energy consumption",
      "Scalable cloud-based architecture",
      "Predictive maintenance reduces downtime",
      "Lower total cost of ownership"
    ]
  },
  {
    id: 4,
    name: "Terrace Garden",
    description: "Smart urban gardening solutions for residential spaces",
    image: "https://5.imimg.com/data5/SELLER/Default/2020/11/IG/KK/HR/2786161/terrace-garden.jpg",
    problem: "Urban residents lack access to fresh produce and green spaces, while facing issues with conventional gardening like space constraints and maintenance challenges.",
    solution: "Our terrace garden systems include modular designs for small spaces, automated irrigation, and specialized urban-adapted plant varieties. These systems provide fresh food access and improved air quality in urban environments.",
    benefits: [
      "Fresh, organic produce at your doorstep",
      "Improved air quality and urban cooling",
      "Automated irrigation saves time and water",
      "Modular design fits any terrace size",
      "Reduces grocery bills and carbon footprint"
    ]
  }
];

export default function SolutionsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col with-navbar-padding bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar
        currentPage="solutions"
       
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <div className="inline-block p-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6">
              <div className="bg-white rounded-full px-6 py-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 font-semibold">
                  Innovation Solutions
                </span>
              </div>
            </div>
           <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
  Our Solutions
</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our innovative products solve real-world problems with environmentally conscious and cutting-edge solutions.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {productSolutions.map((product, index) => (
              <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-0">
                  <div className="relative h-64 w-full overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                      <div className="w-full p-6">
                        <CardTitle className="text-white text-2xl font-bold mb-2">{product.name}</CardTitle>
                        <p className="text-white/90 text-sm">{product.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-amber-800">The Problem</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.problem}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-blue-800">Our Solution</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.solution}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-emerald-800">Key Benefits</h3>
                    </div>
                    <div className="grid gap-2">
                      {product.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {user ? (
                      <Button 
                        onClick={() => toggleExpand(product.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {expandedItem === product.id ? "Show Less" : "Learn More"}
                      </Button>
                    ) : (
                      <Link href="/auth">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300">
                          Sign In to Learn More <span className="ml-2">→</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  {expandedItem === product.id && user && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-inner">
                      <h4 className="font-semibold mb-3 text-gray-800">Additional Product Details</h4>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Implementation timeline: 2-4 weeks</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">ROI: 15-30% within first year</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Maintenance: Minimal, quarterly check-ups</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Compatible with existing infrastructure</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">24/7 technical support included</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 transition-colors">
                          Download Specs
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1 hover:bg-green-50 transition-colors">
                          Schedule Demo
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
     
    </div>
  );
}