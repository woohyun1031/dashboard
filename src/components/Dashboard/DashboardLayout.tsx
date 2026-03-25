import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    Server,
    Activity,
    Map,
    Key,
    Monitor,
    Users,
    FileText,
    User,
} from 'lucide-react';

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-[#000000] text-white font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <nav
                className={`flex-shrink-0 border-r border-[#222] flex flex-col justify-between py-6 bg-[#050505] transition-[width] duration-200 ${isSidebarOpen ? 'w-64 px-4' : 'w-16 px-2 items-center'}`}
            >
                <div className="flex flex-col gap-8 w-full">
                    {/* Header Logo */}
                    <div
                        className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'} mb-2`}
                    >
                        <div className="w-8 h-4 bg-white/10 rounded-sm overflow-hidden flex shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] shrink-0">
                            <div className="w-6 h-full bg-white relative"></div>
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold leadning-tight">You</span>
                                <span className="text-xs text-[#888]">@growth</span>
                            </div>
                        )}
                    </div>

                    {/* Nav Sections */}
                    <div className="flex flex-col gap-6 text-sm">
                        <div className="flex flex-col gap-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-semibold text-[#666] px-2 mb-1">
                                    Dashboard
                                </span>
                            )}
                            <NavLink
                                to="/dashboard/controls"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <LayoutGrid size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Controls</span>}
                            </NavLink>
                            <NavLink
                                to="/dashboard/main"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Server size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Dashboard</span>}
                            </NavLink>
                            <NavLink
                                to="/dashboard/flow"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Activity size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Flow</span>}
                            </NavLink>
                            <NavLink
                                to="/dashboard/map"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Map size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Map</span>}
                            </NavLink>
                        </div>
                        <div className="flex flex-col gap-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-semibold text-[#666] px-2 mb-1">
                                    Productivity
                                </span>
                            )}
                            <NavLink
                                to="/dashboard/deep-work"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Key size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Deep Work</span>}
                            </NavLink>
                            <NavLink
                                to="/dashboard/projects"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Monitor size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Projects</span>}
                            </NavLink>
                        </div>
                        <div className="flex flex-col gap-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-semibold text-[#666] px-2 mb-1">
                                    Mindset
                                </span>
                            )}
                            <NavLink
                                to="/dashboard/community"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <Users size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Community</span>}
                            </NavLink>
                            <NavLink
                                to="/dashboard/journal"
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#222] text-white font-medium' : 'text-[#888] hover:text-white hover:bg-[#111]'}`
                                }
                            >
                                <FileText size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Journal</span>}
                            </NavLink>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div
                    className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} pt-4 mt-8`}
                >
                    <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#888] shrink-0">
                        <User size={16} />
                    </div>
                    {isSidebarOpen && (
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold">admin</span>
                            <span className="text-xs text-[#888]">none</span>
                        </div>
                    )}
                </div>
            </nav>

            <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] min-w-0">
                <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
            </div>
        </div>
    );
};
