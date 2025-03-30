import React from 'react';
import { ContentItem } from '@mosaiq/core';
import { GridViewItem } from './GridViewItem';
import './GridView.css';

interface GridViewProps {
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => Promise<void>;
  formatDate: (dateString: string) => string;
  getSourceIcon: (item: ContentItem) => string;
}

export const GridView: React.FC<GridViewProps> = ({
  items,
  onItemClick,
  onDeleteItem,
  formatDate,
  getSourceIcon
}) => {
  return (
    <div className="grid-view">
      {items.map(item => (
        <GridViewItem
          key={item.id}
          item={item}
          onClick={() => onItemClick(item.id)}
          onDelete={(e) => onDeleteItem(item.id, e)}
          formatDate={formatDate}
          getSourceIcon={getSourceIcon}
        />
      ))}
    </div>
  );
};
