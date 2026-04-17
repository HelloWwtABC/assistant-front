# E-R 图

基于项目根目录下的 [schema.sql](E:\workspace\vscode\assistant-front\schema.sql) 整理。

## 整体 E-R 图

```mermaid
erDiagram
    sys_team {
        BIGINT id PK
        VARCHAR code
        VARCHAR name
        VARCHAR status
        BIGINT owner_user_id
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    sys_user {
        BIGINT id PK
        BIGINT team_id
        VARCHAR username
        VARCHAR name
        VARCHAR email
        VARCHAR role
        VARCHAR status
        DATETIME last_login_at
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    kb_knowledge_base {
        BIGINT id PK
        BIGINT team_id
        VARCHAR name
        VARCHAR status
        INT document_count
        BIGINT created_by
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    kb_document {
        BIGINT id PK
        BIGINT knowledge_base_id
        VARCHAR name
        VARCHAR file_type
        VARCHAR status
        INT chunk_count
        BIGINT created_by
        DATETIME uploaded_at
        DATETIME parsed_at
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    kb_document_chunk {
        BIGINT id PK
        BIGINT document_id
        BIGINT knowledge_base_id
        INT chunk_index
        INT token_count
        VARCHAR vector_status
        VARCHAR embedding_ref
        DATETIME created_at
        DATETIME updated_at
    }

    chat_session {
        BIGINT id PK
        BIGINT team_id
        BIGINT user_id
        BIGINT knowledge_base_id
        VARCHAR title
        VARCHAR status
        INT message_count
        INT question_count
        VARCHAR last_message_preview
        VARCHAR last_question_snippet
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    request_log {
        BIGINT id PK
        BIGINT session_id
        BIGINT user_id
        VARCHAR model_name
        VARCHAR status
        INT latency_ms
        INT hit_chunk_count
        INT citation_count
        TINYINT used_tool
        DATETIME created_at
    }

    chat_message {
        BIGINT id PK
        BIGINT session_id
        BIGINT request_log_id
        VARCHAR role
        VARCHAR model_name
        DATETIME created_at
    }

    tool_call_record {
        BIGINT id PK
        BIGINT request_log_id
        BIGINT session_id
        BIGINT created_by
        VARCHAR tool_name
        VARCHAR status
        INT duration_ms
        DATETIME called_at
        DATETIME created_at
    }

    evaluation_record {
        BIGINT id PK
        BIGINT request_log_id
        BIGINT session_id
        BIGINT user_id
        TINYINT user_score
        TINYINT helpful
        VARCHAR quality_level
        DATETIME created_at
        DATETIME updated_at
    }

    sys_team ||--o{ sys_user : "contains"
    sys_user ||--o{ sys_team : "owns(owner_user_id)"

    sys_team ||--o{ kb_knowledge_base : "has"
    sys_user ||--o{ kb_knowledge_base : "creates"

    kb_knowledge_base ||--o{ kb_document : "contains"
    sys_user ||--o{ kb_document : "uploads"

    kb_document ||--o{ kb_document_chunk : "splits_into"
    kb_knowledge_base ||--o{ kb_document_chunk : "scopes"

    sys_team ||--o{ chat_session : "scopes"
    sys_user ||--o{ chat_session : "starts"
    kb_knowledge_base ||--o{ chat_session : "related_to"

    chat_session ||--o{ chat_message : "has"
    request_log ||--o{ chat_message : "traces"

    chat_session ||--o{ request_log : "generates"
    sys_user ||--o{ request_log : "initiates"

    request_log ||--o{ tool_call_record : "triggers"
    chat_session ||--o{ tool_call_record : "context"
    sys_user ||--o{ tool_call_record : "executes"

    request_log ||--|| evaluation_record : "evaluates"
    chat_session ||--o{ evaluation_record : "belongs_to"
    sys_user ||--o{ evaluation_record : "reviews"
```

## 说明

- `sys_team` 和 `sys_user` 构成平台的组织与用户基础层。
- `kb_knowledge_base`、`kb_document`、`kb_document_chunk` 构成知识库与检索内容层。
- `chat_session`、`chat_message` 构成问答会话事实层。
- `request_log` 是一次问答请求的观测快照。
- `tool_call_record` 记录请求过程中触发的工具调用。
- `evaluation_record` 记录请求级最终评测结果，当前阶段按“一次请求一条最终评测记录”设计。
