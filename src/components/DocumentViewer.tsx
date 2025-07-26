import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Spin,
  Empty,
  Button,
  Space,
  Tag,
  Divider,
  Tooltip,
  Progress,
  message
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface Document {
  _id: string;
  title: string;
  originalFormat: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    wordCount?: number;
    pageCount?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  content?: string;
}

interface DocumentViewerProps {
  document?: Document;
  loading?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, loading = false }) => {
  const [content, setContent] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 模拟文档内容
  const mockContent = `
# ${document?.title || '文档标题'}

## 概述

这是一份关于${document?.title || '相关主题'}的详细文档。本文档旨在为读者提供全面的理解和实用的指导。

## 主要内容

### 1. 基础概念

在开始深入讨论之前，我们需要了解一些基本概念：

- **核心概念A**: 这是理解整个主题的基础
- **核心概念B**: 与概念A密切相关的重要概念
- **核心概念C**: 实际应用中的关键要素

### 2. 技术要点

#### 2.1 关键技术

本节将详细介绍相关的技术要点：

1. **技术方案一**
   - 优势：高效、稳定、易于实现
   - 劣势：资源消耗较大
   - 适用场景：大规模应用

2. **技术方案二**
   - 优势：轻量级、快速部署
   - 劣势：功能相对有限
   - 适用场景：小型项目

#### 2.2 实现细节

在具体实现过程中，需要注意以下几个关键点：

- 性能优化策略
- 安全性考虑
- 可扩展性设计
- 维护性要求

### 3. 实际应用

#### 3.1 应用场景

该技术在以下场景中表现出色：

- **场景一**: 企业级应用开发
- **场景二**: 数据处理和分析
- **场景三**: 用户界面设计

#### 3.2 案例分析

通过以下几个实际案例，我们可以更好地理解技术的应用：

**案例1: 电商平台优化**
通过采用新的技术方案，某电商平台的响应速度提升了40%，用户体验显著改善。

**案例2: 数据分析系统**
在大数据处理场景中，新方案将处理时间从小时级别缩短到分钟级别。

### 4. 最佳实践

基于实际项目经验，我们总结出以下最佳实践：

1. **规划阶段**
   - 充分调研需求
   - 制定详细的技术方案
   - 评估风险和资源需求

2. **开发阶段**
   - 遵循编码规范
   - 进行充分的测试
   - 及时进行代码审查

3. **部署阶段**
   - 制定详细的部署计划
   - 准备回滚方案
   - 监控系统性能

### 5. 未来发展

#### 5.1 技术趋势

随着技术的不断发展，我们预期在以下方面会有重要突破：

- 人工智能集成
- 云原生架构
- 边缘计算应用
- 安全性增强

#### 5.2 发展建议

为了跟上技术发展的步伐，建议：

- 持续学习新技术
- 参与开源项目
- 关注行业动态
- 加强团队协作

## 结论

通过本文档的学习，读者应该能够：

- 理解核心概念和技术要点
- 掌握实际应用的方法
- 了解最佳实践和发展趋势
- 为实际项目提供指导

我们相信，随着技术的不断进步和实践经验的积累，这些知识将为您的工作和学习带来更大的价值。

---

*本文档最后更新时间：${new Date().toLocaleDateString('zh-CN')}*
  `;

  // 加载文档内容
  useEffect(() => {
    if (document && document.processingStatus === 'completed') {
      setContentLoading(true);
      // 模拟加载延迟
      setTimeout(() => {
        setContent(mockContent);
        setContentLoading(false);
      }, 800);
    } else {
      setContent('');
    }
  }, [document, mockContent]);

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

  // 处理操作
  const handleDownload = () => {
    message.info('下载功能开发中...');
  };

  const handleShare = () => {
    message.info('分享功能开发中...');
  };

  const handlePrint = () => {
    message.info('打印功能开发中...');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 渲染Markdown内容
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // 处理标题
      if (line.startsWith('# ')) {
        return <Title key={index} level={1} style={{ fontSize: `${zoom * 0.24}px` }}>{line.substring(2)}</Title>;
      }
      if (line.startsWith('## ')) {
        return <Title key={index} level={2} style={{ fontSize: `${zoom * 0.20}px` }}>{line.substring(3)}</Title>;
      }
      if (line.startsWith('### ')) {
        return <Title key={index} level={3} style={{ fontSize: `${zoom * 0.18}px` }}>{line.substring(4)}</Title>;
      }
      if (line.startsWith('#### ')) {
        return <Title key={index} level={4} style={{ fontSize: `${zoom * 0.16}px` }}>{line.substring(5)}</Title>;
      }
      
      // 处理列表
      if (line.startsWith('- ')) {
        return (
          <div key={index} style={{ marginLeft: '20px', fontSize: `${zoom * 0.14}px` }}>
            • {line.substring(2)}
          </div>
        );
      }
      
      // 处理数字列表
      if (/^\d+\. /.test(line)) {
        return (
          <div key={index} style={{ marginLeft: '20px', fontSize: `${zoom * 0.14}px` }}>
            {line}
          </div>
        );
      }
      
      // 处理粗体文本
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Paragraph key={index} style={{ fontSize: `${zoom * 0.14}px` }}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </Paragraph>
        );
      }
      
      // 处理分隔线
      if (line.trim() === '---') {
        return <Divider key={index} />;
      }
      
      // 处理空行
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // 普通段落
      return (
        <Paragraph key={index} style={{ fontSize: `${zoom * 0.14}px`, lineHeight: 1.6 }}>
          {line}
        </Paragraph>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty 
          description="Select a document"
          image={<FileTextOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
        >
          <Text type="secondary">Choose a document from the left to view its contents.</Text>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 文档头部信息 */}
      <Card size="small" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FileTextOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }} />
              <Title level={4} style={{ margin: 0 }}>
                {document.title}
              </Title>
              {getStatusTag(document.processingStatus)}
            </div>
            
            <Space split={<Divider type="vertical" />} size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatFileSize(document.metadata.fileSize)}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {document.metadata.wordCount ? `${document.metadata.wordCount} 字` : ''}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {document.metadata.pageCount ? `${document.metadata.pageCount} 页` : ''}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(document.updatedAt)}
              </Text>
            </Space>
            
            {document.tags.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {document.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <Space>
            <Tooltip title="缩小">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={zoom <= 50} />
            </Tooltip>
            <Text style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>{zoom}%</Text>
            <Tooltip title="放大">
              <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={zoom >= 200} />
            </Tooltip>
            <Tooltip title="全屏">
              <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
            </Tooltip>
            <Tooltip title="下载">
              <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload} />
            </Tooltip>
            <Tooltip title="分享">
              <Button size="small" icon={<ShareAltOutlined />} onClick={handleShare} />
            </Tooltip>
            <Tooltip title="打印">
              <Button size="small" icon={<PrinterOutlined />} onClick={handlePrint} />
            </Tooltip>
          </Space>
        </div>
        
        {document.processingStatus === 'processing' && (
          <Progress 
            percent={Math.floor(Math.random() * 80) + 10} 
            size="small" 
            style={{ marginTop: '8px' }}
            status="active"
          />
        )}
      </Card>

      {/* 文档内容 */}
      <Card 
        style={{ 
          flex: 1, 
          overflow: 'hidden',
          ...(isFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            margin: 0,
            borderRadius: 0
          } : {})
        }}
      >
        <div style={{ height: '100%', overflow: 'auto', padding: '16px' }}>
          {document.processingStatus === 'pending' && (
            <Empty 
              description="文档等待处理中"
              image={<EyeOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
            />
          )}
          
          {document.processingStatus === 'failed' && (
            <Empty 
              description="文档处理失败"
              image={<FileTextOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />}
            >
              <Button type="primary" size="small">重新处理</Button>
            </Empty>
          )}
          
          {document.processingStatus === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">正在处理文档内容...</Text>
              </div>
            </div>
          )}
          
          {document.processingStatus === 'completed' && (
            contentLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">正在加载文档内容...</Text>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {renderContent(content)}
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentViewer;