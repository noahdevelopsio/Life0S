'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAiPage = pathname === '/ai';

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className={cn(
                "flex-1 md:ml-64 transition-all duration-200",
                isAiPage ? "pb-0" : "pb-24 md:pb-8"
            )}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
