import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash, Check, X, DollarSign, Activity, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for subscription plans
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  currency: string;
  description: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxConnections: number;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  churnRate: number;
}

export default function SubscriptionPlansSection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  
  // Form state for editing or creating plans
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: "",
    price: 0,
    billingInterval: "monthly",
    currency: "USD",
    description: "",
    features: [],
    isActive: true,
    isPopular: false,
    maxConnections: 10
  });
  
  // Optimized query with loading speed improvements
  const { data: plans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/subscription-plans'],
    staleTime: 60000, // 1 minute cache
  });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery<SubscriptionStats>({
    queryKey: ['/api/admin/subscription-stats'],
    staleTime: 60000, // 1 minute cache
  });

  // Create or update plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (data: Partial<SubscriptionPlan>) => {
      const isEditing = !!data.id;
      const url = isEditing 
        ? `/api/admin/subscription-plans/${data.id}` 
        : '/api/admin/subscription-plans';
      const method = isEditing ? 'PATCH' : 'POST';
      const response = await apiRequest<{ success: boolean; message?: string }>(method, url, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to save plan");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-stats'] });
      setEditDialogOpen(false);
      toast({
        title: "Success!",
        description: currentPlan ? "Plan updated successfully" : "New plan created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save plan",
        description: error.message || "An error occurred while saving the plan",
        variant: "destructive",
      });
    }
  });

  // Toggle plan status mutation
  const togglePlanStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const response = await apiRequest<{ success: boolean; message?: string }>('PATCH', `/api/admin/subscription-plans/${id}/status`, { isActive });
      if (!response.success) {
        throw new Error(response.message || "Failed to update plan status");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Plan status updated",
        description: "The plan's active status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred while updating the plan status",
        variant: "destructive",
      });
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest<{ success: boolean; message?: string }>('DELETE', `/api/admin/subscription-plans/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete plan");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Plan deleted",
        description: "The subscription plan has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete plan",
        description: error.message || "An error occurred while deleting the plan",
        variant: "destructive",
      });
    }
  });

  // Handle opening edit dialog for a plan
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setFormData({ ...plan });
    setEditDialogOpen(true);
  };

  // Handle creating a new plan
  const handleNewPlan = () => {
    setCurrentPlan(null);
    setFormData({
      name: "",
      price: 0,
      billingInterval: "monthly",
      currency: "USD",
      description: "",
      features: [],
      isActive: true,
      isPopular: false,
      maxConnections: 10
    });
    setEditDialogOpen(true);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox/switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle adding a feature
  const handleAddFeature = () => {
    if (featureInput.trim() && formData.features) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput("");
    }
  };

  // Handle removing a feature
  const handleRemoveFeature = (index: number) => {
    if (formData.features) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePlanMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="plans">Plans Management</TabsTrigger>
            <TabsTrigger value="stats">Subscription Analytics</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleNewPlan}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
        
        <TabsContent value="plans" className="mt-4">
          {isLoadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className={`overflow-hidden shadow-md ${plan.isPopular ? 'border-blue-400 border-2' : 'border-0'}`}>
                  {plan.isPopular && (
                    <div className="bg-blue-500 text-white text-xs font-bold py-1 text-center">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{plan.name}</CardTitle>
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={(checked) => togglePlanStatusMutation.mutate({ id: plan.id, isActive: checked })}
                      />
                    </div>
                    <CardDescription>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-sm text-gray-500 ml-1">/{plan.billingInterval}</span>
                      </div>
                      {!plan.isActive && (
                        <Badge className="mt-1 bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3 text-gray-600">{plan.description}</p>
                    <div className="text-sm space-y-2">
                      <div className="font-medium text-gray-700">Features:</div>
                      <ul className="space-y-1 pl-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Max Connections:</span> {plan.maxConnections}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 pt-3 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deletePlanMutation.mutate(plan.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">No subscription plans yet</h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  Create your first subscription plan to start offering premium features to your users.
                </p>
                <Button onClick={handleNewPlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          {isLoadingStats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Total Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold">{stats.totalSubscribers}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Active Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-2xl font-bold">{stats.activeSubscribers}</span>
                    <Badge className="ml-2 bg-gray-100 text-gray-700">
                      {((stats.activeSubscribers / stats.totalSubscribers) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add more complex analytics here like graphs and charts */}
            </div>
          ) : (
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">No subscription data available</h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  Subscription analytics will be available once you have active subscribers.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit/Create Plan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}</DialogTitle>
            <DialogDescription>
              {currentPlan 
                ? "Update the details of your subscription plan." 
                : "Configure the details of your new subscription plan."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="pl-7"
                  />
                  <span className="absolute left-2 top-2 text-gray-500">$</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingInterval">Billing Interval</Label>
                <select 
                  id="billingInterval" 
                  name="billingInterval" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  value={formData.billingInterval} 
                  onChange={handleInputChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxConnections">Max Connections</Label>
                <Input 
                  id="maxConnections" 
                  name="maxConnections" 
                  type="number" 
                  min="1" 
                  required 
                  value={formData.maxConnections} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                value={formData.description} 
                onChange={handleInputChange}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add a feature..." 
                  value={featureInput} 
                  onChange={(e) => setFeatureInput(e.target.value)}
                />
                <Button type="button" onClick={handleAddFeature}>Add</Button>
              </div>
              
              <div className="mt-2 space-y-1">
                {formData.features && formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveFeature(index)} 
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.features || formData.features.length === 0) && (
                  <div className="text-sm text-gray-500 py-2">No features added yet</div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} 
                />
                <Label htmlFor="isActive">Plan is active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isPopular" 
                  checked={formData.isPopular} 
                  onCheckedChange={(checked) => handleSwitchChange('isPopular', checked)} 
                />
                <Label htmlFor="isPopular">Mark as popular</Label>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={savePlanMutation.isPending}>
                {savePlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {currentPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}