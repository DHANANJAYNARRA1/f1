import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  _id: string;
  name: string;
  email: string;
  uniqueId: string;
  active: boolean;
  permissions: string[];
  role: string;
  isAdmin: boolean;
}

interface AdminsResponse {
  success: boolean;
  admins: Admin[];
}

interface AdminManagementSectionProps {
  hideStatus?: boolean;
}

export default function AdminManagementSection({ hideStatus }: AdminManagementSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminData, setAdminData] = useState({ name: '', email: '', password: '', permissions: '' });
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editFields, setEditFields] = useState<{ name: string; email: string; permissions: string }>({ name: '', email: '', permissions: '' });
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskData, setTaskData] = useState({ adminId: '', type: '', targetId: '', details: '' });

  const { data, isLoading, refetch } = useQuery<AdminsResponse>({
    queryKey: ['admins'],
    queryFn: async () => apiRequest('GET', '/api/superadmin/admins'),
  });

  const createAdmin = useMutation({
    mutationFn: async (admin: { name: string; email: string; password: string; permissions: string[] }) => 
      apiRequest('POST', '/api/superadmin/admins', admin),
    onSuccess: () => {
      toast({ title: 'Admin created successfully' });
      setShowCreateAdmin(false);
      setAdminData({ name: '', email: '', password: '', permissions: '' });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err: any) => toast({ 
      title: 'Error creating admin', 
      description: err.message || 'Failed to create admin', 
      variant: 'destructive' 
    }),
  });

  const updateAdmin = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => 
      apiRequest('PATCH', `/api/superadmin/admins/${id}`, updates),
    onSuccess: () => {
      toast({ title: 'Admin updated successfully' });
      setEditingAdmin(null);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err: any) => toast({ 
      title: 'Error updating admin', 
      description: err.message || 'Failed to update admin', 
      variant: 'destructive' 
    }),
  });

  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => apiRequest('DELETE', `/api/superadmin/admins/${id}`),
    onSuccess: () => {
      toast({ title: 'Admin deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err: any) => toast({ 
      title: 'Error deleting admin', 
      description: err.message || 'Failed to delete admin', 
      variant: 'destructive' 
    }),
  });

  const assignTask = useMutation({
    mutationFn: async (task: { adminId: string; type: string; targetId: string; details: string }) => 
      apiRequest('POST', '/api/admin/assign-task', task),
    onSuccess: () => {
      toast({ title: 'Task assigned successfully' });
      setShowAssignTask(false);
      setTaskData({ adminId: '', type: '', targetId: '', details: '' });
    },
    onError: (err: any) => toast({ 
      title: 'Error assigning task', 
      description: err.message || 'Failed to assign task', 
      variant: 'destructive' 
    }),
  });

  const admins = data?.admins || [];

  const handleCreateAdmin = () => {
    if (!adminData.name || !adminData.email || !adminData.password) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    const permissions = adminData.permissions
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    createAdmin.mutate({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      permissions
    });
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;

    const permissions = editFields.permissions
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    updateAdmin.mutate({
      id: editingAdmin._id,
      updates: {
        name: editFields.name,
        email: editFields.email,
        permissions
      }
    });
  };

  const handleAssignTask = () => {
    if (!taskData.type || !taskData.details) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in task type and details', 
        variant: 'destructive' 
      });
      return;
    }

    assignTask.mutate(taskData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <Button onClick={() => setShowCreateAdmin(true)}>Create Admin</Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Unique ID</TableHead>
              { !hideStatus && <TableHead>Status</TableHead> }
              <TableHead>Permissions</TableHead>
              <TableHead>Assign Task</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.uniqueId}</TableCell>
                { !hideStatus && (
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${admin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{admin.active ? 'Active' : 'Inactive'}</span>
                  </TableCell>
                )}
                <TableCell>
                  <span className="text-sm text-gray-600">{Array.isArray(admin.permissions) ? admin.permissions.join(', ') : 'No permissions'}</span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => { setShowAssignTask(true); setTaskData({ adminId: admin._id, type: '', targetId: '', details: '' }); }} className="text-black">Assign Task</Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingAdmin(admin); setEditFields({ name: admin.name, email: admin.email, permissions: Array.isArray(admin.permissions) ? admin.permissions.join(',') : '' }); }} className="text-black">Edit</Button>
                    { !hideStatus && (
                      <Button size="sm" variant={admin.active ? 'destructive' : 'default'} onClick={() => updateAdmin.mutate({ id: admin._id, updates: { active: !admin.active } })} className="text-black">{admin.active ? 'Deactivate' : 'Activate'}</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteAdmin.mutate(admin._id)} className="text-black">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Full Name" 
              value={adminData.name} 
              onChange={e => setAdminData({ ...adminData, name: e.target.value })} 
              required 
            />
            <Input 
              type="email" 
              placeholder="Email" 
              value={adminData.email} 
              onChange={e => setAdminData({ ...adminData, email: e.target.value })} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={adminData.password} 
              onChange={e => setAdminData({ ...adminData, password: e.target.value })} 
              required 
            />
            <Input 
              placeholder="Permissions (comma separated)" 
              value={adminData.permissions} 
              onChange={e => setAdminData({ ...adminData, permissions: e.target.value })} 
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateAdmin} 
              disabled={createAdmin.isPending}
            >
              {createAdmin.isPending ? 'Creating...' : 'Create Admin'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateAdmin(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={v => { if (!v) setEditingAdmin(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Name" 
              value={editFields.name} 
              onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))} 
            />
            <Input 
              placeholder="Email" 
              value={editFields.email} 
              onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))} 
            />
            <Input 
              placeholder="Permissions (comma separated)" 
              value={editFields.permissions} 
              onChange={e => setEditFields(f => ({ ...f, permissions: e.target.value }))} 
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleUpdateAdmin} 
              disabled={updateAdmin.isPending}
            >
              {updateAdmin.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setEditingAdmin(null)}
            >
              Cancel
            </Button>
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
            <Input 
              placeholder="Task Type (e.g., review, approve, contact)" 
              value={taskData.type} 
              onChange={e => setTaskData({ ...taskData, type: e.target.value })} 
              required 
            />
            <Input 
              placeholder="Target ID (optional)" 
              value={taskData.targetId} 
              onChange={e => setTaskData({ ...taskData, targetId: e.target.value })} 
            />
            <Input 
              placeholder="Task Details" 
              value={taskData.details} 
              onChange={e => setTaskData({ ...taskData, details: e.target.value })} 
              required 
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAssignTask} 
              disabled={assignTask.isPending}
            >
              {assignTask.isPending ? 'Assigning...' : 'Assign Task'}
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