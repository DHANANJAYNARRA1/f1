import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, BarChart4 } from "lucide-react";
import CommunicationRequest from "@/components/communication/CommunicationRequest";
import { apiRequest } from "@/lib/queryClient";

interface Investor {
  id: string;
  name: string;
  userType: string;
  investmentRange?: string;
  preferredIndustries?: string;
  biography?: string;
  profileComplete?: boolean;
  connectionsAvailable?: boolean;
}

// Function to display investment range in a readable format
const formatInvestmentRange = (range?: string) => {
  if (!range) return "Not specified";
  
  switch (range) {
    case "under50k": return "Under $50K";
    case "50k-100k": return "$50K - $100K";
    case "100k-500k": return "$100K - $500K";
    case "500k-1m": return "$500K - $1M";
    case "1m-5m": return "$1M - $5M";
    case "over5m": return "Over $5M";
    default: return range;
  }
};

export default function InvestorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [investmentRangeFilter, setInvestmentRangeFilter] = useState("all");
  
  // Fetch investors data
  const { data: investors, isLoading, error } = useQuery<Investor[]>({
    queryKey: ["/api/investors"],
    queryFn: async () => {
      return await apiRequest<Investor[]>("GET", "/api/investors");
    },
  });
  
  // Apply filters to investors list
  const filteredInvestors = investors?.filter(investor => {
    // Search query filter
    const matchesSearch = searchQuery 
      ? investor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (investor.preferredIndustries?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    // Industry filter
    const matchesIndustry = industryFilter === "all" 
      ? true 
      : investor.preferredIndustries?.toLowerCase().includes(industryFilter.toLowerCase());
    
    // Investment range filter
    const matchesRange = investmentRangeFilter === "all" 
      ? true 
      : investor.investmentRange === investmentRangeFilter;
    
    return matchesSearch && matchesIndustry && matchesRange;
  });
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setIndustryFilter("all");
    setInvestmentRangeFilter("all");
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">Failed to load investors data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>Potential Investors</div>
          <Badge variant="outline" className="text-xs">
            <BarChart4 className="h-3 w-3 mr-1" />
            {filteredInvestors?.length || 0} investors
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect with investors interested in your industry
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or industry..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select
              value={industryFilter}
              onValueChange={setIndustryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="agritech">AgriTech</SelectItem>
                <SelectItem value="healthtech">HealthTech</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="edutech">EduTech</SelectItem>
                <SelectItem value="medtech">MedTech</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={investmentRangeFilter}
              onValueChange={setInvestmentRangeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <BarChart4 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Investment Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Range</SelectItem>
                <SelectItem value="under50k">Under $50K</SelectItem>
                <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                <SelectItem value="over5m">Over $5M</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={resetFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Investors Grid */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Investors</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-2">
            {filteredInvestors && filteredInvestors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvestors.map((investor) => (
                  <Card key={investor.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{investor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{investor.name}</CardTitle>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                              Investor
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Investment Range:</span>{" "}
                          {formatInvestmentRange(investor.investmentRange)}
                        </div>
                        
                        {investor.preferredIndustries && (
                          <div>
                            <span className="font-medium">Preferred Industries:</span>{" "}
                            {investor.preferredIndustries}
                          </div>
                        )}
                        
                        {investor.biography && (
                          <div className="mt-2">
                            <p className="line-clamp-2 text-gray-600">
                              {investor.biography}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-4 pb-4">
                      <CommunicationRequest
                        targetUserId={investor.id}
                        targetName={investor.name}
                        targetType="investor"
                        buttonLabel="Request Connection"
                        buttonVariant="default"
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || industryFilter !== "all" || investmentRangeFilter !== "all" ? (
                  <div>
                    <p>No investors match your filters</p>
                    <Button variant="link" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  </div>
                ) : (
                  <p>No investors available at this time</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-2">
            <div className="text-center py-12 text-gray-500">
              <p>Personalized investor recommendations coming soon</p>
              <p className="text-sm mt-2">We're analyzing your profile to find the perfect matches</p>
            </div>
          </TabsContent>
          
          <TabsContent value="connected" className="mt-2">
            <div className="text-center py-12 text-gray-500">
              <p>You haven't connected with any investors yet</p>
              <p className="text-sm mt-2">When admins approve your connection requests, they'll appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}