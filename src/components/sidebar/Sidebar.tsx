import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Divider, Switch } from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  SettingOutlined,
  BulbOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import GroupedImportButton from './GroupedImportButton';
import ChatMergeDialog from '../ChatMergeDialog';
import { Checkbox } from 'antd';
import { MergeOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Title, Text } = Typography;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Color palette based on theme
  const colors = theme === 'dark'
    ? { primary: '#333446', secondary: '#7F8CAA', accent: '#B8CFCE', text: '#EAEFEF' }
    : { primary: '#E7EFC7', secondary: '#AEC8A4', accent: '#8A784E', text: '#3B3B1A' };

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    navigate('/import');
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate('/login');
  };

  const sidebarStyle = {
    background: theme === 'dark' ? colors.primary : '#fff',
    color: colors.text,
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '16px 0' : '16px',
    borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`,
  };

  const buttonStyle = {
    backgroundColor: colors.primary,
    color: colors.text,
    border: 'none',
    marginBottom: '8px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const collapseButtonStyle = {
    position: 'absolute' as 'absolute',
    right: '-12px',
    top: '64px',
    zIndex: 1,
    width: '24px',
    height: '24px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: colors.accent,
    color: theme === 'dark' ? '#333' : '#fff',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  // Merge dialog
      <ChatMergeDialog
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        chats={chats
          .filter(chat => selectedChats.has(chat.id))
          .map(chat => ({ id: chat.id, title: chat.title, createdAt: chat.importDate, messageCount: chat.chunkCount }))}
        onMergeComplete={(newChatId: string) => { setSelectedChats(new Set()); setIsMergeModalOpen(false); navigate(`/chat/${newChatId}`); }}
      />
      <Sider
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={sidebarStyle}
    >
      <div style={logoStyle}>
        {!collapsed ? (
          <Title level={4} style={{ margin: 0, color: colors.accent }}>
            MeshMemory
          </Title>
        ) : (
          <Title level={4} style={{ margin: 0, color: colors.accent }}>
            k
          </Title>
        )}
      </div>

      <Button
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={collapseButtonStyle}
      />

      <div style={{ padding: collapsed ? '8px' : '16px' }}>
        <Button
          icon={<UploadOutlined />}
          onClick={handleImportClick}
          style={buttonStyle}
        >
          {!collapsed && 'Import Chat'}
        </Button>

        <GroupedImportButton />
        <Button
          icon={<MergeOutlined />}
          onClick={() => setIsMergeModalOpen(true)}
          disabled={selectedChats.size < 2}
          style={buttonStyle}
        >
          {!collapsed && `Merge Chats (${selectedChats.size})`}
        </Button>

        <Divider style={{ margin: '12px 0', borderColor: theme === 'dark' ? '#444' : '#eee' }} />

        <div style={{ marginBottom: '16px' }}>
          {!collapsed && (
            <Text style={{ color: colors.secondary, display: 'block', marginBottom: '8px' }}>
              Recent Chats
            </Text>
          )}

          <Menu
            mode="inline"
            selectedKeys={[location.pathname.split('/')[2] || '']}
            style={{ 
              background: 'transparent', 
              border: 'none',
              color: colors.text
            }}
          >
            {chats.map(chat => (  
                <Menu.Item
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  style={{
                    color: colors.text,
                    backgroundColor: 'transparent',
                    margin: '4px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={selectedChats.has(chat.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => setSelectedChats(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(chat.id)) newSet.delete(chat.id);
                        else newSet.add(chat.id);
                        return newSet;
                      })}
                    />
                    <span>
                      {chat.title.length > 20
                        ? `${chat.title.substring(0, 20)}...`
                        : chat.title}
                    </span>
                  </div>
                </Menu.Item>
            ))}
              <Menu.Item
                key={chat.id}
                icon={<FileTextOutlined />}
                onClick={() => handleChatClick(chat.id)}
                style={{
                  color: colors.text,
                  backgroundColor: 'transparent',
                  margin: '4px 0',
                }}
              >
                {chat.title.length > 20
                  ? `${chat.title.substring(0, 20)}...`
                  : chat.title}
              </Menu.Item>
            ))}
          </Menu>
        </div>

        <Divider style={{ margin: '12px 0', borderColor: theme === 'dark' ? '#444' : '#eee' }} />

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: collapsed ? 'center' : 'space-between' }}>
            <BulbOutlined style={{ color: colors.accent, marginRight: collapsed ? 0 : '8px' }} />
            {!collapsed && (
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                checkedChildren="Dark"
                unCheckedChildren="Light"
                style={{ backgroundColor: theme === 'dark' ? colors.accent : colors.secondary }}
              />
            )}
          </div>

          <Button
            icon={<SettingOutlined />}
            onClick={handleSettingsClick}
            style={buttonStyle}
          >
            {!collapsed && 'Settings'}
          </Button>

          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={buttonStyle}
          >
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
