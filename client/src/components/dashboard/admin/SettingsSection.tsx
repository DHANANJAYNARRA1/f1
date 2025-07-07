import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { socket } from '@/socket';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function SettingsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminData, setAdminData] = useState({ username: '', email: '', password: '' });
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskData, setTaskData] = useState({ adminId: '', type: '', targetId: '', details: '' });

  // Fetch only admin users
  const { data: admins = [], refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; users: any[] }>('GET', '/api/users');
      return response.users.filter((u: any) => u.role === 'admin');
    },
  });

  useEffect(() => {
    function handleAdminCreated(data: any) {
      toast({ title: 'Admin Created', description: 'A new admin has been created successfully.' });
      refetch();
    }
    function handleTaskAssigned(data: any) {
      toast({ title: 'Task Assigned', description: 'Task assigned to admin successfully.' });
    }
    function handleError(data: any) {
      toast({ title: 'Error', description: data.message || 'Operation failed.', variant: 'destructive' });
    }
    socket.on('adminCreated', handleAdminCreated);
    socket.on('taskAssigned', handleTaskAssigned);
    socket.on('error', handleError);
    return () => {
      socket.off('adminCreated', handleAdminCreated);
      socket.off('taskAssigned', handleTaskAssigned);
      socket.off('error', handleError);
    };
  }, [toast, refetch]);

  const handleCredentialUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || undefined,
          currentPassword,
          newPassword: newPassword || undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin credentials updated successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setUsername("");
      } else {
        throw new Error("Failed to update credentials");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin credentials",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('createAdmin', adminData);
    setShowCreateAdmin(false);
    setAdminData({ username: '', email: '', password: '' });
  };
  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('assignTask', taskData);
    setShowAssignTask(false);
    setTaskData({ adminId: '', type: '', targetId: '', details: '' });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>
      <form onSubmit={handleCredentialUpdate} className="space-y-4">
        <div>
          <label className="text-sm font-medium">New Username (optional)</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">New Password (optional)</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <Button type="submit">Update Credentials</Button>
      </form>
      <div>
        <h2 className="text-xl font-bold mb-4">Admin Creation & Task Assignment</h2>
        <Button onClick={() => setShowCreateAdmin(true)} className="mb-4">Create Admin</Button>
        {showCreateAdmin && (
          <form onSubmit={handleCreateAdmin} className="space-y-4 p-4 border rounded bg-white max-w-md">
            <h3 className="font-semibold text-lg mb-2">Create New Admin</h3>
            <Input name="username" placeholder="Username" value={adminData.username} onChange={handleInputChange} required />
            <Input name="email" type="email" placeholder="Email" value={adminData.email} onChange={handleInputChange} required />
            <Input name="password" type="password" placeholder="Password" value={adminData.password} onChange={handleInputChange} required />
            <div className="flex space-x-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateAdmin(false)}>Cancel</Button>
            </div>
          </form>
        )}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Admin Users</h3>
          <ul className="list-disc pl-6">
            {admins && admins.length > 0 ? admins.map((admin: any) => (
              <li key={admin._id}>{admin.username} ({admin.email})</li>
            )) : <li>No admins found.</li>}
          </ul>
        </div>
        <Button onClick={() => setShowAssignTask(true)} className="mb-4 ml-4">Assign Task</Button>
        {showAssignTask && (
          <form onSubmit={handleAssignTask} className="space-y-4 p-4 border rounded bg-white max-w-md">
            <h3 className="font-semibold text-lg mb-2">Assign Task to Admin</h3>
            <Input name="adminId" placeholder="Admin ID" value={taskData.adminId} onChange={handleTaskInputChange} required />
            <Input name="type" placeholder="Task Type" value={taskData.type} onChange={handleTaskInputChange} required />
            <Input name="targetId" placeholder="Target ID" value={taskData.targetId} onChange={handleTaskInputChange} />
            <Input name="details" placeholder="Details" value={taskData.details} onChange={handleTaskInputChange} />
            <div className="flex space-x-2">
              <Button type="submit">Assign</Button>
              <Button type="button" variant="outline" onClick={() => setShowAssignTask(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}