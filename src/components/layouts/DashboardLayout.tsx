import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          <TopBar />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
