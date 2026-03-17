import React from 'react';
import { GripHorizontal, Maximize2, X } from 'lucide-react';
import type { DashboardItem } from '../../types/grid';

interface GridItemProps {
    item: DashboardItem;
    isInteracting: boolean;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>, type: 'drag' | 'resize') => void;
    onToggleRowSpan: () => void;
    onRemove: () => void;
}

export const GridItem: React.FC<GridItemProps> = ({
    item,
    isInteracting,
    onPointerDown,
    onToggleRowSpan,
    onRemove,
}) => {
    return (
        <div
            className={`
        group relative bg-white rounded-xl flex items-center justify-center flex-col overflow-hidden
        transition-all duration-200 ease-out border
        ${
            isInteracting
                ? 'ring-2 ring-indigo-500 shadow-xl border-indigo-200 z-50 scale-[1.01]'
                : 'border-slate-200 shadow-sm hover:shadow-md z-10'
        }
      `}
            style={{
                gridColumn: `${item.x + 1} / span ${item.w}`,
                gridRow: `${item.y + 1} / span ${item.h}`,
            }}
        >
            <div
                className={`w-full flex items-center justify-between p-3 border-b border-slate-100 cursor-grab active:cursor-grabbing ${
                    isInteracting ? 'bg-indigo-50' : 'bg-slate-50/50'
                }`}
                onPointerDown={(e) => onPointerDown(e, 'drag')}
            >
                <div
                    className={`flex items-center gap-2 ${
                        isInteracting ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                >
                    <GripHorizontal
                        size={16}
                        className={isInteracting ? 'text-indigo-400' : 'text-slate-400'}
                    />
                    <span className="text-sm font-semibold">{item.title}</span>
                    <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                            isInteracting ? 'bg-indigo-100' : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                        {item.w}x{item.h}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onToggleRowSpan}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onRemove}
                        className="p-1 hover:bg-red-100 hover:text-red-500 rounded text-slate-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full p-4 flex items-center justify-center bg-slate-50/20 text-slate-400 text-sm relative">
                {item.type === 'metric' && (
                    <span className="text-3xl font-bold text-slate-700">1,234</span>
                )}
                {item.type === 'chart' && (
                    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center transition-all duration-200">
                        Chart Area
                    </div>
                )}
                {item.type === 'table' && (
                    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center transition-all duration-200">
                        Table Data
                    </div>
                )}
            </div>

            <div
                className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => onPointerDown(e, 'resize')}
            >
                <div className="w-2.5 h-2.5 border-b-[2.5px] border-r-[2.5px] border-slate-400 rounded-br-[2px]" />
            </div>
        </div>
    );
};
