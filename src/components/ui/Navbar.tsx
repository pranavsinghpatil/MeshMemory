import React, { useState } from 'react';
import { Layout, Button, Typography, Space, Avatar, Dropdown, Menu } from 'antd';
import { 
  UserOutlined, 
  DownOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  ImportOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import HybridChatMerge from '../chat/HybridChatMerge';
import MultiImportDialog from '../MultiImportDialog';

const { Header } = Layout;
const { Title } = Typography;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  
  // Color palette based on theme
  const colors = theme === 'dark'
    ? { primary: '#333446', secondary: '#7F8CAA', accent: '#B8CFCE', text: '#EAEFEF' }
    : { primary: '#E7EFC7', secondary: '#AEC8A4', accent: '#8A784E', text: '#3B3B1A' };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  const userMenu = (
    <Menu
      style={{ 
        backgroundColor: theme === 'dark' ? colors.primary : '#fff',
        color: colors.text
      }}
    >
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => navigate('/login')}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    backgroundColor: theme === 'dark' ? colors.primary : '#fff',
    color: colors.text,
    height: '64px',
    lineHeight: '64px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const logoStyle = {
    color: colors.accent,
    margin: 0,
    cursor: 'pointer',
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    color: colors.text,
    border: 'none',
    margin: '0 4px',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.accent,
    color: theme === 'dark' ? colors.primary : '#fff',
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Header style={navbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={logoStyle} onClick={handleHomeClick}>
          knitter.app
        </Title>
      </div>
      
      <Space size="middle">
        <Button
          icon={<HomeOutlined />}
          style={isActive('/') && !isActive('/import') ? activeButtonStyle : buttonStyle}
          onClick={handleHomeClick}
        >
          Home
        </Button>
        
        <Button
          icon={<ImportOutlined />}
          style={buttonStyle}
          onClick={handleImportClick}
        >
          Import
        </Button>
        
        <HybridChatMerge />
        
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Button style={buttonStyle}>
            <Space>
              <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: colors.secondary }} />
              User
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Space>
      {showImportDialog && (
        <MultiImportDialog isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} />
      )}
    </Header>
  );
};

export default Navbar;
