# ThoMo学习平台交互逻辑
请注意！！！所有API均为已经确定，切勿新增任何API接口与用法！！！
## 概述

本文档描述了ThoMo学习平台的完整用户交互流程，包括用户认证、文档管理、AI功能使用等核心功能的交互逻辑。

## 1. 用户认证流程

### 1.1 用户注册流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务器
    participant D as 数据库

    U->>F: 填写注册信息
    F->>F: 前端验证(邮箱格式、密码强度)
    F->>A: POST /api/auth/register
    A->>A: 密码加密
    A->>D: 保存用户信息
    A->>A: 生成JWT Token
    A->>F: 返回用户信息和Token
    F->>F: 存储Token到localStorage
    F->>U: 显示注册成功，自动登录
```

**交互要点:**
- 邮箱格式验证
- 密码强度要求(至少8位，包含字母数字特殊字符)
- 注册成功后自动登录

### 1.2 用户登录流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务器
    participant D as 数据库

    U->>F: 输入用户名/密码
    F->>A: POST /api/auth/login
    A->>D: 验证用户凭据
    A->>A: 生成JWT Token
    A->>F: 返回Token和用户信息
    F->>F: 存储Token
    F->>U: 跳转到主页面
```

**交互要点:**
- 支持用户名或邮箱登录
- Token有效期7天
## 2. 主界面交互流程：三栏式布局

系统核心界面采用三栏式布局，将文档管理、内容阅读和AI工具集于一体，提供无缝的单页应用体验。

```mermaid
graph TD
    subgraph "用户界面 (三栏式布局)"
        direction LR
        
        subgraph "左栏：文档管理"
            A["<b>文档上传</b><br/>(POST /documents/upload)"]
            B["<b>文档列表</b><br/>(GET /documents)"]
            A --> B
            B -- 点击文档 --> C
        end
        
        subgraph "中栏：文档内容展示"
            C["<b>显示文档详情</b>"]
            C --> D["重构后文档<br/>(GET /documents/:id/ai/restructure)"]
            C --> E["摘要<br/>(GET /documents/:id/ai/summary)"]
            C --> F["概念<br/>(GET /documents/:id/ai/concepts)"]
        end
        
        subgraph "右栏：AI工具"
            G["<b>练习题</b>"]
            G --> H["生成练习题<br/>(POST /documents/:id/ai/exercises)"]
            G --> I["查询练习题<br/>(GET /documents/exercises)"]
            
            J["<b>思维导图</b>"]
            J --> K["生成思维导图<br/>(POST /documents/:id/ai/mindmap)"]
            K --> L["存入浏览器Local Storage"]
        end
    end
```

### 2.1 左栏：文档管理交互

此区域是所有操作的起点，负责文档的输入和选择。

#### 2.1.1 文档上传流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端 (左栏)
    participant A as API服务器

    U->>F: 点击上传按钮或拖拽文件
    F->>F: 前端验证(文件格式、大小)
    F->>A: 发起上传请求 (POST /documents/upload)
    A-->>F: 返回文档信息和pending状态
    F->>U: 列表出现新文档，显示“处理中”
```

**交互要点:**
-   支持拖拽上传和点击选择文件。
-   前端进行文件格式和大小（最大50MB）的预验证。
-   上传后，文档列表立即出现新条目，并有明确的“处理中”状态指示，用户无需等待即可进行其他操作。

#### 2.1.2 文档列表交互

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端 (左栏)
    participant A as API服务器

    U->>F: 访问或刷新页面
    F->>A: 请求文档列表 (GET /documents)
    A-->>F: 返回用户文档列表
    F->>U: 显示文档列表
    
    U->>F: 点击某个文档
    F->>F: 触发中栏和右栏加载该文档数据
```

**交互要点:**
-   默认加载用户的所有文档。
-   支持基于标题的搜索和筛选功能（前端实现）。
-   点击文档列表中的条目是驱动整个应用交互的核心操作，会更新中栏和右栏的内容。

### 2.2 中栏：文档内容展示交互

用户在左栏选择文档后，此区域将展示该文档的核心内容。

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端 (中栏)
    participant A as API服务器

    Note over F: 由左栏点击事件触发
    F->>A: 并发请求文档内容
    A-->>F: 1. 重构内容 (GET /documents/:id/ai/restructure)
    A-->>F: 2. 摘要 (GET /documents/:id/ai/summary)
    A-->>F: 3. 概念 (GET /documents/:id/ai/concepts)
    
    F->>F: 渲染返回的内容
    F->>U: 显示重构文档、摘要和概念
```

**交互要点:**
-   **内容聚合**: 将文档的多种AI处理结果（重构、摘要、概念）聚合在标签页或可折叠的面板中，方便用户切换查看。
-   **加载状态**: 在从API获取数据时，显示清晰的加载指示器。
-   **空状态处理**: 如果某项内容（如摘要）尚未生成或生成失败，会显示友好的提示信息。

### 2.3 右栏：AI工具交互

此区域提供与当前文档相关的互动式AI工具。

#### 2.3.1 练习题交互

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端 (右栏)
    participant A as API服务器

    U->>F: 点击“生成练习题”
    F->>F: 显示题目数量、类型等配置项
    U->>F: 确认配置
    F->>A: 请求生成练习题 (POST /documents/:id/ai/exercises)
    A-->>F: 返回生成的练习题数据
    F->>LS: 将题目数据存入Local Storage
    F->>U: 显示题目，开始答题

    Note over F,LS: 再次查看时，优先从Local Storage加载，无需API请求
```

**交互要点:**
-   **按需生成**: 用户可以根据需要为当前文档动态生成练习题。

#### 2.3.2 思维导图交互

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端 (右栏)
    participant A as API服务器
    participant LS as 浏览器Local Storage

    U->>F: 点击“生成思维导图”
    F->>A: 请求生成思维导图 (POST /documents/:id/ai/mindmap)
    A-->>F: 返回Mermaid格式的思维导图数据
    F->>LS: 将导图数据存入Local Storage
    F->>F: 渲染Mermaid图表
    F->>U: 显示可交互的思维导图

    Note over F,LS: 再次查看时，优先从Local Storage加载，无需API请求
```

**交互要点:**
-   **生成与存储分离**: AI服务负责生成思维导图的结构化数据。
-   **本地持久化**: 生成的导图数据存储在用户浏览器的`Local Storage`中，这意味着用户下次查看同一文档的思维导图时，可以即时加载，无需重新生成或调用API。
-   **无查询API**: 该功能设计上不提供查询历史思维导图的API，所有数据均由客户端管理。

## 3. 批量操作流程

## 5. 用户体验优化

### 4.1 响应式设计
- 移动端适配
- 触摸手势支持
- 响应式布局

### 4.2 性能优化
- 文档列表虚拟滚动
- 图片懒加载
- API请求缓存
- 离线功能支持

### 4.3 用户反馈
- 操作成功/失败提示
- 加载状态指示器
- 错误信息友好显示
- 操作确认对话框

### 4.4 快捷操作
- 键盘快捷键支持
- 右键菜单
- 拖拽操作
- 批量选择

## 6. 错误处理和异常情况

### 6.1 网络异常
- 自动重试机制
- 离线状态检测
- 数据同步恢复

### 6.2 文件处理异常
- 文件格式不支持提示
- 文件过大警告
- 处理失败重试选项

### 6.3 AI服务异常
- AI服务不可用提示
- 处理超时处理
- 降级功能提供

### 6.4 权限异常
- Token过期自动刷新
- 权限不足友好提示
- 登录状态检查

## 7. 数据安全和隐私

### 7.1 数据加密
- 传输数据HTTPS加密
- 敏感数据存储加密
- Token安全管理

### 7.2 访问控制
- 用户数据隔离
- 操作权限验证
- 审计日志记录

### 7.3 隐私保护
- 数据最小化原则
- 用户数据删除权
- 隐私设置选项

## 8. 总结

ThoMo学习平台的用户交互逻辑设计注重用户体验的流畅性和功能的实用性，通过清晰的交互流程、友好的界面设计和智能的AI功能，为用户提供高效的学习文档管理和智能分析服务。

整个系统采用前后端分离架构，通过RESTful API和WebSocket实现实时交互，确保用户操作的响应性和数据的一致性。

# 知墨学习平台 API 文档

## 概述

知墨（ZhiMo）学习平台提供完整的RESTful API，支持文档管理、AI处理、用户认证等核心功能。本文档详细描述了所有可用的API端点、请求/响应格式以及使用示例。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`
- **字符编码**: UTF-8

## 认证

### 获取访问令牌

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "user@example.com",
      "profile": {
        "displayName": "测试用户"
      }
    }
  }
}
```

### 使用令牌

所有需要认证的API请求都需要在请求头中包含JWT令牌：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 文档管理 API

### 1. 上传文档

**端点**: `POST /documents/upload`  
**认证**: 必需  
**内容类型**: `multipart/form-data`

**请求参数**:
- `document` (file, 必需): 要上传的文档文件
- `title` (string, 可选): 文档标题
- `tags` (string, 可选): 标签，用逗号分隔

**支持的文件格式**:
- PDF: `.pdf`
- Word: `.doc`, `.docx`
- PowerPoint: `.ppt`, `.pptx`
- 图片: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`

**文件限制**:
- 最大文件大小: 50MB
- 单次上传文件数: 1个

**请求示例**:
```bash
curl -X POST "http://localhost:3000/api/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@example.pdf" \
  -F "title=示例文档" \
  -F "tags=学习,AI"
```

**响应示例**:
```json
{
  "success": true,
  "message": "文档上传成功，正在处理中",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "示例文档",
      "originalFormat": "pdf",
      "processingStatus": "pending",
      "metadata": {
        "originalFileName": "example.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      },
      "tags": ["学习", "AI"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "processingStatus": "pending"
  }
}
```

### 2. 获取文档列表

**端点**: `GET /documents`  
**认证**: 必需


**请求示例**:
```bash
curl -X GET "http://localhost:3000/api/documents" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
    "success": true,
    "data": [
        {
            "_id": "6884f8b1068093f168b216da",
            "title": "api-curl-examples",
            "createdAt": "2025-07-26T15:48:01.239Z"
        },
        {
            "_id": "6884f88f068093f168b216ce",
            "title": "api-curl-examples",
            "createdAt": "2025-07-26T15:47:27.459Z"
        }
    ]
}
```

### 3. 获取文档详情

**端点**: `GET /documents/:documentId`  
**认证**: 必需

**请求示例**:
```bash
curl -X GET "http://localhost:3000/api/documents/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "示例文档",
    "originalFormat": "pdf",
    "processingStatus": "completed",
    "markdownContent": "# 文档标题\n\n这是文档内容...",
    "restructuredContent": "# 重构后的内容\n\n经过AI优化的内容...",
    "metadata": {
      "originalFileName": "example.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "wordCount": 1500,
      "pageCount": 10
    },
    "tags": ["学习", "AI"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z"
  }
}
```

### 4. 获取文档Markdown内容

**端点**: `GET /documents/:documentId/markdown`  
**认证**: 必需

**响应示例**:
```json
{
  "success": true,
  "data": {
    "markdownContent": "# 文档标题\n\n这是转换后的Markdown内容...",
    "wordCount": 1500,
    "processingStatus": "completed"
  }
}
```

### 5. 下载文档

**端点**: `GET /documents/:documentId/download`  
**认证**: 必需

**响应**: 文件流，包含适当的Content-Type和Content-Disposition头

### 6. 删除文档

**端点**: `DELETE /documents/:documentId`  
**认证**: 必需

**响应示例**:
```json
{
  "success": true,
  "message": "文档删除成功"
}
```

### 7. 重新处理文档

**端点**: `POST /documents/:documentId/reprocess`  
**认证**: 必需

**响应示例**:
```json
{
  "success": true,
  "message": "文档重新处理成功",
  "data": {
    "processingStatus": "processing"
  }
}
```

### 8. 添加URL文档

**端点**: `POST /documents/url`  
**认证**: 必需

**请求体**:
```json
{
  "url": "https://example.com/article",
  "title": "网页文章标题",
  "tags": "网页,文章"
}
```

### 9. 获取文档统计

**端点**: `GET /documents/stats`  
**认证**: 必需

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "formatStats": {
      "pdf": 15,
      "docx": 8,
      "image": 2
    },
    "statusStats": {
      "completed": 20,
      "processing": 3,
      "failed": 2
    },
    "totalSize": 52428800,
    "readableTotalSize": "50.00 MB"
  }
}
```

## AI功能 API

### 1. 获取AI重构内容

**端点**: `GET /documents/:documentId/ai/restructure`  
**认证**: 必需

**响应示例**:
```json
{
  "success": true,
  "data": {
    "originalContent": "原始Markdown内容...",
    "restructuredContent": "# 重构后的内容\n\n经过AI优化和重新组织的内容...",
    "processingStatus": "completed"
  }
}
```

### 2. 获取文档摘要

**端点**: `GET /documents/:documentId/ai/summary`  
**认证**: 必需

**查询参数**:
- `type` (string, 可选): 摘要类型 (`oneline`, `detailed`, `keypoints`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "summaries": [
      {
        "id": "507f1f77bcf86cd799439012",
        "type": "detailed",
        "content": "这是一份详细的文档摘要，包含了文档的主要观点和核心内容...",
        "wordCount": 200,
        "generatedAt": "2024-01-01T00:10:00.000Z",
        "aiModel": "gpt-3.5-turbo"
      }
    ]
  }
}
```

### 3. 获取提取的概念

**端点**: `GET /documents/:documentId/ai/concepts`  
**认证**: 必需

**查询参数**:
- `category` (string, 可选): 概念类别 (`person`, `place`, `concept`, `term`, `formula`, `theory`)
- `importance` (number, 可选): 最低重要性等级 (1-5)
- `limit` (number, 可选): 返回数量限制

**响应示例**:
```json
{
  "success": true,
  "data": {
    "concepts": [
      {
        "id": "507f1f77bcf86cd799439013",
        "term": "机器学习",
        "definition": "一种人工智能的分支，通过算法让计算机从数据中学习...",
        "category": "concept",
        "importance": 5,
        "occurrenceCount": 8,
        "extractionConfidence": 0.95,
        "createdAt": "2024-01-01T00:15:00.000Z"
      }
    ],
    "total": 25
  }
}
```

### 4. 生成练习题

**端点**: `POST /documents/:documentId/ai/exercises`  
**认证**: 必需

**请求体**:
```json
{
  "count": 10,
  "types": ["multiple_choice", "true_false", "short_answer"],
  "difficulty": "medium",
  "language": "zh"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "什么是机器学习？",
        "options": [
          "一种编程语言",
          "一种人工智能技术",
          "一种数据库",
          "一种操作系统"
        ],
        "correctAnswer": "一种人工智能技术",
        "explanation": "机器学习是人工智能的一个分支...",
        "difficulty": 3,
        "points": 10
      }
    ],
    "saved": true,
    "databaseId": "507f1f77bcf86cd799439014",
    "options": {
      "count": 10,
      "types": ["multiple_choice", "true_false", "short_answer"],
      "difficulty": "medium",
      "language": "zh"
    }
  }
}
```

### 5. 生成思维导图

**端点**: `POST /documents/:documentId/ai/mindmap`  
**认证**: 必需

**请求体**:
```json
{
  "maxNodes": 20,
  "language": "zh",
  "style": "mindmap"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "title": "文档思维导图",
    "mermaid": "mindmap\n  root((机器学习))\n    监督学习\n      分类\n      回归\n    无监督学习\n      聚类\n      降维",
    "saved": true,
    "databaseId": "507f1f77bcf86cd799439015",
    "isValidSyntax": true,
    "options": {
      "maxNodes": 20,
      "language": "zh",
      "style": "mindmap"
    }
  }
}
```

### 6. 批量AI处理

**端点**: `POST /documents/:documentId/ai/process`  
**认证**: 必需

**请求体**:
```json
{
  "generateSummary": true,
  "extractConcepts": true,
  "generateExercises": false,
  "generateMindMap": true,
  "summaryTypes": ["oneline", "detailed"],
  "exerciseCount": 5
}
```



## 错误处理

### 错误响应格式

所有错误响应都遵循统一格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

### 常见错误码

| HTTP状态码 | 错误类型 | 描述 |
|-----------|---------|------|
| 400 | Bad Request | 请求参数错误或验证失败 |
| 401 | Unauthorized | 未提供认证令牌或令牌无效 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 413 | Payload Too Large | 文件大小超过限制 |
| 429 | Too Many Requests | 请求频率超过限制 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | AI服务不可用 |
| 503 | Service Unavailable | 服务暂时不可用 |

### 文件上传错误

```json
{
  "success": false,
  "message": "文件大小超过限制 (50MB)"
}
```

```json
{
  "success": false,
  "message": "不支持的文件类型: image/svg+xml"
}
```

### AI处理错误

```json
{
  "success": false,
  "message": "文档摘要尚未生成"
}
```

```json
{
  "success": false,
  "message": "文档尚未处理完成，无法生成练习题"
}
```

## 请求限制

### 文件上传限制
- 最大文件大小: 50MB
- 支持的文件类型: PDF, Word, PowerPoint, 图片
- 单次上传文件数: 1个

### API请求频率限制
- 一般API: 100请求/分钟
- 文件上传: 10请求/分钟
- AI处理: 20请求/分钟

