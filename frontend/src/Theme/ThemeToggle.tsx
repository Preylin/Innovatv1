import { Switch } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from "./useTheme";

function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex items-center justify-center p-2">
      <Switch
        checked={isDark}
        onChange={toggle}
        unCheckedChildren={<MoonOutlined style={{ color: '#0D0D0D' }} />}
        checkedChildren={<SunOutlined style={{ color: '#ff7a45' }} />}
        style={{ 
            border: isDark ? '1px solid #303030' : '1px solid #d9d9d9' 
        }}
      />
    </div>
  );
}

export default ThemeToggle;
