import React from 'react';
import { ContentItem } from '@mosaiq/core';
import { ListViewItem } from './ListViewItem';
import './ListView.css';

interface ListViewProps {
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onDeleteItem: (id: string, e?: React.MouseEvent) => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  getSourceIcon: (item: ContentItem) => string;
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  onItemClick,
  onDeleteItem,
  formatDate,
  formatTime,
  getSourceIcon
}) => {
  return (
    <div className="list-view">
      <div className="list-header">
        <div className="list-header-item list-header-icon"></div>
        <div className="list-header-item list-header-title">Title</div>
        <div className="list-header-item list-header-author">Author</div>
        <div className="list-header-item list-header-date">Date Added</div>
        <div className="list-header-item list-header-time">Time</div>
        <div className="list-header-item list-header-actions"></div>
      </div>
      <div className="list-items">
        {items.map(item => (
          <ListViewItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item.id)}
            onDelete={(e) => onDeleteItem(item.id, e)}
            formatDate={formatDate}
            formatTime={formatTime}
            getSourceIcon={getSourceIcon}
          />
        ))}
      </div>
    </div>
  );
};
