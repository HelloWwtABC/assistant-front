import type { ReactNode } from 'react';
import {
  AppstoreOutlined,
  BarChartOutlined,
  BookOutlined,
  DashboardOutlined,
  MessageOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { BreadcrumbProps, MenuProps } from 'antd';

import { APP_ROUTES } from '@/constants/routes';

interface NavigationDefinition {
  key: string;
  label: string;
  icon: ReactNode;
  title: string;
}

const navigationDefinitions: NavigationDefinition[] = [
  {
    key: APP_ROUTES.dashboard,
    label: '工作台',
    icon: <DashboardOutlined />,
    title: '工作台首页',
  },
  {
    key: APP_ROUTES.documents,
    label: '知识库文档',
    icon: <BookOutlined />,
    title: '知识库文档管理',
  },
  {
    key: APP_ROUTES.qa,
    label: 'RAG 问答',
    icon: <MessageOutlined />,
    title: 'RAG 智能问答',
  },
  {
    key: APP_ROUTES.tools,
    label: '工具调用中心',
    icon: <ToolOutlined />,
    title: '工具调用中心',
  },
  {
    key: APP_ROUTES.sessions,
    label: '会话记录',
    icon: <AppstoreOutlined />,
    title: '会话记录',
  },
  {
    key: APP_ROUTES.observability,
    label: '系统观测与评测',
    icon: <BarChartOutlined />,
    title: '系统观测与评测',
  },
];

export const navigationMenuItems: MenuProps['items'] = navigationDefinitions.map(
  ({ key, label, icon }) => ({
    key,
    label,
    icon,
  }),
);

function isMatchedPath(pathname: string, routePath: string) {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function getSelectedMenuKey(pathname: string) {
  const currentItem = navigationDefinitions.find(({ key }) =>
    isMatchedPath(pathname, key),
  );

  return currentItem?.key ?? APP_ROUTES.dashboard;
}

export function getPageTitle(pathname: string) {
  if (pathname.startsWith(`${APP_ROUTES.documents}/`)) {
    return '文档详情';
  }

  return (
    navigationDefinitions.find(({ key }) => isMatchedPath(pathname, key))
      ?.title ?? 'AI 知识库与工单智能体平台'
  );
}

export function getBreadcrumbItems(pathname: string): BreadcrumbProps['items'] {
  if (pathname === APP_ROUTES.dashboard) {
    return [{ title: '工作台' }];
  }

  if (pathname === APP_ROUTES.documents) {
    return [{ title: '知识库' }, { title: '文档管理' }];
  }

  if (pathname.startsWith(`${APP_ROUTES.documents}/`)) {
    return [
      { title: '知识库' },
      { title: '文档管理' },
      { title: '文档详情' },
    ];
  }

  if (pathname === APP_ROUTES.qa) {
    return [{ title: '知识库' }, { title: 'RAG 问答' }];
  }

  if (pathname === APP_ROUTES.tools) {
    return [{ title: '智能体编排' }, { title: '工具调用中心' }];
  }

  if (pathname === APP_ROUTES.sessions) {
    return [{ title: '智能体运营' }, { title: '会话记录' }];
  }

  if (pathname === APP_ROUTES.observability) {
    return [{ title: '智能体运营' }, { title: '系统观测与评测' }];
  }

  return [{ title: '平台后台' }];
}
