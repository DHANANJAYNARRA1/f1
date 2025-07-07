import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/socket";

const fetchVerifiedProducts = async (): Promise<Product[]> => {
  const response = await apiRequest<{ products: Product[] }>("GET", "/api/products/verified");
  return response.products;
};

export default function VerifiedProductsList() {
  const { toast } = useToast();
  const { user } = useAuth();
  if (!user || !user._id) return null;
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["verifiedProducts"],
    queryFn: fetchVerifiedProducts,
  });

  // State for interest form
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [interestForm, setInterestForm] = useState({
    primaryIntent: "",
    investmentAmountRange: "",
    areasOfInterest: [] as string[],
    specificQuestions: "",
    timeline: "",
    additionalComments: "",
  });

  useEffect(() => {
    socket.on("formReviewed", (data) => {
      if (data.type === "interest" && data.interest && data.interest.investorId === user._id) {
        toast({
          title: `Interest ${data.interest.status === 'approved' ? 'Approved' : 'Reviewed'}`,
          description: data.interest.adminFeedback || `Your interest has been ${data.interest.status}.`,
        });
      }
    });
    return () => {
      socket.off("formReviewed");
    };
  }, [user?._id]);

  const handleInterest = (product: any) => {
    setSelectedProduct(product);
    setShowInterestDialog(true);
  };

  const handleInterestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInterestForm({ ...interestForm, [e.target.name]: e.target.value });
  };

  const handleAreasOfInterestChange = (area: string) => {
    setInterestForm((prev) => {
      const exists = prev.areasOfInterest.includes(area);
      return {
        ...prev,
        areasOfInterest: exists
          ? prev.areasOfInterest.filter((a) => a !== area)
          : [...prev.areasOfInterest, area],
      };
    });
  };

  const handleSubmitInterest = () => {
    if (!interestForm.primaryIntent || !interestForm.investmentAmountRange) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    socket.emit("formSubmitted", {
      type: "interest",
      form: {
        ...interestForm,
        productId: selectedProduct.id,
      },
      userId: user._id,
    });
    toast({
      title: "Interest Submitted",
      description: "Your interest has been sent to the admin for review.",
    });
    setShowInterestDialog(false);
    setInterestForm({
      primaryIntent: "",
      investmentAmountRange: "",
      areasOfInterest: [],
      specificQuestions: "",
      timeline: "",
      additionalComments: "",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching products</div>;
  }

  // Example areas of interest
  const allAreas = [
    "Financials & Valuation",
    "Market Opportunity & Size",
    "Team & Experience",
    "Technology & IP",
    "Product Roadmap",
    "Customer Acquisition",
    "Regulatory & Legal",
    "Exit Strategy",
    "Sustainability & ESG",
    "Partnerships & Channels",
    "Competitor Analysis",
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verified Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag.name} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button onClick={() => handleInterest(product)}>
                  Show Interest
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express Interest in {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Primary Intent *</label>
              <Input
                name="primaryIntent"
                value={interestForm.primaryIntent}
                onChange={handleInterestFormChange}
                placeholder="e.g., Equity Investment"
              />
            </div>
            <div>
              <label className="block font-medium">Investment Amount Range *</label>
              <Input
                name="investmentAmountRange"
                value={interestForm.investmentAmountRange}
                onChange={handleInterestFormChange}
                placeholder="e.g., $50,000 - $100,000"
              />
            </div>
            <div>
              <label className="block font-medium">Areas of Interest</label>
              <div className="flex flex-wrap gap-2">
                {allAreas.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={interestForm.areasOfInterest.includes(area) ? "default" : "outline"}
                    onClick={() => handleAreasOfInterestChange(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium">Specific Questions / Requirements</label>
              <Textarea
                name="specificQuestions"
                value={interestForm.specificQuestions}
                onChange={handleInterestFormChange}
                placeholder="e.g., What are your financial projections for the next 3 years?"
              />
            </div>
            <div>
              <label className="block font-medium">Timeline Expectations</label>
              <Input
                name="timeline"
                value={interestForm.timeline}
                onChange={handleInterestFormChange}
                placeholder="e.g., Q3 2024"
              />
            </div>
            <div>
              <label className="block font-medium">Additional Comments</label>
              <Textarea
                name="additionalComments"
                value={interestForm.additionalComments}
                onChange={handleInterestFormChange}
                placeholder="Any other information you'd like to provide"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitInterest}>Submit Interest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}