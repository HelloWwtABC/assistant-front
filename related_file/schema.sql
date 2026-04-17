CREATE DATABASE IF NOT EXISTS ai_knowledge_ticket_agent
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE ai_knowledge_ticket_agent;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS evaluation_record;
DROP TABLE IF EXISTS tool_call_record;
DROP TABLE IF EXISTS request_log;
DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS chat_session;
DROP TABLE IF EXISTS kb_document_chunk;
DROP TABLE IF EXISTS kb_document;
DROP TABLE IF EXISTS kb_knowledge_base;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS sys_team;

CREATE TABLE sys_team (
  id BIGINT UNSIGNED NOT NULL COMMENT '团队主键ID',
  name VARCHAR(128) NOT NULL COMMENT '团队名称',
  code VARCHAR(64) NOT NULL COMMENT '团队编码',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '团队状态：active/inactive',
  owner_user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '团队负责人用户ID，关联sys_user.id',
  remark VARCHAR(500) DEFAULT NULL COMMENT '团队备注',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统团队表';

CREATE TABLE sys_user (
  id BIGINT UNSIGNED NOT NULL COMMENT '用户主键ID',
  team_id BIGINT UNSIGNED DEFAULT NULL COMMENT '所属团队ID，关联sys_team.id',
  username VARCHAR(64) NOT NULL COMMENT '登录用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  name VARCHAR(64) NOT NULL COMMENT '用户姓名或展示名',
  email VARCHAR(128) DEFAULT NULL COMMENT '用户邮箱',
  role VARCHAR(32) NOT NULL DEFAULT 'member' COMMENT '用户角色：admin/operator/member',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '用户状态：active/disabled',
  last_login_at DATETIME(3) DEFAULT NULL COMMENT '最近登录时间',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

CREATE TABLE kb_knowledge_base (
  id BIGINT UNSIGNED NOT NULL COMMENT '知识库主键ID',
  team_id BIGINT UNSIGNED DEFAULT NULL COMMENT '所属团队ID，关联sys_team.id',
  name VARCHAR(128) NOT NULL COMMENT '知识库名称',
  description VARCHAR(1000) DEFAULT NULL COMMENT '知识库描述',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '知识库状态：active/inactive',
  document_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文档数量冗余字段',
  created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人用户ID，关联sys_user.id',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库主表';

CREATE TABLE kb_document (
  id BIGINT UNSIGNED NOT NULL COMMENT '文档主键ID',
  knowledge_base_id BIGINT UNSIGNED NOT NULL COMMENT '所属知识库ID，关联kb_knowledge_base.id',
  name VARCHAR(255) NOT NULL COMMENT '文档名称',
  file_type VARCHAR(16) NOT NULL COMMENT '文件类型：pdf/docx/md/txt',
  file_url VARCHAR(500) DEFAULT NULL COMMENT '原始文件存储地址',
  file_size BIGINT UNSIGNED DEFAULT NULL COMMENT '文件大小，单位字节',
  status VARCHAR(32) NOT NULL DEFAULT 'unparsed' COMMENT '文档解析状态：unparsed/parsing/completed/failed',
  chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文档切片数量冗余字段',
  remark VARCHAR(500) DEFAULT NULL COMMENT '文档备注',
  created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '上传人用户ID，关联sys_user.id',
  uploaded_at DATETIME(3) NOT NULL COMMENT '上传时间',
  parse_error_message VARCHAR(1000) DEFAULT NULL COMMENT '解析失败错误信息',
  parse_started_at DATETIME(3) DEFAULT NULL COMMENT '解析开始时间',
  parse_finished_at DATETIME(3) DEFAULT NULL COMMENT '解析结束时间',
  parsed_at DATETIME(3) DEFAULT NULL COMMENT '解析成功时间',
  parser_version VARCHAR(64) DEFAULT NULL COMMENT '解析器版本号',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库文档表';

CREATE TABLE kb_document_chunk (
  id BIGINT UNSIGNED NOT NULL COMMENT '文档切片主键ID',
  document_id BIGINT UNSIGNED NOT NULL COMMENT '所属文档ID，关联kb_document.id',
  knowledge_base_id BIGINT UNSIGNED NOT NULL COMMENT '所属知识库ID，关联kb_knowledge_base.id',
  chunk_index INT UNSIGNED NOT NULL COMMENT '文档内切片序号，从1开始',
  content MEDIUMTEXT NOT NULL COMMENT '切片原始内容',
  summary TEXT DEFAULT NULL COMMENT '切片摘要内容',
  token_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片token数量',
  vector_status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '向量化状态：pending/completed/failed',
  embedding_ref VARCHAR(128) DEFAULT NULL COMMENT '向量索引引用ID或外部向量存储标识',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库文档切片表';

CREATE TABLE chat_session (
  id BIGINT UNSIGNED NOT NULL COMMENT '会话主键ID',
  team_id BIGINT UNSIGNED DEFAULT NULL COMMENT '所属团队ID，关联sys_team.id',
  user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '发起用户ID，关联sys_user.id',
  knowledge_base_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联知识库ID，关联kb_knowledge_base.id',
  title VARCHAR(255) NOT NULL COMMENT '会话标题',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '会话状态：active/archived/deleted',
  message_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '消息总数冗余字段',
  question_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户提问次数冗余字段',
  last_message_preview VARCHAR(500) DEFAULT NULL COMMENT '最后一条消息摘要',
  last_question_snippet VARCHAR(500) DEFAULT NULL COMMENT '最近问题摘要',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '最后活跃时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问答会话主表';

CREATE TABLE request_log (
  id BIGINT UNSIGNED NOT NULL COMMENT '请求日志主键ID',
  session_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联会话ID，关联chat_session.id',
  user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '请求用户ID，关联sys_user.id',
  model_name VARCHAR(64) DEFAULT NULL COMMENT '模型名称',
  status VARCHAR(32) NOT NULL COMMENT '请求状态：success/failed/partial_success',
  latency_ms INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '整体响应耗时，单位毫秒',
  question MEDIUMTEXT NOT NULL COMMENT '用户问题全文',
  question_summary VARCHAR(500) DEFAULT NULL COMMENT '问题摘要',
  answer MEDIUMTEXT DEFAULT NULL COMMENT '模型回答全文',
  hit_chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '命中片段数',
  citation_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '引用数量',
  used_tool TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否调用工具：0否1是',
  citations_json JSON DEFAULT NULL COMMENT '请求级引用来源快照JSON',
  created_at DATETIME(3) NOT NULL COMMENT '请求创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请求日志观测快照表';

CREATE TABLE chat_message (
  id BIGINT UNSIGNED NOT NULL COMMENT '会话消息主键ID',
  session_id BIGINT UNSIGNED NOT NULL COMMENT '所属会话ID，关联chat_session.id',
  request_log_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联请求日志ID，关联request_log.id',
  role VARCHAR(16) NOT NULL COMMENT '消息角色：user/assistant',
  content MEDIUMTEXT NOT NULL COMMENT '消息内容',
  citations_json JSON DEFAULT NULL COMMENT '消息级引用来源JSON，主要用于assistant消息',
  model_name VARCHAR(64) DEFAULT NULL COMMENT '消息对应模型名称，assistant消息可用',
  token_usage_prompt INT UNSIGNED DEFAULT NULL COMMENT '提示词token用量',
  token_usage_completion INT UNSIGNED DEFAULT NULL COMMENT '回答token用量',
  created_at DATETIME(3) NOT NULL COMMENT '消息创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话消息事实表';

CREATE TABLE tool_call_record (
  id BIGINT UNSIGNED NOT NULL COMMENT '工具调用记录主键ID',
  request_log_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联请求日志ID，关联request_log.id',
  session_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联会话ID，关联chat_session.id',
  tool_name VARCHAR(64) NOT NULL COMMENT '工具名称：ticket_status/create_ticket/service_health',
  request_summary VARCHAR(1000) DEFAULT NULL COMMENT '工具输入摘要',
  result_summary VARCHAR(1000) DEFAULT NULL COMMENT '工具输出摘要',
  status VARCHAR(16) NOT NULL COMMENT '调用状态：success/failed',
  duration_ms INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '调用耗时，单位毫秒',
  called_at DATETIME(3) NOT NULL COMMENT '调用发生时间',
  created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '发起用户ID，关联sys_user.id',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具调用记录表';

CREATE TABLE evaluation_record (
  id BIGINT UNSIGNED NOT NULL COMMENT '评测记录主键ID',
  request_log_id BIGINT UNSIGNED NOT NULL COMMENT '关联请求日志ID，关联request_log.id；当前阶段按一次请求一条最终评测记录设计',
  session_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联会话ID，关联chat_session.id',
  user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '评价用户ID，关联sys_user.id',
  user_score TINYINT UNSIGNED DEFAULT NULL COMMENT '用户评分，建议范围1到5',
  helpful TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否有帮助：0否1是',
  quality_level VARCHAR(16) NOT NULL COMMENT '回答质量等级：high/medium/low',
  remark VARCHAR(500) DEFAULT NULL COMMENT '评测备注',
  created_at DATETIME(3) NOT NULL COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL COMMENT '更新时间',
  deleted_at DATETIME(3) DEFAULT NULL COMMENT '软删除时间，NULL表示未删除',
  deleted_by BIGINT UNSIGNED DEFAULT NULL COMMENT '软删除操作人ID，关联sys_user.id',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请求评测记录表，当前阶段按一次请求一条最终评测记录设计，后续可扩展为多来源评测';

CREATE UNIQUE INDEX uk_sys_team_code ON sys_team (code);
CREATE INDEX idx_sys_team_status ON sys_team (status);
CREATE INDEX idx_sys_team_owner_user_id ON sys_team (owner_user_id);
CREATE INDEX idx_sys_team_deleted_at ON sys_team (deleted_at);

CREATE UNIQUE INDEX uk_sys_user_username ON sys_user (username);
CREATE UNIQUE INDEX uk_sys_user_email ON sys_user (email);
CREATE INDEX idx_sys_user_team_id ON sys_user (team_id);
CREATE INDEX idx_sys_user_status ON sys_user (status);
CREATE INDEX idx_sys_user_last_login_at ON sys_user (last_login_at);
CREATE INDEX idx_sys_user_deleted_at ON sys_user (deleted_at);

CREATE INDEX idx_kb_knowledge_base_team_id ON kb_knowledge_base (team_id);
CREATE INDEX idx_kb_knowledge_base_status ON kb_knowledge_base (status);
CREATE INDEX idx_kb_knowledge_base_name ON kb_knowledge_base (name);
CREATE INDEX idx_kb_knowledge_base_team_status ON kb_knowledge_base (team_id, status);
CREATE INDEX idx_kb_knowledge_base_deleted_at ON kb_knowledge_base (deleted_at);

CREATE INDEX idx_kb_document_knowledge_base_id ON kb_document (knowledge_base_id);
CREATE INDEX idx_kb_document_status ON kb_document (status);
CREATE INDEX idx_kb_document_created_by ON kb_document (created_by);
CREATE INDEX idx_kb_document_uploaded_at ON kb_document (uploaded_at DESC);
CREATE INDEX idx_kb_document_name ON kb_document (name);
CREATE INDEX idx_kb_document_kb_status_uploaded ON kb_document (knowledge_base_id, status, uploaded_at DESC);
CREATE INDEX idx_kb_document_created_by_uploaded ON kb_document (created_by, uploaded_at DESC);
CREATE INDEX idx_kb_document_deleted_at ON kb_document (deleted_at);

CREATE UNIQUE INDEX uk_kb_document_chunk_document_index ON kb_document_chunk (document_id, chunk_index);
CREATE INDEX idx_kb_document_chunk_document_id ON kb_document_chunk (document_id);
CREATE INDEX idx_kb_document_chunk_knowledge_base_id ON kb_document_chunk (knowledge_base_id);
CREATE INDEX idx_kb_document_chunk_vector_status ON kb_document_chunk (vector_status);
CREATE INDEX idx_kb_document_chunk_embedding_ref ON kb_document_chunk (embedding_ref);
CREATE INDEX idx_kb_document_chunk_kb_document ON kb_document_chunk (knowledge_base_id, document_id);

CREATE INDEX idx_chat_session_user_id ON chat_session (user_id);
CREATE INDEX idx_chat_session_knowledge_base_id ON chat_session (knowledge_base_id);
CREATE INDEX idx_chat_session_status ON chat_session (status);
CREATE INDEX idx_chat_session_updated_at ON chat_session (updated_at DESC);
CREATE INDEX idx_chat_session_user_updated ON chat_session (user_id, updated_at DESC);
CREATE INDEX idx_chat_session_kb_updated ON chat_session (knowledge_base_id, updated_at DESC);
CREATE INDEX idx_chat_session_deleted_at ON chat_session (deleted_at);

CREATE INDEX idx_request_log_session_id ON request_log (session_id);
CREATE INDEX idx_request_log_user_id ON request_log (user_id);
CREATE INDEX idx_request_log_status ON request_log (status);
CREATE INDEX idx_request_log_created_at ON request_log (created_at DESC);
CREATE INDEX idx_request_log_used_tool ON request_log (used_tool);
CREATE INDEX idx_request_log_status_tool_created ON request_log (status, used_tool, created_at DESC);
CREATE INDEX idx_request_log_session_created ON request_log (session_id, created_at DESC);

CREATE INDEX idx_chat_message_session_id ON chat_message (session_id);
CREATE INDEX idx_chat_message_request_log_id ON chat_message (request_log_id);
CREATE INDEX idx_chat_message_role ON chat_message (role);
CREATE INDEX idx_chat_message_session_created ON chat_message (session_id, created_at ASC);

CREATE INDEX idx_tool_call_record_request_log_id ON tool_call_record (request_log_id);
CREATE INDEX idx_tool_call_record_session_id ON tool_call_record (session_id);
CREATE INDEX idx_tool_call_record_tool_name ON tool_call_record (tool_name);
CREATE INDEX idx_tool_call_record_status ON tool_call_record (status);
CREATE INDEX idx_tool_call_record_called_at ON tool_call_record (called_at DESC);
CREATE INDEX idx_tool_call_record_created_by ON tool_call_record (created_by);

CREATE UNIQUE INDEX uk_evaluation_record_request_log_id ON evaluation_record (request_log_id);
CREATE INDEX idx_evaluation_record_session_id ON evaluation_record (session_id);
CREATE INDEX idx_evaluation_record_user_id ON evaluation_record (user_id);
CREATE INDEX idx_evaluation_record_quality_level ON evaluation_record (quality_level);
CREATE INDEX idx_evaluation_record_helpful ON evaluation_record (helpful);
CREATE INDEX idx_evaluation_record_created_at ON evaluation_record (created_at DESC);
CREATE INDEX idx_evaluation_record_score_created ON evaluation_record (user_score, created_at DESC);

SET FOREIGN_KEY_CHECKS = 1;
