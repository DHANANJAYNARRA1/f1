import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { socket } from "@/socket";

// Form schema for product submission
type ProductFormValues = z.infer<typeof insertProductSchema>;

export default function AddProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { user, addProductMutation } = useAuth();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");
  
  // Default form values
  const defaultValues: Partial<ProductFormValues> = {
    name: "",
    fullName: "",
    description: "",
    price: "",
    regulatoryCompliance: "",
    certification: "",
    pilotStudy: "",
    research: "",
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    socket.on("formReviewed", (data) => {
      if (data.type === "product" && data.product && data.product.userId === user?._id) {
        toast({
          title: `Product ${data.product.status === 'approved' ? 'Approved' : 'Reviewed'}`,
          description: data.product.adminFeedback || `Your product has been ${data.product.status}.`,
        });
      }
    });
    return () => {
      socket.off("formReviewed");
    };
  }, [user?._id]);

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      // Check if tag already exists
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      } else {
        toast({
          title: "Tag already exists",
          description: "This tag has already been added.",
          variant: "destructive",
        });
      }
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle benefit input
  const handleBenefitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && benefitInput.trim() !== '') {
      e.preventDefault();
      // Check if benefit already exists
      if (!benefits.includes(benefitInput.trim())) {
        setBenefits([...benefits, benefitInput.trim()]);
        setBenefitInput("");
      } else {
        toast({
          title: "Benefit already exists",
          description: "This benefit has already been added.",
          variant: "destructive",
        });
      }
    }
  };

  // Remove a benefit
  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    if (tags.length === 0 || benefits.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide at least one tag and one benefit.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...data,
      tags: tags.map(name => ({ name })),
      benefits,
      userId: typeof user?._id === "string" ? user._id : (user?._id && typeof user._id === "object" && "toString" in user._id ? user._id.toString() : ""),
      userName: user?.name || "",
      status: "pending" as const,
    };

    try {
      // Real-time submission via socket
      socket.emit("formSubmitted", { type: "product", form: productData, userId: productData.userId });
      toast({
        title: "Product Submitted",
        description: "Your product is now pending approval from the admin.",
      });
      if (onSuccess) onSuccess();
      form.reset(defaultValues);
      setTags([]);
      setBenefits([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Tag className="h-4 w-4" /> Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Submit your product for review and showcase it to potential investors. Complete all fields for better visibility.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HydroSense" {...field} />
                    </FormControl>
                    <FormDescription>
                      Short name used as product identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Product Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HydroSense Irrigation Solution" {...field} />
                    </FormControl>
                    <FormDescription>
                      Complete product name with modifiers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your product in detail..." 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Detail the product's purpose, features, and unique selling points (50-500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AgriTech">AgriTech</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="MedTech">MedTech</SelectItem>
                        <SelectItem value="EduTech">EduTech</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the primary industry category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B2B">B2B (Business to Business)</SelectItem>
                        <SelectItem value="B2C">B2C (Business to Consumer)</SelectItem>
                        <SelectItem value="B2B2C">B2B2C (Business to Business to Consumer)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Specify your target customer segment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Starting from ₹25,000 or Subscription: ₹2,999/month" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your pricing model or price range
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags <span className="text-red-500">*</span></FormLabel>
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Add a tag (press Enter after each tag)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
              <FormDescription className="mb-2">
                Add keywords that describe your product (e.g., Eco-Friendly, AI-Powered)
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-gray-500 italic">No tags added yet</span>
                )}
              </div>
            </div>

            <div>
              <FormLabel>Key Benefits <span className="text-red-500">*</span></FormLabel>
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Add a benefit (press Enter after each one)"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={handleBenefitKeyDown}
                />
              </div>
              <FormDescription className="mb-2">
                List the main advantages and value propositions of your product
              </FormDescription>
              <div className="flex flex-col gap-2 mt-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="flex-1">{benefit}</span>
                    <button 
                      type="button"
                      onClick={() => removeBenefit(benefit)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <span className="text-sm text-gray-500 italic">No benefits added yet</span>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to an image that showcases your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-base font-medium">Additional Specifications (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="regulatoryCompliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regulatory Compliance</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FDA Approved, ISO 9001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Any regulatory standards your product meets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="certification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ISO 27001, CE Mark" {...field} />
                      </FormControl>
                      <FormDescription>
                        Any certifications your product has received
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pilotStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilot Study Results</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30% efficiency improvement in trials" {...field} />
                      </FormControl>
                      <FormDescription>
                        Results from any pilot testing or trials
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="research"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Research Background</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Published in Journal of Innovation" {...field} />
                      </FormControl>
                      <FormDescription>
                        Any research backing your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}