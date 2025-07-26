import api from './auth';

// 文档相关的类型定义
export interface Document {
  _id: string;
  title: string;
  content?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  updatedAt: string;
  fileSize?: number;
  fileType?: string;
  tags?: string;
  url?: string;
}

export interface DocumentListResponse {
  success: boolean;
  data: {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface DocumentResponse {
  success: boolean;
  data: Document;
}

export interface UploadResponse {
  success: boolean;
  data: {
    document: Document;
    message: string;
  };
}

// 文档管理API
export const documentsAPI = {
  // 获取文档列表
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  }): Promise<DocumentListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) queryParams.append('tags', params.tags);
    
    const url = `/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // 获取单个文档详情
  getDocument: async (documentId: string): Promise<DocumentResponse> => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  // 上传文档
  uploadDocument: async (file: File, title?: string, tags?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (tags) formData.append('tags', tags);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 添加URL文档
  addUrlDocument: async (url: string, title: string, tags?: string): Promise<UploadResponse> => {
    const response = await api.post('/documents/url', {
      url,
      title,
      tags
    });
    return response.data;
  },

  // 更新文档
  updateDocument: async (documentId: string, updates: {
    title?: string;
    tags?: string;
    content?: string;
  }): Promise<DocumentResponse> => {
    const response = await api.put(`/documents/${documentId}`, updates);
    return response.data;
  },

  // 删除文档
  deleteDocument: async (documentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  // 批量删除文档
  batchDeleteDocuments: async (documentIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/documents/batch', {
      data: { documentIds }
    });
    return response.data;
  },

  // 下载文档
  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // 搜索文档
  searchDocuments: async (query: string, filters?: {
    tags?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<DocumentListResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.tags) params.append('tags', filters.tags);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/documents/search?${params.toString()}`);
    return response.data;
  }
};

export default documentsAPI;