import React from 'react';
import type { DefconLevel } from './TacticalLayout';

interface TacticalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    defcon?: DefconLevel;
    children: React.ReactNode;
    isGlowing?: boolean;
}

export const TacticalPanel: React.FC<TacticalPanelProps> = ({
    title,
    defcon = 5,
    children,
    isGlowing = false,
    className = '',
    ...props
}) => {
    // Map DEFCON levels to panel styles based on Glassmorphism Tactical Cards
    const getPanelStyles = () => {
        if (isGlowing) {
            switch (defcon) {
                case 1:
                    return 'border-rose-500/80 bg-rose-950/40 shadow-[0_0_30px_rgba(225,29,72,0.6)] animate-critical-shake';
                case 3:
                    return 'border-amber-500/80 bg-amber-950/30 animate-warning-pulse';
                case 5:
                    return 'border-cyan-500/60 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse-slow';
            }
        }

        switch (defcon) {
            case 1:
                return 'border-rose-500/30 bg-rose-950/20';
            case 3:
                return 'border-amber-500/30 bg-amber-900/10';
            case 5:
            default:
                return 'border-white/5 bg-zinc-900/40';
        }
    };

    const getHeaderStyles = () => {
        switch (defcon) {
            case 1:
                return 'text-rose-500 border-rose-500/30';
            case 3:
                return 'text-amber-400 border-amber-500/30';
            case 5:
            default:
                return 'text-slate-400 border-white/5';
        }
    };

    return (
        <div
            className={`
                relative backdrop-blur-md border 
                rounded-sm overflow-hidden transition-all duration-500
                ${getPanelStyles()} ${className}
            `}
            {...props}
        >
            {/* Tactical 1px Accent Corner */}
            <div
                className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${isGlowing ? 'border-white opacity-100' : 'border-white/20'}`}
            />

            {/* Panel Header */}
            <div
                className={`
                flex items-center justify-between px-3 py-1.5 
                border-b uppercase text-[10px] font-bold tracking-[0.2em] select-none
                ${getHeaderStyles()}
            `}
            >
                <span className="opacity-90">{title}</span>
                {isGlowing && (
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${defcon === 1 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : defcon === 3 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                    />
                )}
            </div>

            {/* Panel Content (Data/Coordinates Area) */}
            <div className="p-4 font-mono font-medium tracking-wider text-sm">{children}</div>
        </div>
    );
};
