import React from 'react';
import { GripHorizontal, Maximize2, X } from 'lucide-react';
import type { DashboardItem } from '../../types/grid';

interface GridItemProps {
    item: DashboardItem;
    isInteracting: boolean;
    previewState?: { type: 'drag' | 'resize' } | null;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>, type: 'drag' | 'resize') => void;
    onToggleRowSpan: () => void;
    onRemove: () => void;
}

export const GridItem: React.FC<GridItemProps> = ({
    item,
    isInteracting,
    previewState,
    onPointerDown,
    onToggleRowSpan,
    onRemove,
}) => {
    return (
        <div
            className={`
                group relative rounded-xl flex flex-col overflow-hidden
                transition-all duration-200 ease-out font-sans bg-[#0f0f0f] border border-[#222]
                ${isInteracting ? 'ring-1 ring-white/20 scale-[1.01] z-50 bg-[#161616]' : 'hover:border-[#333] z-10'}
                ${previewState?.type === 'drag' ? 'opacity-80' : ''}
            `}
            style={{
                gridColumn: `${item.x + 1} / span ${item.w}`,
                gridRow: `${item.y + 1} / span ${item.h}`,
            }}
        >
            <div
                className={`w-full flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing text-xs font-semibold select-none text-[#888]`}
                onPointerDown={(e) => onPointerDown(e, 'drag')}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal
                        size={14}
                        className={`transition-colors ${isInteracting ? 'text-white' : 'text-transparent group-hover:text-[#555]'}`}
                    />
                    <span>{item.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onToggleRowSpan}
                        className="p-1 hover:bg-white/10 rounded-md text-[#888] hover:text-white transition-colors"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onRemove}
                        className="p-1 hover:bg-white/10 rounded-md text-[#888] hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className={`flex-1 w-full px-4 pb-4 flex flex-col justify-between text-white`}>
                {item.type === 'metric' && (
                    <>
                        <div className="text-3xl font-bold tracking-tight mt-1">
                            {item.title === 'Goals' || item.title === 'Habits' ? '7' : '2'}
                        </div>
                        <div className="mt-4 flex flex-col gap-1 text-xs text-[#888]">
                            <span className="font-medium text-[#aaa]">Active</span>
                            <span>
                                {item.title === 'Goals'
                                    ? 'Monthly goals in progress'
                                    : 'Current daily habits tracked'}
                            </span>
                        </div>
                    </>
                )}
                {item.type === 'chart' && (
                    <div className="w-full h-full flex flex-col justify-between mt-1">
                        <div className="text-3xl font-bold tracking-tight">
                            {item.title === 'Focus' ? '8.5 hr' : '92%'}
                        </div>
                        <div className="mt-4 flex flex-col gap-1 text-xs text-[#888]">
                            <span className="font-medium text-[#aaa]">Weekly Avg</span>
                            <span>
                                {item.title === 'Focus'
                                    ? 'Total deep work sessions'
                                    : 'Recovery & sleep score'}
                            </span>
                        </div>
                    </div>
                )}
                {item.type === 'table' && (
                    <div className="w-full h-full flex flex-col justify-between mt-1">
                        <div className="text-3xl font-bold tracking-tight">Done</div>
                        <div className="mt-4 flex flex-col gap-1 text-xs text-[#888]">
                            <span className="font-medium text-[#aaa]">Status</span>
                            <span className="font-mono">Completed Today</span>
                        </div>
                    </div>
                )}
            </div>

            <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => onPointerDown(e, 'resize')}
            >
                <div
                    className={`w-2 h-2 border-b-[2px] border-r-[2px] rounded-br-[2px] ${
                        isInteracting ? 'border-white' : 'border-[#444]'
                    }`}
                />
            </div>
        </div>
    );
};
