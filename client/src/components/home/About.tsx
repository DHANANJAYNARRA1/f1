import React, { useState } from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaLeaf,
  FaUsers,
  FaLightbulb,
  FaGlobe,
  FaRocket,
  FaHeart,
  FaStar,
  FaAward
} from "react-icons/fa";

export default function About() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const socialLinks = [
    { icon: FaFacebookF, href: "https://facebook.com/metavertex", color: "hover:text-blue-500", bgColor: "hover:bg-blue-500/20" },
    { icon: FaTwitter, href: "https://twitter.com/metavertex", color: "hover:text-sky-400", bgColor: "hover:bg-sky-500/20" },
    { icon: FaLinkedinIn, href: "https://linkedin.com/company/metavertex", color: "hover:text-blue-600", bgColor: "hover:bg-blue-600/20" },
    { icon: FaInstagram, href: "https://instagram.com/metavertex", color: "hover:text-pink-500", bgColor: "hover:bg-pink-500/20" },
   // { icon: FaYoutube, href: "https://youtube.com/@metavertex", color: "hover:text-red-500", bgColor: "hover:bg-red-500/20" },
   // { icon: FaGithub, href: "https://github.com/metavertex", color: "hover:text-gray-700", bgColor: "hover:bg-gray-500/20" }
  ];

  const stats = [
    { icon: FaUsers, number: "50K+", label: "Happy Customers", color: "text-blue-500" },
    { icon: FaLightbulb, number: "100+", label: "Innovations", color: "text-yellow-500" },
    { icon: FaGlobe, number: "25+", label: "Countries", color: "text-green-500" },
    { icon: FaAward, number: "15+", label: "Awards Won", color: "text-purple-500" }
  ];

  const values = [
    {
      icon: FaLeaf,
      title: "Sustainability",
      description: "Environmental responsibility in every solution we create",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: FaRocket,
      title: "Innovation",
      description: "Cutting-edge technology that pushes boundaries",
      color: "from-blue-400 to-cyan-600"
    },
    {
      icon: FaHeart,
      title: "Impact",
      description: "Making a meaningful difference in people's lives",
      color: "from-pink-400 to-rose-600"
    },
    {
      icon: FaStar,
      title: "Excellence",
      description: "Committed to the highest standards of quality",
      color: "from-yellow-400 to-orange-600"
    }
  ];

  return (
    <section id="about" className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-600 rounded-full mb-6 animate-pulse">
            <FaLeaf className="text-3xl text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            About MetaVertex
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pioneering the future of sustainable technology since 2015, where innovation meets environmental responsibility
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          {/* Image Section */}
          <div className="lg:w-1/2 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Our Team" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-lg font-semibold">Our Amazing Team</p>
                <p className="text-sm">Innovators • Creators • Visionaries</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 space-y-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p className="transform hover:translate-x-2 transition-transform duration-300">
                  <span className="font-semibold text-green-600">Founded in 2015</span>, MetaVertex emerged from a simple yet powerful vision: to develop innovative, sustainable technologies that improve lives while reducing environmental impact.
                </p>
                <p className="transform hover:translate-x-2 transition-transform duration-300">
                  Our diverse team of <span className="font-semibold text-blue-600">engineers, healthcare professionals, and agricultural experts</span> work together to create integrated solutions for modern challenges.
                </p>
                <p className="transform hover:translate-x-2 transition-transform duration-300">
                  We believe in a future where <span className="font-semibold text-purple-600">technology and sustainability</span> go hand in hand, and we're dedicated to making that future a reality through every innovation we create.
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Connect With Us</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-4 rounded-full bg-white shadow-lg border-2 border-gray-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${social.color} ${social.bgColor}`}
                    >
                      <IconComponent className="text-2xl transition-all duration-300 group-hover:scale-125" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
            Our Impact in Numbers
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer"
                  onMouseEnter={() => setHoveredStat(index)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${stat.color} bg-current/10 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`text-3xl ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${stat.color} ${hoveredStat === index ? 'animate-pulse' : ''}`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-gradient-to-r ${value.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-3xl text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                    {value.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {value.description}
                  </p>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Shape the Future Together?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in our mission to create sustainable solutions that make a real difference in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Get In Touch
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300">
              View Our Work
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}