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
import { Loader2, Search, Filter, Users, Briefcase, FileText } from "lucide-react";
import CommunicationRequest from "@/components/communication/CommunicationRequest";
import { apiRequest } from "@/lib/queryClient";

interface FounderProject {
  id: string;
  founderId: string;
  founderName: string;
  projectName: string;
  industry: string;
  stage: string;
  fundingNeeded: string;
  description: string;
  approved: boolean;
  createdAt: string;
}

// Format the funding range into readable text
const formatFundingNeeded = (funding: string) => {
  switch(funding) {
    case "none": return "Not seeking funding";
    case "under100k": return "Under $100K";
    case "100k-500k": return "$100K - $500K";
    case "500k-1m": return "$500K - $1M";
    case "1m-5m": return "$1M - $5M";
    case "over5m": return "Over $5M";
    default: return funding;
  }
};

// Format the stage into readable text
const formatStage = (stage: string) => {
  switch(stage) {
    case "ideation": return "Ideation";
    case "prototype": return "Prototype";
    case "mvp": return "MVP";
    case "growth": return "Growth";
    case "scaling": return "Scaling";
    default: return stage;
  }
};

// Get industry badge color
const getIndustryColor = (industry: string) => {
  switch(industry.toLowerCase()) {
    case "agritech":
      return "bg-green-50 text-green-700 border-green-200";
    case "healthtech":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "fintech":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "edutech":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "medtech":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function FounderProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");
  
  // Fetch founder projects
  const { data: projects, isLoading, error } = useQuery<FounderProject[]>({
    queryKey: ["/api/founder-projects/approved"],
    queryFn: async () => {
      return await apiRequest("GET", "/api/founder-projects/approved");
    },
  });
  
  // Apply filters to projects list
  const filteredProjects = projects?.filter(project => {
    // Search query filter (search by project name, founder name, or description)
    const matchesSearch = searchQuery 
      ? project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.founderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Industry filter
    const matchesIndustry = industryFilter === "all" 
      ? true 
      : project.industry.toLowerCase() === industryFilter.toLowerCase();
    
    // Stage filter
    const matchesStage = stageFilter === "all"
      ? true
      : project.stage === stageFilter;
    
    // Funding filter
    const matchesFunding = fundingFilter === "all"
      ? true
      : project.fundingNeeded === fundingFilter;
    
    return matchesSearch && matchesIndustry && matchesStage && matchesFunding;
  });
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setIndustryFilter("all");
    setStageFilter("all");
    setFundingFilter("all");
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
          <p className="text-red-500">Failed to load founder projects</p>
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
          <div>Founder Projects</div>
          <Badge variant="outline" className="text-xs">
            <Briefcase className="h-3 w-3 mr-1" />
            {filteredProjects?.length || 0} projects
          </Badge>
        </CardTitle>
        <CardDescription>
          Discover promising startup projects looking for investment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search projects or founders..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <Select
              value={industryFilter}
              onValueChange={setIndustryFilter}
            >
              <SelectTrigger className="w-[140px] text-xs">
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
              value={stageFilter}
              onValueChange={setStageFilter}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <FileText className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="ideation">Ideation</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
                <SelectItem value="mvp">MVP</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={fundingFilter}
              onValueChange={setFundingFilter}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Funding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Funding</SelectItem>
                <SelectItem value="under100k">Under $100K</SelectItem>
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
        
        {/* Projects Grid */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-2">
            {filteredProjects && filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{project.projectName}</CardTitle>
                          <Badge variant="outline" className={getIndustryColor(project.industry)}>
                            {project.industry}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{project.founderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-gray-600">{project.founderName}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Stage:</span>{" "}
                            {formatStage(project.stage)}
                          </div>
                          
                          <div>
                            <span className="font-medium">Funding:</span>{" "}
                            {formatFundingNeeded(project.fundingNeeded)}
                          </div>
                        </div>
                        
                        <div>
                          <p className="line-clamp-3 text-gray-600">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-between items-center">
                        <CommunicationRequest
                          targetUserId={project.founderId}
                          targetName={project.founderName}
                          targetType="founder"
                          buttonLabel="Connect with Founder"
                          buttonVariant="default"
                        />
                        
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || industryFilter !== "all" || stageFilter !== "all" || fundingFilter !== "all" ? (
                  <div>
                    <p>No projects match your filters</p>
                    <Button variant="link" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  </div>
                ) : (
                  <p>No founder projects available at this time</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-2">
            <div className="text-center py-12 text-gray-500">
              <p>Recent projects will appear here</p>
              <p className="text-sm mt-2">We're working on bringing you the latest projects</p>
            </div>
          </TabsContent>
          
          <TabsContent value="connected" className="mt-2">
            <div className="text-center py-12 text-gray-500">
              <p>You haven't connected with any projects yet</p>
              <p className="text-sm mt-2">When admins approve your connection requests, the projects will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}