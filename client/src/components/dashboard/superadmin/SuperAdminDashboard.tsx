import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminSidebar from './SuperAdminSidebar';
import { socket } from '@/socket';
import UsersSection from '../admin/UsersSection';
import AdminsSection from '../admin/AdminsSection';
import AdminManagementSection from '../admin/AdminManagementSection';

interface ProductRequest {
  _id: string;
  userName: string;
  productId: string;
  userType: string;
  uniqueId?: string;
}

interface AdminAction {
  _id: string;
  adminId: { username: string; email: string } | string;
  actionType: string;
  details?: string;
  timestamp: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [user, setUser] = useState<any>(null);
  const [location, navigate] = useLocation();

  // Admin management state
  const [admins, setAdmins] = useState([
    { id: '1', name: 'Alice Admin', email: 'alice@admin.com', permissions: ['products', 'interests'], active: true },
    { id: '2', name: 'Bob Admin', email: 'bob@admin.com', permissions: ['interests'], active: false },
  ]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', permissions: [] as string[] });

  const [activeSection, setActiveSection] = useState<string>('users');

  // Zoom scheduling state
  const [zoomTopic, setZoomTopic] = useState('');
  const [zoomDate, setZoomDate] = useState('');
  const [zoomTime, setZoomTime] = useState('');
  const [zoomDuration, setZoomDuration] = useState(30);
  const [zoomTargetType, setZoomTargetType] = useState('founder');
  const [zoomTargetId, setZoomTargetId] = useState('');
  const [zoomStatus, setZoomStatus] = useState('');

  // Action log state
  const [actions, setActions] = useState<AdminAction[]>([]);

  // Redirect Home to profile/landing page
  useEffect(() => {
    if (location === '/home' || location === '/superadmin/home') {
      navigate('/superadmin/profile'); // or your actual profile/landing route
    }
  }, [location, navigate]);

  // Listen for real-time meeting scheduled events (for demo, log to console)
  useEffect(() => {
    socket.on('zoomMeetingScheduled', (meeting) => {
      setZoomStatus(`Meeting scheduled for ${meeting.topic} with join link: ${meeting.joinUrl}`);
    });
    return () => {
      socket.off('zoomMeetingScheduled');
    };
  }, []);

  // Fetch actions when activeSection is 'action-log'
  useEffect(() => {
    if (activeSection === 'action-log') {
      fetch('/api/superadmin/admin-actions')
        .then(res => res.json())
        .then(data => setActions(data.actions || []));
    }
  }, [activeSection]);

  const handleLogout = () => {
    // Implement logout functionality
  };

  const handleApprove = (id: string) => {
    // Implement approve functionality
  };

  const handleReject = (id: string) => {
    // Implement reject functionality
  };

  // Admin creation logic (mock for now)
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdmins(prev => [
      ...prev,
      { id: String(Date.now()), name: newAdmin.name, email: newAdmin.email, permissions: newAdmin.permissions, active: true }
    ]);
    setNewAdmin({ name: '', email: '', password: '', permissions: [] });
  };

  const handleToggleAdmin = (id: string) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handlePermissionChange = (perm: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  // Schedule Zoom meeting handler
  const handleScheduleZoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setZoomStatus('Scheduling...');
    try {
      const scheduledFor = `${zoomDate}T${zoomTime}`;
      const res = await fetch('/api/zoom/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: zoomTopic,
          scheduledFor,
          duration: zoomDuration,
          founderId: zoomTargetType === 'founder' ? zoomTargetId : undefined,
          investorId: zoomTargetType === 'investor' ? zoomTargetId : undefined,
        })
      });
      const data = await res.json();
      if (data.success) {
        setZoomStatus('Meeting scheduled!');
        setZoomTopic(''); setZoomDate(''); setZoomTime(''); setZoomDuration(30); setZoomTargetId('');
      } else {
        setZoomStatus('Failed to schedule meeting.');
      }
    } catch (err) {
      setZoomStatus('Error scheduling meeting.');
    }
  };

  const renderSidebar = () => (
    <div className="h-full min-h-screen flex flex-col">
      <SuperAdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UsersSection />;
      case 'product-approval':
        return <div className="bg-white rounded-lg shadow p-6">Approve/Reject Products section</div>;
      case 'product-submissions':
        return <div className="bg-white rounded-lg shadow p-6">Product Submissions section</div>;
      case 'analytics':
        return <div className="bg-white rounded-lg shadow p-6">Product Popularity section</div>;
      case 'interests':
        return <div className="bg-white rounded-lg shadow p-6">Investor Interest section</div>;
      case 'mentor-suggestions':
        return <div className="bg-white rounded-lg shadow p-6">Mentor Suggestions section</div>;
      case 'service-requests':
        return <div className="bg-white rounded-lg shadow p-6">Service Requests section</div>;
      case 'my-requests':
        return <div className="bg-white rounded-lg shadow p-6">My Requests section</div>;
      case 'zoom-calls':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Zoom Meeting</h2>
            <form onSubmit={handleScheduleZoom} className="space-y-4 mb-4">
              <div>
                <Label>Meeting Topic</Label>
                <Input value={zoomTopic} onChange={e => setZoomTopic(e.target.value)} required />
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={zoomDate} onChange={e => setZoomDate(e.target.value)} required />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={zoomTime} onChange={e => setZoomTime(e.target.value)} required />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" min={15} max={180} value={zoomDuration} onChange={e => setZoomDuration(Number(e.target.value))} required />
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Target Type</Label>
                  <select value={zoomTargetType} onChange={e => setZoomTargetType(e.target.value)} className="border rounded p-2">
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
                <div>
                  <Label>Target User ID</Label>
                  <Input value={zoomTargetId} onChange={e => setZoomTargetId(e.target.value)} required />
                </div>
              </div>
              <Button type="submit">Schedule Meeting</Button>
            </form>
            {zoomStatus && <div className="text-sm text-blue-600 mt-2">{zoomStatus}</div>}
          </div>
        );
      case 'visitors':
        return <div className="bg-white rounded-lg shadow p-6">Visitor Metrics section</div>;
      case 'settings':
        return <div className="bg-white rounded-lg shadow p-6">Platform Settings section</div>;
      case 'admin-list':
        return <AdminsSection />;
      case 'action-log':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Action Log</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Details</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {actions.map(action => (
                  <tr key={action._id}>
                    <td className="border px-4 py-2">{typeof action.adminId === 'object' ? action.adminId.username : action.adminId}</td>
                    <td className="border px-4 py-2">{action.actionType}</td>
                    <td className="border px-4 py-2">{action.details}</td>
                    <td className="border px-4 py-2">{new Date(action.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'admin-management':
        return <AdminManagementSection />;
      default:
        return <div className="p-8 text-center">Loading...</div>;
    }
  };

  return (
    <div className="flex min-h-screen h-full bg-gray-50 items-stretch">
      <div className="h-full min-h-screen flex flex-col">
        {renderSidebar()}
      </div>
      <main className="flex-1 p-8 overflow-auto min-h-screen h-full flex flex-col">
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          {renderSection()}
        </Suspense>
      </main>
    </div>
  );
};

export default SuperAdminDashboard; 