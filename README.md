# assistant-front

AI 知识库与工单智能体平台的前端项目，基于 `React + Vite + TypeScript + Ant Design` 构建，采用前后端分离架构，当前默认以 Mock 模式运行，便于本地演示与后续前后端联调。

## 技术栈

- React 19
- Vite 8
- TypeScript
- Ant Design 6
- React Router `createBrowserRouter`
- Axios
- Zustand

## 项目特性

- 登录态管理、路由守卫、后台主布局已完成
- `documents / qa / tools / sessions / observability` 五个核心业务模块已具备可演示页面
- 请求层统一处理 `baseURL`、token 注入、401 跳转和错误提示
- 所有业务模块均按 `types + mock + api + components + pages` 组织
- 当前默认启用 Mock 数据，可平滑切换真实后端接口

## 目录结构

```text
src
├─ api                # API 封装
│  └─ modules
├─ assets             # 全局样式与静态资源
├─ components         # 通用组件与业务组件
├─ config             # 环境变量读取
├─ constants          # 常量
├─ hooks              # 自定义 hooks
├─ layouts            # 登录布局、后台布局
├─ mock               # Mock 数据与 Mock 请求封装
├─ pages              # 页面级实现
├─ router             # 路由与导航配置
├─ store              # 全局状态
├─ types              # 类型定义
└─ utils              # 工具函数
```

## 启动方式

安装依赖：

```bash
npm install
```

本地开发：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

本地预览构建产物：

```bash
npm run preview
```

## 环境变量

请参考根目录的 `.env.example`。

常用变量如下：

- `VITE_APP_TITLE`：应用标题
- `VITE_API_BASE_URL`：后端 API 基础地址
- `VITE_USE_MOCK`：是否启用 Mock，默认 `true`

## Mock 模式说明

当前项目默认运行在 Mock 模式：

- 页面展示数据来自 `src/mock/*`
- API 层统一通过 `src/api/modules/*` 调用
- 当 `VITE_USE_MOCK=false` 时，可切换到真实后端接口

建议联调时只替换 API 实现，不要直接在页面内改请求逻辑。

## 默认演示账号

- 用户名：`admin`
- 密码：`Admin123456`

## 当前页面说明

- `/login`：登录页
- `/dashboard`：工作台首页
- `/documents`：知识库文档管理
- `/documents/:documentId`：文档详情
- `/qa`：RAG 智能问答
- `/tools`：工具调用中心
- `/sessions`：会话记录
- `/observability`：系统观测与评测

## 联调建议

- 先与后端统一分页结构、时间字段格式、错误码定义
- 保持 `types` 中的字段与接口协议同步更新
- 优先在 `src/api/modules/*` 中切换真实接口，不要改页面组件职责

## 当前状态

该项目已达到可演示状态，适合用于：

- 简历项目展示
- 后台产品演示
- 前后端联调前的页面预演

如需继续提升工程质量，建议优先补充：

- 路由级代码分包优化
- README 中的接口协议说明
- 基础测试或 smoke test
