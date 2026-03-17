import type { DashboardItem } from '../types/grid';
import { GRID_CONFIG } from '../constants/grid';

// AABB(Axis-Aligned Bounding Box) 충돌 검증
export const canPlaceItem = (
    items: DashboardItem[],
    newItem: Pick<DashboardItem, 'x' | 'y' | 'w' | 'h'>,
    excludeId: string | null = null
): boolean => {
    if (newItem.x < 0 || newItem.x + newItem.w > GRID_CONFIG.COLUMNS) return false;
    if (newItem.y < 0) return false;

    return !items.some((item) => {
        if (item.id === excludeId) return false;
        return !(
            newItem.x >= item.x + item.w ||
            newItem.x + newItem.w <= item.x ||
            newItem.y >= item.y + item.h ||
            newItem.y + newItem.h <= item.y
        );
    });
};

// ⭐️ [신규] 충돌 시 다른 아이템들을 우측/아래로 밀어내는 연쇄 Reflow 알고리즘
export const calculateReflowLayout = (
    initialItems: DashboardItem[],
    targetItem: DashboardItem
): DashboardItem[] => {
    // 1. 타겟 아이템을 가장 먼저 확정된 배열(draft)에 배치
    const draft: DashboardItem[] = [targetItem];

    // 2. 나머지 아이템들을 원래의 시각적 순서(위에서 아래, 좌에서 우)로 정렬하여 순차 처리
    const others = initialItems.filter((i) => i.id !== targetItem.id);
    others.sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
    });

    for (const item of others) {
        if (canPlaceItem(draft, item)) {
            draft.push(item); // 충돌하지 않으면 그대로 배치
        } else {
            // 충돌 발생: 현재 위치에서 오른쪽으로 1칸씩 이동하며 스캔
            let cx = item.x;
            let cy = item.y;

            while (true) {
                cx++; // 오른쪽으로 밀기

                // 오른쪽 끝을 벗어나면 다음 줄(아래)의 맨 왼쪽으로 래핑(내려보내기)
                if (cx + item.w > GRID_CONFIG.COLUMNS) {
                    cx = 0;
                    cy++;
                }

                if (canPlaceItem(draft, { ...item, x: cx, y: cy })) {
                    draft.push({ ...item, x: cx, y: cy });
                    break; // 빈 공간을 찾으면 배치 완료 후 루프 종료
                }

                // 브라우저 멈춤 방지를 위한 안전장치
                if (cy > 100) {
                    draft.push({ ...item, x: cx, y: cy });
                    break;
                }
            }
        }
    }
    return draft;
};

// 빈 공간 자동 탐색
export const findNextAvailablePosition = (
    items: DashboardItem[],
    w: number,
    h: number
): { x: number; y: number } => {
    let y = 0;
    while (y < 50) {
        for (let x = 0; x <= GRID_CONFIG.COLUMNS - w; x++) {
            if (canPlaceItem(items, { x, y, w, h })) return { x, y };
        }
        y++;
    }
    return { x: 0, y: Math.max(0, ...items.map((i) => i.y + i.h)) };
};

// ⭐️ [신규] 드래그 중 빈 공간에 맞춰 자동으로 크기를 축소하는 알고리즘
export const findBestFit = (
    items: DashboardItem[],
    startX: number,
    startY: number,
    initialW: number,
    initialH: number,
    minW: number,
    minH: number,
    excludeId: string
): { w: number; h: number } | null => {
    // 1. 원래 크기로 들어갈 수 있으면 최우선 반환 (원상복구 기능)
    if (canPlaceItem(items, { x: startX, y: startY, w: initialW, h: initialH }, excludeId)) {
        return { w: initialW, h: initialH };
    }

    // 2. 불가능하다면 최소 크기(minW, minH)까지 줄여보며 가장 큰 면적의 크기를 탐색
    let bestArea = 0;
    let bestFit: { w: number; h: number } | null = null;

    for (let w = initialW; w >= minW; w--) {
        for (let h = initialH; h >= minH; h--) {
            if (canPlaceItem(items, { x: startX, y: startY, w, h }, excludeId)) {
                const area = w * h;
                if (area > bestArea) {
                    bestArea = area;
                    bestFit = { w, h };
                } else if (area === bestArea && bestFit) {
                    // 면적이 같다면 대시보드 특성상 너비(w)가 더 넓은 것을 선호
                    if (w > bestFit.w) bestFit = { w, h };
                }
            }
        }
    }

    return bestFit;
};

// ⭐️ [신규] 리사이즈 시 주변 아이템을 압축(Squeeze)하는 반응형 레이아웃 계산
export const calculateSqueezedLayout = (
    originalItems: DashboardItem[],
    targetId: string,
    proposedTarget: DashboardItem
): DashboardItem[] | null => {
    // 1. 타겟 자체가 그리드를 벗어나거나 최소 크기를 위반하면 거부
    if (
        proposedTarget.w < (proposedTarget.minW || 1) ||
        proposedTarget.h < (proposedTarget.minH || 1)
    )
        return null;
    if (proposedTarget.x + proposedTarget.w > GRID_CONFIG.COLUMNS) return null;
    if (proposedTarget.y < 0) return null;

    // 불변성 유지를 위한 깊은 복사 (1 Depth)
    const draft = originalItems.map((item) => ({ ...item }));
    const targetIndex = draft.findIndex((i) => i.id === targetId);
    const originalTarget = originalItems[targetIndex];

    draft[targetIndex] = proposedTarget; // 제안된 타겟 크기 반영

    let isValid = true;

    // 2. 다른 아이템들과의 충돌 검사 및 압축(Shrink) 처리
    for (let i = 0; i < draft.length; i++) {
        if (i === targetIndex) continue;
        const c = draft[i];

        const isColliding = !(
            proposedTarget.x >= c.x + c.w ||
            proposedTarget.x + proposedTarget.w <= c.x ||
            proposedTarget.y >= c.y + c.h ||
            proposedTarget.y + proposedTarget.h <= c.y
        );

        if (isColliding) {
            // 충돌 발생: 해당 아이템이 원래 타겟의 '오른쪽'에 있었는지 '아래'에 있었는지 파악
            const wasToRight = originalTarget.x + originalTarget.w <= c.x;
            const wasBelow = originalTarget.y + originalTarget.h <= c.y;

            if (wasToRight) {
                // 우측으로 밀어내며 너비 축소
                const overlapX = proposedTarget.x + proposedTarget.w - c.x;
                c.x += overlapX;
                c.w -= overlapX;

                // ⭐️ [핵심 개선] 축소하다가 최소 너비(minW)를 위반하면, 찌그러뜨리지 않고 우측으로 온전히 밀어내기(Push)
                if (c.w < (c.minW || 1)) {
                    c.w = c.minW || 1;
                    c.x = proposedTarget.x + proposedTarget.w;
                }
            } else if (wasBelow) {
                // 아래로 밀어내며 높이 축소
                const overlapY = proposedTarget.y + proposedTarget.h - c.y;
                c.y += overlapY;
                c.h -= overlapY;

                // ⭐️ [핵심 개선] 축소하다가 최소 높이(minH)를 위반하면, 찌그러뜨리지 않고 아래로 온전히 밀어내기(Push)
                if (c.h < (c.minH || 1)) {
                    c.h = c.minH || 1;
                    c.y = proposedTarget.y + proposedTarget.h;
                }
            } else {
                // 이미 겹쳐있었거나 비정상적인 충돌이면 리사이즈 취소
                isValid = false;
                break;
            }

            // 3. 밀어낸 후 화면 밖으로 나가는지 확인
            if (c.x + c.w > GRID_CONFIG.COLUMNS || c.y < 0) {
                isValid = false;
                break;
            }

            // 3. 밀어낸 후 이웃 패널이 최소 크기를 위반하는지 확인
            if (
                c.w < (c.minW || 1) ||
                c.h < (c.minH || 1) ||
                c.x + c.w > GRID_CONFIG.COLUMNS ||
                c.y < 0
            ) {
                isValid = false;
                break;
            }

            // 4. 밀려난 이웃 패널이 또 다른 패널과 연쇄 충돌을 일으키는지 확인 (안정성을 위해 1차 충돌만 허용)
            const hasSecondaryCollision = draft.some((other, oIdx) => {
                if (oIdx === i || oIdx === targetIndex) return false;
                return !(
                    c.x >= other.x + other.w ||
                    c.x + c.w <= other.x ||
                    c.y >= other.y + other.h ||
                    c.y + c.h <= other.y
                );
            });

            if (hasSecondaryCollision) {
                isValid = false;
                break;
            }
        }
    }

    return isValid ? draft : null;
};
