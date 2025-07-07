import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaCrown, FaCheck, FaStar, FaArrowRight } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type PlanFeature = {
  feature: string;
  included: boolean;
  highlight?: boolean;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  currentPlan?: boolean;
  founderIdRange?: [string, string]; // Range for IDs (e.g., ["FOB-001", "FOB-100"])
  investorIdRange?: [string, string]; // Range for IDs (e.g., ["INV-001", "INV-100"])
};

export default function SubscriptionPlansSection() {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const userType = user?.userType || 'other';
  
  // Generate unique ID for user based on their type
  // Founder: FOB-001 to FOB-999
  // Investor: INV-001 to INV-999
  // Organization: ORG-001 to ORG-999
  // Other/Mentor: MNT-001 to MNT-999
  const getUserId = () => {
    if (!user) return '';
    
    const userId = user.id || '0';
    const paddedId = userId.toString().padStart(3, '0');
    
    switch(userType) {
      case 'founder':
        return `FOB-${paddedId}`;
      case 'investor':
        return `INV-${paddedId}`;
      case 'organization':
        return `ORG-${paddedId}`;
      case 'other':
        return `MNT-${paddedId}`;
      default:
        return `USR-${paddedId}`;
    }
  };

  // Get subscription plans based on user type
  const getSubscriptionPlans = (): SubscriptionPlan[] => {
    // Default: Founder plans
    if (userType === 'founder') {
      return [
        {
          id: "starter",
          name: "Starter",
          price: "₹999",
          period: "monthly",
          description: "Essential tools for early-stage startup founders",
          currentPlan: true,
          founderIdRange: ["FOB-001", "FOB-300"],
          features: [
            { feature: "Create product profile", included: true },
            { feature: "Basic investor matching", included: true },
            { feature: "Community forum access", included: true },
            { feature: "1 investor introduction per month", included: true },
            { feature: "Email support", included: true },
            { feature: "Resource library access", included: true },
            { feature: "Mentorship network", included: false },
            { feature: "Funding readiness assessment", included: false },
            { feature: "Dedicated advisor", included: false },
            { feature: "Premium investor network", included: false },
          ],
        },
        {
          id: "growth",
          name: "Growth",
          price: "₹2,499",
          period: "monthly",
          description: "Advanced features for founders seeking investment",
          founderIdRange: ["FOB-301", "FOB-700"],
          features: [
            { feature: "All Starter features", included: true },
            { feature: "Enhanced product visibility", included: true, highlight: true },
            { feature: "5 investor introductions per month", included: true, highlight: true },
            { feature: "Mentorship network", included: true },
            { feature: "Pitch deck review", included: true },
            { feature: "Funding readiness assessment", included: true },
            { feature: "Priority email & phone support", included: true },
            { feature: "Investor webinars", included: true },
            { feature: "Dedicated advisor", included: false },
            { feature: "Premium investor network", included: false },
          ],
        },
        {
          id: "premium",
          name: "Premium",
          price: "₹5,999",
          period: "monthly",
          description: "Full-service support for serious fundraising",
          founderIdRange: ["FOB-701", "FOB-999"],
          features: [
            { feature: "All Growth features", included: true },
            { feature: "Unlimited investor introductions", included: true, highlight: true },
            { feature: "Dedicated investment advisor", included: true, highlight: true },
            { feature: "Premium investor network", included: true, highlight: true },
            { feature: "Deal negotiation support", included: true },
            { feature: "Due diligence assistance", included: true },
            { feature: "Exclusive investor events", included: true },
            { feature: "Legal document templates", included: true },
            { feature: "Competitor analysis", included: true },
            { feature: "24/7 priority support", included: true },
          ],
        },
      ];
    }
    
    // Investor plans
    else if (userType === 'investor') {
      return [
        {
          id: "basic",
          name: "Basic",
          price: "Free",
          period: "",
          description: "Essential tools for individual investors",
          currentPlan: true,
          investorIdRange: ["INV-001", "INV-300"],
          features: [
            { feature: "Browse startups", included: true },
            { feature: "Basic filtering", included: true },
            { feature: "3 startup connections per month", included: true },
            { feature: "Community forum access", included: true },
            { feature: "Email support", included: true },
            { feature: "Advanced startup filters", included: false },
            { feature: "Deal flow management", included: false },
            { feature: "Due diligence tools", included: false },
            { feature: "Co-investment opportunities", included: false },
          ],
        },
        {
          id: "professional",
          name: "Professional",
          price: "₹3,999",
          period: "monthly",
          description: "Advanced tools for serious investors",
          investorIdRange: ["INV-301", "INV-700"],
          features: [
            { feature: "All Basic features", included: true },
            { feature: "Unlimited startup connections", included: true, highlight: true },
            { feature: "Advanced startup filters", included: true, highlight: true },
            { feature: "Deal flow management", included: true },
            { feature: "Due diligence tools", included: true },
            { feature: "Priority support", included: true },
            { feature: "Early access to new startups", included: true },
            { feature: "Portfolio tracking", included: true },
            { feature: "Co-investment opportunities", included: false },
            { feature: "Dedicated portfolio manager", included: false },
          ],
        },
        {
          id: "institutional",
          name: "Institutional",
          price: "₹8,999",
          period: "monthly",
          description: "Comprehensive solution for investment firms",
          investorIdRange: ["INV-701", "INV-999"],
          features: [
            { feature: "All Professional features", included: true },
            { feature: "Co-investment opportunities", included: true, highlight: true },
            { feature: "Dedicated portfolio manager", included: true, highlight: true },
            { feature: "Custom deal flow", included: true },
            { feature: "Exclusive founder events", included: true },
            { feature: "Multi-user access", included: true },
            { feature: "API access", included: true },
            { feature: "Custom reporting", included: true },
            { feature: "White-glove onboarding", included: true },
            { feature: "Strategic partnerships", included: true },
          ],
        },
      ];
    }
    
    // Organization plans
    else if (userType === 'organization') {
      return [
        {
          id: "corporate",
          name: "Corporate",
          price: "₹4,999",
          period: "monthly",
          description: "Essential tools for corporate innovation",
          currentPlan: true,
          features: [
            { feature: "Startup discovery", included: true },
            { feature: "Innovation database access", included: true },
            { feature: "5 startup connections per month", included: true },
            { feature: "Standard reporting", included: true },
            { feature: "Email & phone support", included: true },
            { feature: "Corporate innovation workshop", included: false },
            { feature: "White-label platform", included: false },
            { feature: "API integration", included: false },
            { feature: "Custom innovation programs", included: false },
          ],
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: "Custom",
          period: "",
          description: "Full-service corporate innovation solution",
          features: [
            { feature: "All Corporate features", included: true },
            { feature: "Unlimited startup connections", included: true, highlight: true },
            { feature: "Corporate innovation workshop", included: true, highlight: true },
            { feature: "White-label platform", included: true },
            { feature: "API integration", included: true },
            { feature: "Custom innovation programs", included: true },
            { feature: "Dedicated innovation manager", included: true },
            { feature: "Quarterly strategy sessions", included: true },
            { feature: "Ecosystem mapping", included: true },
            { feature: "Executive reporting", included: true },
          ],
        },
      ];
    }
    
    // Mentor/Other plans
    else {
      return [
        {
          id: "mentor",
          name: "Mentor",
          price: "Free",
          period: "",
          description: "Platform for experienced mentors to guide startups",
          currentPlan: true,
          features: [
            { feature: "Mentor profile", included: true },
            { feature: "Startup discovery", included: true },
            { feature: "Mentorship requests", included: true },
            { feature: "Community forum access", included: true },
            { feature: "Calendar integration", included: true },
            { feature: "Mentorship tracking", included: true },
            { feature: "Resource library", included: true },
            { feature: "Consultation billing", included: false },
            { feature: "Premium services offering", included: false },
          ],
        },
        {
          id: "mentor-pro",
          name: "Mentor Pro",
          price: "₹1,499",
          period: "monthly",
          description: "Professional tools for mentors offering paid services",
          features: [
            { feature: "All Mentor features", included: true },
            { feature: "Consultation billing", included: true, highlight: true },
            { feature: "Premium services offering", included: true, highlight: true },
            { feature: "Priority listing in search", included: true },
            { feature: "Verified badge", included: true },
            { feature: "Analytics dashboard", included: true },
            { feature: "Client management", included: true },
            { feature: "Custom availability", included: true },
            { feature: "Marketing tools", included: true },
            { feature: "Advanced calendar integration", included: true },
          ],
        },
      ];
    }
  };
  
  const plans = getSubscriptionPlans();
  const userId = getUserId();
  
  // Find current plan based on user ID
  const getCurrentPlan = () => {
    if (!userId) return plans[0]; // Default to first plan
    
    // For founders
    if (userType === 'founder') {
      return plans.find(plan => {
        if (!plan.founderIdRange) return false;
        const [minId, maxId] = plan.founderIdRange;
        return userId >= minId && userId <= maxId;
      }) || plans[0];
    }
    
    // For investors
    if (userType === 'investor') {
      return plans.find(plan => {
        if (!plan.investorIdRange) return false;
        const [minId, maxId] = plan.investorIdRange;
        return userId >= minId && userId <= maxId;
      }) || plans[0];
    }
    
    // Default for other user types
    return plans[0];
  };
  
  const currentPlan = getCurrentPlan();
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setOpenDialog(true);
  };
  
  const handleSubscribe = () => {
    if (!selectedPlan) return;
    
    // Close dialog
    setOpenDialog(false);
    
    // Show success toast
    toast({
      title: "Subscription Updated",
      description: `You have successfully subscribed to the ${selectedPlan.name} plan.`,
      duration: 5000,
    });
    
    // Could redirect to dashboard or confirmation page
    setTimeout(() => {
      // Optional: Redirect to dashboard
      // navigate("/dashboard");
    }, 1500);
  };
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-gray-600 mb-2">
          Choose the plan that best fits your needs. Upgrade anytime to access more features.
        </p>
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <FaCrown className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Your {userType.charAt(0).toUpperCase() + userType.slice(1)} ID: <span className="font-bold">{userId}</span></p>
            <p className="text-sm text-gray-600">Current Plan: <span className="font-semibold">{currentPlan.name}</span></p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id;
          return (
            <Card key={plan.id} className={`flex flex-col h-full ${isCurrentPlan ? 'border-primary shadow-md' : ''}`}>
              {isCurrentPlan && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Current Plan
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  {plan.id === "premium" || plan.id === "institutional" && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <FaStar className="mr-1 h-3 w-3" /> Popular
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500 ml-1">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <h4 className="font-medium text-sm mb-3">Includes:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li 
                      key={idx} 
                      className={`flex items-start ${!feature.included ? 'text-gray-400' : ''} ${feature.highlight ? 'font-medium' : ''}`}
                    >
                      {feature.included ? (
                        <FaCheck className={`h-4 w-4 mr-2 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-green-500'}`} />
                      ) : (
                        <span className="h-4 w-4 mr-2 mt-0.5 flex justify-center text-gray-300">-</span>
                      )}
                      <span className={`text-sm ${feature.highlight ? 'text-primary' : ''}`}>{feature.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={isCurrentPlan ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Please select your preferred payment method to complete your subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="net_banking">Net Banking</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-3 border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Billing</span>
                <span className="font-medium">{selectedPlan?.period ? `${selectedPlan.period}` : 'One-time'}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Total</span>
                <span>{selectedPlan?.price} {selectedPlan?.period ? `/ ${selectedPlan.period}` : ''}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubscribe} className="gap-1">
              Subscribe <FaArrowRight className="h-3 w-3" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}