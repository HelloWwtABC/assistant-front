import { appEnv } from '@/config/env';
import {
  mockBatchDeleteDocuments,
  mockDeleteDocument,
  mockGetDocumentDetail,
  mockGetDocuments,
  mockUploadDocument,
} from '@/mock/documents';
import { mockRequest } from '@/mock/request';
import type {
  DocumentDetail,
  DocumentListResponse,
  KnowledgeDocumentQuery,
  UploadDocumentPayload,
} from '@/types/documents';

import { request } from '../request';

export const documentsApi = {
  getDocuments(query: KnowledgeDocumentQuery) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetDocuments(query));
    }

    return request.get<DocumentListResponse>('/documents', {
      params: query,
    });
  },
  getDocumentDetail(documentId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetDocumentDetail(documentId));
    }

    return request.get<DocumentDetail>(`/documents/${documentId}`);
  },
  uploadDocument(payload: UploadDocumentPayload) {
    if (appEnv.useMock) {
      return mockRequest(() => mockUploadDocument(payload));
    }

    const formData = new FormData();
    formData.append('knowledgeBaseId', payload.knowledgeBaseId);
    formData.append('knowledgeBaseName', payload.knowledgeBaseName);
    formData.append('uploader', payload.uploader);

    if (payload.remark) {
      formData.append('remark', payload.remark);
    }

    formData.append('file', payload.file);

    return request.post<DocumentDetail, FormData>('/documents/upload', formData);
  },
  deleteDocument(documentId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockDeleteDocument(documentId));
    }

    return request.delete<void>(`/documents/${documentId}`);
  },
  batchDeleteDocuments(documentIds: string[]) {
    if (appEnv.useMock) {
      return mockRequest(() => mockBatchDeleteDocuments(documentIds));
    }

    return request.post<void, { documentIds: string[] }>('/documents/batch-delete', {
      documentIds,
    });
  },
};
