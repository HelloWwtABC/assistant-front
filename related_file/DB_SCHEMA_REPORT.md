# 数据库建表脚本生成说明

## 1. 一共生成了哪些表

本次共生成 10 张核心业务表：

1. `sys_team`
2. `sys_user`
3. `kb_knowledge_base`
4. `kb_document`
5. `kb_document_chunk`
6. `chat_session`
7. `chat_message`
8. `tool_call_record`
9. `request_log`
10. `evaluation_record`

同时已生成可直接执行的 MySQL 8.0 建表脚本：

- [schema.sql](E:\workspace\vscode\assistant-front\schema.sql)

## 2. 对原始草稿做了哪些关键修正

本次不是机械照抄 `BACKEND_DB_DRAFT.md`，而是做了以下收敛和修正：

- 将 `user` 表更名为 `sys_user`
- 将 `team` 表更名为 `sys_team`
- 将 `knowledge_base` 表更名为 `kb_knowledge_base`
- 将 `document` 表更名为 `kb_document`
- 将 `document_chunk` 表更名为 `kb_document_chunk`
- 为 `kb_document` 增加了解析链路字段：
  - `parse_error_message`
  - `parse_started_at`
  - `parse_finished_at`
  - `parsed_at`
  - `parser_version`
- 为 `kb_document_chunk` 增加了 `knowledge_base_id`
  - 便于按知识库重建索引和过滤切片
- 明确区分了 `chat_message` 与 `request_log` 的职责：
  - `chat_message` 作为消息事实表
  - `request_log` 作为观测快照表
- 为 `chat_message` 增加了 `request_log_id`
  - 便于将一轮消息与观测日志关联
- 统一了软删除策略，以下表都加入了：
  - `deleted_at`
  - `deleted_by`
  - 适用表：`sys_team`、`sys_user`、`kb_knowledge_base`、`kb_document`、`chat_session`
- 保留了 `evaluation_record.request_log_id` 唯一索引
  - 并在表注释中说明：当前阶段按“一次请求一条最终评测记录”设计，后续可扩展

## 3. 哪些设计是为了适配 MySQL 8.0

以下处理是针对 MySQL 8.0 做的：

- 所有表统一使用：
  - `ENGINE=InnoDB`
  - `CHARSET=utf8mb4`
  - `COLLATE=utf8mb4_unicode_ci`
- 所有主键统一为：
  - `BIGINT UNSIGNED`
  - 不使用 `AUTO_INCREMENT`
  - 默认由应用层雪花算法生成
- 布尔字段统一为：
  - `TINYINT(1)`
- 时间字段统一优先使用：
  - `DATETIME(3)`
- JSON 扩展字段统一使用：
  - `JSON`
- 所有字段和表都添加了 `COMMENT`
- 未使用 `FOREIGN KEY`
  - 当前阶段为了方便快速开发和联调，由业务层控制关联完整性
- 脚本中加入了：
  - `CREATE DATABASE`
  - `USE`
  - `DROP TABLE IF EXISTS`
  - `CREATE TABLE`
  - `CREATE INDEX`

## 4. 哪些地方保留为后续可扩展设计

以下设计已预留扩展空间，但当前并未过度设计：

- `kb_document_chunk.embedding_ref`
  - 后续可接入外部向量库或向量检索系统
- `chat_message.citations_json`
  - 当前适合快速支撑前端引用展示，后续可拆分为单独 citation 明细表
- `request_log.citations_json`
  - 当前适合观测详情展示，后续可拆分为 `request_log_citation`
- `tool_call_record`
  - 当前主要存摘要字段，后续可扩展输入输出 JSON 明细
- `evaluation_record`
  - 当前是一条请求对应一条最终评测记录，后续可扩展为：
    - 用户反馈
    - 自动评测
    - 人工审核
    多来源并存模型
- `sys_team`
  - 虽然前端暂未直接做团队管理，但已保留多团队/租户承载能力

## 5. 额外说明

- 当前脚本重点服务于：
  - 文档管理
  - QA 会话与消息
  - 工具调用记录
  - 请求日志观测
  - 评测结果
- 当前未生成 Java 实体、Mapper、初始化数据或迁移脚本，仅输出 MySQL 8.0 第一版建表 DDL。
