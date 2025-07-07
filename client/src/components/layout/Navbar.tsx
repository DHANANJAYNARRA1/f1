import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { Menu, X } from "lucide-react";

// ✅ Simplified interface - no navigation props needed
interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage = "" }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    if (location === "/") {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navigateToHomeSection = (sectionId: string) => {
    return location !== "/" ? `/#${sectionId}` : `#${sectionId}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: navigateToHomeSection("home"), label: "Home", onClick: (e: React.MouseEvent) => scrollToSection("home", e) },
    { label: "Products", dropdown: [
        { href: "/founder", label: "Founder" },
        { href: "/investor", label: "Investor" },
      ], onClick: (e: React.MouseEvent) => scrollToSection("products", e) },
    { href: navigateToHomeSection("about"), label: "About", onClick: (e: React.MouseEvent) => scrollToSection("about", e) },
    { href: "/solutions", label: "Solutions" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-xl"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className={`text-2xl lg:text-3xl font-bold transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" 
                  : "text-white"
              }`}
            >
              METAVERTEX
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link, index) => (
              link.dropdown ? (
                <div key={index} className="relative group">
                  <a
                    href={link.href || '#'}
                    onClick={link.onClick}
                    className={`px-3 xl:px-4 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                      isScrolled
                        ? "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className={`absolute inset-0 rounded-lg transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left ${
                      isScrolled 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 opacity-10" 
                        : "bg-gradient-to-r from-white/20 to-white/10"
                    }`}></div>
                  </a>
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                    {link.dropdown.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={index}>
                  {typeof link.href === 'string' ? (
                    <a
                      href={link.href}
                      onClick={link.onClick}
                      className={`px-3 xl:px-4 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                        isScrolled
                          ? "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                          : "text-gray-200 hover:text-white hover:bg-white/10"
                      } ${
                        (location === "/" && link.label === "Home") || 
                        (location.includes(link.href.replace("/", "")) && link.href !== "/" && !link.href.includes("#"))
                          ? (isScrolled ? "text-purple-600 bg-purple-50" : "text-white bg-white/20")
                          : ""
                      }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                      <div className={`absolute inset-0 rounded-lg transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left ${
                        isScrolled 
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 opacity-10" 
                          : "bg-gradient-to-r from-white/20 to-white/10"
                      }`}></div>
                    </a>
                  ) : null}
                </div>
              )
            ))}

            {/* Authentication Button */}
            <div className="ml-4 xl:ml-6">
              {!user ? (
                <Link href="/auth">
                  <Button 
                    className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      isScrolled
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
                        : "bg-white text-purple-900 hover:bg-gray-100 shadow-md"
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
              ) : (
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <ProfileMenu />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen 
              ? "max-h-screen opacity-100 pb-6" 
              : "max-h-0 opacity-0"
          }`}
        >
          <div className={`pt-4 space-y-2 ${
            isScrolled 
              ? "border-t border-gray-200" 
              : "border-t border-white/20"
          }`}>
            {navLinks.map((link, index) => (
              link.dropdown ? (
                <div key={index} className="relative group">
                  <button
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 hover:translate-x-2 ${
                      isScrolled
                        ? "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </button>
                  <div className="pl-4">
                    {link.dropdown.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                typeof link.href === 'string' && (
                  <a
                    key={index}
                    href={link.href}
                    onClick={link.onClick}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 hover:translate-x-2 ${
                      isScrolled
                        ? "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    } ${
                      (location === "/" && link.label === "Home") || 
                      (location.includes(link.href.replace("/", "")) && link.href !== "/" && !link.href.includes("#"))
                        ? (isScrolled ? "bg-purple-50 text-purple-600" : "bg-white/20 text-white")
                        : ""
                    }`}
                  >
                    {link.label}
                  </a>
                )
              )
            ))}
            
            {/* Mobile Authentication */}
            <div className="pt-4">
              {!user ? (
                <Link href="/auth">
                  <Button 
                    className={`w-full transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                      isScrolled
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        : "bg-white text-purple-900 hover:bg-gray-100"
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
              ) : (
                <div className="px-4">
                  <ProfileMenu />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}