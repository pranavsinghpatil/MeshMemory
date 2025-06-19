import React, { useState, useEffect } from 'react';
import { Button, Modal, Checkbox, List, Spin, message, Typography, Tag } from 'antd';
import { MergeCellsOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

interface Chat {
  id: string;
  title: string;
  sourceType: string;
  importDate: string;
  chunkCount: number;
}

const HybridChatMerge: React.FC = () => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [mergeTitle, setMergeTitle] = useState('');

  // Color palette based on theme
  const colors = theme === 'dark'
    ? { primary: '#333446', secondary: '#7F8CAA', accent: '#B8CFCE', text: '#EAEFEF' }
    : { primary: '#E7EFC7', secondary: '#AEC8A4', accent: '#8A784E', text: '#3B3B1A' };

  useEffect(() => {
    if (isModalVisible) {
      fetchChats();
    }
  }, [isModalVisible]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      message.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedChats([]);
    setMergeTitle('');
  };

  const handleMerge = async () => {
    if (selectedChats.length < 2) {
      message.warning('Please select at least 2 chats to merge');
      return;
    }

    if (!mergeTitle.trim()) {
      setMergeTitle(`Merged Chat (${new Date().toLocaleDateString()})`);
    }

    try {
      setMerging(true);
      const response = await fetch('/api/hybrid-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: mergeTitle,
          source_ids: selectedChats,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success('Chats merged successfully!');
        handleCancel();
        // Redirect to the new hybrid chat
        window.location.href = `/chat/${data.hybridChatId}`;
      } else {
        throw new Error(data.message || 'Failed to merge chats');
      }
    } catch (error) {
      console.error('Error merging chats:', error);
      message.error('Failed to merge chats');
    } finally {
      setMerging(false);
    }
  };

  const handleCheckboxChange = (chatId: string) => {
    setSelectedChats(prev => 
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const buttonStyle = {
    backgroundColor: colors.primary,
    color: colors.text,
    border: 'none',
    margin: '0 8px',
  };

  return (
    <>
      <Button 
        icon={<MergeCellsOutlined />} 
        onClick={showModal}
        style={buttonStyle}
      >
        Merge Chats
      </Button>
      
      <Modal
        title="Merge Chats"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleMerge}
        okText="Merge Selected"
        confirmLoading={merging}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Select multiple chats to merge into a hybrid chat:</Text>
          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              placeholder="Enter title for merged chat"
              value={mergeTitle}
              onChange={(e) => setMergeTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${colors.secondary}`,
                backgroundColor: theme === 'dark' ? colors.primary : '#fff',
                color: colors.text,
              }}
            />
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={chats}
            renderItem={(chat) => (
              <List.Item
                style={{
                  backgroundColor: selectedChats.includes(chat.id) 
                    ? (theme === 'dark' ? '#4a4c63' : '#f0f7e4') 
                    : 'transparent',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              >
                <Checkbox
                  checked={selectedChats.includes(chat.id)}
                  onChange={() => handleCheckboxChange(chat.id)}
                  style={{ marginRight: '12px' }}
                />
                <List.Item.Meta
                  title={chat.title}
                  description={
                    <div>
                      <Tag color={chat.sourceType === 'hybrid' ? 'purple' : 'blue'}>
                        {chat.sourceType}
                      </Tag>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {new Date(chat.importDate).toLocaleDateString()} • 
                        {chat.chunkCount} messages
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
        
        {selectedChats.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>{selectedChats.length} chats selected</Text>
          </div>
        )}
      </Modal>
    </>
  );
};

export default HybridChatMerge;
