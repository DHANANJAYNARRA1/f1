import React, { useEffect, useState, lazy, Suspense } from "react";
import { socket } from "@/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import Chart from "chart.js/auto";
import { Label } from '@/components/ui/label';
import SuperAdminSidebar from "@/components/dashboard/superadmin/SuperAdminSidebar";
import AdminManagementSection from "@/components/dashboard/admin/AdminManagementSection";

// Lazy load all admin dashboard sections
const UsersSection = lazy(() => import("@/components/dashboard/admin/UsersSection"));
const ProductAnalyticsSection = lazy(() => import("@/components/dashboard/admin/ProductAnalyticsSection"));
const ProductInterestsSection = lazy(() => import("@/components/dashboard/admin/ProductInterestsSection"));
const ProductSubmissions = lazy(() => import("@/components/dashboard/admin/ProductSubmissions"));
const MyRequestsSection = lazy(() => import("@/components/dashboard/admin/MyRequestsSection"));
const ZoomCallsSection = lazy(() => import("@/components/dashboard/admin/ZoomCallsSection"));
const VisitorMetricsSection = lazy(() => import("@/components/dashboard/admin/VisitorMetricsSection"));
const SettingsSection = lazy(() => import("@/components/dashboard/admin/SettingsSection"));
const SuperAdminZoomRequests = lazy(() => import("@/components/dashboard/superadmin/SuperAdminZoomRequests"));

// Sidebar items
const SIDEBAR_ITEMS = [
  { key: "home", label: "Home" },
  { key: "users", label: "User Management" },
  { key: "analytics", label: "Product Analytics" },
  { key: "interests", label: "Product Interests" },
  { key: "product-submissions", label: "Product Submissions" },
  { key: "my-requests", label: "My Requests" },
  { key: "zoom-calls", label: "Zoom Calls" },
  { key: "visitors", label: "Visitor Metrics" },
  { key: "settings", label: "Settings" },
  { key: "admin-management", label: "Admin Management" },
  { key: "tasks", label: "Tasks" },
  { key: "super-analytics", label: "Analytics" },
  { key: "logout", label: "Logout" },
];

const SuperAdminDashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState('users');
  const [tasks, setTasks] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskData, setTaskData] = useState({ adminId: "", type: "", targetId: "", details: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only allow superadmin
  useEffect(() => {
    if (!user || user.role !== "superadmin") {
      window.location.href = "/not-found";
    }
  }, [user]);

  // Real-time listeners
  useEffect(() => {
    socket.emit("join", { userId: user?._id, role: user?.role });
    socket.on("taskAssigned", ({ task }) => setTasks((prev) => [...prev, task]));
    socket.on("adminActionLogged", ({ action }) => setActions((prev) => [...prev, action]));
    // Fetch initial data (replace with API calls in production)
    // ...
    return () => {
      socket.off("taskAssigned");
      socket.off("adminActionLogged");
    };
  }, [user?._id, user?.role]);

  // Analytics chart (example: admin actions count)
  useEffect(() => {
    if (activeSection === "super-analytics" && actions.length > 0) {
      const ctx = document.getElementById("adminActionsChart") as HTMLCanvasElement;
      if (ctx) {
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: actions.map((a) => a.adminId),
            datasets: [{
              data: actions.map((a) => 1),
              backgroundColor: ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#fbbf24"],
            }],
          },
        });
      }
    }
  }, [activeSection, actions]);

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/login";
  };

  // Section rendering
  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, Superadmin!</h1>
            <p className="text-gray-600 mb-4">This is your landing page. Here you can see your profile and quick links.</p>
            {user && (
              <div className="mb-4">
                <div className="font-semibold text-lg">{user.name || user.username}</div>
                <div className="text-sm text-gray-500">Email: {('email' in user && user.email) ? user.email : user.username}</div>
                <div className="text-sm text-gray-500">Unique ID: <span className="font-mono text-green-600">{user.uniqueId}</span></div>
                <div className="text-sm text-gray-500">Role: {user.role}</div>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <Button onClick={() => setActiveSection("users")}>Go to User Management</Button>
              <Button onClick={() => setActiveSection("admin-management")}>Go to Admin Management</Button>
            </div>
          </div>
        );
      case "users":
        return <UsersSection />;
      case "analytics":
        return <ProductAnalyticsSection />;
      case "interests":
        return <ProductInterestsSection />;
      case "product-submissions":
        return <ProductSubmissions />;
      case "my-requests":
        return <MyRequestsSection />;
      case "zoom-calls":
        return <SuperAdminZoomRequests />;
      case "visitors":
        return <VisitorMetricsSection />;
      case "settings":
        return <SettingsSection />;
      case "admin-management":
        return <AdminManagementSection />;
      case "tasks":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tasks</h1>
              <Button onClick={() => setShowAssignTask(true)}>Assign Task</Button>
            </div>
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li key={task._id} className="p-4 bg-gray-100 rounded shadow flex flex-col">
                  <div className="font-semibold">{task.type}</div>
                  <div className="text-xs text-gray-500">Admin: {actions.find((a) => a.adminId === a._id)?.adminId}</div>
                  <div className="text-xs text-gray-500">Status: {task.status}</div>
                  <div className="text-xs text-gray-500">Details: {task.details}</div>
                </li>
              ))}
            </ul>
            <Dialog open={showAssignTask} onOpenChange={setShowAssignTask}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Admin ID" value={taskData.adminId} onChange={(e) => setTaskData((t) => ({ ...t, adminId: e.target.value }))} />
                  <Input placeholder="Task Type" value={taskData.type} onChange={(e) => setTaskData((t) => ({ ...t, type: e.target.value }))} />
                  <Input placeholder="Target ID (optional)" value={taskData.targetId} onChange={(e) => setTaskData((t) => ({ ...t, targetId: e.target.value }))} />
                  <Input placeholder="Details (optional)" value={taskData.details} onChange={(e) => setTaskData((t) => ({ ...t, details: e.target.value }))} />
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    socket.emit("assignTask", taskData);
                    setShowAssignTask(false);
                    setTaskData({ adminId: "", type: "", targetId: "", details: "" });
                  }}>Assign</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      case "super-analytics":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Analytics</h2>
            <canvas id="adminActionsChart" width={400} height={400}></canvas>
          </div>
        );
      default:
        return <UsersSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-foreground">
      <SuperAdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard; 