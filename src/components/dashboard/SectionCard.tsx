import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SectionCardProps {
    title: string;
    /** Optional action rendered on the right of the header (e.g. "View all"). */
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/**
 * Reusable titled card used across all dashboards (admin, PPIMU, agency).
 */
const SectionCard = ({ title, action, className, children }: SectionCardProps) => {
    return (
        <section
            className={cn(
                'rounded-2xl border border-hairline bg-surface p-5 shadow-sm sm:p-6',
                className,
            )}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
};

export default SectionCard;
