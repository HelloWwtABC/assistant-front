# 后端接口文档初稿

基于当前 `assistant-front` 前端项目已实现代码整理。  
说明：

- 仅整理前端当前真实使用到的接口，不臆造未使用接口。
- 请求路径以 `src/api/modules/*` 中的真实调用为准，个别处标注“建议保持”。
- 当前前端统一响应结构基于 [src/types/request.ts](E:\workspace\vscode\assistant-front\src\types\request.ts)：

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

推荐后端统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

---

## 一、接口字段与风格总览

### 1. ID 字段风格

- 登录用户：`id`
- 文档：`documentId`
- 文档 chunk：`chunkId`
- QA 会话：`sessionId`
- QA 消息：`messageId`
- 工单：`ticketId`
- 工具调用记录：`recordId`
- 请求日志：`requestId`

结论：当前项目整体采用“业务实体名 + Id”的命名方式，建议后端统一保持。

### 2. 时间字段风格

当前前端已使用到的时间字段：

- `createdAt`
- `updatedAt`
- `uploadedAt`
- `submittedAt`
- `checkedAt`
- `calledAt`

结论：字段命名未完全统一，建议后端尽量收敛到：

- 通用创建时间：`createdAt`
- 通用更新时间：`updatedAt`
- 特殊业务时间仅在必要时保留，如 `uploadedAt`

时间格式建议统一为：

- 字符串，格式：`YYYY-MM-DD HH:mm:ss`
- 或 ISO 8601 标准字符串，但需要前后端统一

### 3. 状态字段风格

当前前端已存在的状态字段：

- 文档状态：`status`
- chunk 向量状态：`vectorStatus`
- 工单状态：`status` / `processStatus`
- 服务状态：`healthStatus`
- 请求日志状态：`status`
- 是否调用工具：`usedTool`
- 质量等级：`qualityLevel`

结论：状态字段语义清晰，但命名仍略有分散，建议：

- 主实体状态优先统一使用 `status`
- 布尔语义不要用 `'yes' | 'no'`，建议改为 `boolean`

### 4. 分页结构

当前分页接口大多采用：

```ts
{
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

这是当前项目的主流分页结构，建议后端统一沿用。

---

## 二、模块接口

## auth

### 1. 登录

- 接口名称：登录
- 类型：认证接口
- 请求路径：`/auth/login`
- 请求方法：`POST`
- 接口说明：用户输入用户名和密码后进行登录，返回 token、可选 refreshToken 和用户信息。
- 前端使用位置：
  - 页面：[src/pages/login/index.tsx](E:\workspace\vscode\assistant-front\src\pages\login\index.tsx)
  - API：[src/api/modules/auth.ts](E:\workspace\vscode\assistant-front\src\api\modules\auth.ts)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `password` | `string` | 是 | 密码 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `token` | `string` | 访问令牌 |
| `refreshToken` | `string` | 可选，刷新令牌 |
| `user.id` | `string` | 用户 ID |
| `user.name` | `string` | 用户姓名/昵称 |
| `user.email` | `string` | 邮箱 |
| `user.role` | `string` | 角色 |

返回示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "u_admin",
      "name": "管理员",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

错误返回建议：

- `400`：用户名或密码为空
- `401`：用户名或密码错误
- `423`：账号被禁用
- `500`：服务异常

---

## documents

### 1. 获取文档列表

- 接口名称：获取知识库文档列表
- 类型：列表接口
- 请求路径：`/documents`
- 请求方法：`GET`
- 接口说明：用于文档管理页的筛选、分页和知识库选项展示。
- 前端使用位置：
  - 页面：[src/pages/documents/index.tsx](E:\workspace\vscode\assistant-front\src\pages\documents\index.tsx)
  - 组件：[src/components/documents/DocumentFilter.tsx](E:\workspace\vscode\assistant-front\src\components\documents\DocumentFilter.tsx)
  - 组件：[src/components/documents/DocumentTable.tsx](E:\workspace\vscode\assistant-front\src\components\documents\DocumentTable.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | `string` | 否 | 文档名称或文档 ID 搜索 |
| `status` | `'unparsed' \| 'parsing' \| 'completed' \| 'failed'` | 否 | 解析状态 |
| `uploader` | `string` | 否 | 上传人 |
| `page` | `number` | 是 | 页码 |
| `pageSize` | `number` | 是 | 每页条数 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `list` | `KnowledgeDocumentItem[]` | 文档列表 |
| `total` | `number` | 总数 |
| `page` | `number` | 当前页 |
| `pageSize` | `number` | 每页条数 |
| `knowledgeBaseOptions` | `{ value: string; label: string }[]` | 上传弹窗和筛选区使用的知识库选项 |

单项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `documentId` | `string` | 文档 ID |
| `documentName` | `string` | 文档名称 |
| `knowledgeBaseId` | `string` | 知识库 ID |
| `knowledgeBaseName` | `string` | 知识库名称 |
| `fileType` | `'pdf' \| 'docx' \| 'md' \| 'txt'` | 文件类型 |
| `status` | `DocumentStatus` | 解析状态 |
| `chunkCount` | `number` | chunk 数量 |
| `uploader` | `string` | 上传人 |
| `uploadedAt` | `string` | 上传时间 |
| `remark` | `string` | 备注，可选 |

分页结构：标准分页结构

错误返回建议：

- `400`：查询参数非法
- `401`：未登录
- `500`：列表查询失败

### 2. 获取文档详情

- 接口名称：获取文档详情
- 类型：详情接口
- 请求路径：`/documents/{documentId}`
- 请求方法：`GET`
- 接口说明：用于文档详情页展示基础信息和 chunk 列表。
- 前端使用位置：
  - 页面：[src/pages/documents/detail.tsx](E:\workspace\vscode\assistant-front\src\pages\documents\detail.tsx)

路径参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `documentId` | `string` | 是 | 文档 ID |

返回参数：

- 继承文档列表单项字段
- 追加 `chunks`

`chunks` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `chunkId` | `string` | chunk ID |
| `chunkIndex` | `number` | chunk 序号 |
| `summary` | `string` | chunk 摘要 |
| `tokenCount` | `number` | token 数 |
| `vectorStatus` | `'pending' \| 'completed' \| 'failed'` | 向量化状态 |

错误返回建议：

- `404`：文档不存在
- `401`：未登录
- `500`：详情加载失败

### 3. 上传文档

- 接口名称：上传文档
- 类型：上传接口
- 请求路径：`/documents/upload`
- 请求方法：`POST`
- 接口说明：上传新文档并创建文档记录，前端当前上传成功后默认展示为“解析中”。
- 前端使用位置：
  - 页面：[src/pages/documents/index.tsx](E:\workspace\vscode\assistant-front\src\pages\documents\index.tsx)
  - 组件：[src/components/documents/UploadDocumentModal.tsx](E:\workspace\vscode\assistant-front\src\components\documents\UploadDocumentModal.tsx)

当前前端请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `knowledgeBaseId` | `string` | 是 | 所属知识库 ID |
| `knowledgeBaseName` | `string` | 是 | 当前由前端附带，建议后端自行推导 |
| `file` | `File` | 是 | 上传文件 |
| `remark` | `string` | 否 | 备注 |
| `uploader` | `string` | 是 | 当前由前端附带，建议后端从登录态推导 |

返回参数：

- 返回新建文档详情对象，字段同 `DocumentDetail`

错误返回建议：

- `400`：文件为空/文件类型不支持/知识库不存在
- `401`：未登录
- `413`：文件过大
- `500`：上传失败

### 4. 删除文档

- 接口名称：删除文档
- 类型：删除接口
- 请求路径：`/documents/{documentId}`
- 请求方法：`DELETE`
- 接口说明：删除单个文档。
- 前端使用位置：
  - 页面：[src/pages/documents/index.tsx](E:\workspace\vscode\assistant-front\src\pages\documents\index.tsx)
  - 组件：[src/components/documents/DocumentTable.tsx](E:\workspace\vscode\assistant-front\src\components\documents\DocumentTable.tsx)

路径参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `documentId` | `string` | 是 | 文档 ID |

返回参数：`void`

错误返回建议：

- `404`：文档不存在
- `401`：未登录
- `500`：删除失败

### 5. 批量删除文档

- 接口名称：批量删除文档
- 类型：批量操作接口
- 请求路径：`/documents/batch-delete`
- 请求方法：`POST`
- 接口说明：批量删除多个文档。
- 前端使用位置：
  - 页面：[src/pages/documents/index.tsx](E:\workspace\vscode\assistant-front\src\pages\documents\index.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `documentIds` | `string[]` | 是 | 文档 ID 列表 |

返回参数：`void`

错误返回建议：

- `400`：`documentIds` 为空
- `401`：未登录
- `500`：批量删除失败

---

## qa

### 1. 获取会话列表

- 接口名称：获取 QA 会话列表
- 类型：列表接口
- 请求路径：`/qa/sessions`
- 请求方法：`GET`
- 接口说明：用于左侧会话栏展示。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/SessionList.tsx](E:\workspace\vscode\assistant-front\src\components\qa\SessionList.tsx)

请求参数：无

返回参数：`QaSessionItem[]`

单项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionId` | `string` | 会话 ID |
| `title` | `string` | 会话标题 |
| `createdAt` | `string` | 创建时间 |
| `updatedAt` | `string` | 最后活跃时间 |
| `lastMessagePreview` | `string` | 最后一条消息摘要 |
| `messageCount` | `number` | 消息总数 |

错误返回建议：

- `401`：未登录
- `500`：会话列表加载失败

### 2. 获取会话详情

- 接口名称：获取 QA 会话详情
- 类型：详情接口
- 请求路径：`/qa/sessions/{sessionId}`
- 请求方法：`GET`
- 接口说明：获取当前会话的完整消息流。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/ChatMessageList.tsx](E:\workspace\vscode\assistant-front\src\components\qa\ChatMessageList.tsx)
  - 组件：[src/components/qa/CitationList.tsx](E:\workspace\vscode\assistant-front\src\components\qa\CitationList.tsx)

路径参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sessionId` | `string` | 是 | 会话 ID |

返回参数：

- 会话基础信息同 `QaSessionItem`
- `messages: QaMessageItem[]`

消息字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `messageId` | `string` | 消息 ID |
| `role` | `'user' \| 'assistant'` | 消息角色 |
| `content` | `string` | 消息内容 |
| `createdAt` | `string` | 消息时间 |
| `citations` | `QaCitationItem[]` | assistant 消息引用列表 |

引用字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `citationId` | `string` | 引用 ID |
| `documentId` | `string` | 文档 ID |
| `documentName` | `string` | 文档名称 |
| `chunkIndex` | `number` | chunk 序号 |
| `snippet` | `string` | 摘要片段 |

错误返回建议：

- `404`：会话不存在
- `401`：未登录
- `500`：详情加载失败

### 3. 新建会话

- 接口名称：新建 QA 会话
- 类型：新增接口
- 请求路径：`/qa/sessions`
- 请求方法：`POST`
- 接口说明：创建空会话，前端新建后自动切换到该会话。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/SessionList.tsx](E:\workspace\vscode\assistant-front\src\components\qa\SessionList.tsx)

请求参数：无

返回参数：`QaSessionDetail`

错误返回建议：

- `401`：未登录
- `500`：创建失败

### 4. 删除会话

- 接口名称：删除 QA 会话
- 类型：删除接口
- 请求路径：`/qa/sessions/{sessionId}`
- 请求方法：`DELETE`
- 接口说明：删除指定 QA 会话。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/SessionList.tsx](E:\workspace\vscode\assistant-front\src\components\qa\SessionList.tsx)

路径参数：`sessionId`

返回参数：`void`

错误返回建议：

- `404`：会话不存在
- `401`：未登录
- `500`：删除失败

### 5. 发送消息

- 接口名称：发送 QA 消息
- 类型：问答接口
- 请求路径：`/qa/chat`
- 请求方法：`POST`
- 接口说明：在指定会话中发送用户问题，返回用户消息、AI 消息以及更新后的会话摘要。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/ChatComposer.tsx](E:\workspace\vscode\assistant-front\src\components\qa\ChatComposer.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sessionId` | `string` | 是 | 会话 ID |
| `question` | `string` | 是 | 用户问题 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionId` | `string` | 会话 ID |
| `userMessage` | `QaMessageItem` | 用户消息 |
| `assistantMessage` | `QaMessageItem` | AI 回复 |
| `updatedSession` | `QaSessionItem` | 更新后的会话摘要 |

错误返回建议：

- `400`：问题为空
- `404`：会话不存在
- `401`：未登录
- `500`：回答生成失败

### 6. 清空会话上下文

- 接口名称：清空 QA 会话上下文
- 类型：批量操作接口
- 请求路径：`/qa/clear-context`
- 请求方法：`POST`
- 接口说明：清空指定会话消息上下文。
- 前端使用位置：
  - 页面：[src/pages/qa/index.tsx](E:\workspace\vscode\assistant-front\src\pages\qa\index.tsx)
  - 组件：[src/components/qa/ChatComposer.tsx](E:\workspace\vscode\assistant-front\src\components\qa\ChatComposer.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sessionId` | `string` | 是 | 会话 ID |

返回参数：`void`

错误返回建议：

- `404`：会话不存在
- `401`：未登录
- `500`：清空失败

---

## tools

### 1. 查询工单状态

- 接口名称：查询工单状态
- 类型：查询接口
- 请求路径：`/tools/ticket-status`
- 请求方法：`POST`
- 接口说明：根据工单 ID 查询当前工单状态。
- 前端使用位置：
  - 页面：[src/pages/tools/index.tsx](E:\workspace\vscode\assistant-front\src\pages\tools\index.tsx)
  - 组件：[src/components/tools/TicketStatusTool.tsx](E:\workspace\vscode\assistant-front\src\components\tools\TicketStatusTool.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ticketId` | `string` | 是 | 工单 ID |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ticketId` | `string` | 工单 ID |
| `title` | `string` | 工单标题 |
| `status` | `'pending' \| 'processing' \| 'resolved' \| 'closed'` | 当前状态 |
| `priority` | `'low' \| 'medium' \| 'high' \| 'urgent'` | 优先级 |
| `owner` | `string` | 负责人 |
| `updatedAt` | `string` | 更新时间 |
| `summary` | `string` | 摘要 |

错误返回建议：

- `400`：工单 ID 为空
- `404`：工单不存在
- `401`：未登录
- `500`：查询失败

### 2. 创建工单

- 接口名称：创建工单
- 类型：新增接口
- 请求路径：`/tools/create-ticket`
- 请求方法：`POST`
- 接口说明：创建新工单。
- 前端使用位置：
  - 页面：[src/pages/tools/index.tsx](E:\workspace\vscode\assistant-front\src\pages\tools\index.tsx)
  - 组件：[src/components/tools/CreateTicketTool.tsx](E:\workspace\vscode\assistant-front\src\components\tools\CreateTicketTool.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 工单标题 |
| `priority` | `TicketPriority` | 是 | 优先级 |
| `description` | `string` | 是 | 工单描述 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ticketId` | `string` | 新工单 ID |
| `createStatus` | `'created'` | 创建状态 |
| `submittedAt` | `string` | 提交时间 |
| `assignee` | `string` | 默认负责人 |
| `processStatus` | `TicketProcessStatus` | 默认处理状态 |

错误返回建议：

- `400`：标题或描述为空
- `401`：未登录
- `500`：创建失败

### 3. 查询服务健康状态

- 接口名称：查询服务健康状态
- 类型：查询接口
- 请求路径：`/tools/service-health`
- 请求方法：`POST`
- 接口说明：根据服务名称查询健康状态。
- 前端使用位置：
  - 页面：[src/pages/tools/index.tsx](E:\workspace\vscode\assistant-front\src\pages\tools\index.tsx)
  - 组件：[src/components/tools/ServiceHealthTool.tsx](E:\workspace\vscode\assistant-front\src\components\tools\ServiceHealthTool.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `serviceName` | `string` | 是 | 服务名称 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `serviceName` | `string` | 服务名称 |
| `healthStatus` | `'healthy' \| 'warning' \| 'critical'` | 健康状态 |
| `instanceCount` | `number` | 实例数 |
| `averageResponseTime` | `number` | 平均响应时间 |
| `checkedAt` | `string` | 检查时间 |
| `remark` | `string` | 备注 |

错误返回建议：

- `400`：服务名为空
- `404`：服务不存在
- `401`：未登录
- `500`：查询失败

### 4. 获取工具调用记录

- 接口名称：获取工具调用记录
- 类型：列表接口
- 请求路径：`/tools/call-records`
- 请求方法：`GET`
- 接口说明：用于工具调用中心页底部记录表格。
- 前端使用位置：
  - 页面：[src/pages/tools/index.tsx](E:\workspace\vscode\assistant-front\src\pages\tools\index.tsx)
  - 组件：[src/components/tools/ToolCallRecordsTable.tsx](E:\workspace\vscode\assistant-front\src\components\tools\ToolCallRecordsTable.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` | 是 | 页码 |
| `pageSize` | `number` | 是 | 每页条数 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `list` | `ToolCallRecordItem[]` | 记录列表 |
| `total` | `number` | 总数 |
| `page` | `number` | 当前页 |
| `pageSize` | `number` | 每页条数 |

记录字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `recordId` | `string` | 记录 ID |
| `toolName` | `'ticket_status' \| 'create_ticket' \| 'service_health'` | 工具标识 |
| `requestSummary` | `string` | 请求摘要 |
| `resultSummary` | `string` | 返回摘要 |
| `status` | `'success' \| 'failed'` | 调用状态 |
| `durationMs` | `number` | 耗时 |
| `calledAt` | `string` | 调用时间 |

分页结构：标准分页结构

错误返回建议：

- `401`：未登录
- `500`：记录查询失败

---

## sessions

### 1. 获取会话记录列表

- 接口名称：获取会话记录列表
- 类型：列表接口
- 请求路径：`/sessions`
- 请求方法：`GET`
- 接口说明：用于会话记录页的筛选、分页和统计展示。
- 前端使用位置：
  - 页面：[src/pages/sessions/index.tsx](E:\workspace\vscode\assistant-front\src\pages\sessions\index.tsx)
  - 组件：[src/components/sessions/SessionFilter.tsx](E:\workspace\vscode\assistant-front\src\components\sessions\SessionFilter.tsx)
  - 组件：[src/components/sessions/SessionTable.tsx](E:\workspace\vscode\assistant-front\src\components\sessions\SessionTable.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | `string` | 否 | 会话标题 / 问题摘要 / 会话 ID |
| `knowledgeBaseId` | `string` | 否 | 关联知识库 ID |
| `startDate` | `string` | 否 | 开始日期，`YYYY-MM-DD` |
| `endDate` | `string` | 否 | 结束日期，`YYYY-MM-DD` |
| `page` | `number` | 是 | 页码 |
| `pageSize` | `number` | 是 | 每页条数 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `list` | `SessionRecordItem[]` | 会话记录列表 |
| `total` | `number` | 总数 |
| `page` | `number` | 当前页 |
| `pageSize` | `number` | 每页条数 |
| `knowledgeBaseOptions` | `{ value: string; label: string }[]` | 知识库筛选选项 |
| `todayActiveCount` | `number` | 今日活跃会话数 |

列表单项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionId` | `string` | 会话 ID |
| `title` | `string` | 会话标题 |
| `questionCount` | `number` | 提问次数 |
| `knowledgeBaseName` | `string` | 知识库名称 |
| `knowledgeBaseId` | `string` | 知识库 ID |
| `lastQuestionSnippet` | `string` | 最近问题摘要 |
| `createdAt` | `string` | 创建时间 |
| `updatedAt` | `string` | 最后活跃时间 |

分页结构：标准分页结构

错误返回建议：

- `400`：筛选参数非法
- `401`：未登录
- `500`：列表查询失败

### 2. 获取会话详情

- 接口名称：获取会话详情
- 类型：详情接口
- 请求路径：`/sessions/{sessionId}`
- 请求方法：`GET`
- 接口说明：用于 Drawer 中展示会话基础信息和消息历史。
- 前端使用位置：
  - 页面：[src/pages/sessions/index.tsx](E:\workspace\vscode\assistant-front\src\pages\sessions\index.tsx)
  - 组件：[src/components/sessions/SessionDetailDrawer.tsx](E:\workspace\vscode\assistant-front\src\components\sessions\SessionDetailDrawer.tsx)
  - 组件：[src/components/sessions/MessageHistoryList.tsx](E:\workspace\vscode\assistant-front\src\components\sessions\MessageHistoryList.tsx)

路径参数：`sessionId`

返回参数：

- 会话基础信息同 `SessionRecordItem`
- `messages: SessionMessageItem[]`

消息字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `messageId` | `string` | 消息 ID |
| `role` | `'user' \| 'assistant'` | 角色 |
| `content` | `string` | 内容 |
| `createdAt` | `string` | 消息时间 |
| `citations` | `SessionMessageCitationItem[]` | 可选，assistant 引用 |

引用字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `documentId` | `string` | 文档 ID |
| `documentName` | `string` | 文档名称 |
| `chunkIndex` | `number` | chunk 序号 |
| `snippet` | `string` | 片段摘要 |

错误返回建议：

- `404`：会话不存在
- `401`：未登录
- `500`：详情加载失败

### 3. 删除会话

- 接口名称：删除会话
- 类型：删除接口
- 请求路径：`/sessions/{sessionId}`
- 请求方法：`DELETE`
- 接口说明：删除单个会话。
- 前端使用位置：
  - 页面：[src/pages/sessions/index.tsx](E:\workspace\vscode\assistant-front\src\pages\sessions\index.tsx)
  - 组件：[src/components/sessions/SessionTable.tsx](E:\workspace\vscode\assistant-front\src\components\sessions\SessionTable.tsx)

路径参数：`sessionId`

返回参数：`void`

错误返回建议：

- `404`：会话不存在
- `401`：未登录
- `500`：删除失败

### 4. 批量删除会话

- 接口名称：批量删除会话
- 类型：批量操作接口
- 请求路径：`/sessions/batch-delete`
- 请求方法：`POST`
- 接口说明：批量删除多个会话。
- 前端使用位置：
  - 页面：[src/pages/sessions/index.tsx](E:\workspace\vscode\assistant-front\src\pages\sessions\index.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sessionIds` | `string[]` | 是 | 会话 ID 列表 |

返回参数：`void`

错误返回建议：

- `400`：`sessionIds` 为空
- `401`：未登录
- `500`：批量删除失败

---

## observability

### 1. 获取系统指标概览

- 接口名称：获取系统指标概览
- 类型：概览接口
- 请求路径：`/observability/metrics`
- 请求方法：`GET`
- 接口说明：用于顶部 6 个统计卡片。
- 前端使用位置：
  - 页面：[src/pages/observability/index.tsx](E:\workspace\vscode\assistant-front\src\pages\observability\index.tsx)
  - 组件：[src/components/observability/MetricsOverview.tsx](E:\workspace\vscode\assistant-front\src\components\observability\MetricsOverview.tsx)

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `todayRequestCount` | `number` | 今日请求次数 |
| `avgLatencyMs` | `number` | 平均响应时间 |
| `toolCallCount` | `number` | 工具调用次数 |
| `errorRate` | `number` | 错误率，建议 0~1 |
| `avgHitChunkCount` | `number` | 平均命中片段数 |
| `citationCoverage` | `number` | 引用覆盖率，建议 0~1 |

错误返回建议：

- `401`：未登录
- `500`：指标加载失败

### 2. 获取问答评测概览

- 接口名称：获取问答评测概览
- 类型：概览接口
- 请求路径：`/observability/evaluation-summary`
- 请求方法：`GET`
- 接口说明：用于评测面板左侧卡片。
- 前端使用位置：
  - 页面：[src/pages/observability/index.tsx](E:\workspace\vscode\assistant-front\src\pages\observability\index.tsx)
  - 组件：[src/components/observability/EvaluationPanel.tsx](E:\workspace\vscode\assistant-front\src\components\observability\EvaluationPanel.tsx)

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `positiveFeedbackCount` | `number` | 正向反馈数 |
| `negativeFeedbackCount` | `number` | 负向反馈数 |
| `avgScore` | `number` | 平均人工评分 |
| `helpfulRate` | `number` | 是否有帮助占比，建议 0~1 |
| `effectiveAnswerCount` | `number` | 今日有效回答数 |

错误返回建议：

- `401`：未登录
- `500`：评测数据加载失败

### 3. 获取召回与引用质量概览

- 接口名称：获取召回与引用质量概览
- 类型：概览接口
- 请求路径：`/observability/retrieval-quality`
- 请求方法：`GET`
- 接口说明：用于评测面板右侧卡片。
- 前端使用位置：
  - 页面：[src/pages/observability/index.tsx](E:\workspace\vscode\assistant-front\src\pages\observability\index.tsx)
  - 组件：[src/components/observability/EvaluationPanel.tsx](E:\workspace\vscode\assistant-front\src\components\observability\EvaluationPanel.tsx)

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `avgHitChunks` | `number` | 平均命中 chunk 数 |
| `avgCitationCount` | `number` | 平均引用数 |
| `highQualityRate` | `number` | 高质量回答占比，建议 0~1 |
| `lowQualityRate` | `number` | 低质量回答占比，建议 0~1 |
| `commonQuestionCategories` | `{ category: string; count: number }[]` | 常见问题类型统计 |

错误返回建议：

- `401`：未登录
- `500`：召回质量数据加载失败

### 4. 获取请求日志列表

- 接口名称：获取请求日志列表
- 类型：列表接口
- 请求路径：`/observability/request-logs`
- 请求方法：`GET`
- 接口说明：用于请求日志筛选和表格分页。
- 前端使用位置：
  - 页面：[src/pages/observability/index.tsx](E:\workspace\vscode\assistant-front\src\pages\observability\index.tsx)
  - 组件：[src/components/observability/RequestLogsTable.tsx](E:\workspace\vscode\assistant-front\src\components\observability\RequestLogsTable.tsx)

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | `string` | 否 | 请求 ID 或问题摘要 |
| `status` | `'success' \| 'failed' \| 'partial_success'` | 否 | 请求状态 |
| `usedTool` | `'yes' \| 'no'` | 否 | 是否调用工具 |
| `startDate` | `string` | 否 | 开始日期，`YYYY-MM-DD` |
| `endDate` | `string` | 否 | 结束日期，`YYYY-MM-DD` |
| `page` | `number` | 是 | 页码 |
| `pageSize` | `number` | 是 | 每页条数 |

返回参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `list` | `RequestLogItem[]` | 日志列表 |
| `total` | `number` | 总数 |
| `page` | `number` | 当前页 |
| `pageSize` | `number` | 每页条数 |

单项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `requestId` | `string` | 请求 ID |
| `sessionId` | `string` | 会话 ID |
| `questionSummary` | `string` | 问题摘要 |
| `status` | `RequestStatus` | 请求状态 |
| `latencyMs` | `number` | 响应耗时 |
| `hitChunkCount` | `number` | 命中片段数 |
| `citationCount` | `number` | 引用数 |
| `usedTool` | `ToolCallFlag` | 是否调用工具 |
| `createdAt` | `string` | 请求时间 |

分页结构：标准分页结构

错误返回建议：

- `400`：筛选参数非法
- `401`：未登录
- `500`：日志查询失败

### 5. 获取请求日志详情

- 接口名称：获取请求日志详情
- 类型：详情接口
- 请求路径：`/observability/request-logs/{requestId}`
- 请求方法：`GET`
- 接口说明：用于 Drawer 展示问答详情、引用、工具调用和评测信息。
- 前端使用位置：
  - 页面：[src/pages/observability/index.tsx](E:\workspace\vscode\assistant-front\src\pages\observability\index.tsx)
  - 组件：[src/components/observability/RequestDetailDrawer.tsx](E:\workspace\vscode\assistant-front\src\components\observability\RequestDetailDrawer.tsx)

路径参数：`requestId`

返回参数：

- 列表字段同 `RequestLogItem`
- 追加以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `modelName` | `string` | 模型名称 |
| `question` | `string` | 用户问题全文 |
| `answer` | `string` | 模型回答全文 |
| `citations` | `RequestCitationItem[]` | 引用列表 |
| `toolCalls` | `RequestToolCallItem[]` | 工具调用列表 |
| `evaluation` | `RequestEvaluationItem` | 评测信息 |

`RequestToolCallItem`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toolName` | `string` | 工具名称 |
| `inputSummary` | `string` | 输入摘要 |
| `outputSummary` | `string` | 输出摘要 |
| `status` | `'success' \| 'failed'` | 调用状态 |
| `durationMs` | `number` | 调用耗时 |

`RequestEvaluationItem`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userScore` | `number` | 用户评分 |
| `helpful` | `boolean` | 是否有帮助 |
| `remark` | `string` | 备注，可选 |
| `qualityLevel` | `'high' \| 'medium' \| 'low'` | 回答质量等级 |

错误返回建议：

- `404`：请求日志不存在
- `401`：未登录
- `500`：详情加载失败

---

## 三、需要统一的接口规范问题

以下问题来自当前前端实现中的真实字段差异，建议在后端联调前统一：

### 1. 时间字段命名不统一

当前同时存在：

- `createdAt`
- `updatedAt`
- `uploadedAt`
- `submittedAt`
- `checkedAt`
- `calledAt`

建议：

- 主实体统一使用 `createdAt / updatedAt`
- 特殊业务时间只在确有业务意义时保留

### 2. 布尔语义字段未统一

当前 `observability` 中的 `usedTool` 使用 `'yes' | 'no'`，不如 `boolean` 清晰。

建议：

- 改为 `usedTool: boolean`
- 前端展示层自行转换为“是/否”或 Tag 文案

### 3. 列表返回结构大体统一，但 QA 会话列表例外

当前大多数列表接口都使用：

```ts
{ list, total, page, pageSize }
```

但 `qaApi.getQaSessions()` 返回的是 `QaSessionItem[]`，没有分页包装。

建议：

- 若 QA 会话后续可能增长，建议也统一成标准分页结构
- 若短期确定无需分页，可保留，但建议文档中明确“无分页”

### 4. 选项字段命名不够领域化

当前知识库下拉选项使用：

```ts
{ value, label }
```

这更像 UI 组件结构，不像领域接口结构。

建议：

- 后端返回更语义化结构：`{ knowledgeBaseId, knowledgeBaseName }`
- 前端在组件层转换为 `Select` 需要的 `value / label`

### 5. 上传接口让前端传递可推导字段

当前文档上传接口前端会额外传：

- `knowledgeBaseName`
- `uploader`

这两个字段后端理论上都可以自行推导：

- `knowledgeBaseName` 可由 `knowledgeBaseId` 查出
- `uploader` 可从登录态解析

建议：

- 上传接口只保留最小必要字段：`knowledgeBaseId`、`file`、`remark`
- 后端自行补齐派生字段

### 6. 状态字段命名存在轻微分散

如：

- 工单详情使用 `status`
- 创建工单返回使用 `processStatus`
- 服务状态使用 `healthStatus`
- 请求状态使用 `status`

建议：

- 同一实体的状态字段尽量统一命名
- 若创建结果中需区分“创建状态”和“工单状态”，可保留 `createStatus + status`

### 7. 引用对象结构在不同模块略有差异

QA 引用含 `citationId`，而 sessions / observability 引用对象没有 `citationId`。

建议：

- 如果引用本身是可追踪实体，统一保留 `citationId`
- 如果引用只是展示对象，则三处都可去掉 `citationId`

---

## 四、建议的后端联调优先顺序

1. `auth`：先打通登录与 token
2. `documents`：文档列表、详情、上传、删除
3. `qa`：会话列表、会话详情、发送消息
4. `tools`：三个工具接口与调用记录
5. `sessions`：列表、详情、批量删除
6. `observability`：指标概览、日志列表、详情

---

## 五、附：当前前端使用到的页面映射

- 登录页：`/login`
- 文档管理页：`/documents`
- 文档详情页：`/documents/:documentId`
- RAG 问答页：`/qa`
- 工具调用中心页：`/tools`
- 会话记录页：`/sessions`
- 系统观测与评测页：`/observability`

以上页面均已在前端实现，可直接作为联调和接口验收的页面入口。
