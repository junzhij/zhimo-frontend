import api from './auth';

// AI功能相关的类型定义
export interface ExerciseConfig {
  count: number;
  types: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'zh' | 'en';
}

export interface Exercise {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  points: number;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface ExerciseResponse {
  success: boolean;
  data: {
    exercises: Exercise[];
    saved: boolean;
    databaseId: string;
    options: ExerciseConfig;
  };
}

export interface MindMapConfig {
  maxNodes: number;
  language: 'zh' | 'en';
  style: 'mindmap' | 'flowchart' | 'graph';
}

export interface MindMapResponse {
  success: boolean;
  data: {
    title: string;
    mermaid: string;
    saved: boolean;
    databaseId: string;
    isValidSyntax: boolean;
    options: MindMapConfig;
  };
}

export interface DocumentSummaryResponse {
  success: boolean;
  data: {
    oneline: string;
    detailed: string;
    processingStatus: string;
  };
}

export interface DocumentConceptsResponse {
  success: boolean;
  data: {
    concepts: Array<{
      term: string;
      definition: string;
      importance: number;
    }>;
    processingStatus: string;
  };
}

export interface DocumentRestructureResponse {
  success: boolean;
  data: {
    originalContent: string;
    restructuredContent: string;
    processingStatus: string;
  };
}

// AI功能API
export const aiAPI = {
  // 生成练习题
  generateExercises: async (documentId: string, config: ExerciseConfig): Promise<ExerciseResponse> => {
    const response = await api.post(`/documents/${documentId}/ai/exercises`, {
      count: config.count,
      types: config.types,
      difficulty: config.difficulty,
      language: config.language
    });
    return response.data;
  },

  // 查询练习题
  getExercises: async (documentId?: string): Promise<{ success: boolean; data: Exercise[] }> => {
    const url = documentId ? `/documents/exercises?documentId=${documentId}` : '/documents/exercises';
    const response = await api.get(url);
    return response.data;
  },

  // 生成思维导图
  generateMindMap: async (documentId: string, config: MindMapConfig): Promise<MindMapResponse> => {
    const response = await api.post(`/documents/${documentId}/ai/mindmap`, {
      maxNodes: config.maxNodes,
      language: config.language,
      style: config.style
    });
    return response.data;
  },

  // 获取文档摘要
  getDocumentSummary: async (documentId: string): Promise<DocumentSummaryResponse> => {
    const response = await api.get(`/documents/${documentId}/ai/summary`);
    return response.data;
  },

  // 获取文档概念
  getDocumentConcepts: async (documentId: string): Promise<DocumentConceptsResponse> => {
    const response = await api.get(`/documents/${documentId}/ai/concepts`);
    return response.data;
  },

  // 获取AI重构内容
  getDocumentRestructure: async (documentId: string): Promise<DocumentRestructureResponse> => {
    const response = await api.get(`/documents/${documentId}/ai/restructure`);
    return response.data;
  },

  // 批量AI处理
  batchProcess: async (documentId: string, options: {
    generateSummary?: boolean;
    extractConcepts?: boolean;
    generateExercises?: boolean;
    generateMindMap?: boolean;
    summaryTypes?: string[];
    exerciseCount?: number;
  }): Promise<{ success: boolean; data: any }> => {
    const response = await api.post(`/documents/${documentId}/ai/process`, options);
    return response.data;
  }
};

export default aiAPI;