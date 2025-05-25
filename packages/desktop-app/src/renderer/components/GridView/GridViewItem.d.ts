import React from 'react';
import { ContentItem } from '@mosaiq/core';
import './GridViewItem.css';
interface GridViewItemProps {
    item: ContentItem;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => Promise<void>;
    formatDate: (dateString: string) => string;
    getSourceIcon: (item: ContentItem) => string;
}
export declare const GridViewItem: React.FC<GridViewItemProps>;
export {};
//# sourceMappingURL=GridViewItem.d.ts.map