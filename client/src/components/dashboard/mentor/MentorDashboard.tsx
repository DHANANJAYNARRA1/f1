import { useState } from "react";
import MentorSidebar from "./MentorSidebar";
import ProfileSection from "@/components/dashboard/user/ProfileSection";
import MentorRequestsSection from "./MentorRequestsSection";
import MentorConnections from "./MentorConnections";
import MentorCommunicationSection from "@/components/communication/MentorCommunicationSection";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SettingsSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Configure your account settings.</p>
    </CardContent>
  </Card>
);

export default function MentorDashboard() {
  const { logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "mentees":
        return <MentorRequestsSection />;
      case "communication":
        return <MentorCommunicationSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-stretch">
      <MentorSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 p-10 flex flex-col">{renderSection()}</main>
    </div>
  );
}
