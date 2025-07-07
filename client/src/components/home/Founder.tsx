import { ArrowRight, Upload, Eye, MessageCircle, Handshake, Shield, CheckCircle, Users, TrendingUp, Lock, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
// Removed Footer import
// import Footer from "@/components/layout/Footer"; 

function FounderPage() {
  const products = [
    { id: 1, name: "AgriTech", image: "https://via.placeholder.com/150/0000FF/FFFFFF?text=SaaS+X" },
    { id: 2, name: "FinTech", image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=E-commerce+Z" },
    { id: 3, name: "GreenTech", image: "https://via.placeholder.com/150/008000/FFFFFF?text=App+A" },
    { id: 4, name: "MedTech", image: "https://via.placeholder.com/150/FFFF00/000000?text=FinTech+B" },
    { id: 5, name: "EduTech", image: "https://via.placeholder.com/150/800080/FFFFFF?text=AI+Tool+C" },
    { id: 6, name: "E-commerce", image: "https://via.placeholder.com/150/FF4500/FFFFFF?text=Hardware+D" },
    { id: 7, name: "HealthTech", image: "https://via.placeholder.com/150/00CED1/FFFFFF?text=Agency+E" },
    { id: 8, name: "Pharma", image: "https://via.placeholder.com/150/FF69B4/FFFFFF?text=Health+F" },
  ];

  const founderFeedback = [
    {
      id: 1,
      quote: "Closed my first $50K deal in 3 weeks - completely anonymous until the final handshake. This platform is a game-changer for founders who value privacy.",
      author: "Sarah M.",
      title: "SaaS Founder",
    },
    {
      id: 2,
      quote: "The anonymous negotiation feature is brilliant. It allowed us to explore multiple offers without revealing our identity prematurely. Highly recommended!",
      author: "John D.",
      title: "E-commerce Entrepreneur",
    },
    {
      id: 3,
      quote: "Finding serious investors has always been a challenge, but this platform connects you directly with verified buyers. Our last round closed faster than ever.",
      author: "Emily R.",
      title: "Mobile App Developer",
    },
    {
      id: 4,
      quote: "I was skeptical at first, but the privacy protocols are top-notch. It truly empowers founders to control their narrative and engage on their terms.",
      author: "Michael T.",
      title: "FinTech Innovator",
    },
    {
      id: 5,
      quote: "Finally, a platform that understands the discreet nature of selling a business. The process was seamless and incredibly secure.",
      author: "Jessica L.",
      title: "AI Startup CEO",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar currentPage="founder" />
      
      {/* Hero Section - Instant Appeal */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-500/30">
              <Shield className="h-4 w-4 mr-2" />
              100% Confidential Process
            </div>
            
            <h3 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Connect With Serious 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"> Investors.</span>
              <br />
              <h4><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">"Confidential Product Listing"</span></h4>
            </h3>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Join <strong className="text-cyan-400">1,500+ founders</strong> who've closed deals through secure, anonymous negotiations
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
                <p className="text-white text-sm">Anonymous discussions until you're ready</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
                <p className="text-white text-sm">Direct investor interest notifications</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
                <p className="text-white text-sm">Secure deal closure process</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-cyan-400/30"
                >
                  Start Connecting with Investors <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            
            </div>
          </div>
        </div>
      </section>

      {/* Live Success Metrics */}
      <section className="py-12 px-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold text-cyan-400 mb-2">2,340</div>
              <p className="text-gray-300">Products listed this month</p>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold text-purple-400 mb-2">890</div>
              <p className="text-gray-300">Active investor discussions</p>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold text-pink-400 mb-2">156</div>
              <p className="text-gray-300">Deals closed this week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Continuously Moving Products Row */}
      <section className="py-16 bg-slate-900 overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
          Featured Products
        </h2>
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll {
            animation: scroll-left 20s linear infinite; /* Adjust duration for speed */
            will-change: transform;
          }
          .product-container {
            display: flex;
            gap: 2rem; /* Space between products */
            padding-left: 100%; /* Start items off-screen to the right */
            white-space: nowrap; /* Prevent wrapping */
          }
        `}</style>
        <div className="relative w-full overflow-hidden py-4">
          <div className="product-container animate-scroll group-hover:paused">
            {/* Duplicate products to create continuous loop effect */}
            {[...products, ...products].map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-shrink-0 w-64 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold text-white truncate">{product.name}</h3>
                <p className="text-gray-400 text-sm mt-2">Connecting founders with investors.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 4 Simple Steps */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Four simple steps to connect with serious investors while maintaining complete anonymity
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-cyan-500/25">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div className="bg-cyan-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">STEP 1</div>
              <h3 className="text-2xl font-bold text-white mb-4">Publish Your Products</h3>
              <p className="text-gray-400 leading-relaxed">
                List your products or services with detailed descriptions. Your identity remains completely hidden.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/25">
                <Eye className="h-10 w-10 text-white" />
              </div>
              <div className="bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">STEP 2</div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Anonymous Interest</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive notifications when verified investors show interest in your products.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-green-500/25">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">STEP 3</div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Discussions</h3>
              <p className="text-gray-400 leading-relaxed">
                Engage in encrypted conversations while maintaining anonymity until you're ready.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-orange-500/25">
                <Handshake className="h-10 w-10 text-white" />
              </div>
              <div className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">STEP 4</div>
              <h3 className="text-2xl font-bold text-white mb-4">Close Deals Safely</h3>
              <p className="text-gray-400 leading-relaxed">
                Reveal identities mutually and finalize agreements through our secure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Protection Appeal */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-800 to-purple-900">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Privacy, Our Priority
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              We understand the importance of confidentiality in business negotiations. 
              That's why we've built the most secure platform for founder-investor connections.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <Shield className="h-12 w-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Discuss Without Revealing Identity</h3>
                <p className="text-gray-300">
                  Maintain complete anonymity during initial discussions and negotiations.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                <Users className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Control When to Share Details</h3>
                <p className="text-gray-300">
                  You decide exactly when and what contact information to reveal.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-400/30 transition-all duration-300">
                <Eye className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Review Investor Backgrounds</h3>
                <p className="text-gray-300">
                  Access detailed investor profiles and track records before engaging.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-400/30 transition-all duration-300">
                <CheckCircle className="h-12 w-12 text-pink-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Mutual Confirmation Required</h3>
                <p className="text-gray-300">
                  Both parties must agree before any personal information is exchanged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Quality Assurance */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-900 to-slate-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Verified Investors Only
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Every investor on our platform is pre-screened for serious interest and background checked for credibility
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl p-8 border border-cyan-400/30">
              <div className="text-3xl font-bold text-cyan-400 mb-2">✓</div>
              <h3 className="text-xl font-bold text-white mb-3">Pre-screened</h3>
              <p className="text-gray-300">All investors undergo rigorous verification</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl p-8 border border-purple-400/30">
              <div className="text-3xl font-bold text-purple-400 mb-2">✓</div>
              <h3 className="text-xl font-bold text-white mb-3">Serious Interest</h3>
              <p className="text-gray-300">Only investors with proven track records</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-8 border border-green-400/30">
              <div className="text-3xl font-bold text-green-400 mb-2">✓</div>
              <h3 className="text-xl font-bold text-white mb-3">Background Checked</h3>
              <p className="text-gray-300">Credibility verified through multiple sources</p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Industry Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['AgriTech', 'Healthcare', 'MedTEch', 'E-commerce', 'FinTech', 'GreenTech', 'EduTech', 'Pharma'].map((category) => (
                <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:border-cyan-400/30 transition-all duration-300">
                  <p className="text-white font-medium">{category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Feedback Carousel */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-800 to-purple-800">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
          What Founders Say
        </h2>
        <div className="container mx-auto">
          <style>{`
            @keyframes carousel-scroll {
              0% { transform: translateX(0%); }
              20% { transform: translateX(0%); } /* Stay for a bit */
              25% { transform: translateX(-100%); } /* Move to next item */
              45% { transform: translateX(-100%); }
              50% { transform: translateX(-200%); }
              70% { transform: translateX(-200%); }
              75% { transform: translateX(-300%); }
              95% { transform: translateX(-300%); }
              100% { transform: translateX(-400%); } /* Go past last item */
            }
            .carousel-container {
              display: flex;
              transition: transform 0.8s ease-in-out;
            }
            .carousel-item {
              flex: 0 0 100%; /* Each item takes full width of container */
              margin-right: 0;
            }
            .carousel-wrapper {
              overflow: hidden;
              position: relative;
            }
            .carousel-container.animate {
              animation: carousel-scroll 30s infinite; /* Adjust duration for speed */
            }
          `}</style>
          <div className="carousel-wrapper">
            <div className="carousel-container animate">
              {/* Duplicate feedback items to ensure smooth looping */}
              {[...founderFeedback, founderFeedback[0]].map((feedback, index) => ( // Added one more item for continuous loop
                <div key={`${feedback.id}-${index}`} className="carousel-item max-w-4xl mx-auto text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-2xl md:text-3xl text-white mb-6 italic leading-relaxed">
                      "{feedback.quote}"
                    </blockquote>
                    <div className="text-cyan-400 font-semibold text-lg">
                      - {feedback.author}, {feedback.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Risk-Free Start CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Risk-Free Today
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-400/30">
                <div className="text-4xl mb-3">🆓</div>
                <h3 className="text-xl font-bold text-white mb-2">List Your First Product FREE</h3>
                <p className="text-gray-300">No upfront costs or hidden fees</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl p-6 border border-cyan-400/30">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">No Commitment Until Interest</h3>
                <p className="text-gray-300">Pay only when investors show genuine interest</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30">
                <div className="text-4xl mb-3">🚫</div>
                <h3 className="text-xl font-bold text-white mb-2">Cancel Discussions Anytime</h3>
                <p className="text-gray-300">Full control over your engagement level</p>
              </div>
            </div>
            
            <Link href="/auth">
              <Button 
                className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-cyan-400/30"
              >
                Join Founder Network Now <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            
            <p className="text-gray-400 mt-6 text-lg">
              Join 1,500+ founders already growing their businesses anonymously
            </p>
          </div>
        </div>
      </section>

      {/* Removed Footer */}
      {/* <Footer /> */}
    </div>
  );
}

export default FounderPage;