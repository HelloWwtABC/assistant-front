import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { documentsApi } from '@/api/modules/documents';
import { PageContainer } from '@/components/common/PageContainer';
import { PageStatus } from '@/components/status/PageStatus';
import { APP_ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CHUNK_VECTOR_STATUS_META,
  DOCUMENT_STATUS_META,
  type DocumentChunkItem,
  type DocumentDetail,
} from '@/types/documents';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '文档详情加载失败，请稍后重试';
}

export function DocumentDetailPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  useDocumentTitle('文档详情');

  const chunkColumns: ColumnsType<DocumentChunkItem> = [
    {
      title: 'chunk 序号',
      dataIndex: 'chunkIndex',
      width: 100,
    },
    {
      title: '摘要内容',
      dataIndex: 'summary',
    },
    {
      title: 'token 数量',
      dataIndex: 'tokenCount',
      width: 120,
    },
    {
      title: '向量化状态',
      dataIndex: 'vectorStatus',
      width: 140,
      render: (value: DocumentChunkItem['vectorStatus']) => (
        <Tag color={CHUNK_VECTOR_STATUS_META[value].color}>
          {CHUNK_VECTOR_STATUS_META[value].text}
        </Tag>
      ),
    },
  ];

  const fetchDetail = async () => {
    if (!documentId) {
      setDetail(null);

      return;
    }

    setLoading(true);
    setError(false);

    try {
      const result = await documentsApi.getDocumentDetail(documentId);

      setDetail(result);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  return (
    <PageContainer
      title="文档详情"
      description={`当前文档 ID：${documentId ?? '--'}`}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(APP_ROUTES.documents)}
        >
          返回文档列表
        </Button>
      }
    >
      <PageStatus
        loading={loading}
        error={error}
        empty={!documentId || !detail}
        emptyDescription="未获取到文档详情信息，请返回列表页重新选择文档。"
        onRetry={() => void fetchDetail()}
      >
        {detail ? (
          <div className="document-detail-stack">
            <Card title="基础信息">
              <Descriptions column={{ xs: 1, md: 2, xl: 3 }} bordered>
                <Descriptions.Item label="文档名称">
                  {detail.documentName}
                </Descriptions.Item>
                <Descriptions.Item label="文档ID">
                  <Typography.Text code>{detail.documentId}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="所属知识库">
                  {detail.knowledgeBaseName}
                </Descriptions.Item>
                <Descriptions.Item label="文件类型">
                  <Tag>{detail.fileType.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={DOCUMENT_STATUS_META[detail.status].color}>
                    {DOCUMENT_STATUS_META[detail.status].text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="上传人">
                  {detail.uploader}
                </Descriptions.Item>
                <Descriptions.Item label="上传时间">
                  {detail.uploadedAt}
                </Descriptions.Item>
                <Descriptions.Item label="chunk 总数">
                  {detail.chunkCount}
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {detail.remark || '暂无备注'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Chunk 列表"
              extra={
                <Space>
                  <Typography.Text type="secondary">
                    当前共 {detail.chunks.length} 个 chunk
                  </Typography.Text>
                </Space>
              }
            >
              <Table
                rowKey="chunkId"
                dataSource={detail.chunks}
                pagination={false}
                columns={chunkColumns}
                locale={{
                  emptyText: '当前文档暂无 chunk 数据',
                }}
              />
            </Card>
          </div>
        ) : null}
      </PageStatus>
    </PageContainer>
  );
}
