import React, { useState } from 'react';
import { Button, Dropdown, Menu, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ThemeType } from '../types';

interface SettingsProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleThemeToggle = (checked: boolean) => {
    onThemeChange(checked ? 'goldenPurple' : 'daybreakBlue');
  };

  const menu = (
    <Menu>
      <Menu.Item key="theme">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Golden Purple Theme</span>
          <Switch 
            checked={currentTheme === 'goldenPurple'}
            onChange={handleThemeToggle}
          />
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="settings-button" style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
      <Dropdown 
        overlay={menu} 
        placement="topRight" 
        visible={isMenuVisible}
        onVisibleChange={setIsMenuVisible}
      >
        <Button 
          type="primary" 
          shape="circle" 
          icon={<SettingOutlined />} 
          size="large"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
        />
      </Dropdown>
    </div>
  );
};

export default Settings;