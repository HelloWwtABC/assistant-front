export type DocumentStatus = 'unparsed' | 'parsing' | 'completed' | 'failed';

export type DocumentFileType = 'pdf' | 'docx' | 'md' | 'txt';

export type ChunkVectorStatus = 'pending' | 'completed' | 'failed';

export interface KnowledgeBaseOption {
  value: string;
  label: string;
}

export interface KnowledgeDocumentItem {
  documentId: string;
  documentName: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  fileType: DocumentFileType;
  status: DocumentStatus;
  chunkCount: number;
  uploader: string;
  uploadedAt: string;
  remark?: string;
}

export interface KnowledgeDocumentQuery {
  keyword?: string;
  status?: DocumentStatus;
  uploader?: string;
  page: number;
  pageSize: number;
}

export interface UploadDocumentRequest {
  knowledgeBaseId: string;
  file: File;
  remark?: string;
}

export interface UploadDocumentPayload extends UploadDocumentRequest {
  knowledgeBaseName: string;
  uploader: string;
}

export interface DocumentChunkItem {
  chunkId: string;
  chunkIndex: number;
  summary: string;
  tokenCount: number;
  vectorStatus: ChunkVectorStatus;
}

export interface DocumentDetail extends KnowledgeDocumentItem {
  chunks: DocumentChunkItem[];
}

export interface DocumentListResponse {
  list: KnowledgeDocumentItem[];
  total: number;
  page: number;
  pageSize: number;
  knowledgeBaseOptions: KnowledgeBaseOption[];
}

export const DOCUMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: DocumentStatus;
}> = [
  { label: '未解析', value: 'unparsed' },
  { label: '解析中', value: 'parsing' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
];

export const DOCUMENT_STATUS_META: Record<
  DocumentStatus,
  {
    text: string;
    color: string;
  }
> = {
  unparsed: {
    text: '未解析',
    color: 'default',
  },
  parsing: {
    text: '解析中',
    color: 'processing',
  },
  completed: {
    text: '已完成',
    color: 'success',
  },
  failed: {
    text: '失败',
    color: 'error',
  },
};

export const CHUNK_VECTOR_STATUS_META: Record<
  ChunkVectorStatus,
  {
    text: string;
    color: string;
  }
> = {
  pending: {
    text: '待向量化',
    color: 'default',
  },
  completed: {
    text: '已向量化',
    color: 'success',
  },
  failed: {
    text: '向量化失败',
    color: 'error',
  },
};

export const DOCUMENT_FILE_TYPES: DocumentFileType[] = ['pdf', 'docx', 'md', 'txt'];
