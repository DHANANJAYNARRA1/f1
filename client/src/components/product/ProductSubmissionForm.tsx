import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Product submission form props
interface ProductSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Product categories
const PRODUCT_CATEGORIES = [
  { id: "agritech", name: "AgriTech" },
  { id: "healthtech", name: "HealthTech" },
  { id: "fintech", name: "FinTech" },
  { id: "medtech", name: "MedTech" },
  { id: "edutech", name: "EduTech" },
  { id: "dschool", name: "D School" },
  { id: "med360", name: "Med360" }
];

// Product stages
const PRODUCT_STAGES = [
  { id: "idea", name: "Idea Stage" },
  { id: "prototype", name: "Prototype" },
  { id: "mvp", name: "MVP" },
  { id: "market", name: "Market Ready" },
  { id: "scaling", name: "Scaling" }
];

export default function ProductSubmissionForm({ onSuccess, onCancel }: ProductSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    stage: "",
    fundingNeeded: "",
    seekingInvestment: true,
    contactInfo: "",
    website: ""
  });
  
  // Product submission mutation
  const submitProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/user/products", {
        ...data,
        fundingNeeded: data.fundingNeeded ? parseInt(data.fundingNeeded) : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/products'] });
      
      toast({
        title: "Product submitted successfully",
        description: "Your product has been submitted for admin approval",
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        stage: "",
        fundingNeeded: "",
        seekingInvestment: true,
        contactInfo: "",
        website: ""
      });
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message || "Could not submit your product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.category || !formData.stage) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Submit form
    submitProductMutation.mutate(formData);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Product</CardTitle>
        <CardDescription>
          Fill out this form to submit your product for approval and potential investor interest.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Product Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Product Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product in detail"
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Development Stage *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleSelectChange("stage", value)}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fundingNeeded">Funding Needed (USD)</Label>
                <Input
                  id="fundingNeeded"
                  name="fundingNeeded"
                  type="number"
                  value={formData.fundingNeeded}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="space-y-2 pt-2">
            <h3 className="text-lg font-medium">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://your-product-website.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Additional contact information"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="seekingInvestment"
                checked={formData.seekingInvestment}
                onCheckedChange={(checked) => handleSwitchChange("seekingInvestment", checked)}
              />
              <Label htmlFor="seekingInvestment">I am actively seeking investment for this product</Label>
            </div>
          </div>
          
          {/* Notification about admin approval */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Admin approval required</p>
              <p>Your product will be reviewed by our admin team before it becomes visible to investors. You'll receive a notification once approved.</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <Button type="submit" disabled={submitProductMutation.isPending}>
            {submitProductMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Product"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}