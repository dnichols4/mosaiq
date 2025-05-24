import React from 'react';
import { ContentItem } from '@mosaiq/core';
import './ListViewItem.css';
interface ListViewItemProps {
    item: ContentItem;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => Promise<void>;
    formatDate: (dateString: string) => string;
    formatTime: (dateString: string) => string;
    getSourceIcon: (item: ContentItem) => string;
}
export declare const ListViewItem: React.FC<ListViewItemProps>;
export {};
//# sourceMappingURL=ListViewItem.d.ts.map