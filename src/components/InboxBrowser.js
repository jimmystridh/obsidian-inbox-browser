import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InboxItem from './InboxItem';
import { Archive, BookOpen, Calendar, Trash2, Eye, CheckSquare } from 'lucide-react';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
`;

const ItemCount = styled.span`
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.show ? 1 : 0};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

const BulkActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.variant === 'danger' ? '#fed7d7' : '#ebf8ff'};
  color: ${props => props.variant === 'danger' ? '#c53030' : '#3182ce'};
  border: 1px solid ${props => props.variant === 'danger' ? '#feb2b2' : '#bee3f8'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#feb2b2' : '#bee3f8'};
  }
`;

const ItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-gap: 1rem;
  align-content: start;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #718096;
`;

const EmptyIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: #edf2f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f7fafc;
  }
`;

const InboxBrowser = ({ items, onItemProcessed, isFiltered }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Reset selection when items change
  useEffect(() => {
    setSelectedItems(new Set());
  }, [items]);

  const handleItemSelect = (itemId, isSelected) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) return;
    
    setIsProcessingBulk(true);
    
    try {
      const selectedItemsArray = items.filter(item => selectedItems.has(item.id));
      
      for (const item of selectedItemsArray) {
        try {
          await window.electronAPI.processItem(action, item);
          onItemProcessed(item);
        } catch (error) {
          console.error(`Failed to process item ${item.id}:`, error);
        }
      }
      
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const getHeaderTitle = () => {
    if (isFiltered) {
      return `Filtered Items`;
    }
    return 'Inbox Items';
  };

  if (items.length === 0) {
    return (
      <BrowserContainer>
        <Header>
          <HeaderLeft>
            <Title>{getHeaderTitle()}</Title>
            <ItemCount>0 items</ItemCount>
          </HeaderLeft>
        </Header>
        <ItemsContainer>
          <EmptyState>
            <EmptyIcon>
              <Archive size={24} />
            </EmptyIcon>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {isFiltered ? 'No items match your filter' : 'Inbox is empty'}
            </h3>
            <p>
              {isFiltered 
                ? 'Try adjusting your search or filter criteria'
                : 'All items have been processed! Great work!'
              }
            </p>
          </EmptyState>
        </ItemsContainer>
      </BrowserContainer>
    );
  }

  return (
    <BrowserContainer>
      <Header>
        <HeaderLeft>
          <Title>{getHeaderTitle()}</Title>
          <ItemCount>{items.length} items</ItemCount>
          
          <SelectAllContainer>
            <SelectAllButton onClick={handleSelectAll}>
              <CheckSquare size={16} />
              {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
            </SelectAllButton>
          </SelectAllContainer>
        </HeaderLeft>
        
        <BulkActions show={selectedItems.size > 0}>
          <span style={{ fontSize: '0.875rem', color: '#4a5568', marginRight: '0.5rem' }}>
            {selectedItems.size} selected
          </span>
          
          <BulkActionButton 
            onClick={() => handleBulkAction('read-later')}
            disabled={isProcessingBulk}
          >
            <BookOpen size={16} />
            Read Later
          </BulkActionButton>
          
          <BulkActionButton 
            onClick={() => handleBulkAction('archive')}
            disabled={isProcessingBulk}
          >
            <Archive size={16} />
            Archive
          </BulkActionButton>
          
          <BulkActionButton 
            onClick={() => handleBulkAction('schedule')}
            disabled={isProcessingBulk}
          >
            <Calendar size={16} />
            Schedule
          </BulkActionButton>
          
          <BulkActionButton 
            variant="danger"
            onClick={() => handleBulkAction('delete')}
            disabled={isProcessingBulk}
          >
            <Trash2 size={16} />
            Delete
          </BulkActionButton>
        </BulkActions>
      </Header>
      
      <ItemsContainer>
        {items.map((item, index) => (
          <InboxItem
            key={item.id}
            item={item}
            index={index}
            onProcessed={onItemProcessed}
            isSelected={selectedItems.has(item.id)}
            onSelect={handleItemSelect}
          />
        ))}
      </ItemsContainer>
    </BrowserContainer>
  );
};

export default InboxBrowser;