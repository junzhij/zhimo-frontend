import React from 'react';
import {
  Card,
  Tabs,
  Typography
} from 'antd';
import {
  FileTextOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import ExerciseGenerator from './ExerciseGenerator';
import MindMapGenerator from './MindMapGenerator';

const { Text } = Typography;

interface AIToolPanelProps {
  selectedDocument?: {
    _id: string;
    title: string;
    content?: string;
    processingStatus?: string;
  };
}

const AIToolPanel: React.FC<AIToolPanelProps> = ({ selectedDocument }) => {





  const tabItems = [
    {
      key: 'exercise',
      label: (
        <span>
          <FileTextOutlined />
          题目生成
        </span>
      ),
      children: <ExerciseGenerator selectedDocument={selectedDocument} />
    },
    {
      key: 'mindmap',
      label: (
        <span>
          <NodeIndexOutlined />
          思维导图
        </span>
      ),
      children: <MindMapGenerator selectedDocument={selectedDocument} />
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题和工具栏 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            AI Assistant
          </Typography.Title>
        </div>
        
        {selectedDocument && (
          <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>当前文档：</Text>
            <Text strong style={{ fontSize: '13px', marginLeft: '4px' }}>
              {selectedDocument.title}
            </Text>
          </Card>
        )}
      </div>

      {/* AI工具选项卡 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Tabs 
          items={tabItems}
          size="small"
          style={{ height: '100%' }}
          tabBarStyle={{ marginBottom: '16px' }}
        />
      </div>
    </div>
  );
};

export default AIToolPanel;