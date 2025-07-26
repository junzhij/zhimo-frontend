import { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  FileTextOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import type { MenuProps } from 'antd';
import DocumentManager from '../components/DocumentManager';
import DocumentViewer from '../components/DocumentViewer';
import AIToolPanel from '../components/AIToolPanel';
import type { Document } from '../api/documents';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;



interface MainLayoutProps {
  children?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  showLeftPanel?: boolean;
  showRightPanel?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  leftPanel,
  rightPanel,
  showLeftPanel = true,
  showRightPanel = true
}) => {
  const { user, logout } = useAuthStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();
  const [documentLoading, setDocumentLoading] = useState(false);

  // 响应式检测
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftCollapsed(true);
        setRightCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // 处理文档选择
  const handleDocumentSelect = (document: Document) => {
    setDocumentLoading(true);
    setSelectedDocument(document);
    // 立即设置文档，让DocumentViewer开始加载
    setDocumentLoading(false);
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header 
        style={{ 
          backgroundColor: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        {/* 左侧：系统标题和折叠按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {showLeftPanel && (
            <Button
              type="text"
              icon={leftCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              style={{ fontSize: '16px' }}
            />
          )}
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            智墨学习平台
          </Title>
        </div>

        {/* 右侧：用户信息和操作 */}
        <Space>
          {!isMobile && (
            <Text type="secondary">
              欢迎，{user?.profile?.displayName || user?.username}
            </Text>
          )}
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ height: '40px', padding: '0 8px' }}>
              <Space>
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  {user?.profile?.displayName?.[0] || user?.username?.[0]}
                </Avatar>
                {!isMobile && (
                  <span>{user?.profile?.displayName || user?.username}</span>
                )}
              </Space>
            </Button>
          </Dropdown>

          {showRightPanel && (
            <Button
              type="text"
              icon={rightCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setRightCollapsed(!rightCollapsed)}
              style={{ fontSize: '16px' }}
            />
          )}
        </Space>
      </Header>

      <Layout>
        {/* 左栏：文档管理区域 */}
        {showLeftPanel && (
          <Sider
            width={320}
            collapsedWidth={isMobile ? 0 : 80}
            collapsed={leftCollapsed}
            style={{
              backgroundColor: '#fff',
              borderRight: '1px solid #f0f0f0',
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
            }}
            breakpoint="lg"
            onBreakpoint={(broken) => {
              if (broken && !isMobile) {
                setLeftCollapsed(true);
              }
            }}
          >
            <div style={{ padding: leftCollapsed ? '8px' : '16px', height: '100%' }}>
              {leftCollapsed ? (
                <div style={{ textAlign: 'center' }}>
                  <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                </div>
              ) : (
                leftPanel || (
                  <DocumentManager 
                    onDocumentSelect={handleDocumentSelect}
                    selectedDocumentId={selectedDocument?._id}
                  />
                )
              )}
            </div>
          </Sider>
        )}

        {/* 中栏：文档内容展示区域 */}
        <Content
          style={{
            backgroundColor: '#fff',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <div style={{ 
            padding: isMobile ? '16px' : '24px', 
            height: '100%',
            minHeight: 'calc(100vh - 64px)'
          }}>
            {children || (
              <DocumentViewer 
                document={selectedDocument}
                loading={documentLoading}
              />
            )}
          </div>
        </Content>

        {/* 右栏：AI工具区域 */}
        {showRightPanel && (
          <Sider
            width={320}
            collapsedWidth={isMobile ? 0 : 80}
            collapsed={rightCollapsed}
            style={{
              backgroundColor: '#fff',
              borderLeft: '1px solid #f0f0f0',
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
            }}
            breakpoint="lg"
            onBreakpoint={(broken) => {
              if (broken && !isMobile) {
                setRightCollapsed(true);
              }
            }}
          >
            <div style={{ padding: rightCollapsed ? '8px' : '16px', height: '100%' }}>
              {rightCollapsed ? (
                <div style={{ textAlign: 'center' }}>
                  <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                </div>
              ) : (
                rightPanel || (
                  <AIToolPanel selectedDocument={selectedDocument} />
                )
              )}
            </div>
          </Sider>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout;