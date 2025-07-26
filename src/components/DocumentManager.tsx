import { useState, useEffect } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  List, 
  Input, 
  Tag, 
  Typography, 
  message, 
  Empty,
  Spin,
  Badge
} from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  InboxOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { documentsAPI } from '../api/documents';
import type { Document } from '../api/documents';

const { Search } = Input;
const { Text, Title } = Typography;
const { Dragger } = Upload;

interface DocumentManagerProps {
  onDocumentSelect?: (document: Document) => void;
  selectedDocumentId?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  onDocumentSelect,
  selectedDocumentId
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 加载文档数据
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getDocuments();
      // 根据新的API响应格式，data直接是文档数组
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      message.error('加载文档列表失败！');
      // 确保documents始终是数组，即使API调用失败
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // 过滤文档
  const filteredDocuments = (documents || []).filter(doc => {
    const searchLower = searchText.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(searchLower);
    
    // 处理tags字段，根据API文档应该是字符串数组
    const tagsMatch = doc.tags && Array.isArray(doc.tags) ? 
      doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) : false;
    
    return titleMatch || tagsMatch;
  });

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      // 根据API文档支持的文件格式
      const isValidType = [
        // PDF
        'application/pdf',
        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // PowerPoint
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // 图片格式
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
      ].includes(file.type!);
      
      if (!isValidType) {
        message.error('只支持 PDF、Word (.doc/.docx)、PowerPoint (.ppt/.pptx) 和图片格式 (.jpg/.jpeg/.png/.gif/.bmp/.webp)！');
        return false;
      }
      
      const isLt50M = file.size! / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB！');
        return false;
      }
      
      return false; // 阻止自动上传，手动控制
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onDrop: (e) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  // 手动上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件！');
      return;
    }

    setUploading(true);
    try {
      // 逐个上传文件
      for (const fileItem of fileList) {
        if (fileItem.originFileObj) {
          const title = fileItem.name.replace(/\.[^/.]+$/, '');
          await documentsAPI.uploadDocument(fileItem.originFileObj, title);
        }
      }
      
      // 重新加载文档列表
      await loadDocuments();
      setFileList([]);
      message.success('文件上传成功！');
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // 更详细的错误处理
      let errorMessage = '上传失败，请重试！';
      if (error.response) {
        // 服务器响应了错误状态码
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = '请先登录后再上传文件！';
        } else if (status === 413) {
          errorMessage = '文件太大，请选择小于50MB的文件！';
        } else if (status === 400) {
          errorMessage = data?.message || '文件格式不支持或参数错误！';
        } else if (status >= 500) {
          errorMessage = '服务器错误，请稍后重试！';
        } else {
          errorMessage = data?.message || `上传失败 (${status})`;
        }
      } else if (error.request) {
        // 请求发出但没有收到响应
        errorMessage = '网络连接失败，请检查网络连接！';
      } else {
        // 其他错误
        errorMessage = error.message || '上传失败，请重试！';
      }
      
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // 获取状态标签
  const getStatusTag = (document: Document) => {
    const { hasBothSummaryAndConcept } = document;
    console.log(hasBothSummaryAndConcept);
    // 根据hasBothSummaryAndConcept字段判断状态
    if (hasBothSummaryAndConcept) {
      return <Tag color="success">已完成</Tag>;
    } else {
      return <Tag color="processing">处理中</Tag>;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题 */}
      <Title level={4} style={{ margin: '0 0 16px 0' }}>
        My Documents
      </Title>

      {/* 搜索框 */}
      <Search
        placeholder="Search documents..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '16px' }}
        prefix={<SearchOutlined />}
      />

      {/* 上传区域 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Drag & Drop or</p>
          <p className="ant-upload-hint">Click to upload</p>
        </Dragger>
        
        {fileList.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <Button 
              type="primary" 
              onClick={handleUpload}
              loading={uploading}
              block
              icon={<UploadOutlined />}
            >
              Upload
            </Button>
          </div>
        )}
      </Card>

      {/* 文档列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Empty 
            description="No documents found"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <List
            dataSource={filteredDocuments}
            renderItem={(doc) => (
              <List.Item
                style={{
                  padding: '12px',
                  margin: '0 0 8px 0',
                  backgroundColor: selectedDocumentId === doc._id ? '#e6f7ff' : '#fff',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => onDocumentSelect?.(doc)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge 
                      status={doc.hasBothSummaryAndConcept ? 'success' : 'processing'}
                    >
                      <FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    </Badge>
                  }
                  title={
                    <div>
                      <Text strong style={{ fontSize: '14px' }}>
                        {doc.title}
                      </Text>
                      <div style={{ marginTop: '4px' }}>
                        {getStatusTag(doc)}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {/* 优先使用新数据结构，兼容旧数据结构 */}
                        {(doc.metadata?.fileSize || doc.fileSize) ? 
                          formatFileSize(doc.metadata?.fileSize || doc.fileSize!) : 
                          'Unknown size'
                        } • {formatDate(
                          doc.metadata?.uploadedAt || 
                          doc.uploadedAt || 
                          doc.createdAt
                        )}
                      </Text>

                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentManager;