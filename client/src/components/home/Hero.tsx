import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Slide = {
  image: string;
  title: string;
  description: string;
  //buttonText: string;
};

const slides: Slide[] = [
  {
    image:
      "https://imgs.search.brave.com/3zRA6n0BK9VoG5F1sr3_8-7oB6JLULJbso0N6GkRIRU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTA0/NDkwMDcwNC9waG90/by9oeWRyb3Bvbmlj/LWdyZWVuLW9hay12/ZWdldGFibGVzLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz05/SlJtSlVHRTVCaF9N/OV90MkdfYTktTDNy/X0p6Ylk0SUZjNmN2/bzZJcmVZPQ",
    title: "Sustainable Solutions for a Better Tomorrow",
    description: "",
    //buttonText: "Learn More",
  },
  {
    image:
      "https://media.istockphoto.com/id/1076104412/photo/automatic-garden-lawn-sprinkler.jpg?s=612x612&w=0&k=20&c=YaHSzB9Reg4oCGxkLsG8uVG6Utt5RISU5hZqk6Zuito=",
    title: "Open Farm",
    description: "",
    //buttonText: "Explore Products",
  },
  {
    image:
      "https://imgs.search.brave.com/rN9gohpc7w0bZ98jXw9xwV67FA5yMEMpuQLX7WQ5a98/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzEyLzczLzA1/LzM2MF9GXzMxMjcz/MDUyNF9aeWY0b3N2/VlFUcGVVQ0VpRTRm/eFoxRHdTZkhWbnR1/RC5qcGc",
    title: "Advanced Health Monitoring",
    description: "",
    //buttonText: "View Solutions",
  },
  {
    image:
      "https://imgs.search.brave.com/NvNtaHKPSl7bAJU6qHmue0ATGKdkvqw1s-p8YnE5kzQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9qdW1h/bmppLmxpdnNwYWNl/LWNkbi5jb20vbWFn/YXppbmUvd3AtY29u/dGVudC91cGxvYWRz/L3NpdGVzLzIvMjAy/My8xMi8wMTEzMTU0/MS90YWxsLXBsYW50/cy10ZXJyYWNlLWdh/cmRlbi1pZGVhLmpw/Zw",
    title: "Terrace Gardening",
    description: "",
    //buttonText: "View Solutions",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    const index = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    const index = (currentSlide + 1) % slides.length;
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section
      id="home"
      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
    >
      <div className="relative overflow-hidden h-[500px] md:h-[600px]">
        <div
          className="flex transition-transform duration-500 h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl mb-8 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  {/* <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                    {slide.buttonText}
                  </Button> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-gray-800 hover:bg-opacity-75"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-gray-800 hover:bg-opacity-75"
        >
          <FaChevronRight />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full bg-white ${
                index === currentSlide
                  ? "bg-opacity-70"
                  : "bg-opacity-30 hover:bg-opacity-100"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
