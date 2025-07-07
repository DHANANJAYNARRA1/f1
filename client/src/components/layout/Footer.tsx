import React from 'react';
import {
  FaLeaf,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaTiktok,
  FaDiscord
} from "react-icons/fa";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe } from "react-icons/fa";

export default function Footer() {
  const socialLinks = [
    { icon: FaFacebookF, href: "https://facebook.com/metavertex", color: "hover:text-blue-400", bgColor: "hover:bg-blue-500/20" },
    { icon: FaTwitter, href: "https://twitter.com/metavertex", color: "hover:text-sky-400", bgColor: "hover:bg-sky-500/20" },
    { icon: FaLinkedinIn, href: "https://linkedin.com/company/metavertex", color: "hover:text-blue-600", bgColor: "hover:bg-blue-600/20" },
    { icon: FaInstagram, href: "https://instagram.com/metavertex", color: "hover:text-pink-400", bgColor: "hover:bg-pink-500/20" },
    //{ icon: FaYoutube, href: "https://youtube.com/@metavertex", color: "hover:text-red-500", bgColor: "hover:bg-red-500/20" },
    //{ icon: FaGithub, href: "https://github.com/metavertex", color: "hover:text-gray-300", bgColor: "hover:bg-gray-500/20" },
    ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <FaLeaf className="text-green-400 text-4xl animate-pulse" />
              <div className="absolute inset-0 text-green-400 text-4xl animate-ping opacity-20">
                <FaLeaf />
              </div>
            </div>
            <h2 className="font-bold text-4xl bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Metavertex
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Innovative sustainable solutions for a better tomorrow. Join our community and stay connected across all platforms.
          </p>
        </div>

        {/* Social Media Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Connect With Us
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${social.color} ${social.bgColor}`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <IconComponent className="text-2xl transition-all duration-300 group-hover:scale-125" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Products Section */}
          <div className="group">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <h3 className="font-bold text-xl mb-6 text-green-400 group-hover:text-green-300 transition-colors">
                🌱 Products
              </h3>
              <ul className="space-y-3">
                {["Hydroponics", "ECG Monitoring", "Health Parameter Systems", "Terrace Garden Solutions"].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#products" 
                      className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 block py-1 border-l-2 border-transparent hover:border-green-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Partnerships Section */}
          <div className="group">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <h3 className="font-bold text-xl mb-6 text-blue-400 group-hover:text-blue-300 transition-colors">
                🤝 Our Partnerships
              </h3>
              <ul className="space-y-3">
                {["Nabbad", "V Hub", "Ozones", "D School"].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#partnerships" 
                      className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 block py-1 border-l-2 border-transparent hover:border-blue-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Section */}
          <div className="group">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <h3 className="font-bold text-xl mb-6 text-purple-400 group-hover:text-purple-300 transition-colors">
                🏢 Company
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "About Us", href: "#about" },
                  { name: "Careers", href: "#careers" },
                  { name: "Partners", href: "#partners" },
                  { name: "Blog", href: "#blog" }
                ].map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 block py-1 border-l-2 border-transparent hover:border-purple-400"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="group">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <h3 className="font-bold text-xl mb-6 text-pink-400 group-hover:text-pink-300 transition-colors">
                📞 Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group/item">
                  <FaMapMarkerAlt className="mt-1 text-pink-400 group-hover/item:text-pink-300 transition-colors" />
                  <span className="text-gray-300 group-hover/item:text-white transition-colors">
                    123 Green Street, Eco City, EC 12345
                  </span>
                </li>
                <li className="flex items-start space-x-3 group/item">
                  <FaEnvelope className="mt-1 text-pink-400 group-hover/item:text-pink-300 transition-colors" />
                  <a
                    href="mailto:cife@sims.healthcare"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    cife@sims.healthcare
                  </a>
                </li>
                <li className="flex items-start space-x-3 group/item">
                  <FaPhone className="mt-1 text-pink-400 group-hover/item:text-pink-300 transition-colors" />
                  <a
                    href="tel:+917527866666"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +91 7527866666
                  </a>
                </li>
                <li className="flex items-start space-x-3 group/item">
                  <FaGlobe className="mt-1 text-pink-400 group-hover/item:text-pink-300 transition-colors" />
                  <a
                    href="https://metavertex.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    metavertex.co.uk
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-6">Get the latest news and updates from Metavertex</p>
           {/* <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>*/}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} MetaVertex.co.uk. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}