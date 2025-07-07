import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, User, LogOut, Briefcase, LineChart, 
  UserCog, Crown, School
} from "lucide-react";

export default function ProfileMenu() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  if (!user) return null;
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get background color based on user type - using black for all user types as requested
  const getAvatarColor = () => {
    return "bg-black text-white"; // Use black color with white text for all profile icons
  };
  
  // Get user type badge
  const getUserTypeBadge = () => {
    switch(user.userType) {
      case 'founder':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Briefcase className="h-3 w-3 mr-1" />
            Founder
          </Badge>
        );
      case 'investor':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <LineChart className="h-3 w-3 mr-1" />
            Investor
          </Badge>
        );
      case 'organization':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <UserCog className="h-3 w-3 mr-1" />
            Organization
          </Badge>
        );
      case 'other':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <School className="h-3 w-3 mr-1" />
            Mentor
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Get user dashboard link
  const getDashboardLink = () => {
  if (user.isAdmin) return "/superadmin";
  switch(user.userType) {
    case 'founder':
      return "/founder-dashboard";
    case 'investor':
      return "/investor-dashboard";
    default:
      return "/dashboard";
  }
};
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full px-3 py-2 flex items-center gap-2">
          <Avatar className={`h-9 w-9 ${getAvatarColor()}`}>
            <AvatarFallback className="text-white font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex items-center gap-1.5">
            <User className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm">{user.name}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.username}</p>
            <div className="mt-1">
              {getUserTypeBadge()}
              {user.isAdmin && (
                <Badge className="ml-1 bg-red-100 text-red-800 border-red-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => user.isAdmin ? navigate('/admin') : user.userType === 'founder' ? navigate('/founder-dashboard') : navigate(getDashboardLink())}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => user.isAdmin ? navigate('/admin') : user.userType === 'founder' ? navigate('/founder-dashboard') : navigate(`${getDashboardLink()}?section=profile`)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}