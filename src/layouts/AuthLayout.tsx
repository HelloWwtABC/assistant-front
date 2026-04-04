import { Outlet } from 'react-router-dom';

import { AppLogo } from '@/components/common/AppLogo';

const highlights = [
  {
    title: '知识库统一沉淀',
    description: '集中管理文档、版本、切片与检索策略，支撑后续 RAG 场景快速上线。',
  },
  {
    title: '智能体工单协同',
    description: '把问答、工具调用、会话记录和工单链路串起来，形成闭环运营视图。',
  },
  {
    title: '系统观测评测',
    description: '统一接入评测指标、调用日志与异常观测，便于持续优化模型表现。',
  },
  {
    title: '前后端分离扩展',
    description: '所有模块先接 mock 结构，后续替换 API 即可，无需重写页面骨架。',
  },
];

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <section className="auth-layout__brand">
        <div>
          <AppLogo variant="light" />
          <h1 className="auth-layout__title">AI 知识库与工单智能体平台</h1>
          <p className="auth-layout__description">
            面向企业智能服务场景的统一工作台，覆盖知识管理、RAG 问答、工具调用、会话追踪与系统评测。
          </p>
        </div>

        <div className="auth-layout__highlights">
          {highlights.map((item) => (
            <div className="auth-layout__highlight" key={item.title}>
              <div className="auth-layout__highlight-title">{item.title}</div>
              <div className="auth-layout__highlight-description">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-layout__panel">
        <Outlet />
      </section>
    </div>
  );
}
