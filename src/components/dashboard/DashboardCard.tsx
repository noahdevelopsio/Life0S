'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    headerAction?: ReactNode;
}

export function DashboardCard({ title, children, className = '', onClick, headerAction }: DashboardCardProps) {
    return (
        <motion.div
            className={cn(
                "bg-white dark:bg-slate-800/40 rounded-[40px] shadow-sm p-8 transition-all duration-200",
                onClick && "cursor-pointer hover:shadow-md",
                className
            )}
            whileHover={onClick ? { scale: 1.02 } : undefined}
            onClick={onClick}
        >
            {(title || headerAction) && (
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {title && (
                            <h3 className="font-bold text-xl leading-none mb-1">{title}</h3>
                        )}
                        {/* Optional subtitle slot could go here */}
                    </div>
                    {headerAction}
                </div>
            )}
            {children}
        </motion.div>
    );
}
