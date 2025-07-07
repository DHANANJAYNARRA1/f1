import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  FaUsers, 
  FaChartLine, 
  FaLaptopCode, 
  FaFileContract, 
  FaHandshake,
  FaLightbulb,
  FaBriefcase,
  FaFileInvoiceDollar
} from "react-icons/fa";

// Define the form schema
const formSchema = z.object({
  serviceType: z.string().min(1, { message: "Please select a service type" }),
  preferredDate: z.string().min(1, { message: "Please select a preferred date" }),
  preferredTime: z.string().min(1, { message: "Please select a preferred time" }),
  location: z.string().min(1, { message: "Please specify a location" }),
  notes: z.string().optional(),
});

type ServiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  price: string;
  isPopular?: boolean;
  userType: string;
}

const ServiceCard = ({ title, description, icon, features, price, isPopular, userType }: ServiceCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: title,
      preferredDate: "",
      preferredTime: "",
      location: "",
      notes: "",
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Service Request Submitted",
      description: `Your request for ${title} has been submitted successfully. We'll contact you shortly.`,
    });
    setOpenDialog(false);
    form.reset();
  };

  return (
    <Card className={`flex flex-col h-full border ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Popular Choice
        </div>
      )}
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2.5 rounded-full">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <Badge variant="outline" className="mb-2 bg-primary/5">
            {userType}
          </Badge>
          <p className="text-2xl font-bold">{price}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">Request Service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request {title}</DialogTitle>
              <DialogDescription>
                Fill in the details below to request this service. Our team will contact you to confirm.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (1PM - 5PM)</SelectItem>
                          <SelectItem value="evening">Evening (6PM - 9PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online">Online/Virtual</SelectItem>
                          <SelectItem value="office">Our Office</SelectItem>
                          <SelectItem value="client">Your Location</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide any specific requirements or questions" 
                          {...field} 
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" className="w-full">Submit Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default function ServicesSection() {
  const { user } = useAuth();
  const userType = user?.userType || 'other';
  
  // Define services based on user type
  const services = getServicesByUserType(userType);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Our Services</h2>
        <p className="text-gray-600">
          We offer a range of professional services tailored to your needs as a{' '}
          <span className="font-medium capitalize">{userType}</span>. 
          Browse and request the services that will help you achieve your goals.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            title={service.title}
            description={service.description}
            icon={service.icon}
            features={service.features}
            price={service.price}
            isPopular={service.isPopular}
            userType={userType}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to get services based on user type
function getServicesByUserType(userType: string) {
  // Default services available to all users
  const defaultServices = [
    {
      title: "Business Consultation",
      description: "Expert advice on business strategy, market positioning, and growth opportunities.",
      icon: <FaBriefcase className="h-5 w-5 text-primary" />,
      features: [
        "60-minute consultation",
        "Personalized advice",
        "Written summary",
        "Follow-up support",
      ],
      price: "₹2,500",
      isPopular: false,
    },
    {
      title: "Technical Support",
      description: "Get help with product integration, implementation, and troubleshooting.",
      icon: <FaLaptopCode className="h-5 w-5 text-primary" />,
      features: [
        "Priority support",
        "Remote assistance",
        "Step-by-step guidance",
        "Documentation",
      ],
      price: "₹1,500 / hour",
      isPopular: true,
    },
  ];
  
  // Founder-specific services
  if (userType === 'founder') {
    return [
      ...defaultServices,
      {
        title: "Investor Readiness Package",
        description: "Prepare your pitch deck, financial projections, and valuation for investor meetings.",
        icon: <FaChartLine className="h-5 w-5 text-primary" />,
        features: [
          "Pitch deck review",
          "Financial model validation",
          "Valuation assistance",
          "Mock investor Q&A",
        ],
        price: "₹15,000",
        isPopular: true,
      },
      {
        title: "Legal Documentation",
        description: "Professional legal services for contracts, agreements, and regulatory compliance.",
        icon: <FaFileContract className="h-5 w-5 text-primary" />,
        features: [
          "Custom agreements",
          "Legal review",
          "Compliance check",
          "Document management",
        ],
        price: "₹10,000",
        isPopular: false,
      },
      {
        title: "Mentoring Session",
        description: "One-on-one guidance from experienced entrepreneurs in your industry.",
        icon: <FaLightbulb className="h-5 w-5 text-primary" />,
        features: [
          "90-minute session",
          "Industry-specific insights",
          "Network introductions",
          "Growth roadmap",
        ],
        price: "₹5,000",
        isPopular: false,
      },
    ];
  }
  
  // Investor-specific services
  else if (userType === 'investor') {
    return [
      ...defaultServices,
      {
        title: "Due Diligence Support",
        description: "Comprehensive analysis and verification of potential investment opportunities.",
        icon: <FaFileInvoiceDollar className="h-5 w-5 text-primary" />,
        features: [
          "Financial analysis",
          "Market research",
          "Team assessment",
          "Risk evaluation",
        ],
        price: "₹25,000",
        isPopular: true,
      },
      {
        title: "Deal Flow Management",
        description: "Streamlined access to pre-screened startups matching your investment criteria.",
        icon: <FaHandshake className="h-5 w-5 text-primary" />,
        features: [
          "Personalized deal flow",
          "Weekly updates",
          "Preliminary screening",
          "Warm introductions",
        ],
        price: "₹8,000 / month",
        isPopular: false,
      },
      {
        title: "Investment Group Formation",
        description: "Setup and management of investment syndicates for collaborative funding.",
        icon: <FaUsers className="h-5 w-5 text-primary" />,
        features: [
          "Group structure setup",
          "Terms negotiation",
          "Document preparation",
          "Administration",
        ],
        price: "₹20,000",
        isPopular: false,
      },
    ];
  }
  
  // Organization-specific services
  else if (userType === 'organization') {
    return [
      ...defaultServices,
      {
        title: "Corporate Innovation Program",
        description: "Structured innovation workshops and implementation support for your team.",
        icon: <FaLightbulb className="h-5 w-5 text-primary" />,
        features: [
          "2-day workshop",
          "Implementation roadmap",
          "Progress tracking",
          "Executive briefing",
        ],
        price: "₹30,000",
        isPopular: true,
      },
      {
        title: "Partner Matching",
        description: "Find the right startup partners to enhance your corporate innovation initiatives.",
        icon: <FaHandshake className="h-5 w-5 text-primary" />,
        features: [
          "Partner screening",
          "Compatibility analysis",
          "Introduction facilitation",
          "Relationship management",
        ],
        price: "₹12,000",
        isPopular: false,
      },
    ];
  }
  
  // Mentor or other user types
  else {
    return defaultServices;
  }
}