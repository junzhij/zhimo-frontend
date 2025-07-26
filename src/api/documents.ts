import api from './auth';

// 文档相关的类型定义
export interface Document {
  _id: string;
  title: string;
  originalFormat?: string;
  markdownContent?: string;
  restructuredContent?: string;
  hasBothSummaryAndConcept?: boolean; // AI分析完成状态
  metadata?: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    wordCount?: number;
    pageCount?: number;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  // 兼容旧字段
  uploadedAt?: string;
  fileSize?: number;
  fileType?: string;
  url?: string;
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[]; // 根据API文档，直接返回文档数组
}

export interface DocumentResponse {
  success: boolean;
  data: Document;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    document: Document;
    processingStatus: string;
  };
}

// AI功能相关的类型定义
export interface RestructureResponse {
  success: boolean;
  data: {
    originalContent: string;
    restructuredContent: string;
    processingStatus: string;
  };
}

export interface Summary {
  id: string;
  type: 'oneline' | 'detailed' | 'keypoints';
  content: string;
  wordCount: number;
  generatedAt: string;
  aiModel: string;
}

export interface SummaryResponse {
  success: boolean;
  data: {
    summaries: Summary[];
  };
}

export interface Concept {
  id: string;
  term: string;
  definition: string;
  category: 'person' | 'place' | 'concept' | 'term' | 'formula' | 'theory';
  importance: number;
  occurrenceCount: number;
  extractionConfidence: number;
  createdAt: string;
}

export interface ConceptsResponse {
  success: boolean;
  data: {
    concepts: Concept[];
    total: number;
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
    formData.append('document', file); // 根据API文档，字段名应该是'document'
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
  },

  // AI功能API
  // 获取AI重构内容
  getRestructuredContent: async (documentId: string): Promise<RestructureResponse> => {
    const response = await api.get(`/documents/${documentId}/ai/restructure`);
    return response.data;
  },

  // 获取文档摘要
  getSummary: async (documentId: string, type?: 'oneline' | 'detailed' | 'keypoints'): Promise<SummaryResponse> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const url = `/documents/${documentId}/ai/summary${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // 获取提取的概念
  getConcepts: async (documentId: string, filters?: {
    category?: 'person' | 'place' | 'concept' | 'term' | 'formula' | 'theory';
    importance?: number;
    limit?: number;
  }): Promise<ConceptsResponse> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.importance) params.append('importance', filters.importance.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/documents/${documentId}/ai/concepts${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  }
};

export default documentsAPI;