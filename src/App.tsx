import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import HotLinks from './components/HotLinks';
import TodoList from './components/TodoList';
import Settings from './components/Settings';
import { ThemeType } from './types';
import './styles/index.css';

const { Content } = Layout;

const App: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('daybreakBlue');

  // Get the theme when component mounts
  useEffect(() => {
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme) {
        setCurrentTheme(result.theme);
      }
    });
  }, []);

  // Save theme when it changes
  const handleThemeChange = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    chrome.runtime.sendMessage({
      action: 'saveData',
      dataType: 'theme',
      data: newTheme
    });
  };

  // Configure theme colors
  const themeConfig = {
    token: {
      colorPrimary: currentTheme === 'daybreakBlue' ? '#1890ff' : '#722ed1',
    },
    algorithm: theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className="layout" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f7f7f2' // Bookpaper color as per requirement
      }}>
        <Content className="content">
          <div className="workspace-container">
            <HotLinks />
            <TodoList />
          </div>
          <Settings currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;