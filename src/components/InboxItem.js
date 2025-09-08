import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ExternalLink, 
  Archive, 
  BookOpen, 
  Calendar, 
  Trash2, 
  Eye,
  Twitter,
  Youtube,
  Github,
  MessageSquare,
  Link,
  FileText,
  Globe,
  Clock,
  CheckSquare,
  Square,
  Briefcase,
  Home,
  Tag,
  Brain
} from 'lucide-react';

const ItemCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e0;
  }
  
  ${props => props.isSelected && `
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  `}
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const SelectCheckbox = styled.button`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.25rem;
  background: ${props => props.checked ? '#3182ce' : 'transparent'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 0.125rem;
  
  &:hover {
    border-color: #3182ce;
  }
`;

const ItemIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: ${props => props.bgColor || '#f7fafc'};
  color: ${props => props.color || '#4a5568'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTimestamp = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const ItemTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 0.5rem;
  line-height: 1.25;
`;

const ItemText = styled.p`
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetadataSection = styled.div`
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #edf2f7;
`;

const MetadataTitle = styled.h5`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  line-height: 1.25;
`;

const MetadataDescription = styled.p`
  color: #718096;
  font-size: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetadataImage = styled.img`
  width: 100%;
  height: 8rem;
  object-fit: cover;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
`;

const LoadingMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.75rem;
  font-style: italic;
`;

const UrlList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const UrlChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: #edf2f7;
  color: #4a5568;
  text-decoration: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: #2d3748;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: ${props => props.variant === 'primary' ? '#ebf8ff' : props.variant === 'danger' ? '#fed7d7' : '#f7fafc'};
  color: ${props => props.variant === 'primary' ? '#3182ce' : props.variant === 'danger' ? '#c53030' : '#4a5568'};
  border: 1px solid ${props => props.variant === 'primary' ? '#bee3f8' : props.variant === 'danger' ? '#feb2b2' : '#e2e8f0'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#bee3f8' : props.variant === 'danger' ? '#feb2b2' : '#edf2f7'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const getTypeIcon = (type) => {
  const iconProps = { size: 16 };
  
  const iconConfig = {
    twitter: { icon: <Twitter {...iconProps} />, color: '#1da1f2', bgColor: '#e1f5fe' },
    threads: { icon: <MessageSquare {...iconProps} />, color: '#000', bgColor: '#f5f5f5' },
    youtube: { icon: <Youtube {...iconProps} />, color: '#ff0000', bgColor: '#ffebee' },
    github: { icon: <Github {...iconProps} />, color: '#333', bgColor: '#f5f5f5' },
    link: { icon: <Link {...iconProps} />, color: '#3182ce', bgColor: '#ebf8ff' },
    note: { icon: <FileText {...iconProps} />, color: '#805ad5', bgColor: '#faf5ff' },
    'swedish-note': { icon: <FileText {...iconProps} />, color: '#d69e2e', bgColor: '#fffbeb' },
    default: { icon: <Globe {...iconProps} />, color: '#718096', bgColor: '#f7fafc' }
  };
  
  return iconConfig[type] || iconConfig.default;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'No timestamp';
  
  try {
    let date;
    
    // Handle different timestamp formats
    if (timestamp.includes('T')) {
      // ISO format: "2024-05-20T16:47:59"
      date = new Date(timestamp);
    } else if (timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // Inbox format: "2024-05-20 16:47:59"
      date = new Date(timestamp.replace(' ', 'T'));
    } else if (timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      // Inbox format without seconds: "2024-05-20 16:47"
      date = new Date(timestamp.replace(' ', 'T') + ':00');
    } else {
      // Twitter format: "Wed Aug 27 15:04:32 +0000 2025"
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      console.log(`❌ Invalid date format: "${timestamp}" (type: ${typeof timestamp})`);
      console.log(`❌ Timestamp details:`, { timestamp, length: timestamp?.length });
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffHours < 1) {
      const diffMins = Math.round(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    } else if (diffDays < 30) {
      return `${Math.round(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.log(`Date formatting error for ${timestamp}:`, error.message);
    return timestamp;
  }
};

const InboxItem = ({ item, onProcessed, isSelected, onSelect }) => {
  const [metadata, setMetadata] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Debug logging for frontend
  console.log(`🎨 Rendering item:`, {
    type: item.type,
    content: item.content.substring(0, 50) + '...',
    urls: item.urls,
    timestamp: item.timestamp
  });
  
  const typeConfig = getTypeIcon(item.type);

  useEffect(() => {
    if (item.urls.length > 0 && !metadata && !loadingMetadata) {
      fetchMetadata();
    }
  }, [item.urls]);


  const fetchMetadata = async () => {
    if (item.urls.length === 0) return;
    
    setLoadingMetadata(true);
    try {
      // Fetch metadata for the first URL
      const result = await window.electronAPI.fetchMetadata(item.urls[0]);
      
      if (result.success) {
        setMetadata(result.metadata);
      }
    } catch (error) {
      console.error('❌ Failed to fetch metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleAction = async (action) => {
    setProcessing(true);
    
    try {
      const context = {};
      const result = await window.electronAPI.processItem(action, item, context);
      
      if (result.success) {
        onProcessed(item);
      } else {
        console.error('Action failed:', result.error);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setProcessing(false);
    }
  };


  const handleExternalLink = (url) => {
    window.electronAPI.openExternal(url);
  };

  const handleSelect = () => {
    onSelect(item.id, !isSelected);
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <ItemCard isSelected={isSelected}>
      <ItemHeader>
        <SelectCheckbox checked={isSelected} onClick={handleSelect}>
          {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
        </SelectCheckbox>
        
        <ItemIcon bgColor={typeConfig.bgColor} color={typeConfig.color}>
          {typeConfig.icon}
        </ItemIcon>
        
        <ItemContent>
          <ItemTimestamp>
            <Clock size={12} />
            {formatTimestamp(item.timestamp)}
          </ItemTimestamp>
          
          <ItemTitle>
            {metadata?.title || 
             (item.urls.length > 0 ? 'Link' : 'Note') ||
             item.type.charAt(0).toUpperCase() + item.type.slice(1)
            }
          </ItemTitle>
        </ItemContent>
      </ItemHeader>

      <ItemText>
        {truncateText(item.content)}
      </ItemText>

      {item.urls.length > 0 && (
        <UrlList>
          {item.urls.map((url, index) => (
            <UrlChip
              key={index}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleExternalLink(url);
              }}
            >
              <ExternalLink size={10} />
              {new URL(url).hostname.replace('www.', '')}
            </UrlChip>
          ))}
        </UrlList>
      )}

      {loadingMetadata && (
        <LoadingMetadata>
          Loading preview...
        </LoadingMetadata>
      )}

      {metadata && !metadata.error && (
        <MetadataSection>
          {/* Enhanced Twitter display */}
          {metadata.type === 'twitter' && metadata.source === 'twitter-api' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {metadata.image && (
                  <img 
                    src={metadata.image}
                    alt={`@${metadata.author}`}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      border: '2px solid #e2e8f0'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#1a202c' }}>
                      {metadata.authorDisplayName || metadata.author}
                    </span>
                    {metadata.verified && (
                      <span style={{ 
                        background: '#1da1f2', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '1rem', 
                        height: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.625rem'
                      }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.875rem' }}>
                    @{metadata.author} • {formatTimestamp(metadata.createdAt)}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '0.875rem', 
                lineHeight: '1.5', 
                color: '#2d3748',
                marginBottom: '0.75rem',
                whiteSpace: 'pre-wrap'
              }}>
                {metadata.fullText || metadata.description}
              </div>
              
              {metadata.metrics && (
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  color: '#718096', 
                  fontSize: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  {metadata.metrics.likes > 0 && <span>❤️ {metadata.metrics.likes}</span>}
                  {metadata.metrics.retweets > 0 && <span>🔄 {metadata.metrics.retweets}</span>}
                  {metadata.metrics.replies > 0 && <span>💬 {metadata.metrics.replies}</span>}
                </div>
              )}
              
              {metadata.media && metadata.media.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  {metadata.media.slice(0, 1).map((mediaItem, index) => (
                    <img 
                      key={index}
                      src={mediaItem.media_url_https || mediaItem.media_url}
                      alt="Tweet media"
                      style={{
                        width: '100%',
                        maxHeight: '12rem',
                        objectFit: 'cover',
                        borderRadius: '0.5rem'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Standard metadata display for non-Twitter or fallback content */}
          {!(metadata.type === 'twitter' && metadata.source === 'twitter-api') && (
            <>
              {metadata.image && (
                <MetadataImage 
                  src={metadata.image} 
                  alt={metadata.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <MetadataTitle>{metadata.title}</MetadataTitle>
              {metadata.description && (
                <MetadataDescription>{metadata.description}</MetadataDescription>
              )}
            </>
          )}
        </MetadataSection>
      )}


      <Actions>
        {/* Standard Actions */}
        <ActionButton 
          onClick={() => handleAction('read-later')}
          disabled={processing}
          variant="primary"
        >
          <BookOpen size={12} />
          Read Later
        </ActionButton>
        <ActionButton 
          onClick={() => handleAction('archive')}
          disabled={processing}
        >
          <Archive size={12} />
          Archive
        </ActionButton>
        <ActionButton 
          onClick={() => handleAction('schedule')}
          disabled={processing}
        >
          <Calendar size={12} />
          Schedule
        </ActionButton>
        
        {/* Always available actions */}
        <ActionButton 
          onClick={() => handleAction('extract')}
          disabled={processing}
        >
          <Eye size={12} />
          Extract
        </ActionButton>
        
        <ActionButton 
          onClick={() => handleAction('delete')}
          disabled={processing}
          variant="danger"
        >
          <Trash2 size={12} />
          Delete
        </ActionButton>
      </Actions>
    </ItemCard>
  );
};

export default InboxItem;