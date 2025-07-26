import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Select,
  InputNumber,
  Radio,
  Checkbox,
  Typography,
  Space,
  Divider,
  message,
  Spin,
  Progress,
  Modal,
  List,
  Tag
} from 'antd';
import {
  PlayCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Exercise {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  points: number;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface ExerciseConfig {
  count: number;
  types: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'zh' | 'en';
}

interface ExerciseGeneratorProps {
  selectedDocument?: {
    _id: string;
    title: string;
    processingStatus?: string;
  };
}

const ExerciseGenerator: React.FC<ExerciseGeneratorProps> = ({ selectedDocument }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [configVisible, setConfigVisible] = useState(false);
  const [form] = Form.useForm();

  // 默认配置
  const defaultConfig: ExerciseConfig = {
    count: 5,
    types: ['multiple_choice', 'true_false'],
    difficulty: 'medium',
    language: 'zh'
  };

  // 从localStorage加载练习题
  useEffect(() => {
    if (selectedDocument) {
      const storageKey = `exercises_${selectedDocument._id}`;
      const savedExercises = localStorage.getItem(storageKey);
      if (savedExercises) {
        try {
          const parsed = JSON.parse(savedExercises);
          setExercises(parsed);
        } catch (error) {
          console.error('Failed to parse saved exercises:', error);
        }
      }
    }
  }, [selectedDocument]);

  // 生成模拟练习题数据
  const generateMockExercises = (config: ExerciseConfig): Exercise[] => {
    const mockExercises: Exercise[] = [];
    
    for (let i = 0; i < config.count; i++) {
      if (config.types.includes('multiple_choice')) {
        mockExercises.push({
          id: `q${i + 1}`,
          type: 'multiple_choice',
          question: `关于《${selectedDocument?.title}》的第${i + 1}个问题：以下哪个选项最准确地描述了文档中的核心概念？`,
          options: [
            '选项A：这是第一个可能的答案',
            '选项B：这是正确的答案选项',
            '选项C：这是第三个选项',
            '选项D：这是第四个选项'
          ],
          correctAnswer: '选项B：这是正确的答案选项',
          explanation: '根据文档内容，选项B最准确地反映了核心概念的定义和应用场景。',
          difficulty: 3,
          points: 10
        });
      }
      
      if (config.types.includes('true_false') && i % 2 === 1) {
        mockExercises.push({
          id: `q${i + 1}_tf`,
          type: 'true_false',
          question: `判断题：文档《${selectedDocument?.title}》中提到的理论在实际应用中具有重要意义。`,
          options: ['正确', '错误'],
          correctAnswer: '正确',
          explanation: '根据文档分析，该理论确实在多个实际场景中得到了成功应用。',
          difficulty: 2,
          points: 5
        });
      }
    }
    
    return mockExercises.slice(0, config.count);
  };

  // 生成练习题
  const handleGenerateExercises = async (config: ExerciseConfig) => {
    if (!selectedDocument) {
      message.warning('请先选择一个文档');
      return;
    }

    if (selectedDocument.processingStatus && selectedDocument.processingStatus !== 'completed') {
      message.warning('文档尚未处理完成，无法生成题目');
      return;
    }

    setIsGenerating(true);
    setConfigVisible(false);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成模拟数据
      const newExercises = generateMockExercises(config);
      setExercises(newExercises);
      
      // 保存到localStorage
      const storageKey = `exercises_${selectedDocument._id}`;
      localStorage.setItem(storageKey, JSON.stringify(newExercises));
      
      message.success(`成功生成${newExercises.length}道练习题`);
      setCurrentExerciseIndex(0);
      setUserAnswers({});
      setShowResults(false);
    } catch (error) {
      message.error('生成练习题失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 开始答题
  const handleStartAnswering = () => {
    setIsAnswering(true);
    setCurrentExerciseIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };

  // 提交答案
  const handleAnswerSubmit = (exerciseId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  // 下一题
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      handleFinishAnswering();
    }
  };

  // 完成答题
  const handleFinishAnswering = () => {
    let correctCount = 0;
    const updatedExercises = exercises.map(exercise => {
      const userAnswer = userAnswers[exercise.id];
      const isCorrect = userAnswer === exercise.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        ...exercise,
        userAnswer,
        isCorrect
      };
    });
    
    setExercises(updatedExercises);
    setScore(Math.round((correctCount / exercises.length) * 100));
    setShowResults(true);
    setIsAnswering(false);
  };

  // 重新开始
  const handleRestart = () => {
    setIsAnswering(false);
    setCurrentExerciseIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };

  // 配置表单提交
  const handleConfigSubmit = (values: ExerciseConfig) => {
    handleGenerateExercises(values);
  };

  const currentExercise = exercises[currentExerciseIndex];
  const progress = exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题和操作栏 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Title level={4} style={{ margin: 0 }}>
            练习题生成
          </Title>
          <Space>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setConfigVisible(true)}
              disabled={isGenerating || isAnswering}
            >
              配置
            </Button>
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleGenerateExercises(defaultConfig)}
              loading={isGenerating}
              disabled={!selectedDocument || isAnswering}
            >
              生成题目
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
              <Text>正在生成练习题...</Text>
            </div>
          </div>
        )}

        {!isGenerating && exercises.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <PlayCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">点击"生成题目"开始创建练习题</Text>
            </div>
          </div>
        )}

        {!isGenerating && exercises.length > 0 && !isAnswering && !showResults && (
          <div>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Text>已生成 {exercises.length} 道练习题</Text>
              <br />
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={handleStartAnswering}
                style={{ marginTop: '8px' }}
              >
                开始答题
              </Button>
            </div>
            
            <List
              dataSource={exercises}
              renderItem={(exercise, index) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong>题目 {index + 1}：</Text>
                        <Paragraph style={{ margin: '4px 0' }}>{exercise.question}</Paragraph>
                        <Space>
                          <Tag color={exercise.type === 'multiple_choice' ? 'blue' : 'green'}>
                            {exercise.type === 'multiple_choice' ? '选择题' : '判断题'}
                          </Tag>
                          <Tag>难度: {exercise.difficulty}/5</Tag>
                          <Tag>分值: {exercise.points}</Tag>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {isAnswering && currentExercise && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Progress percent={progress} showInfo={false} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <Text>题目 {currentExerciseIndex + 1} / {exercises.length}</Text>
                <Text>分值: {currentExercise.points} 分</Text>
              </div>
            </div>
            
            <Card>
              <Title level={5}>{currentExercise.question}</Title>
              
              {currentExercise.type === 'multiple_choice' && (
                <Radio.Group 
                  value={userAnswers[currentExercise.id]}
                  onChange={(e) => handleAnswerSubmit(currentExercise.id, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {currentExercise.options?.map((option, index) => (
                      <Radio key={index} value={option} style={{ padding: '8px 0' }}>
                        {option}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
              
              {currentExercise.type === 'true_false' && (
                <Radio.Group 
                  value={userAnswers[currentExercise.id]}
                  onChange={(e) => handleAnswerSubmit(currentExercise.id, e.target.value)}
                >
                  <Space>
                    <Radio value="正确">正确</Radio>
                    <Radio value="错误">错误</Radio>
                  </Space>
                </Radio.Group>
              )}
              
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Button 
                  type="primary"
                  onClick={handleNextExercise}
                  disabled={!userAnswers[currentExercise.id]}
                >
                  {currentExerciseIndex === exercises.length - 1 ? '完成答题' : '下一题'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {showResults && (
          <div>
            <Card style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Title level={3}>答题完成！</Title>
              <div style={{ fontSize: '48px', margin: '16px 0' }}>
                {score >= 80 ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                )}
              </div>
              <Title level={2} style={{ color: score >= 80 ? '#52c41a' : '#ff4d4f' }}>
                {score}分
              </Title>
              <Text type="secondary">
                答对 {exercises.filter(e => e.isCorrect).length} / {exercises.length} 题
              </Text>
              
              <div style={{ marginTop: '16px' }}>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={handleRestart}>
                    重新答题
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SettingOutlined />}
                    onClick={() => setConfigVisible(true)}
                  >
                    生成新题目
                  </Button>
                </Space>
              </div>
            </Card>
            
            <List
              dataSource={exercises}
              renderItem={(exercise, index) => (
                <List.Item>
                  <Card 
                    size="small" 
                    style={{ 
                      width: '100%',
                      borderColor: exercise.isCorrect ? '#52c41a' : '#ff4d4f'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      {exercise.isCorrect ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: '4px' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginTop: '4px' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <Text strong>题目 {index + 1}：</Text>
                        <Paragraph style={{ margin: '4px 0' }}>{exercise.question}</Paragraph>
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary">您的答案：</Text>
                          <Text style={{ color: exercise.isCorrect ? '#52c41a' : '#ff4d4f' }}>
                            {exercise.userAnswer || '未作答'}
                          </Text>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary">正确答案：</Text>
                          <Text style={{ color: '#52c41a' }}>{exercise.correctAnswer}</Text>
                        </div>
                        <Paragraph type="secondary" style={{ fontSize: '12px', margin: 0 }}>
                          {exercise.explanation}
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* 配置弹窗 */}
      <Modal
        title="练习题配置"
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
            label="题目数量"
            name="count"
            rules={[{ required: true, message: '请输入题目数量' }]}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="题目类型"
            name="types"
            rules={[{ required: true, message: '请选择题目类型' }]}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="multiple_choice">选择题</Checkbox>
                <Checkbox value="true_false">判断题</Checkbox>
                <Checkbox value="short_answer">简答题</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item
            label="难度等级"
            name="difficulty"
            rules={[{ required: true, message: '请选择难度等级' }]}
          >
            <Select>
              <Option value="easy">简单</Option>
              <Option value="medium">中等</Option>
              <Option value="hard">困难</Option>
            </Select>
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
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setConfigVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={isGenerating}>
                生成题目
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExerciseGenerator;