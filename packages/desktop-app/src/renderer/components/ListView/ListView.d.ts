import React from 'react';
import { ContentItem } from '@mosaiq/core';
import './ListView.css';
interface ListViewProps {
    items: ContentItem[];
    onItemClick: (id: string) => void;
    onDeleteItem: (id: string, e: React.MouseEvent) => Promise<void>;
    formatDate: (dateString: string) => string;
    formatTime: (dateString: string) => string;
    getSourceIcon: (item: ContentItem) => string;
}
export declare const ListView: React.FC<ListViewProps>;
export {};
//# sourceMappingURL=ListView.d.ts.map