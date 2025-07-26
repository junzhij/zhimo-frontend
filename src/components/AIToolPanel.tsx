import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Divider,
  Tooltip,
  Spin,
  Empty,
  message,
  Dropdown,
  Menu,
  Tabs
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CopyOutlined,
  ReloadOutlined,
  MoreOutlined,
  BulbOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import ExerciseGenerator from './ExerciseGenerator';
import MindMapGenerator from './MindMapGenerator';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'generation' | 'qa' | 'summary';
}

interface AIToolPanelProps {
  selectedDocument?: {
    _id: string;
    title: string;
    content?: string;
    processingStatus?: string;
  };
}

const AIToolPanel: React.FC<AIToolPanelProps> = ({ selectedDocument }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI工具列表
  const aiTools: AITool[] = [
    {
      id: 'summarize',
      name: '文档摘要',
      description: '生成文档的核心要点摘要',
      icon: <FileTextOutlined />,
      category: 'summary'
    },
    {
      id: 'qa',
      name: '智能问答',
      description: '基于文档内容回答问题',
      icon: <QuestionCircleOutlined />,
      category: 'qa'
    },
    {
      id: 'insights',
      name: '深度分析',
      description: '提供深入的内容分析和见解',
      icon: <BulbOutlined />,
      category: 'analysis'
    },
    {
      id: 'generate',
      name: '内容生成',
      description: '基于文档生成相关内容',
      icon: <ThunderboltOutlined />,
      category: 'generation'
    }
  ];

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 生成模拟响应
  const generateMockResponse = (input: string, toolId: string | null): string => {
    const responses = {
      summarize: `基于文档《${selectedDocument?.title}》的摘要：\n\n这是一份关于${selectedDocument?.title}的重要文档。主要内容包括：\n\n1. 核心概念和定义\n2. 关键技术要点\n3. 实际应用场景\n4. 未来发展趋势\n\n该文档为相关领域的学习和研究提供了宝贵的参考资料。`,
      qa: `关于您的问题"${input}"，我正在基于文档《${selectedDocument?.title}》为您分析。这是一个很有意思的问题，让我为您详细解答...\n\n根据文档内容，我建议从以下几个角度来理解这个问题：\n\n1. 首先需要明确相关的基本概念\n2. 然后分析具体的应用场景\n3. 最后考虑实际的实施方案\n\n希望这个回答对您有帮助！`,
      insights: `基于文档《${selectedDocument?.title}》的深度分析：\n\n通过对文档内容的深入研究，我发现了以下几个关键洞察：\n\n1. 核心价值主张\n2. 技术创新点\n3. 市场应用前景\n4. 潜在挑战和机遇\n\n这些分析可以为您的决策提供重要参考。`,
      generate: `基于文档《${selectedDocument?.title}》生成的相关内容：\n\n根据您的需求，我为您生成了以下内容：\n\n1. 扩展阅读建议\n2. 相关案例分析\n3. 实践应用指南\n4. 进一步研究方向\n\n希望这些内容对您有所帮助！`
    };
    
    return responses[toolId as keyof typeof responses] || responses.qa;
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!selectedDocument) {
      message.warning('请先选择一个文档');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI响应
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(inputValue, selectedTool),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      message.error('AI响应失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 使用AI工具
  const handleToolClick = (tool: AITool) => {
    if (!selectedDocument) {
      message.warning('请先选择一个文档');
      return;
    }
    
    setSelectedTool(tool.id);
    setInputValue(`使用${tool.name}分析当前文档`);
  };

  // 复制消息
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    setSelectedTool(null);
  };

  // 消息操作菜单
  const getMessageMenu = (message: Message) => (
    <Menu>
      <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleCopyMessage(message.content)}>
        复制
      </Menu.Item>
      <Menu.Item key="regenerate" icon={<ReloadOutlined />}>
        重新生成
      </Menu.Item>
    </Menu>
  );

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