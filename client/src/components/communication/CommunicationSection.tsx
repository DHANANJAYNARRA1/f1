import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunicationRequestList from "./CommunicationRequestList";
import CommunicationRequest from "./CommunicationRequest";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetchUsers = async (): Promise<User[]> => {
  const data = await apiRequest<{users: User[]}>("GET", "/api/users");
  return data.users;
};

export default function CommunicationSection() {
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="requests">My Requests</TabsTrigger>
        <TabsTrigger value="new">New Request</TabsTrigger>
      </TabsList>
      <TabsContent value="requests">
        <CommunicationRequestList />
      </TabsContent>
      <TabsContent value="new">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select a user to communicate with</h3>
          <Select onValueChange={(userId) => setSelectedUser(users?.find(u => u.id === userId) || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name} ({user.userType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUser && (
            <CommunicationRequest
              targetUserId={selectedUser.id.toString()}
              targetName={selectedUser.name}
              targetType={selectedUser.userType as "founder" | "investor"}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}