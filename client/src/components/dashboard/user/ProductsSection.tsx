import { Button } from "@/components/ui/button";
import { useState } from "react";
import InterestModal from "@/components/modals/InterestModal";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "./AddProductForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaInfo,
  FaEnvelope,
  FaStar,
  FaLeaf,
  FaHeartbeat,
  FaHospital,
  FaSeedling,
  FaCheck,
  FaCertificate,
  FaFlask,
  FaBook,
  FaBuilding,
  FaShoppingBag,
  FaHandshake,
  FaUsers
} from "react-icons/fa";

type ProductTag = {
  name: string;
};

// Export the type so it can be imported elsewhere
export type DetailedProduct = {
  id: string;
  name: string;
  fullName: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  tags: ProductTag[];
  benefits: string[];
  price: string;
  // New required specifications
  regulatoryCompliance?: string;
  certification?: string;
  pilotStudy?: string;
  research?: string;
  businessModel?: 'B2B' | 'B2C' | 'B2B2C';
};

const detailedProducts: DetailedProduct[] = [
  // D School products
  {
    id: "dschool-innovation",
    name: "D School",
    fullName: "D School Innovation Lab",
    description:
      "Comprehensive design thinking platform for innovative education solutions. Transform how students learn through human-centered design principles and creative problem solving.",
    image:
      "https://www.shutterstock.com/image-photo/education-concept-students-studying-learning-600nw-2042224346.jpg",
    icon: <FaBook className="text-purple-500" />,
    tags: [
      { name: "Design Thinking" },
      { name: "Innovation" },
      { name: "Education" },
    ],
    benefits: [
      "Student-centered learning approach",
      "Practical problem-solving skills",
      "Creative confidence building",
      "Cross-disciplinary collaboration",
    ],
    price: "Starting from ₹45,000",
    // New specifications
    regulatoryCompliance: "NEP 2020 Compliant, UGC Guidelines for Innovation Hubs",
    certification: "International Design Thinking Association Certified",
    pilotStudy: "Implemented in 25 educational institutions with 65% improvement in student engagement",
    research: "Published in International Journal of Design Education 2023",
    businessModel: "B2B",
  },
  
  // Med360 product
  {
    id: "med360-health",
    name: "Med360",
    fullName: "Med360 Health Monitoring Platform",
    description:
      "Complete 360-degree health monitoring solution for hospitals, clinics and remote patient care. Integrated platform for continuous health tracking and early intervention.",
    image:
      "https://img.freepik.com/free-photo/doctor-with-stethoscope-hands-hospital-background_1423-1.jpg",
    icon: <FaFlask className="text-blue-500" />,
    tags: [
      { name: "Remote Monitoring" },
      { name: "Healthcare IT" },
      { name: "Patient-Centric" },
    ],
    benefits: [
      "24/7 vital signs monitoring",
      "AI-powered health analytics",
      "Remote doctor consultations",
      "Integrated health records",
    ],
    price: "Starting from ₹75,000",
    // New specifications
    regulatoryCompliance: "HIPAA Compliant, GDPR Ready, NABH Certified",
    certification: "ISO 13485:2016 Medical Devices Quality Management",
    pilotStudy: "Deployed in 12 hospitals with 40% reduction in readmission rates",
    research: "Published in Journal of Digital Health Technology 2023",
    businessModel: "B2B2C",
  },
  
  // Original hydroponics product
  {
    id: "hydroponics",
    name: "Hydroponics",
    fullName: "Hydroponics Solutions",
    description:
      "Our hydroponics systems use up to 90% less water than traditional farming while producing higher yields in less space. Perfect for urban farming and sustainable agriculture.",
    image:
      "https://m.media-amazon.com/images/I/710QZjYAy7L._AC_UF350,350_QL80_.jpg",
    icon: <FaLeaf className="text-green-500" />,
    tags: [
      { name: "Eco-Friendly" },
      { name: "Water Efficient" },
      { name: "Space Saving" },
    ],
    benefits: [
      "90% less water consumption",
      "30% faster growth cycle",
      "Year-round production",
      "No soil required",
    ],
    price: "Starting from ₹25,000",
    // New specifications
    regulatoryCompliance: "Compliant with Agriculture Ministry Sustainable Farming Guidelines",
    certification: "ISO 14001:2015 Environmental Management",
    pilotStudy: "12-month study with 50 urban farms showing 40% yield increase",
    research: "Published in International Journal of Sustainable Agriculture 2024",
    businessModel: "B2B2C",
  },
  {
    id: "ecg",
    name: "ECG",
    fullName: "ECG Monitoring Systems",
    description:
      "Portable and accurate electrocardiogram devices for personal health monitoring. Track your heart health with clinical-grade precision from the comfort of your home.",
    image:
      "https://imgs.search.brave.com/f5RegzPzh8SNPn3MblSrqG63xH7x6Pct7MB4PnrGbPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI5/MDIyMDYzMS9waG90/by9odW1hbi1oZWFy/dC13aXRoLWVjZy1n/cmFwaC5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9OXpqeWty/STRzQlJsdU5rSGth/RkZzLVZnOUpranRN/V0p4cXNmemwySGdv/ND0",
    icon: <FaHeartbeat className="text-red-500" />,
    tags: [
      { name: "Medical Grade" },
      { name: "Portable" },
      { name: "Cloud Connected" },
    ],
    benefits: [
      "Real-time cardiac monitoring",
      "Instant medical alerts",
      "Historical data analysis",
      "Smartphone integration",
    ],
    price: "Starting from ₹15,000",
    // New specifications
    regulatoryCompliance: "FDA Approved, CDSCO Certified for Home Medical Devices",
    certification: "ISO 13485:2016 Medical Devices Quality Management",
    pilotStudy: "Clinical trial with 200 cardiac patients showing 95% accuracy",
    research: "Peer-reviewed in Journal of Telemedicine and e-Health 2023",
    businessModel: "B2C",
  },
  {
    id: "hps",
    name: "HPS",
    fullName: "Health Parameter Systems",
    description:
      "Comprehensive health monitoring solutions for hospitals and clinics. Integrated systems for tracking multiple vital signs with centralized data management.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXhPktIiVCMOhFTrS36im9fOSCb1G9UDtc4TmSbuai94G0JSnHajS_Ye0ErE7x23gxC5U&usqp=CAU",
    icon: <FaHospital className="text-blue-500" />,
    tags: [
      { name: "Enterprise" },
      { name: "Integrated" },
      { name: "Analytics" },
    ],
    benefits: [
      "Multi-parameter monitoring",
      "Centralized patient database",
      "Predictive analytics",
      "AI-assisted diagnosis",
    ],
    price: "Custom enterprise solutions",
    // New specifications
    regulatoryCompliance: "CE Marked, HIPAA Compliant, NABH Certified",
    certification: "ISO 27001:2013 Information Security Management",
    pilotStudy: "Implemented in 15 major hospitals with 30% diagnostic efficiency improvement",
    research: "Published in Healthcare Informatics Journal 2023",
    businessModel: "B2B",
  },
  {
    id: "terrace-garden",
    name: "Terrace Garden",
    fullName: "Terrace Garden Solutions",
    description:
      "Complete systems for transforming urban spaces into productive gardens. Includes raised beds, irrigation systems, and companion planting guides.",
    image:
      "https://imgs.search.brave.com/_tiVd8wsfAO2ZTs8KRNFmZfrEXEGQnyJwgpJJNNKyWo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bGF3bnN0YXJ0ZXIu/Y29tL2Jsb2cvd3At/Y29udGVudC91cGxv/YWRzLzIwMjIvMTIv/MjQzNjg2MzI0X2Mx/NTZhYjY5Yzhfay0x/LmpwZw",
    icon: <FaSeedling className="text-green-500" />,
    tags: [
      { name: "Urban" },
      { name: "DIY Friendly" },
      { name: "Sustainable" },
    ],
    benefits: [
      "Self-watering system",
      "Modular design",
      "Weather resistant",
      "Optimized for limited space",
    ],
    price: "Starting from ₹10,000",
    // New specifications
    regulatoryCompliance: "Meets Urban Development Ministry Guidelines for Rooftop Usage",
    certification: "Green Building Council Certified Product",
    pilotStudy: "Deployed in 100 residential buildings with 60% success in food production",
    research: "Featured in Urban Farming Quarterly 2023",
    businessModel: "B2C",
  },
];

export default function ProductsSection() {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<DetailedProduct | null>(null);
  const auth = useAuth();
  const { expressInterest } = auth;
  const { toast } = useToast();

  const handleContactClick = (product: DetailedProduct) => {
    setSelectedProduct(product);
    setShowInterestModal(true);
  };

  const handleCloseModal = () => {
    setShowInterestModal(false);
    setSelectedProduct(null);
  };

  const handleSubmitInterest = (productId: string) => {
    expressInterest.mutate(
      { productId },
      {
        onSuccess: () => {
          toast({
            title: "Interest Submitted",
            description: "Our team will contact you soon with more information",
            duration: 3000,
          });
        },
      },
    );
    handleCloseModal();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 hidden md:block">
            Your exclusive access to detailed product information
          </div>
          {auth.user?.userType === 'founder' && <AddProductForm onSuccess={() => {
            toast({
              title: "Product Submitted Successfully",
              description: "Your product will be reviewed by our team and made available once approved.",
              duration: 5000,
            });
          }} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {detailedProducts.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-0 right-0 p-2">
                <Badge
                  variant="secondary"
                  className="bg-white font-medium text-gray-700"
                >
                  {product.name}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <div className="flex items-center gap-2">
                {product.icon}
                <CardTitle>{product.fullName}</CardTitle>
              </div>
              <CardDescription className="text-base mt-2">
                {product.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="outline"
                      className="bg-primary/10 border-primary/20 text-primary"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <FaStar className="text-amber-400" />
                    Key Benefits
                  </h4>
                  <ul className="text-sm space-y-1 pl-5 list-disc text-gray-600">
                    {product.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm font-medium text-primary">
                    {product.price}
                  </div>
                  {product.businessModel && (
                    <Badge 
                      variant="outline" 
                      className={`
                        ${product.businessModel === 'B2B' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                          product.businessModel === 'B2C' ? 'bg-green-100 text-green-800 border-green-200' : 
                          'bg-purple-100 text-purple-800 border-purple-200'}
                      `}
                    >
                      {product.businessModel}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 justify-between pt-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  // Create a modal-like toast with beautifully formatted specifications
                  const specContent = document.createElement('div');
                  specContent.innerHTML = `
                    <div class="specifications-toast p-2">
                      <h3 class="text-lg font-semibold mb-3 border-b pb-2">${product.fullName}</h3>
                      <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col">
                          <div class="flex items-center mb-2">
                            <span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            <span class="font-medium text-sm">Business Model:</span>
                          </div>
                          <span class="ml-5 text-sm">${product.businessModel || 'N/A'}</span>
                        </div>
                        <div class="flex flex-col">
                          <div class="flex items-center mb-2">
                            <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            <span class="font-medium text-sm">Certification:</span>
                          </div>
                          <span class="ml-5 text-sm">${product.certification || 'N/A'}</span>
                        </div>
                        <div class="flex flex-col">
                          <div class="flex items-center mb-2">
                            <span class="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                            <span class="font-medium text-sm">Regulatory Compliance:</span>
                          </div>
                          <span class="ml-5 text-sm">${product.regulatoryCompliance || 'N/A'}</span>
                        </div>
                        <div class="flex flex-col">
                          <div class="flex items-center mb-2">
                            <span class="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                            <span class="font-medium text-sm">Pilot Study:</span>
                          </div>
                          <span class="ml-5 text-sm">${product.pilotStudy || 'N/A'}</span>
                        </div>
                        <div class="flex flex-col col-span-2">
                          <div class="flex items-center mb-2">
                            <span class="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                            <span class="font-medium text-sm">Research:</span>
                          </div>
                          <span class="ml-5 text-sm">${product.research || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  `;
                  
                  toast({
                    title: "Product Specifications",
                    description: (
                      <div dangerouslySetInnerHTML={{ __html: specContent.innerHTML }} />
                    ),
                    duration: 8000, // Longer duration to read specifications
                    className: "specifications-toast",
                  });
                }}
              >
                <FaInfo /> Specifications
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleContactClick(product)}
                  className="gap-1"
                  size="sm"
                >
                  <FaEnvelope /> ReachOut At
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmitInterest(product.id)}
                  className="gap-1"
                  size="sm"
                >
                  I'm Interested
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedProduct && showInterestModal && (
        <InterestModal
          product={{ _id: selectedProduct.id.toString(), anonymousId: selectedProduct.id.toString() }}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
