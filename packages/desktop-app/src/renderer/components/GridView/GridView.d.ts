import React from 'react';
import { ContentItem } from '@mosaiq/core';
import './GridView.css';
interface GridViewProps {
    items: ContentItem[];
    onItemClick: (id: string) => void;
    onDeleteItem: (id: string, e: React.MouseEvent) => Promise<void>;
    formatDate: (dateString: string) => string;
    getSourceIcon: (item: ContentItem) => string;
}
export declare const GridView: React.FC<GridViewProps>;
export {};
//# sourceMappingURL=GridView.d.ts.map