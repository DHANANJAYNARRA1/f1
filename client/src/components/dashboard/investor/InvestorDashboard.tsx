import React from 'react';
import InvestorSidebar from './InvestorSidebar';
import ProductCatalogSection from './ProductCatalogSection';
import { MyInterestsSection } from './MyInterestsSection';
// Placeholder for SettingsSection, assuming it will be created
// import SettingsSection from './SettingsSection';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function InvestorDashboard() {
    const { user, isLoading, logoutMutation } = useAuth();
    const [activeSection, setActiveSection] = React.useState('catalog');

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12" /></div>;
    }

    if (!user) {
        return <div>Error: Not logged in. Please log in to view your dashboard.</div>;
    }

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'catalog':
                return <ProductCatalogSection />;
            case 'interests':
                return <MyInterestsSection />;
            // case 'settings':
            //   return <SettingsSection />;
            default:
                return <ProductCatalogSection />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <InvestorSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                            Welcome, {user?.name}
                        </span>
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
                {renderSection()}
            </main>
        </div>
    );
} 