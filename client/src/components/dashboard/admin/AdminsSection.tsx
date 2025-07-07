import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaSync, FaUserPlus, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { socket } from "@/socket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const { toast } = useToast();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ 
    name: '', 
    email: '', 
    password: '',
    permissions: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskData, setTaskData] = useState({ adminId: '', type: '', targetId: '', details: '' });

  // Available permissions
  const availablePermissions = [
    'products', 'interests', 'users', 'analytics', 
    'service-requests', 'zoom-calls', 'settings'
  ];

  const {
    data: adminsResponse,
    isLoading: isLoadingAdmins,
    refetch: refetchAdmins,
  } = useQuery<{ success: boolean; admins: any[] }>({
    queryKey: ["/api/superadmin/admins"],
    queryFn: async () => {
      const res = await fetch("/api/superadmin/admins", {
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Socket.io real-time listeners
  useEffect(() => {
    // Join superadmin room for real-time updates
    socket.emit('join', { role: 'superadmin' });

    // Listen for admin creation events
    socket.on('adminCreated', (data) => {
      toast({
        title: "Admin Created",
        description: `New admin ${data.admin.name} has been created successfully.`,
      });
      refetchAdmins(); // Refresh the admin list
    });

    // Listen for admin updates
    socket.on('adminUpdated', (data) => {
      toast({
        title: "Admin Updated",
        description: `Admin ${data.admin.name} has been updated.`,
      });
      refetchAdmins();
    });

    // Listen for admin deletion
    socket.on('adminDeleted', (data) => {
      toast({
        title: "Admin Deleted",
        description: `Admin has been deleted successfully.`,
      });
      refetchAdmins();
    });

    // Listen for errors
    socket.on('error', (data) => {
      toast({
        title: "Error",
        description: data.message || "An error occurred",
        variant: "destructive",
      });
    });

    return () => {
      socket.off('adminCreated');
      socket.off('adminUpdated');
      socket.off('adminDeleted');
      socket.off('error');
    };
  }, [toast, refetchAdmins]);

  const handleRefresh = () => {
    refetchAdmins();
    toast({
      title: "Data Refreshed",
      description: "Admin information has been updated.",
    });
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      setLoading(true);
      await apiRequest("DELETE", `/api/superadmin/admins/${adminId}`);
      
      // Emit real-time event
      socket.emit('adminDeleted', { adminId });
      
      toast({
        title: "Admin Deleted",
        description: "Admin has been successfully deleted.",
      });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  function handleContactAdmin(admin: any) {
    window.open(`mailto:${admin.email}?subject=Hello from Superadmin`, "_blank");
  }

  const admins = adminsResponse?.success && Array.isArray(adminsResponse.admins)
    ? adminsResponse.admins
    : [];

  const filteredAdmins = admins.filter((admin) =>
    (admin.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.uniqueId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await apiRequest<{ success: boolean; admin: any; message?: string }>('POST', '/api/superadmin/admins', newAdmin);
      
      if (data.success) {
        // Emit real-time event
        socket.emit('adminCreated', { admin: data.admin });
        
        setShowCreateAdmin(false);
        setNewAdmin({ name: '', email: '', password: '', permissions: [] });
        
        toast({ 
          title: 'Admin Created', 
          description: 'A new admin has been created successfully.' 
        });
      } else {
        throw new Error(data.message || 'Failed to create admin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleAssignTask = async () => {
    if (!taskData.type || !taskData.details) {
      toast({
        title: "Validation Error",
        description: "Please fill in task type and details",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiRequest('POST', '/api/admin/assign-task', taskData);
      
      toast({
        title: "Task Assigned",
        description: "Task has been successfully assigned to the admin.",
      });
      
      setShowAssignTask(false);
      setTaskData({ adminId: '', type: '', targetId: '', details: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-black"
          >
            <FaSync className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FaUserPlus className="h-4 w-4" />
            {showCreateAdmin ? 'Cancel' : 'Create Admin'}
          </Button>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    required
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    required
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  placeholder="Enter password"
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newAdmin.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionChange(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm capitalize">
                        {permission.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Admin'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateAdmin(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search admins by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Admins ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Unique ID</th>
                  <th className="text-left p-2">Permissions</th>
                  <th className="text-left p-2">Assign Task</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAdmins ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">Loading admins...</td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">No admins found</td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{admin.name}</td>
                      <td className="p-2 text-gray-600">{admin.email}</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="font-mono">
                          {admin.uniqueId}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {(admin.permissions || []).map((perm: string) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { 
                            setShowAssignTask(true); 
                            setTaskData({ 
                              adminId: admin._id, 
                              type: '', 
                              targetId: '', 
                              details: '' 
                            }); 
                          }}
                        >
                          Assign Task
                        </Button>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedAdmin(admin); setAdminDialogOpen(true); }}
                            className="text-black"
                          >
                            <FaEye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactAdmin(admin)}
                          >
                            Contact
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Details Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium">{selectedAdmin.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-gray-600">{selectedAdmin.email}</p>
              </div>
              <div>
                <Label>Unique ID</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedAdmin.uniqueId}
                </p>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedAdmin.permissions || []).map((perm: string) => (
                    <Badge key={perm} variant="outline">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setAdminDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignTask} onOpenChange={setShowAssignTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task to Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Type</Label>
              <Input 
                placeholder="e.g., review, approve, contact" 
                value={taskData.type} 
                onChange={e => setTaskData({ ...taskData, type: e.target.value })} 
                required 
              />
            </div>
            <div>
              <Label>Target ID (optional)</Label>
              <Input 
                placeholder="Target user or product ID" 
                value={taskData.targetId} 
                onChange={e => setTaskData({ ...taskData, targetId: e.target.value })} 
              />
            </div>
            <div>
              <Label>Task Details</Label>
              <Input 
                placeholder="Detailed description of the task" 
                value={taskData.details} 
                onChange={e => setTaskData({ ...taskData, details: e.target.value })} 
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAssignTask} 
              disabled={loading}
            >
              {loading ? 'Assigning...' : 'Assign Task'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignTask(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 