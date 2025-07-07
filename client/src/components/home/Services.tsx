{/* import { 
  Lightbulb, 
  User, 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Users,
  Rocket,
  Brain,
  DollarSign,
  BarChart3,
  Search,
  MessageSquare,
  Settings,
  CheckCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define types for our data
interface Service {
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface UserType {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  services: Service[];
  gradient: string;
  bgColor: string;
  stats: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  benefits: string[];
}

interface Question {
  question: string;
  answer: string;
  category: string;
}

// Define the different user types with enhanced services
const userTypes: UserType[] = [
  {
    icon: <Lightbulb className="w-8 h-8 text-white" />,
    title: "For Founders",
    subtitle: "Transform Ideas into Reality",
    description: "Comprehensive suite of tools and services designed to accelerate your startup journey from concept to market success.",
    gradient: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    services: [
      {
        name: "Product Showcase Platform",
        icon: <Rocket className="w-5 h-5" />,
        description: "Present your innovations to global investors"
      },
      {
        name: "Investor Matching",
        icon: <Users className="w-5 h-5" />,
        description: "AI-powered connections with relevant investors"
      },
      {
        name: "Market Analytics",
        icon: <BarChart3 className="w-5 h-5" />,
        description: "Real-time market insights and trend analysis"
      },
      {
        name: "Brand Development",
        icon: <Sparkles className="w-5 h-5" />,
        description: "Professional branding and marketing support"
      }
    ],
    stats: [
      { label: "Success Rate", value: "87%", icon: <TrendingUp className="w-4 h-4" /> },
      { label: "Avg. Funding", value: "$2.5M", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Time to Market", value: "6 months", icon: <Zap className="w-4 h-4" /> }
    ],
    benefits: [
      "Access to exclusive investor networks",
      "Professional pitch deck development",
      "Legal and compliance guidance",
      "Technical infrastructure support"
    ]
  },
  {
    icon: <User className="w-8 h-8 text-white" />,
    title: "For Investors",
    subtitle: "Discover Tomorrow's Unicorns",
    description: "Advanced investment platform with AI-driven insights to identify and evaluate high-potential startups and innovative technologies.",
    gradient: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    services: [
      {
        name: "Deal Flow Dashboard",
        icon: <Search className="w-5 h-5" />,
        description: "Curated opportunities matching your criteria"
      },
      {
        name: "Due Diligence Suite",
        icon: <Shield className="w-5 h-5" />,
        description: "Comprehensive risk assessment tools"
      },
      {
        name: "Founder Communications",
        icon: <MessageSquare className="w-5 h-5" />,
        description: "Direct channels with startup founders"
      },
      {
        name: "Portfolio Tracking",
        icon: <Target className="w-5 h-5" />,
        description: "Real-time investment performance monitoring"
      }
    ],
    stats: [
      { label: "ROI Average", value: "340%", icon: <TrendingUp className="w-4 h-4" /> },
      { label: "Deal Volume", value: "$50M+", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Success Rate", value: "92%", icon: <Target className="w-4 h-4" /> }
    ],
    benefits: [
      "AI-powered investment recommendations",
      "Exclusive access to pre-seed rounds",
      "Comprehensive founder background checks",
      "Market trend analysis and predictions"
    ]
  },
  {
    icon: <Building2 className="w-8 h-8 text-white" />,
    title: "For Organizations",
    subtitle: "Enterprise Innovation Solutions",
    description: "Scalable enterprise solutions to integrate cutting-edge technologies and drive digital transformation across your organization.",
    gradient: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50",
    services: [
      {
        name: "Enterprise Integration",
        icon: <Settings className="w-5 h-5" />,
        description: "Seamless technology implementation"
      },
      {
        name: "Risk Assessment",
        icon: <Shield className="w-5 h-5" />,
        description: "Comprehensive security and compliance analysis"
      },
      {
        name: "Product Evaluation",
        icon: <Brain className="w-5 h-5" />,
        description: "AI-driven technology assessment"
      },
      {
        name: "Custom Solutions",
        icon: <Settings className="w-5 h-5" />,
        description: "Tailored integration and development"
      }
    ],
    stats: [
      { label: "Efficiency Gain", value: "75%", icon: <TrendingUp className="w-4 h-4" /> },
      { label: "Cost Reduction", value: "45%", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Implementation", value: "30 days", icon: <Zap className="w-4 h-4" /> }
    ],
    benefits: [
      "White-glove implementation support",
      "24/7 technical assistance",
      "Custom API development",
      "Training and onboarding programs"
    ]
  }
];

// Enhanced questions with categories
const questionsByCategory: Record<string, Question[]> = {
  "Getting Started": [
    {
      question: "How do I get started on the platform?",
      answer: "Simply register for an account, complete your profile, and our AI will recommend the best services for your needs. You'll get a personalized onboarding experience.",
      category: "Getting Started"
    },
    {
      question: "What information do I need to provide?",
      answer: "Basic business information, your goals, and preferences. The more details you provide, the better we can match you with relevant opportunities.",
      category: "Getting Started"
    }
  ],
  "Pricing & Plans": [
    {
      question: "Is there a cost to join?",
      answer: "Basic accounts are free with limited access. Premium plans start at $99/month with full access to all features, analytics, and priority support.",
      category: "Pricing & Plans"
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Upgrades are immediate, and downgrades take effect at the next billing cycle.",
      category: "Pricing & Plans"
    }
  ],
  "Features & Support": [
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 chat support, dedicated account managers for premium users, comprehensive documentation, and regular webinars.",
      category: "Features & Support"
    },
    {
      question: "Can I change my user type later?",
      answer: "Absolutely! You can update your profile and switch between founder, investor, or organization modes as your needs evolve.",
      category: "Features & Support"
    }
  ]
};

export default function Services() {
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Getting Started");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleQuestionsClick = (type: UserType) => {
    setSelectedType(type);
    setShowQuestionsDialog(true);
    setSelectedCategory("Getting Started");
    setOpenQuestionIndex(null);
  };

  const allQuestions = Object.values(questionsByCategory).flat();
  const categories = Object.keys(questionsByCategory);

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section 
        <div className="text-center mb-11">
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Specialized Services
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive solutions designed for founders, investors, and organizations to accelerate innovation and drive unprecedented growth.
          </p>
        </div>
        
        {/* Services Grid 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {userTypes.map((type, index) => (
            <div 
              key={index} 
              className={`group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 ${
                hoveredCard === index ? 'z-10' : ''
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Gradient Overlay 
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Header Section 
              <div className={`relative ${type.bgColor} p-6 border-b border-gray-100`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${type.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {type.icon}
                </div>
                <h3 className="font-bold text-2xl mb-2 text-gray-800">{type.title}</h3>
                <p className="text-lg font-medium text-gray-600 mb-3">{type.subtitle}</p>
                <p className="text-gray-600 leading-relaxed">{type.description}</p>
              </div>

              {/* Stats Section
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Key Metrics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {type.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.gradient} flex items-center justify-center mx-auto mb-2`}>
                        <div className="text-white">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="font-bold text-lg text-gray-800">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Section 
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Core Services
                </h4>
                <div className="space-y-3">
                  {type.services.map((service, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.gradient} flex items-center justify-center flex-shrink-0`}>
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Section 
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Key Benefits
                </h4>
                <div className="space-y-2">
                  {type.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 text-green-500 flex-shrink-0`} />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons 
              <div className="p-6">
                <Button 
                  onClick={() => handleQuestionsClick(type)}
                  className={`w-full bg-gradient-to-r ${type.gradient} hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-white font-medium py-3 group`}
                >
                  <HelpCircle className="mr-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Learn More & Ask Questions
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action 
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 lg:p-12 text-white shadow-2xl">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Choose your path and join thousands of successful founders, investors, and organizations.
            </p>
           <Button 
  className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 transition-all duration-300 transform hover:scale-105"
  onClick={() => window.location.href = "/auth"}
>               
  Start Your Journey               
  <ArrowRight className="ml-2 w-4 h-4" />             
</Button>
          </div>
        </div>
      </div>

      {/* Enhanced Questions Dialog 
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedType?.gradient} flex items-center justify-center`}>
                {selectedType?.icon}
              </div>
              Questions About {selectedType?.title}
            </DialogTitle>
            <DialogDescription className="text-lg">
              Get answers to common questions about our services for {selectedType?.title.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-6 my-6 max-h-96 overflow-hidden">
            {/* Category Sidebar 
            <div className="w-1/3 space-y-2">
              <h4 className="font-semibold text-gray-800 mb-3">Categories</h4>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setOpenQuestionIndex(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${selectedType?.gradient} text-white shadow-md`
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Questions Content 
            <div className="w-2/3 space-y-3 overflow-y-auto max-h-80">
              {questionsByCategory[selectedCategory]?.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setOpenQuestionIndex(openQuestionIndex === idx ? null : idx)}
                  >
                    <h4 className="font-medium text-gray-800 pr-4">{q.question}</h4>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      openQuestionIndex === idx ? 'rotate-180' : ''
                    }`} />
                  </div>
                  {openQuestionIndex === idx && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowQuestionsDialog(false);
                setOpenQuestionIndex(null);
                setSelectedCategory("Getting Started");
              }}
              className={`bg-gradient-to-r ${selectedType?.gradient} hover:shadow-lg transition-all duration-300`}
            >
              <CheckCircle className="mr-2 w-4 h-4" />
              Got It, Thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
} */}