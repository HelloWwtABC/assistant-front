import { Card, Col, Row, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { qaApi } from '@/api/modules/qa';
import { PageContainer } from '@/components/common/PageContainer';
import { ChatComposer } from '@/components/qa/ChatComposer';
import { ChatMessageList } from '@/components/qa/ChatMessageList';
import { SessionList } from '@/components/qa/SessionList';
import { PageStatus } from '@/components/status/PageStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type {
  QaMessageItem,
  QaSessionDetail,
  QaSessionItem,
} from '@/types/qa';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '问答数据加载失败，请稍后重试';
}

export function RagQaPage() {
  const [sessions, setSessions] = useState<QaSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [activeSessionDetail, setActiveSessionDetail] = useState<QaSessionDetail | null>(
    null,
  );
  const [sessionKeyword, setSessionKeyword] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | false>(false);

  useDocumentTitle('RAG 智能问答');

  const filteredSessions = useMemo(() => {
    const keyword = sessionKeyword.trim().toLowerCase();

    if (!keyword) {
      return sessions;
    }

    return sessions.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.lastMessagePreview.toLowerCase().includes(keyword),
    );
  }, [sessionKeyword, sessions]);

  const loadSessions = async (preferredSessionId?: string) => {
    setPageLoading(true);
    setError(false);

    try {
      const result = await qaApi.getQaSessions();

      setSessions(result);

      const nextActiveSessionId =
        preferredSessionId && result.some((item) => item.sessionId === preferredSessionId)
          ? preferredSessionId
          : result[0]?.sessionId;

      setActiveSessionId(nextActiveSessionId);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setPageLoading(false);
    }
  };

  const loadSessionDetail = async (sessionId: string) => {
    setSessionLoading(true);

    try {
      const result = await qaApi.getQaSessionDetail(sessionId);

      setActiveSessionDetail(result);
    } catch (detailError) {
      message.error(getErrorMessage(detailError));
      setActiveSessionDetail(null);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      setActiveSessionDetail(null);

      return;
    }

    void loadSessionDetail(activeSessionId);
  }, [activeSessionId]);

  const updateSessionSummary = (updatedSession: QaSessionItem) => {
    setSessions((currentSessions) =>
      [updatedSession, ...currentSessions.filter((item) => item.sessionId !== updatedSession.sessionId)]
        .sort((prev, next) => next.updatedAt.localeCompare(prev.updatedAt)),
    );
  };

  const handleCreateSession = async () => {
    setCreating(true);

    try {
      const result = await qaApi.createQaSession();

      message.success('已新建会话');
      setSessionKeyword('');
      setSessions((currentSessions) => [result, ...currentSessions]);
      setActiveSessionId(result.sessionId);
      setActiveSessionDetail(result);
    } catch (createError) {
      message.error(getErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const visibleSessions = filteredSessions;

    try {
      await qaApi.deleteQaSession(sessionId);
      message.success('会话删除成功');

      const remainingSessions = sessions.filter((item) => item.sessionId !== sessionId);
      setSessions(remainingSessions);

      if (activeSessionId === sessionId) {
        const deletedIndex = visibleSessions.findIndex((item) => item.sessionId === sessionId);
        const nextSession =
          visibleSessions[deletedIndex + 1] ??
          visibleSessions[deletedIndex - 1] ??
          remainingSessions[0];

        setActiveSessionId(nextSession?.sessionId);
        setActiveSessionDetail(null);
      }
    } catch (deleteError) {
      message.error(getErrorMessage(deleteError));
    }
  };

  const handleSendMessage = async (question: string) => {
    if (!activeSessionId || !activeSessionDetail) {
      message.warning('请先选择或创建会话');

      return;
    }

    const optimisticUserMessage: QaMessageItem = {
      messageId: `temp_user_${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      citations: [],
    };

    setSending(true);
    setThinking(true);
    setActiveSessionDetail((currentDetail) =>
      currentDetail
        ? {
            ...currentDetail,
            messages: [...currentDetail.messages, optimisticUserMessage],
          }
        : currentDetail,
    );

    try {
      const result = await qaApi.sendQaMessage({
        sessionId: activeSessionId,
        question,
      });

      setActiveSessionDetail((currentDetail) =>
        currentDetail
          ? {
              ...currentDetail,
              ...result.updatedSession,
              messages: [
                ...currentDetail.messages.filter(
                  (item) => item.messageId !== optimisticUserMessage.messageId,
                ),
                result.userMessage,
                result.assistantMessage,
              ],
            }
          : currentDetail,
      );
      updateSessionSummary(result.updatedSession);
      message.success('回答生成成功');
    } catch (sendError) {
      setActiveSessionDetail((currentDetail) =>
        currentDetail
          ? {
              ...currentDetail,
              messages: currentDetail.messages.filter(
                (item) => item.messageId !== optimisticUserMessage.messageId,
              ),
            }
          : currentDetail,
      );
      message.error(getErrorMessage(sendError));
    } finally {
      setSending(false);
      setThinking(false);
    }
  };

  const handleClearContext = async () => {
    if (!activeSessionId) {
      message.warning('请先选择会话');

      return;
    }

    try {
      await qaApi.clearQaSessionContext(activeSessionId);
      message.success('会话上下文已清空');
      await loadSessionDetail(activeSessionId);
      await loadSessions(activeSessionId);
    } catch (clearError) {
      message.error(getErrorMessage(clearError));
    }
  };

  return (
    <PageContainer
      title="RAG 智能问答"
      description="用于演示基于知识库检索的会话问答、引用来源展示与上下文管理能力"
    >
      <PageStatus error={error} onRetry={() => void loadSessions(activeSessionId)}>
        <Row gutter={[16, 16]} className="qa-layout">
          <Col xs={24} xl={7}>
            <Card className="qa-panel qa-panel--sessions">
              <SessionList
                sessions={filteredSessions}
                activeSessionId={activeSessionId}
                keyword={sessionKeyword}
                loading={pageLoading}
                creating={creating}
                onKeywordChange={setSessionKeyword}
                onCreate={() => void handleCreateSession()}
                onSelect={setActiveSessionId}
                onDelete={(sessionId) => void handleDeleteSession(sessionId)}
              />
            </Card>
          </Col>

          <Col xs={24} xl={17}>
            <div className="qa-chat-layout">
              <Card className="qa-panel qa-panel--chat-header">
                <div className="qa-chat-layout__header">
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {activeSessionDetail?.title ?? '请选择会话开始问答'}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    在当前会话中输入问题，系统会基于 mock 知识库返回答案，并展示引用来源片段。
                  </Typography.Text>
                </div>
              </Card>

              <Card className="qa-panel qa-panel--chat qa-panel--chat-stream">
                <ChatMessageList
                  messages={activeSessionDetail?.messages ?? []}
                  loading={Boolean(activeSessionId) && sessionLoading}
                  thinking={thinking}
                />
              </Card>

              <Card className="qa-panel qa-panel--composer">
                <ChatComposer
                  disabled={sending}
                  sending={sending}
                  hasActiveSession={Boolean(activeSessionId)}
                  onSend={handleSendMessage}
                  onClear={handleClearContext}
                />
              </Card>
            </div>
          </Col>
        </Row>
      </PageStatus>
    </PageContainer>
  );
}
