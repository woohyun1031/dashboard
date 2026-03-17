import React, { useState, useRef, useEffect } from 'react';
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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import type { DashboardItem, InteractionState, ItemType } from '../../types/grid';
import { GRID_CONFIG } from '../../constants/grid';
import {
    calculateReflowLayout,
    findNextAvailablePosition,
    findBestFit,
    calculateSqueezedLayout,
} from '../../utils/gridUtils';
import { GridItem } from './GridItem';

const INITIAL_ITEMS: DashboardItem[] = [
    { id: '1', type: 'metric', title: 'Goals', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
    { id: '2', type: 'metric', title: 'Habits', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
    { id: '3', type: 'chart', title: 'Focus', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { id: '4', type: 'chart', title: 'Energy', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    {
        id: '5',
        type: 'table',
        title: 'Task : Meditate',
        x: 0,
        y: 2,
        w: 3,
        h: 2,
        minW: 2,
        minH: 2,
    },
    { id: '6', type: 'table', title: 'Task : Read 1hr', x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { id: '7', type: 'table', title: 'Task : Workout', x: 6, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { id: '8', type: 'table', title: 'Task : Journal', x: 9, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
];

export const DashboardGrid = () => {
    const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS);
    const gridRef = useRef<HTMLDivElement>(null);

    const [interaction, setInteraction] = useState<InteractionState | null>(null);
    const [previewLayout, setPreviewLayout] = useState<DashboardItem[] | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleAddItem = (type: ItemType) => {
        const configs: Record<
            ItemType,
            Pick<DashboardItem, 'w' | 'h' | 'minW' | 'minH' | 'title'>
        > = {
            metric: { w: 3, h: 2, minW: 2, minH: 1, title: 'New Metric' },
            chart: { w: 3, h: 2, minW: 2, minH: 2, title: 'New Chart' },
            table: { w: 3, h: 2, minW: 2, minH: 2, title: 'New Event' },
        };
        const config = configs[type];

        const pos = findNextAvailablePosition(items, config.w, config.h);
        const newItem: DashboardItem = {
            id: Math.random().toString(36).substring(2, 9),
            type,
            ...config,
            ...pos,
        };
        setItems((prev) => [...prev, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleRowSpan = (id: string) => {
        setItems((prev) => {
            const target = prev.find((i) => i.id === id);
            if (!target) return prev;

            const minH = target.minH || 1;
            const nextH = target.h > minH ? minH : minH + 1;
            const proposed = { ...target, h: Math.min(nextH, GRID_CONFIG.MAX_ROW_SPAN) };

            const squeezed = calculateSqueezedLayout(prev, id, proposed);
            return squeezed || prev;
        });
    };

    const handlePointerDown = (
        e: React.PointerEvent<HTMLDivElement>,
        item: DashboardItem,
        type: 'drag' | 'resize'
    ) => {
        e.stopPropagation();
        if (e.button !== 0) return; // Left click only

        setInteraction({
            type,
            id: item.id,
            startX: e.clientX,
            startY: e.clientY,
            initialItem: { ...item },
            initialItems: items.map((i) => ({ ...i })),
        });
        setPreviewLayout(null);
    };

    useEffect(() => {
        if (interaction) {
            document.body.style.userSelect = 'none';
            return () => {
                document.body.style.userSelect = '';
            };
        }
    }, [interaction]);

    useEffect(() => {
        if (!interaction || !gridRef.current) return;

        const handlePointerMove = (e: PointerEvent) => {
            const gridWidth = gridRef.current!.offsetWidth;
            const cellWidth =
                (gridWidth - (GRID_CONFIG.COLUMNS - 1) * GRID_CONFIG.GAP) / GRID_CONFIG.COLUMNS;

            const deltaCols = Math.round(
                (e.clientX - interaction.startX) / (cellWidth + GRID_CONFIG.GAP)
            );
            const deltaRows = Math.round(
                (e.clientY - interaction.startY) / (GRID_CONFIG.ROW_HEIGHT + GRID_CONFIG.GAP)
            );

            const { initialItem, initialItems } = interaction;

            if (interaction.type === 'drag') {
                const newX = Math.max(
                    0,
                    Math.min(
                        initialItem.x + deltaCols,
                        GRID_CONFIG.COLUMNS - (initialItem.minW || 1)
                    )
                );
                const newY = Math.max(0, initialItem.y + deltaRows);

                const isTargetCellOccupied = initialItems.some(
                    (i) =>
                        i.id !== interaction.id &&
                        newX >= i.x &&
                        newX < i.x + i.w &&
                        newY >= i.y &&
                        newY < i.y + i.h
                );

                if (isTargetCellOccupied) {
                    const reflowX = Math.min(newX, GRID_CONFIG.COLUMNS - initialItem.w);
                    const proposedReflow = {
                        ...initialItem,
                        x: reflowX,
                        y: newY,
                        w: initialItem.w,
                        h: initialItem.h,
                    };
                    setPreviewLayout(calculateReflowLayout(initialItems, proposedReflow));
                } else {
                    const bestFit = findBestFit(
                        initialItems,
                        newX,
                        newY,
                        initialItem.w,
                        initialItem.h,
                        initialItem.minW || 1,
                        initialItem.minH || 1,
                        interaction.id
                    );

                    if (bestFit) {
                        const proposed = {
                            ...initialItem,
                            x: newX,
                            y: newY,
                            w: bestFit.w,
                            h: bestFit.h,
                        };
                        setPreviewLayout(
                            initialItems.map((i) => (i.id === interaction.id ? proposed : i))
                        );
                    } else {
                        const reflowX = Math.min(newX, GRID_CONFIG.COLUMNS - initialItem.w);
                        const proposedReflow = {
                            ...initialItem,
                            x: reflowX,
                            y: newY,
                            w: initialItem.w,
                            h: initialItem.h,
                        };
                        setPreviewLayout(calculateReflowLayout(initialItems, proposedReflow));
                    }
                }
            } else if (interaction.type === 'resize') {
                const newW = Math.max(
                    initialItem.minW || 1,
                    Math.min(initialItem.w + deltaCols, GRID_CONFIG.COLUMNS - initialItem.x)
                );
                const newH = Math.max(
                    initialItem.minH || 1,
                    Math.min(initialItem.h + deltaRows, GRID_CONFIG.MAX_ROW_SPAN)
                );
                const proposed = { ...initialItem, w: newW, h: newH };

                const nextLayout = calculateSqueezedLayout(initialItems, interaction.id, proposed);
                if (nextLayout) {
                    setPreviewLayout(nextLayout);
                }
            }
        };

        const handlePointerUp = () => {
            if (previewLayout) setItems(previewLayout);

            setInteraction(null);
            setPreviewLayout(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [interaction, previewLayout]);

    const displayItems = previewLayout || items;

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
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md bg-[#222] text-white font-medium`}
                            >
                                <LayoutGrid size={16} className="text-[#888] shrink-0" />{' '}
                                {isSidebarOpen && <span>Controls</span>}
                            </a>
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Server size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Dashboard</span>}
                            </a>
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Activity size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Flow</span>}
                            </a>
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Map size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Map</span>}
                            </a>
                        </div>
                        <div className="flex flex-col gap-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-semibold text-[#666] px-2 mb-1">
                                    Productivity
                                </span>
                            )}
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Key size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Deep Work</span>}
                            </a>
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Monitor size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Projects</span>}
                            </a>
                        </div>
                        <div className="flex flex-col gap-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-semibold text-[#666] px-2 mb-1">
                                    Mindset
                                </span>
                            )}
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <Users size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Community</span>}
                            </a>
                            <a
                                href="#"
                                className={`flex items-center ${isSidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#111] transition-colors`}
                            >
                                <FileText size={16} className="shrink-0" />{' '}
                                {isSidebarOpen && <span>Journal</span>}
                            </a>
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] min-w-0">
                {/* Top Header */}
                <header className="h-14 border-b border-[#222] flex items-center px-4 text-sm font-medium gap-2 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 mr-2 text-[#888] hover:text-white hover:bg-[#111] rounded-md transition-colors"
                        title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                    >
                        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <span className="text-white/40 flex gap-2 items-center">
                        <LayoutGrid size={14} /> /
                    </span>
                    <span className="text-white">Dashboard</span>

                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={() => handleAddItem('metric')}
                            className="px-3 py-1.5 text-xs bg-[#111] text-[#888] hover:text-white border border-[#333] hover:border-[#555] rounded-md transition-colors"
                        >
                            + Metric
                        </button>
                    </div>
                </header>

                {/* Grid Container */}
                <div className="flex-1 overflow-auto p-12">
                    <div className="max-w-[1200px] mx-auto w-full h-full relative">
                        <div
                            ref={gridRef}
                            className="relative select-none w-full"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${GRID_CONFIG.COLUMNS}, minmax(0, 1fr))`,
                                gridAutoRows: `${GRID_CONFIG.ROW_HEIGHT}px`,
                                gap: `${GRID_CONFIG.GAP}px`,
                                paddingBottom: '100px', // Extra padding for drag space
                            }}
                        >
                            {displayItems.map((item) => (
                                <GridItem
                                    key={item.id}
                                    item={item}
                                    isInteracting={interaction?.id === item.id}
                                    previewState={
                                        interaction?.id === item.id && previewLayout
                                            ? { type: interaction.type }
                                            : null
                                    }
                                    onPointerDown={(e, type) => handlePointerDown(e, item, type)}
                                    onToggleRowSpan={() => toggleRowSpan(item.id)}
                                    onRemove={() => handleRemoveItem(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar */}
                <footer className="h-8 border-t border-[#222] bg-[#050505] flex items-center px-4 text-[10px] text-[#666]">
                    <span>Dashboard 0.1</span>
                    <span className="ml-2">0ms</span>
                </footer>
            </div>
        </div>
    );
};
