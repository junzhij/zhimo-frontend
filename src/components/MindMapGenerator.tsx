import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Form,
  InputNumber,
  Select,
  Typography,
  Space,
  Divider,
  message,
  Spin,
  Modal,
  Tooltip,
  Alert
} from 'antd';
import {
  NodeIndexOutlined,
  SettingOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import mermaid from 'mermaid';
import { aiAPI, type MindMapConfig } from '../api/ai';

const { Title, Text } = Typography;
const { Option } = Select;

interface MindMapData {
  title: string;
  mermaid: string;
  saved: boolean;
  databaseId?: string;
  isValidSyntax: boolean;
  options: MindMapConfig;
  generatedAt: string;
}

interface MindMapGeneratorProps {
  selectedDocument?: {
    _id: string;
    title: string;
    processingStatus?: string;
  };
}

const MindMapGenerator: React.FC<MindMapGeneratorProps> = ({ selectedDocument }) => {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [form] = Form.useForm();
  const mindMapRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // 默认配置
  const defaultConfig: MindMapConfig = {
    maxNodes: 15,
    language: 'zh',
    style: 'mindmap'
  };

  // 初始化Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
  }, []);

  // 从localStorage加载思维导图
  useEffect(() => {
    if (selectedDocument) {
      const storageKey = `mindmap_${selectedDocument._id}`;
      const savedMindMap = localStorage.getItem(storageKey);
      if (savedMindMap) {
        try {
          const parsed = JSON.parse(savedMindMap);
          setMindMapData(parsed);
        } catch (error) {
          console.error('Failed to parse saved mindmap:', error);
        }
      } else {
        setMindMapData(null);
      }
    }
  }, [selectedDocument]);

  // 渲染思维导图
  const renderMindMap = async (mermaidCode: string, container: HTMLDivElement) => {
    try {
      container.innerHTML = '';
      const { svg } = await mermaid.render('mindmap-' + Date.now(), mermaidCode);
      container.innerHTML = svg;
      return true;
    } catch (error) {
      console.error('Mermaid render error:', error);
      container.innerHTML = '<div style="color: #ff4d4f; text-align: center; padding: 20px;">思维导图渲染失败</div>';
      return false;
    }
  };

  // 当思维导图数据更新时重新渲染
  useEffect(() => {
    if (mindMapData && mindMapRef.current) {
      renderMindMap(mindMapData.mermaid, mindMapRef.current);
    }
  }, [mindMapData]);



  // 生成思维导图
  const handleGenerateMindMap = async (config: MindMapConfig) => {
    if (!selectedDocument) {
      message.warning('请先选择一个文档');
      return;
    }

    if (selectedDocument.processingStatus && selectedDocument.processingStatus !== 'completed') {
      message.warning('文档尚未处理完成，无法生成思维导图');
      return;
    }

    setIsGenerating(true);
    setConfigVisible(false);

    try {
      // 调用真实API生成思维导图
      const response = await aiAPI.generateMindMap(selectedDocument._id, config);
      
      const newMindMapData: MindMapData = {
        title: response.data.title,
        mermaid: response.data.mermaid,
        saved: response.data.saved,
        databaseId: response.data.databaseId,
        isValidSyntax: response.data.isValidSyntax,
        options: response.data.options,
        generatedAt: new Date().toISOString()
      };
      
      setMindMapData(newMindMapData);
      
      // 保存到localStorage
      const storageKey = `mindmap_${selectedDocument._id}`;
      localStorage.setItem(storageKey, JSON.stringify(newMindMapData));
      
      message.success('思维导图生成成功');
    } catch (error) {
      message.error('生成思维导图失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载思维导图
  const handleDownload = () => {
    if (!mindMapData) return;
    
    const element = document.createElement('a');
    const file = new Blob([mindMapData.mermaid], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDocument?.title || 'mindmap'}_mindmap.mmd`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    message.success('思维导图已下载');
  };

  // 保存到本地存储
  const handleSaveToLocal = () => {
    if (!mindMapData || !selectedDocument) return;
    
    const storageKey = `mindmap_${selectedDocument._id}`;
    localStorage.setItem(storageKey, JSON.stringify(mindMapData));
    message.success('已保存到本地存储');
  };

  // 配置表单提交
  const handleConfigSubmit = (values: MindMapConfig) => {
    handleGenerateMindMap(values);
  };

  // 全屏显示
  const handleFullscreen = () => {
    setFullscreenVisible(true);
    // 延迟渲染以确保DOM已更新
    setTimeout(() => {
      if (mindMapData && fullscreenRef.current) {
        renderMindMap(mindMapData.mermaid, fullscreenRef.current);
      }
    }, 100);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题和操作栏 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Title level={4} style={{ margin: 0 }}>
            思维导图
          </Title>
          <Space>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setConfigVisible(true)}
              disabled={isGenerating}
            >
              配置
            </Button>
            <Button 
              type="primary" 
              icon={<NodeIndexOutlined />}
              onClick={() => handleGenerateMindMap(defaultConfig)}
              loading={isGenerating}
              disabled={!selectedDocument}
            >
              生成导图
            </Button>
          </Space>
        </div>
        
        {selectedDocument && (
          <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>当前文档：</Text>
            <Text style={{ fontSize: '13px', marginLeft: '4px' }}>
              <strong>{selectedDocument.title}</strong>
            </Text>
          </Card>
        )}
      </div>

      <Divider style={{ margin: '0 0 16px 0' }} />

      {/* 主要内容区域 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isGenerating && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>正在生成思维导图...</Text>
            </div>
          </div>
        )}

        {!isGenerating && !mindMapData && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <NodeIndexOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">点击"生成导图"创建思维导图</Text>
            </div>
          </div>
        )}

        {!isGenerating && mindMapData && (
          <div>
            {/* 操作工具栏 */}
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Space>
                <Tooltip title="全屏查看">
                  <Button 
                    icon={<FullscreenOutlined />} 
                    onClick={handleFullscreen}
                  />
                </Tooltip>
                <Tooltip title="保存到本地">
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveToLocal}
                  />
                </Tooltip>
                <Tooltip title="下载Mermaid文件">
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownload}
                  />
                </Tooltip>
                <Tooltip title="重新生成">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => handleGenerateMindMap(mindMapData.options)}
                  />
                </Tooltip>
              </Space>
            </div>

            {/* 思维导图信息 */}
            <Alert
              message={mindMapData.title}
              description={`生成时间: ${new Date(mindMapData.generatedAt).toLocaleString()} | 节点数: ${mindMapData.options.maxNodes} | 样式: ${mindMapData.options.style}`}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            {/* 思维导图渲染区域 */}
            <Card 
              style={{ 
                minHeight: '400px',
                textAlign: 'center'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div 
                ref={mindMapRef}
                style={{ 
                  width: '100%',
                  minHeight: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Card>

            {/* Mermaid代码显示 */}
            <Card 
              title="Mermaid 代码" 
              size="small" 
              style={{ marginTop: '16px' }}
              extra={
                <Button 
                  size="small" 
                  onClick={() => {
                    navigator.clipboard.writeText(mindMapData.mermaid);
                    message.success('代码已复制到剪贴板');
                  }}
                >
                  复制代码
                </Button>
              }
            >
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {mindMapData.mermaid}
              </pre>
            </Card>
          </div>
        )}
      </div>

      {/* 配置弹窗 */}
      <Modal
        title="思维导图配置"
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultConfig}
          onFinish={handleConfigSubmit}
        >
          <Form.Item
            label="最大节点数"
            name="maxNodes"
            rules={[{ required: true, message: '请输入最大节点数' }]}
          >
            <InputNumber min={5} max={50} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="语言"
            name="language"
            rules={[{ required: true, message: '请选择语言' }]}
          >
            <Select>
              <Option value="zh">中文</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="图表样式"
            name="style"
            rules={[{ required: true, message: '请选择图表样式' }]}
          >
            <Select>
              <Option value="mindmap">思维导图</Option>
              <Option value="flowchart">流程图</Option>
              <Option value="graph">关系图</Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setConfigVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={isGenerating}>
                生成导图
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 全屏显示弹窗 */}
      <Modal
        title={mindMapData?.title}
        open={fullscreenVisible}
        onCancel={() => setFullscreenVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: '70vh', overflow: 'auto' }}
      >
        <div 
          ref={fullscreenRef}
          style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Modal>
    </div>
  );
};

export default MindMapGenerator;