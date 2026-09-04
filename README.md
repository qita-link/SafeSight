# 安盾云检 SafeSight AI

面向中小企业、个人站长和团队的防御型网站安全检测与持续治理平台。平台只对用户主动提交且获得授权的网站执行只读 HTTP 检查，不提供攻击、利用或恶意扫描能力。

## 功能概览

- **逐项安全检测**：按检测阶段逐步展示 HTTPS、响应头、Cookie 和安全策略结果。
- **风险摘要与报告**：区分高、中、低风险，提供影响说明和整改建议。
- **AI 检测报告**：通过 DeepSeek 生成中文安全分析、整改优先级和复测建议。
- **每日安全巡检**：登录用户可添加站点并保存每日扫描计划。
- **个人安全后台**：查看扫描历史、平均评分、风险信号、邮箱验证状态和巡检任务。
- **管理员后台**：分页面管理平台策略、用户邮箱验证、定时任务和当天扫描记录。
- **邮箱注册验证**：支持验证码注册，并预留 SMTP 邮件发送配置。
- **安全限制**：拒绝内网、回环、链路本地、保留地址和非 HTTP(S) 协议。

## 页面入口

| 页面 | 地址 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 产品介绍、注册和免费检测入口 |
| 登录 | `/login` | 用户和管理员登录 |
| 注册 | `/register` | 邮箱验证码注册 |
| 安全检测 | `/dashboard` | 逐项检测和报告查看 |
| 个人后台 | `/account` | 扫描历史、指标和每日巡检 |
| 管理总览 | `/admin` | 管理员统计和系统状态 |
| 用户管理 | `/admin/users` | 查看用户并修改邮箱验证状态 |
| 平台设置 | `/admin/settings` | 注册、邮箱验证和访客扫描开关 |
| 扫描任务 | `/admin/tasks` | 定时任务和当天扫描记录 |
| 解决方案 | `/solutions` | 项目能力和安全治理流程 |

## 技术栈

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide
- Backend: FastAPI, Python 3.11+, SQLAlchemy
- Database: PostgreSQL 16
- Cache / worker: Redis 7，Celery/RQ 可扩展
- Auth: JWT Bearer Token
- AI: DeepSeek OpenAI-compatible API
- Infra: Docker Compose

## 目录结构

```text
safe-website/
├── frontend/                 # Next.js 前端
│   ├── app/                  # 页面和路由
│   └── lib/                  # API 客户端和演示类型
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/           # 认证、扫描、管理员接口
│   │   ├── core/             # JWT 和安全工具
│   │   ├── db.py             # SQLAlchemy 模型和数据库会话
│   │   └── main.py           # 应用入口
│   ├── tests/                # 后端测试
│   └── requirements.txt
├── docs/                     # 架构和阶段文档
├── docker-compose.yml
├── .env.example
└── README.md
```

## 快速启动

### 环境要求

- Docker 24+
- Docker Compose v2
- Windows、macOS 或 Linux

### 启动服务

1. 复制环境变量模板。

   Linux/macOS：

   ```bash
   cp .env.example .env
   ```

   Windows PowerShell：

   ```powershell
   Copy-Item .env.example .env
   ```

2. 修改 `.env` 中的管理员密码、JWT 密钥和其他服务配置。
3. 构建并启动：

   ```bash
   docker compose up -d --build
   ```

服务地址：

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

首次启动时会自动创建数据库表和环境变量指定的管理员账号。

默认管理员配置：

```env
ADMIN_EMAIL=admin@safesight.ai
ADMIN_USERNAME=system-admin
ADMIN_PASSWORD=change-this-admin-password
```

请在正式部署前修改 `ADMIN_PASSWORD` 和 `SECRET_KEY`。

常用服务命令：

```bash
docker compose ps
docker compose logs -f backend
docker compose down
```

## 环境变量

### 数据库和认证

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://postgres:postgres@postgres:5432/safesight` | PostgreSQL 连接地址 |
| `REDIS_URL` | `redis://redis:6379/0` | Redis 连接地址 |
| `SECRET_KEY` | `change-me-in-production` | JWT 签名密钥 |
| `JWT_ALGORITHM` | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token 有效期 |
| `ADMIN_EMAIL` | `admin@safesight.ai` | 默认管理员邮箱 |
| `ADMIN_USERNAME` | `system-admin` | 默认管理员名称 |
| `ADMIN_PASSWORD` | `change-this-admin-password` | 默认管理员密码 |

### 前端和平台开关

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | 浏览器访问后端的地址 |
| `REGISTRATION_ENABLED` | `true` | 是否开放注册 |
| `EMAIL_VERIFICATION_ENABLED` | `true` | 注册是否需要验证码 |
| `GUEST_SCAN_ENABLED` | `true` | 是否允许访客使用扫描 |

### AI 和 SMTP

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 空 | AI 报告 API 密钥 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek 模型 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek API 地址 |
| `SMTP_HOST` | 空 | SMTP 服务器 |
| `SMTP_PORT` | `587` | SMTP 端口 |
| `SMTP_USER` / `SMTP_PASSWORD` | 空 | SMTP 认证信息 |
| `SMTP_FROM` | `noreply@safesight.ai` | 验证码发件人 |

未配置 SMTP 时，开发环境验证码接口会返回 `dev_code`，方便本地测试。生产环境应配置 SMTP，并避免向客户端返回验证码。

## 数据与认证

- PostgreSQL 保存用户、邮箱验证码、扫描计划、扫描事件和完整扫描结果。
- 登录后 API 请求通过 `Authorization: Bearer <token>` 认证。
- 普通用户只能访问个人数据和个人扫描计划。
- 管理员接口要求 JWT 中包含 `super_admin` 角色。
- 前端页面提供基础访问跳转，后端 API 权限校验是最终安全边界。
- 每日计划已经持久化；真正的自动执行需要部署 Celery/RQ worker。

## API 主要接口

- `POST /api/v1/auth/register`：注册
- `POST /api/v1/auth/verification-code`：发送邮箱验证码
- `POST /api/v1/auth/login`：登录
- `GET /api/v1/auth/me`：当前用户
- `POST /api/v1/scan`：执行网站安全扫描
- `GET /api/v1/scan/history`：当前用户扫描历史
- `GET /api/v1/scan/schedule`：读取每日扫描计划
- `PUT /api/v1/scan/schedule`：保存每日扫描计划
- `POST /api/v1/scan/ai-report`：生成 DeepSeek AI 报告
- `GET /api/v1/admin/overview`：管理员总览
- `GET/PUT /api/v1/admin/settings`：管理员平台开关
- `GET /api/v1/admin/users`：用户列表
- `PATCH /api/v1/admin/users/{email}/verification`：修改邮箱验证状态
- `GET /api/v1/admin/schedules`：所有定时扫描
- `GET /api/v1/admin/daily-tasks`：当天扫描记录

## 生产部署

推荐使用 Nginx 或 Caddy 作为 HTTPS 反向代理：

- 对外只开放 `80` 和 `443`。
- 前端容器内部使用 `3000`。
- 后端容器内部使用 `8000`。
- PostgreSQL 的 `5432` 和 Redis 的 `6379` 不要暴露到公网。
- 将 `NEXT_PUBLIC_API_URL` 设置为浏览器可以访问的 API 域名，例如 `https://api.example.com`。
- 生产环境关闭 `--reload`，并配置数据库备份、日志和 worker。

开发环境可以保留 Compose 中的端口映射；正式环境建议移除 PostgreSQL 和 Redis 的 `ports` 配置。

## 常见问题

### 页面提示 `Failed to fetch`

1. 确认 Docker Desktop 正在运行。
2. 执行 `docker compose ps`，确认 `backend`、`frontend`、`postgres`、`redis` 都在运行。
3. 访问 http://localhost:8000/health，确认返回 JSON 和 `200`。
4. 检查 `.env` 的 `NEXT_PUBLIC_API_URL` 是否是浏览器可访问的地址。远程服务器不能继续使用 `localhost`。
5. 修改环境变量后重新构建：

   ```bash
   docker compose up -d --build frontend backend
   ```

### 定时扫描保存失败

确认用户已登录、PostgreSQL 状态为 healthy，并检查后端日志：

```bash
docker compose logs -f backend
```

### 数据库初始化失败

确认 PostgreSQL 容器已经 healthy：

```bash
docker compose ps postgres
```

不要在没有备份的情况下删除 `pgdata` 数据卷。

## 安全说明

- 仅检测用户主动提交且获得授权的网站。
- 所有检测使用非破坏式、只读 HTTP 请求。
- 严禁扫描内网、回环地址、私有地址和云厂商 metadata 地址。
- 仅支持 `http` / `https` 协议。
- AI 只能解释已检测出的结果，不能编造漏洞。
- 本项目不得用于恶意入侵、漏洞利用或任何非法活动。

## 架构文档

完整架构设计见 [docs/architecture.md](docs/architecture.md)。

## 开源协议与关于我们

### 开源协议

> [!IMPORTANT]
> 本项目基于 [MIT License](LICENSE) 开源。您可以自由使用、修改和分发本项目，但须在软件的所有副本或重要部分中保留原始版权及许可声明。

### 关于我们

我们是热爱计算机的大学生
