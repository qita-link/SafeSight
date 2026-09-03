# 安盾云检（SafeSight / WebGuard AI）

基于 AI 的中小企业网站安全风险智能检测与辅助治理平台。

## 项目介绍

安盾云检面向中小企业、个人站长、高校社团网站、小微企业官网和电商独立站，提供安全自检、风险理解、AI 解释、整改建议、历史监控和安全报告服务。平台聚焦防御型安全检测，不做攻击工具，不进行恶意扫描，仅允许检测用户主动提交并授权的网站。

## 设计目标

- AI + 网络安全：使企业用户看懂风险、理解原因、知道怎么修复
- 低门槛 SaaS：无需专业安全团队也能做基础安全体检
- 可视化报告：将安全风险转为直观指标和清晰的治理建议
- 持续监控：监控风险变化，建立安全成长曲线
- AI 辅助治理：从风险解释、整改建议到优先级排序，提升治理效率

## 技术栈

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: FastAPI, Python 3.11+, SQLAlchemy, Alembic
- Database: PostgreSQL
- Cache / Queue: Redis, Celery / RQ
- Auth: JWT + Refresh Token
- AI: OpenAI compatible / DeepSeek / Qwen / custom provider interface
- Infra: Docker + Docker Compose

## 目录结构

```text
safe-website/
├── frontend/                 # Next.js 前端
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── backend/                  # FastAPI 后端
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
├── docs/                     # 项目文档
│   ├── architecture.md
│   ├── api.md
│   └── security.md
├── docker/                   # Docker 配置
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── scripts/                  # 辅助脚本
│   ├── init_demo.py
│   ├── seed_data.py
│   └── run_dev.sh
├── docker-compose.yml
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## 架构设计

完整架构文档见：[docs/architecture.md](docs/architecture.md)。

## 安装与启动

### 1. 环境准备

- Docker 24+
- Docker Compose v2
- Node.js 20+
- Python 3.11+

### 2. 环境变量

复制 `.env.example` 到实际配置文件；后端和前端都需要对应变量。

### 3. Docker 启动

```bash
docker compose up --build
```

访问：

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 安全说明

- 仅检测用户主动授权站点
- 严禁扫描内网、回环地址、私有地址、云厂商 metadata 地址
- 仅支持 http / https 协议，禁止 file / ftp / gopher 等协议
- 所有检测均采用非破坏式、只读的 HTTP 请求
- AI 只能解释已检测出的风险，不能编造漏洞

## Demo 模式

项目启动后自动创建：

- Demo 管理员：admin@demo.local
- Demo 用户：user@demo.local
- Demo 网站：company-demo.com, shop-demo.com, school-demo.edu

所有 Demo 数据会显式标注为“演示数据”，不得伪装真实检测结果。

## API 文档

后端采用 FastAPI 自动生成 Swagger 文档，默认地址：

http://localhost:8000/docs

## 版权与说明

本项目用于大学生创新创业展示，遵循合规的安全自检目的，禁止用于恶意入侵、漏洞利用或任何非法活动。
