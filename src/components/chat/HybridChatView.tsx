import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Tag, Spin, Empty, Collapse, List, Button } from 'antd';
import { MergeCellsOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface HybridChatProps {
  chatId: string;
}

interface HybridChat {
  hybridChatId: string;
  title: string;
  chunkCount: number;
  sourceChats: string[];
  createdAt: string;
  chunks: any[];
  metadata: {
    merged_from: string[];
    import_method: string;
    [key: string]: any;
  };
}

interface SourceChat {
  id: string;
  title: string;
  sourceType: string;
}

const HybridChatView: React.FC<HybridChatProps> = ({ chatId }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [hybridChat, setHybridChat] = useState<HybridChat | null>(null);
  const [sourceChats, setSourceChats] = useState<SourceChat[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Color palette based on theme
  const colors = theme === 'dark'
    ? { primary: '#333446', secondary: '#7F8CAA', accent: '#B8CFCE', text: '#EAEFEF' }
    : { primary: '#E7EFC7', secondary: '#AEC8A4', accent: '#8A784E', text: '#3B3B1A' };

  useEffect(() => {
    fetchHybridChat();
  }, [chatId]);

  const fetchHybridChat = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hybrid-chats/${chatId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hybrid chat: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHybridChat(data);
      
      // Fetch source chat details
      if (data.sourceChats && data.sourceChats.length > 0) {
        await fetchSourceChats(data.sourceChats);
      }
    } catch (err) {
      console.error('Error fetching hybrid chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hybrid chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchSourceChats = async (sourceIds: string[]) => {
    try {
      const sourceChatDetails: SourceChat[] = [];
      
      for (const id of sourceIds) {
        const response = await fetch(`/api/chats/${id}`);
        if (response.ok) {
          const data = await response.json();
          sourceChatDetails.push({
            id: data.id,
            title: data.title,
            sourceType: data.sourceType || 'unknown'
          });
        }
      }
      
      setSourceChats(sourceChatDetails);
    } catch (err) {
      console.error('Error fetching source chats:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !hybridChat) {
    return (
      <Empty
        description={error || "Hybrid chat not found"}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? colors.primary : '#fff',
    color: colors.text,
    borderRadius: '8px',
    marginBottom: '20px',
  };

  const headerStyle = {
    backgroundColor: theme === 'dark' ? '#252636' : colors.secondary,
    padding: '16px',
    borderRadius: '8px 8px 0 0',
    borderBottom: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
  };

  return (
    <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MergeCellsOutlined style={{ fontSize: '24px', marginRight: '12px', color: colors.accent }} />
          <Title level={4} style={{ margin: 0, color: colors.text }}>
            {hybridChat.title}
          </Title>
        </div>
        <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
          Created on {formatDate(hybridChat.createdAt)}
        </Text>
        <Tag color="purple" style={{ marginTop: '8px' }}>Hybrid Chat</Tag>
      </div>
      
      <div style={{ padding: '16px' }}>
        <Paragraph>
          This hybrid chat combines content from {hybridChat.sourceChats.length} source chats,
          with a total of {hybridChat.chunkCount} messages.
        </Paragraph>
        
        <Divider orientation="left">Source Chats</Divider>
        
        <Collapse 
          ghost 
          expandIcon={({ isActive }) => isActive ? <DownOutlined /> : <RightOutlined />}
        >
          <Panel header="View Source Chats" key="1">
            <List
              itemLayout="horizontal"
              dataSource={sourceChats}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={<a href={`/chat/${item.id}`}>{item.title}</a>}
                    description={
                      <Tag color="blue">{item.sourceType}</Tag>
                    }
                  />
                  <Button type="link" href={`/chat/${item.id}`}>View</Button>
                </List.Item>
              )}
              locale={{ emptyText: 'No source chat details available' }}
            />
          </Panel>
        </Collapse>
      </div>
    </Card>
  );
};

export default HybridChatView;
