# 后端数据库表设计初稿

基于当前前端项目 `assistant-front` 的页面实现、类型定义以及 [BACKEND_API_DRAFT.md](E:\workspace\vscode\assistant-front\BACKEND_API_DRAFT.md) 推导。  
目标：为后端接口落地提供第一版关系型数据库设计参考。

说明：

- 本稿以当前前端真实业务页面为准，不脱离现有功能范围。
- 表设计以 MySQL / PostgreSQL 通用关系库思路整理。
- 涉及向量检索能力时，当前仅给出基础字段建议；若后端使用专用向量库，可将向量字段迁移到外部向量存储。

---

## 一、总体数据关系概览

```text
team
 └─ user
 └─ knowledge_base
     └─ document
         └─ document_chunk

user
 └─ chat_session
     └─ chat_message
     └─ request_log
         └─ tool_call_record
         └─ evaluation_record
```

说明：

- `team` 作为组织或租户维度，虽然前端暂未直接展示团队管理，但已足以支撑当前“企业后台”场景。
- `knowledge_base`、`document`、`document_chunk` 对应知识库和检索内容。
- `chat_session`、`chat_message` 对应 QA 会话与会话记录页。
- `request_log`、`tool_call_record`、`evaluation_record` 对应系统观测与评测页。

---

## 二、核心表设计

## 1. user

- 表名：`user`
- 作用说明：存储平台登录用户信息，用于认证、操作审计、上传人、会话所属人等场景。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 用户主键 |
| `team_id` | `varchar(64)` | 所属团队 ID |
| `username` | `varchar(64)` | 登录用户名，唯一 |
| `password_hash` | `varchar(255)` | 密码哈希 |
| `name` | `varchar(64)` | 姓名/展示名 |
| `email` | `varchar(128)` | 邮箱 |
| `role` | `varchar(32)` | 角色，如 `admin/operator/member` |
| `status` | `varchar(16)` | 状态，如 `active/disabled` |
| `last_login_at` | `datetime` | 最近登录时间 |
| `created_at` | `datetime` | 创建时间 |
| `updated_at` | `datetime` | 更新时间 |

### 关联关系

- `user.team_id -> team.id`
- `document.created_by -> user.id`
- `chat_session.user_id -> user.id`
- `request_log.user_id -> user.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 唯一索引：`UNIQUE KEY uk_user_username (username)`
- 唯一索引：`UNIQUE KEY uk_user_email (email)`
- 普通索引：`KEY idx_user_team_id (team_id)`
- 普通索引：`KEY idx_user_status (status)`

---

## 2. team

- 表名：`team`
- 作用说明：存储团队/租户信息，用于隔离知识库、用户、会话和观测数据。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 团队主键 |
| `name` | `varchar(128)` | 团队名称 |
| `code` | `varchar(64)` | 团队编码，唯一 |
| `status` | `varchar(16)` | 状态，如 `active/inactive` |
| `owner_user_id` | `varchar(64)` | 团队负责人用户 ID |
| `remark` | `varchar(255)` | 备注 |
| `created_at` | `datetime` | 创建时间 |
| `updated_at` | `datetime` | 更新时间 |

### 关联关系

- `team.owner_user_id -> user.id`
- `user.team_id -> team.id`
- `knowledge_base.team_id -> team.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 唯一索引：`UNIQUE KEY uk_team_code (code)`
- 普通索引：`KEY idx_team_owner_user_id (owner_user_id)`
- 普通索引：`KEY idx_team_status (status)`

---

## 3. knowledge_base

- 表名：`knowledge_base`
- 作用说明：知识库主表，对应前端文档管理、会话筛选中的“所属知识库 / 关联知识库”。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 知识库主键 |
| `team_id` | `varchar(64)` | 所属团队 |
| `name` | `varchar(128)` | 知识库名称 |
| `description` | `varchar(500)` | 描述 |
| `status` | `varchar(16)` | 状态，如 `active/inactive` |
| `document_count` | `int` | 文档数，可冗余 |
| `created_by` | `varchar(64)` | 创建人 |
| `created_at` | `datetime` | 创建时间 |
| `updated_at` | `datetime` | 更新时间 |

### 关联关系

- `knowledge_base.team_id -> team.id`
- `knowledge_base.created_by -> user.id`
- `document.knowledge_base_id -> knowledge_base.id`
- `chat_session.knowledge_base_id -> knowledge_base.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_kb_team_id (team_id)`
- 普通索引：`KEY idx_kb_status (status)`
- 联合索引：`KEY idx_kb_team_status (team_id, status)`
- 普通索引：`KEY idx_kb_name (name)`

---

## 4. document

- 表名：`document`
- 作用说明：知识库文档主表，对应文档管理页列表、上传、删除、详情查看。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 文档主键，对应前端 `documentId` |
| `knowledge_base_id` | `varchar(64)` | 所属知识库 |
| `name` | `varchar(255)` | 文档名称 |
| `file_type` | `varchar(16)` | `pdf/docx/md/txt` |
| `file_url` | `varchar(500)` | 原始文件地址 |
| `file_size` | `bigint` | 文件大小 |
| `status` | `varchar(16)` | `unparsed/parsing/completed/failed` |
| `chunk_count` | `int` | chunk 数量 |
| `remark` | `varchar(500)` | 备注 |
| `created_by` | `varchar(64)` | 上传人用户 ID |
| `uploaded_at` | `datetime` | 上传时间 |
| `parsed_at` | `datetime` | 解析完成时间，可空 |
| `updated_at` | `datetime` | 更新时间 |
| `is_deleted` | `tinyint` / `boolean` | 软删除标记，建议保留 |

### 关联关系

- `document.knowledge_base_id -> knowledge_base.id`
- `document.created_by -> user.id`
- `document_chunk.document_id -> document.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_document_kb_id (knowledge_base_id)`
- 普通索引：`KEY idx_document_status (status)`
- 普通索引：`KEY idx_document_created_by (created_by)`
- 普通索引：`KEY idx_document_uploaded_at (uploaded_at)`
- 联合索引：`KEY idx_document_kb_status (knowledge_base_id, status)`
- 联合索引：`KEY idx_document_kb_uploaded_at (knowledge_base_id, uploaded_at)`
- 普通索引：`KEY idx_document_name (name)`

---

## 5. document_chunk

- 表名：`document_chunk`
- 作用说明：文档切片表，对应文档详情页 chunk 列表，同时是 RAG 检索引用的基础数据。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | chunk 主键，对应前端 `chunkId` |
| `document_id` | `varchar(64)` | 所属文档 |
| `chunk_index` | `int` | 文档内序号 |
| `content` | `text` | 原始 chunk 内容 |
| `summary` | `text` | 摘要/截断内容 |
| `token_count` | `int` | token 数 |
| `vector_status` | `varchar(16)` | `pending/completed/failed` |
| `embedding_ref` | `varchar(128)` | 向量索引引用 ID，可选 |
| `created_at` | `datetime` | 创建时间 |
| `updated_at` | `datetime` | 更新时间 |

### 关联关系

- `document_chunk.document_id -> document.id`
- `chat_message.citations` 中引用 `document_id + chunk_index`
- `request_log.citations` 中引用 `document_id + chunk_index`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 唯一索引：`UNIQUE KEY uk_chunk_document_index (document_id, chunk_index)`
- 普通索引：`KEY idx_chunk_vector_status (vector_status)`
- 普通索引：`KEY idx_chunk_document_id (document_id)`
- 普通索引：`KEY idx_chunk_embedding_ref (embedding_ref)`

---

## 6. chat_session

- 表名：`chat_session`
- 作用说明：问答会话主表，对应 QA 页左侧会话列表和会话记录页列表。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 会话主键，对应前端 `sessionId` |
| `team_id` | `varchar(64)` | 所属团队 |
| `user_id` | `varchar(64)` | 发起人 |
| `knowledge_base_id` | `varchar(64)` | 关联知识库，可空但建议保留 |
| `title` | `varchar(255)` | 会话标题 |
| `status` | `varchar(16)` | 会话状态，如 `active/archived/deleted` |
| `message_count` | `int` | 消息总数，可冗余 |
| `question_count` | `int` | 用户提问次数，可冗余 |
| `last_message_preview` | `varchar(500)` | 最后一条消息摘要，可冗余 |
| `last_question_snippet` | `varchar(500)` | 最近问题摘要，可冗余 |
| `created_at` | `datetime` | 创建时间 |
| `updated_at` | `datetime` | 最后活跃时间 |
| `deleted_at` | `datetime` | 删除时间，可空 |

### 关联关系

- `chat_session.team_id -> team.id`
- `chat_session.user_id -> user.id`
- `chat_session.knowledge_base_id -> knowledge_base.id`
- `chat_message.session_id -> chat_session.id`
- `request_log.session_id -> chat_session.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_chat_session_user_id (user_id)`
- 普通索引：`KEY idx_chat_session_kb_id (knowledge_base_id)`
- 普通索引：`KEY idx_chat_session_updated_at (updated_at)`
- 联合索引：`KEY idx_chat_session_user_updated (user_id, updated_at DESC)`
- 联合索引：`KEY idx_chat_session_kb_updated (knowledge_base_id, updated_at DESC)`

---

## 7. chat_message

- 表名：`chat_message`
- 作用说明：会话消息表，对应 QA 页面消息流、会话记录 Drawer 内消息历史。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 消息主键，对应前端 `messageId` |
| `session_id` | `varchar(64)` | 所属会话 |
| `role` | `varchar(16)` | `user/assistant` |
| `content` | `text` | 消息正文 |
| `model_name` | `varchar(64)` | assistant 消息对应模型，可空 |
| `citations_json` | `json` | 引用列表，当前前端直接消费数组结构 |
| `token_usage_prompt` | `int` | 提示词 token，可选 |
| `token_usage_completion` | `int` | 回答 token，可选 |
| `created_at` | `datetime` | 消息时间 |

### 关联关系

- `chat_message.session_id -> chat_session.id`
- assistant 消息可与 `request_log.id` 做弱关联或通过 `request_id` 字段关联

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_chat_message_session_id (session_id)`
- 联合索引：`KEY idx_chat_message_session_created (session_id, created_at ASC)`
- 普通索引：`KEY idx_chat_message_role (role)`

备注：

- 当前前端引用数据结构较简单，使用 `citations_json` 足以支持展示。
- 若后续需要对引用做独立统计，可扩展 `chat_message_citation` 表。

---

## 8. tool_call_record

- 表名：`tool_call_record`
- 作用说明：记录工具调用详情，对应工具调用中心记录表，以及观测详情中的工具调用区块。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 记录主键，对应前端 `recordId` |
| `request_log_id` | `varchar(64)` | 关联请求日志 ID，可空但建议保留 |
| `session_id` | `varchar(64)` | 所属会话，可空 |
| `tool_name` | `varchar(32)` | 工具名称，如 `ticket_status/create_ticket/service_health` |
| `request_summary` | `varchar(500)` | 输入摘要 |
| `result_summary` | `varchar(500)` | 输出摘要 |
| `status` | `varchar(16)` | `success/failed` |
| `duration_ms` | `int` | 调用耗时 |
| `called_at` | `datetime` | 调用时间 |
| `created_by` | `varchar(64)` | 发起用户 ID，可空 |

### 关联关系

- `tool_call_record.request_log_id -> request_log.id`
- `tool_call_record.session_id -> chat_session.id`
- `tool_call_record.created_by -> user.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_tool_call_request_log_id (request_log_id)`
- 普通索引：`KEY idx_tool_call_session_id (session_id)`
- 普通索引：`KEY idx_tool_call_tool_name (tool_name)`
- 普通索引：`KEY idx_tool_call_status (status)`
- 普通索引：`KEY idx_tool_call_called_at (called_at DESC)`

---

## 9. request_log

- 表名：`request_log`
- 作用说明：记录每次 QA 请求的整体日志，对应系统观测与评测页的请求日志表格和详情 Drawer。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 请求主键，对应前端 `requestId` |
| `session_id` | `varchar(64)` | 关联会话 |
| `user_id` | `varchar(64)` | 请求用户 |
| `model_name` | `varchar(64)` | 模型名称 |
| `status` | `varchar(24)` | `success/failed/partial_success` |
| `latency_ms` | `int` | 总耗时 |
| `question` | `text` | 用户问题全文 |
| `question_summary` | `varchar(500)` | 问题摘要 |
| `answer` | `text` | 模型回答全文 |
| `hit_chunk_count` | `int` | 命中片段数 |
| `citation_count` | `int` | 引用数 |
| `used_tool` | `tinyint` / `boolean` | 是否调用工具 |
| `citations_json` | `json` | 引用列表 |
| `created_at` | `datetime` | 请求时间 |

### 关联关系

- `request_log.session_id -> chat_session.id`
- `request_log.user_id -> user.id`
- `tool_call_record.request_log_id -> request_log.id`
- `evaluation_record.request_log_id -> request_log.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 普通索引：`KEY idx_request_log_session_id (session_id)`
- 普通索引：`KEY idx_request_log_user_id (user_id)`
- 普通索引：`KEY idx_request_log_status (status)`
- 普通索引：`KEY idx_request_log_created_at (created_at DESC)`
- 普通索引：`KEY idx_request_log_used_tool (used_tool)`
- 联合索引：`KEY idx_request_log_status_created (status, created_at DESC)`
- 联合索引：`KEY idx_request_log_session_created (session_id, created_at DESC)`

备注：

- 当前前端在详情中直接消费引用列表，因此 `citations_json` 足以支持当前阶段。
- 如后续需要更细粒度分析，可增加 `request_log_citation` 明细表。

---

## 10. evaluation_record

- 表名：`evaluation_record`
- 作用说明：记录回答评测结果，对应观测页中的评分、是否有帮助、质量等级等信息。
- 主键：`id`

### 主要字段

| 字段名 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `varchar(64)` | 评测记录主键 |
| `request_log_id` | `varchar(64)` | 关联请求日志 |
| `session_id` | `varchar(64)` | 关联会话，可冗余 |
| `user_id` | `varchar(64)` | 评价用户，可空 |
| `user_score` | `tinyint` | 用户评分，建议 1~5 |
| `helpful` | `tinyint` / `boolean` | 是否有帮助 |
| `quality_level` | `varchar(16)` | `high/medium/low` |
| `remark` | `varchar(500)` | 评测备注 |
| `created_at` | `datetime` | 记录时间 |
| `updated_at` | `datetime` | 更新时间 |

### 关联关系

- `evaluation_record.request_log_id -> request_log.id`
- `evaluation_record.session_id -> chat_session.id`
- `evaluation_record.user_id -> user.id`

### 建议索引

- 主键索引：`PRIMARY KEY (id)`
- 唯一索引：`UNIQUE KEY uk_evaluation_request_log_id (request_log_id)`
- 普通索引：`KEY idx_evaluation_session_id (session_id)`
- 普通索引：`KEY idx_evaluation_user_score (user_score)`
- 普通索引：`KEY idx_evaluation_quality_level (quality_level)`
- 普通索引：`KEY idx_evaluation_helpful (helpful)`
- 普通索引：`KEY idx_evaluation_created_at (created_at DESC)`

---

## 三、补充建议

## 1. 当前可选扩展表

当前前端还没有强制要求，但后端若要增强能力，可后续补充：

- `chat_message_citation`
  - 将 QA 消息中的 citations 从 JSON 拆成明细表
- `request_log_citation`
  - 将请求日志中的引用拆成明细表，便于统计热门文档/热门 chunk
- `user_session_token`
  - 用于 refresh token、多端登录控制

## 2. 命名建议

为了和前端接口草稿更顺滑地对齐，建议：

- 数据库字段统一使用下划线命名：`created_at / updated_at / knowledge_base_id`
- 接口返回字段统一转换成前端当前风格：`createdAt / updatedAt / knowledgeBaseId`

## 3. 删除策略建议

当前前端存在单删和批量删，建议：

- `document` 使用软删除
- `chat_session` 使用软删除
- `request_log`、`tool_call_record`、`evaluation_record` 默认保留，不建议直接物理删除

这样更符合审计和观测数据保留要求。

---

## 四、与当前前端页面的对应关系

- 登录页：`user`
- 文档管理页：`knowledge_base`、`document`
- 文档详情页：`document_chunk`
- QA 问答页：`chat_session`、`chat_message`
- 工具调用中心：`tool_call_record`
- 会话记录页：`chat_session`、`chat_message`
- 系统观测页：`request_log`、`tool_call_record`、`evaluation_record`

以上表已覆盖当前前端主要页面与接口所需的数据实体。
