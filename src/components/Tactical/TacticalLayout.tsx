import React from 'react';

export type DefconLevel = 1 | 3 | 5;

interface TacticalLayoutProps {
    children: React.ReactNode;
    defcon?: DefconLevel;
}

export const TacticalLayout: React.FC<TacticalLayoutProps> = ({ children, defcon = 5 }) => {
    // Map DEFCON levels to specific visual global states
    const getDefconStyles = () => {
        switch (defcon) {
            case 1:
                return 'animate-critical-glow bg-rose-950/20'; // Critical
            case 3:
                return 'bg-amber-950/5'; // Warning
            case 5:
            default:
                return 'bg-slate-950/50'; // Normal
        }
    };

    return (
        <div
            className={`relative w-full min-h-screen overflow-hidden ${getDefconStyles()} transition-colors duration-1000`}
        >
            {/* Global HUD overlay for CRT/Radar effect */}
            <div className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay opacity-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

            {/* Main Content Container */}
            <div className="relative z-10 w-full h-full p-6">{children}</div>
        </div>
    );
};
