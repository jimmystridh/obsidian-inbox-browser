import React from 'react';
import styled from 'styled-components';
import { 
  Search, 
  RefreshCw, 
  BarChart3, 
  Filter,
  Twitter,
  Youtube,
  Github,
  MessageSquare,
  Link,
  FileText,
  Globe,
  Hash,
  Briefcase,
  Home,
  Tag,
  Brain
} from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 280px;
  min-width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    background: white;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #a0aec0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const Section = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: ${props => props.active ? '#ebf8ff' : 'transparent'};
  border: none;
  border-radius: 0.375rem;
  color: ${props => props.active ? '#3182ce' : '#4a5568'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    background: ${props => props.active ? '#ebf8ff' : '#f7fafc'};
  }
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterCount = styled.span`
  background: ${props => props.active ? '#3182ce' : '#e2e8f0'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StatsContainer = styled.div`
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
`;

const StatValue = styled.span`
  color: #1a202c;
  font-weight: 500;
  font-size: 0.875rem;
`;

const getFilterIcon = (type) => {
  const iconProps = { size: 16 };
  
  switch (type) {
    case 'twitter': return <Twitter {...iconProps} />;
    case 'threads': return <MessageSquare {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    case 'github': return <Github {...iconProps} />;
    case 'link': return <Link {...iconProps} />;
    case 'note': return <FileText {...iconProps} />;
    case 'swedish-note': return <Hash {...iconProps} />;
    default: return <Globe {...iconProps} />;
  }
};

const getFilterLabel = (type) => {
  const labels = {
    twitter: 'Twitter/X',
    threads: 'Threads',
    youtube: 'YouTube',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    spotify: 'Spotify',
    bluesky: 'Bluesky',
    hackernews: 'Hacker News',
    reddit: 'Reddit',
    link: 'Articles',
    note: 'Notes',
    'swedish-note': 'Swedish',
    website: 'Websites'
  };
  
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const Sidebar = ({ 
  stats, 
  selectedFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange,
  onRefresh 
}) => {
  // Add classification-based filters
  const classificationFilters = [
    { key: 'work-classified', label: 'Work Items', count: 0, icon: <Briefcase size={16} /> },
    { key: 'personal-classified', label: 'Personal Items', count: 0, icon: <Home size={16} /> },
    { key: 'mixed-classified', label: 'Mixed Content', count: 0, icon: <Tag size={16} /> },
    { key: 'unclear-classified', label: 'Needs Review', count: 0, icon: <Brain size={16} /> }
  ];

  const filterOptions = [
    { key: 'all', label: 'All Items', count: stats?.total || 0 },
    ...classificationFilters,
    { key: 'divider', label: '---', count: 0 },
    ...(stats?.byType ? Object.entries(stats.byType).map(([type, count]) => ({
      key: type,
      label: getFilterLabel(type),
      count
    })) : [])
  ].sort((a, b) => {
    // Keep 'all' and classification filters at top
    if (a.key === 'all') return -1;
    if (b.key === 'all') return 1;
    if (a.key.endsWith('-classified')) return -1;
    if (b.key.endsWith('-classified')) return 1;
    if (a.key === 'divider') return 0;
    return b.count - a.count;
  });

  return (
    <SidebarContainer>
      <Header>
        <Title>Inbox Browser</Title>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchContainer>
        <RefreshButton onClick={onRefresh}>
          <RefreshCw size={16} />
          Refresh
        </RefreshButton>
      </Header>
      
      <Section>
        <SectionTitle>
          <Filter size={16} />
          Filter by Type
        </SectionTitle>
        <FilterList>
          {filterOptions.map(({ key, label, count, icon }) => {
            if (key === 'divider') {
              return (
                <div key={key} style={{ 
                  height: '1px', 
                  background: '#e2e8f0', 
                  margin: '0.5rem 0',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: '#9ca3af'
                }}>
                  <span style={{ background: 'white', padding: '0 0.5rem' }}>Content Types</span>
                </div>
              );
            }
            
            return (
              <FilterItem
                key={key}
                active={selectedFilter === key}
                onClick={() => onFilterChange(key)}
              >
                <FilterLabel>
                  {icon || (key !== 'all' && getFilterIcon(key))}
                  {label}
                </FilterLabel>
                <FilterCount active={selectedFilter === key}>
                  {count}
                </FilterCount>
              </FilterItem>
            );
          })}
        </FilterList>
      </Section>
      
      {stats && (
        <StatsContainer>
          <SectionTitle>
            <BarChart3 size={16} />
            Statistics
          </SectionTitle>
          <StatItem>
            <StatLabel>Total Items</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Links</StatLabel>
            <StatValue>{stats.urlCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Notes</StatLabel>
            <StatValue>{stats.noteCount}</StatValue>
          </StatItem>
          
          {stats.byMonth && Object.keys(stats.byMonth).length > 0 && (
            <>
              <SectionTitle style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                Recent Activity
              </SectionTitle>
              {Object.entries(stats.byMonth)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 6)
                .map(([month, count]) => (
                  <StatItem key={month}>
                    <StatLabel>{month}</StatLabel>
                    <StatValue>{count}</StatValue>
                  </StatItem>
                ))}
            </>
          )}
        </StatsContainer>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;