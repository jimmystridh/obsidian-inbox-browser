import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import InboxBrowser from './components/InboxBrowser';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import './utils/api'; // Initialize API client for web version

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #f8fafc;
    color: #1a202c;
    overflow: hidden;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);

  const loadInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await window.electronAPI.loadInbox();
      
      if (result.success) {
        setItems(result.items);
        calculateStats(result.items);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (inboxItems) => {
    const totalItems = inboxItems.length;
    const typeCount = {};
    const monthCount = {};
    let urlCount = 0;
    let noteCount = 0;

    inboxItems.forEach(item => {
      // Count by type
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      
      // Count by month
      if (item.timestamp) {
        const month = item.timestamp.substring(0, 7);
        monthCount[month] = (monthCount[month] || 0) + 1;
      }
      
      // Count URLs vs notes
      if (item.urls.length > 0) {
        urlCount++;
      } else {
        noteCount++;
      }
    });

    setStats({
      total: totalItems,
      byType: typeCount,
      byMonth: monthCount,
      urlCount,
      noteCount
    });
  };

  const handleItemProcessed = (processedItem) => {
    // Remove the processed item from the list
    setItems(prev => prev.filter(item => item.id !== processedItem.id));
    
    // Recalculate stats
    calculateStats(items.filter(item => item.id !== processedItem.id));
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const filterItems = (items) => {
    let filtered = items;

    // Apply classification and type filters
    if (selectedFilter !== 'all') {
      if (selectedFilter.endsWith('-classified')) {
        // Classification filter
        const classificationCategory = selectedFilter.replace('-classified', '');
        filtered = filtered.filter(item => {
          // In a real app, this would use the actual classification
          // For now, we'll simulate classification based on content patterns
          return getSimulatedClassification(item) === classificationCategory;
        });
      } else {
        // Content type filter
        filtered = filtered.filter(item => item.type === selectedFilter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(query) ||
        item.urls.some(url => url.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // Temporary simulation of classification for filtering
  const getSimulatedClassification = (item) => {
    const content = item.content.toLowerCase();
    const urls = item.urls.join(' ').toLowerCase();
    
    // Work indicators
    if (urls.includes('github.com') || urls.includes('linkedin.com') || 
        content.includes('api') || content.includes('programming') ||
        content.includes('development') || content.includes('tech')) {
      return 'work';
    }
    
    // Personal indicators (Swedish terms, entertainment)
    if (content.includes('träning') || content.includes('hemma') ||
        content.includes('barn') || urls.includes('youtube.com') ||
        urls.includes('spotify.com') || urls.includes('instagram.com')) {
      return 'personal';
    }
    
    // Mixed content
    if (urls.includes('news.ycombinator.com') || content.includes('ai')) {
      return 'mixed';
    }
    
    return 'unclear';
  };

  // Set up file change listener
  useEffect(() => {
    const removeListener = window.electronAPI.onInboxFileChanged(() => {
      loadInbox();
    });

    return removeListener;
  }, [loadInbox]);

  // Initial load
  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <AppContainer>
        <GlobalStyle />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2 style={{ color: '#e53e3e' }}>Error loading inbox</h2>
          <p style={{ color: '#718096' }}>{error}</p>
          <button 
            onClick={loadInbox}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </AppContainer>
    );
  }

  const filteredItems = filterItems(items);

  return (
    <ErrorBoundary>
      <AppContainer>
        <GlobalStyle />
        <Sidebar 
          stats={stats}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={loadInbox}
        />
        <MainContent>
          <InboxBrowser 
            items={filteredItems}
            onItemProcessed={handleItemProcessed}
            isFiltered={selectedFilter !== 'all' || searchQuery !== ''}
          />
        </MainContent>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App;