import React, { useState, useRef, useEffect } from 'react';
import { Activity, BarChart2, LayoutList } from 'lucide-react';
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
    { id: '1', type: 'metric', title: 'Total Revenue', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
    { id: '2', type: 'metric', title: 'Active Users', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
    { id: '3', type: 'chart', title: 'Sales Trend', x: 0, y: 1, w: 6, h: 2, minW: 4, minH: 2 },
    { id: '4', type: 'table', title: 'Recent Orders', x: 6, y: 0, w: 6, h: 3, minW: 4, minH: 2 },
];

export const DashboardGrid = () => {
    const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS);
    const gridRef = useRef<HTMLDivElement>(null);

    const [interaction, setInteraction] = useState<InteractionState | null>(null);
    const [previewLayout, setPreviewLayout] = useState<DashboardItem[] | null>(null);

    const handleAddItem = (type: ItemType) => {
        const configs: Record<
            ItemType,
            Pick<DashboardItem, 'w' | 'h' | 'minW' | 'minH' | 'title'>
        > = {
            metric: { w: 3, h: 1, minW: 2, minH: 1, title: 'New Metric' },
            chart: { w: 6, h: 2, minW: 4, minH: 2, title: 'New Chart' },
            table: { w: 6, h: 2, minW: 4, minH: 2, title: 'New Table' },
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
        document.body.style.userSelect = 'none';
    };

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
            document.body.style.userSelect = '';
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
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Responsive Dashboard Grid</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        리사이즈 시 주변 패널 실시간 압축(Squeeze) 반응형 레이아웃 엔진
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAddItem('metric')}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                    >
                        <Activity size={16} /> + Metric
                    </button>
                    <button
                        onClick={() => handleAddItem('chart')}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                    >
                        <BarChart2 size={16} /> + Chart
                    </button>
                    <button
                        onClick={() => handleAddItem('table')}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                    >
                        <LayoutList size={16} /> + Table
                    </button>
                </div>
            </div>

            <div
                ref={gridRef}
                className="max-w-7xl mx-auto relative select-none"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_CONFIG.COLUMNS}, minmax(0, 1fr))`,
                    gridAutoRows: `${GRID_CONFIG.ROW_HEIGHT}px`,
                    gap: `${GRID_CONFIG.GAP}px`,
                }}
            >
                {displayItems.map((item) => (
                    <GridItem
                        key={item.id}
                        item={item}
                        isInteracting={interaction?.id === item.id}
                        onPointerDown={(e, type) => handlePointerDown(e, item, type)}
                        onToggleRowSpan={() => toggleRowSpan(item.id)}
                        onRemove={() => handleRemoveItem(item.id)}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 flex items-start gap-3">
                <Activity className="shrink-0 mt-0.5" size={16} />
                <div>
                    <p className="font-semibold mb-1">
                        반응형 리사이즈 및 드래그 엔진 업데이트 내용
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-indigo-700/80">
                        <li>
                            <b>[New!]</b> 패널을 드래그하여{' '}
                            <b>
                                다른 패널 위에 겹쳐 놓으면, 기존 패널들을 우측으로
                                밀어냅니다(Reflow)
                            </b>
                            . 공간이 부족하면 자동으로 다음 줄의 좌측으로 내려갑니다!
                        </li>
                        <li>
                            패널을 드래그할 때,{' '}
                            <b>빈 틈새를 겨냥하면 공간에 맞춰 자동으로 크기가 축소(Auto-shrink)</b>
                            되어 쏙 들어갑니다. 큰 영역으로 나오면 원래 크기로 복구됩니다.
                        </li>
                        <li>
                            패널의 크기를 키울 때, <b>다른 패널을 밀어내며(Squeeze)</b> 크기를
                            양보받습니다. 최소 크기에 다다르면 화면 밖으로 밀어냅니다.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
