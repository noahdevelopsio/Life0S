import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 md:ml-64 pb-24 md:pb-8 transition-all duration-200">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
