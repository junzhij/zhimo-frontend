import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  List, 
  Input, 
  Tag, 
  Space, 
  Typography, 
  message, 
  Progress,
  Empty,
  Spin,
  Badge
} from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined
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
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      message.error('加载文档失败');
      // 确保即使API失败也保持空数组
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // 过滤文档
  const filteredDocuments = (documents || []).filter(doc => 
    doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (doc.tags && doc.tags.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif'
      ].includes(file.type!);
      
      if (!isValidType) {
        message.error('只支持 PDF、Word、PPT 和图片格式！');
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
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('上传失败，请重试！');
    } finally {
      setUploading(false);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: Document['processingStatus']) => {
    const statusConfig = {
      pending: { color: 'default', text: '等待处理' },
      processing: { color: 'processing', text: '处理中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '处理失败' }
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
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
                      status={doc.processingStatus === 'completed' ? 'success' : 
                             doc.processingStatus === 'processing' ? 'processing' : 
                             doc.processingStatus === 'failed' ? 'error' : 'default'}
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
                        {getStatusTag(doc.processingStatus)}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {doc.fileSize ? formatFileSize(doc.fileSize) : 'Unknown size'} • {formatDate(doc.uploadedAt)}
                      </Text>
                      {doc.processingStatus === 'processing' && (
                        <Progress 
                          percent={Math.floor(Math.random() * 80) + 10} 
                          size="small" 
                          style={{ marginTop: '4px' }}
                          status="active"
                        />
                      )}
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