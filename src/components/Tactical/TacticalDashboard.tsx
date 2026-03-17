import React, { useState } from 'react';
import { TacticalLayout } from './TacticalLayout';
import type { DefconLevel } from './TacticalLayout';
import { TacticalPanel } from './TacticalPanel';

export const TacticalDashboard: React.FC = () => {
    const [defcon, setDefcon] = useState<DefconLevel>(5);

    return (
        <TacticalLayout defcon={defcon}>
            <div className="flex flex-col h-full gap-6">
                {/* Header Section */}
                <header className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-sm bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                            <span className="font-mono text-xs font-bold text-slate-400">C2</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-[0.3em] uppercase text-slate-100">
                            Command & Control <span className="text-slate-500">//</span> Core
                        </h1>
                    </div>

                    {/* DEFCON Selector for Demonstration */}
                    <div className="flex gap-2 font-mono text-xs">
                        <button
                            onClick={() => setDefcon(5)}
                            className={`px-3 py-1 border transition-colors ${defcon === 5 ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-slate-700 text-slate-500 hover:border-cyan-800'}`}
                        >
                            DEFCON 5 [NORMAL]
                        </button>
                        <button
                            onClick={() => setDefcon(3)}
                            className={`px-3 py-1 border transition-colors ${defcon === 3 ? 'bg-amber-900/50 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-slate-700 text-slate-500 hover:border-amber-800'}`}
                        >
                            DEFCON 3 [WARNING]
                        </button>
                        <button
                            onClick={() => setDefcon(1)}
                            className={`px-3 py-1 border transition-colors ${defcon === 1 ? 'bg-rose-900/50 border-rose-600 text-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.3)]' : 'border-slate-700 text-slate-500 hover:border-rose-800'}`}
                        >
                            DEFCON 1 [CRITICAL]
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid Content */}
                <div className="grid grid-cols-12 gap-6 flex-1">
                    {/* Radar / Main Map Area */}
                    <div className="col-span-8 flex flex-col gap-6">
                        <TacticalPanel
                            title="Global Threat Assessment"
                            defcon={defcon}
                            className="h-[400px]"
                            isGlowing={defcon === 1}
                        >
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                                <span
                                    className={`text-4xl opacity-20 ${defcon === 1 ? 'text-rose-500' : defcon === 3 ? 'text-amber-500' : 'text-cyan-500'}`}
                                >
                                    [ RADAR FEED OFFLINE FOR DEMO ]
                                </span>
                                <div
                                    className={`text-sm ${defcon === 1 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}
                                >
                                    SYS.COORD: 34.0522° N, 118.2437° W
                                </div>
                            </div>
                        </TacticalPanel>

                        <div className="grid grid-cols-2 gap-4">
                            <TacticalPanel title="Squadron Alpha Status" defcon={defcon}>
                                <div
                                    className={`flex justify-between items-center ${defcon === 5 ? 'text-cyan-400' : 'text-slate-400'}`}
                                >
                                    <span>FUEL_LVL: 87%</span>
                                    <span>AMMO: NOMINAL</span>
                                </div>
                            </TacticalPanel>

                            <TacticalPanel
                                title="Sector Beta Anomalies"
                                defcon={defcon}
                                isGlowing={defcon === 3}
                            >
                                <div
                                    className={`flex justify-between items-center ${defcon === 3 ? 'text-amber-400' : 'text-slate-400'}`}
                                >
                                    <span>UNIDENTIFIED TARGETS: {defcon >= 3 ? '02' : '00'}</span>
                                    <span>
                                        RISK:{' '}
                                        {defcon === 1
                                            ? 'SEVERE'
                                            : defcon === 3
                                              ? 'ELEVATED'
                                              : 'LOW'}
                                    </span>
                                </div>
                            </TacticalPanel>
                        </div>
                    </div>

                    {/* Side Panel / Live Feed */}
                    <div className="col-span-4 flex flex-col gap-4">
                        <TacticalPanel title="Live Action Feed" defcon={defcon} className="flex-1">
                            <ul className="space-y-3 text-xs flex flex-col h-full">
                                <li className="flex gap-2">
                                    <span className="text-slate-500">[14:02:44]</span>
                                    <span className="text-slate-300">
                                        System initialization complete.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-slate-500">[14:05:12]</span>
                                    <span
                                        className={`${defcon === 5 ? 'text-cyan-400' : 'text-slate-300'}`}
                                    >
                                        Routine scan nominal.
                                    </span>
                                </li>
                                {defcon <= 3 && (
                                    <li className="flex gap-2 animate-warning-pulse">
                                        <span className="text-slate-500">[14:10:01]</span>
                                        <span className="text-amber-400">
                                            WARNING: Heat signature detected in Sector 7.
                                        </span>
                                    </li>
                                )}
                                {defcon === 1 && (
                                    <li className="flex gap-2 animate-critical-shake">
                                        <span className="text-slate-500">[14:11:37]</span>
                                        <span className="text-rose-500 font-bold shadow-rose-500/50">
                                            CRITICAL: Hostile lock-on detected. Evade!
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </TacticalPanel>

                        <TacticalPanel
                            title="System Core Temp"
                            defcon={defcon}
                            isGlowing={defcon === 1}
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <span>CORE_TEMP:</span>
                                    <span
                                        className={`${defcon === 1 ? 'text-rose-500 shadow-rose-500/50 animate-pulse' : defcon === 3 ? 'text-amber-400' : 'text-cyan-400'}`}
                                    >
                                        {defcon === 1
                                            ? '98.5°C'
                                            : defcon === 3
                                              ? '75.2°C'
                                              : '42.1°C'}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 mt-2">
                                    <div
                                        className={`h-full transition-all duration-1000 ${defcon === 1 ? 'bg-rose-500 w-[95%]' : defcon === 3 ? 'bg-amber-400 w-[75%]' : 'bg-cyan-500 w-[42%]'}`}
                                    />
                                </div>
                            </div>
                        </TacticalPanel>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
};
