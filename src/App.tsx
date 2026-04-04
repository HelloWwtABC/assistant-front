import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/router';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    colorBgLayout: '#f3f5f7',
    colorText: '#1f2329',
    borderRadius: 10,
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Card: {
      borderRadiusLG: 12,
    },
    Layout: {
      bodyBg: '#f3f5f7',
      headerBg: '#ffffff',
      siderBg: '#001529',
    },
    Menu: {
      itemBorderRadius: 8,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
