import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Statistic, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { documentsApi } from '@/api/modules/documents';
import { PageContainer } from '@/components/common/PageContainer';
import {
  DocumentFilter,
  type DocumentFilterValues,
} from '@/components/documents/DocumentFilter';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal';
import { PageStatus } from '@/components/status/PageStatus';
import { APP_ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/store/auth';
import type {
  DocumentListResponse,
  KnowledgeBaseOption,
  KnowledgeDocumentItem,
  KnowledgeDocumentQuery,
  UploadDocumentRequest,
} from '@/types/documents';

const defaultQuery: KnowledgeDocumentQuery = {
  keyword: '',
  status: undefined,
  uploader: '',
  page: 1,
  pageSize: 10,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '文档数据加载失败，请稍后重试';
}

export function DocumentManagementPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [query, setQuery] = useState<KnowledgeDocumentQuery>(defaultQuery);
  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>([]);
  const [knowledgeBaseOptions, setKnowledgeBaseOptions] = useState<
    KnowledgeBaseOption[]
  >([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useDocumentTitle('知识库文档管理');

  const applyListResult = (
    result: DocumentListResponse,
    appliedQuery: KnowledgeDocumentQuery,
  ) => {
    setDocuments(result.list);
    setTotal(result.total);
    setKnowledgeBaseOptions(result.knowledgeBaseOptions);
    setQuery(appliedQuery);
  };

  const fetchDocuments = async (nextQuery = query) => {
    setLoading(true);
    setError(false);

    try {
      let appliedQuery = nextQuery;
      let result = await documentsApi.getDocuments(appliedQuery);

      while (appliedQuery.page > 1 && result.list.length === 0 && result.total > 0) {
        appliedQuery = {
          ...appliedQuery,
          page: appliedQuery.page - 1,
        };
        result = await documentsApi.getDocuments(appliedQuery);
      }

      applyListResult(result, appliedQuery);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDocuments(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (values: DocumentFilterValues) => {
    setSelectedRowKeys([]);

    await fetchDocuments({
      ...query,
      keyword: values.keyword?.trim() ?? '',
      status: values.status,
      uploader: values.uploader?.trim() ?? '',
      page: 1,
    });
  };

  const handleReset = async () => {
    setSelectedRowKeys([]);
    await fetchDocuments(defaultQuery);
  };

  const handleRefresh = async () => {
    await fetchDocuments(query);
  };

  const handleDelete = async (documentId: string) => {
    setDeleteLoading(true);

    try {
      await documentsApi.deleteDocument(documentId);
      message.success('文档删除成功');
      setSelectedRowKeys((currentKeys) =>
        currentKeys.filter((key) => key !== documentId),
      );
      await fetchDocuments(query);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    setDeleteLoading(true);

    try {
      await documentsApi.batchDeleteDocuments(selectedRowKeys as string[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      await fetchDocuments(query);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpload = async (values: UploadDocumentRequest) => {
    const matchedKnowledgeBase = knowledgeBaseOptions.find(
      (item) => item.value === values.knowledgeBaseId,
    );

    if (!matchedKnowledgeBase) {
      message.error('所属知识库不存在，请重新选择');

      return;
    }

    setUploadLoading(true);

    try {
      await documentsApi.uploadDocument({
        ...values,
        knowledgeBaseName: matchedKnowledgeBase.label,
        uploader: currentUser?.name ?? '平台管理员',
      });
      message.success('文档上传成功，已进入解析流程');
      setUploadOpen(false);
      setSelectedRowKeys([]);
      await fetchDocuments({
        ...query,
        page: 1,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <PageContainer
      title="知识库文档管理"
      description="用于管理知识库文档、查看解析状态、上传文档和进入详情页"
      extra={<Tag color="processing">Mock Data</Tag>}
    >
      <Card>
        <DocumentFilter
          loading={loading}
          values={{
            keyword: query.keyword,
            status: query.status,
            uploader: query.uploader,
          }}
          onSearch={(values) => void handleSearch(values)}
          onReset={() => void handleReset()}
        />
      </Card>

      <Card>
        <div className="document-toolbar">
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setUploadOpen(true)}
            >
              上传文档
            </Button>

            <Popconfirm
              title="确认批量删除已选文档吗？"
              description="删除后将无法恢复，请谨慎操作。"
              onConfirm={() => void handleBatchDelete()}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                loading={deleteLoading}
              >
                批量删除
              </Button>
            </Popconfirm>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => void handleRefresh()}
              loading={loading}
            >
              刷新
            </Button>
          </Space>

          <div className="document-toolbar__summary">
            <Typography.Text type="secondary">
              已选 {selectedRowKeys.length} 项
            </Typography.Text>
            <Statistic title="文档总数" value={total} />
          </div>
        </div>
      </Card>

      <PageStatus error={error} onRetry={() => void handleRefresh()}>
        <Card>
          <DocumentTable
            dataSource={documents}
            loading={loading || deleteLoading}
            selectedRowKeys={selectedRowKeys}
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total,
            }}
            onSelectionChange={setSelectedRowKeys}
            onPageChange={(page, pageSize) =>
              void fetchDocuments({
                ...query,
                page,
                pageSize,
              })
            }
            onViewDetail={(documentId) =>
              navigate(APP_ROUTES.documentDetail(documentId))
            }
            onDelete={(documentId) => void handleDelete(documentId)}
          />
        </Card>
      </PageStatus>

      <UploadDocumentModal
        open={uploadOpen}
        confirmLoading={uploadLoading}
        knowledgeBaseOptions={knowledgeBaseOptions}
        onCancel={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />
    </PageContainer>
  );
}
