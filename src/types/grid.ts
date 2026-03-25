export type ItemType = 'metric' | 'chart' | 'table';

export interface DashboardItem {
    id: string;
    type: ItemType;
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
}

export type InteractionType = 'drag' | 'resize';

export interface InteractionState {
    type: InteractionType;
    id: string;
    startX: number;
    startY: number;
    initialItem: DashboardItem;
    initialItems: DashboardItem[];
}
