import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Products from "@/components/home/Products";
import About from "@/components/home/About";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col with-navbar-padding">
      <Navbar />
      <main>
        <Hero />
        <Products />
        <About />
      </main>
      <Footer />
    </div>
  );
}
