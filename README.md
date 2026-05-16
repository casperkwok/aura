# Aura

私人 AI 领域情报中心。从信息搬运到连续洞察。

## 是什么

Aura 采集多维度 AI 信号（技术论文、产品发布、投资动态、招聘趋势、行业观点），通过 DeepSeek 翻译摘要后做每周趋势分析 — 判断趋势在加速还是消退，哪些维度在交叉印证。

## 快速开始

```bash
# 1. 配置
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY

# 2. 启动后端（Go）
go run cmd/server/main.go
# → API 运行在 :8081

# 3. 启动前端（Remix 3）
cd web && bun install && bun run dev
# → 前端运行在 :44100
```

## 架构

```
信号层 ──→ 知识层 ──→ 洞察层
   │           │           │
RSS/API    条目入库    每周趋势分析
采集翻译    Timeline   趋势生命周期
            Sources    多维度交叉验证
            Insights   置信度评估
```

| 层 | 技术 |
|---|---|
| 后端 | Go + Gin + SQLite (WAL) + robfig/cron |
| AI | DeepSeek V4 Flash |
| 前端 | Remix 3 + Bun |

## 数据维度

| 维度 | 来源示例 |
|------|---------|
| Tech | OpenAI, Hugging Face, ArXiv AI |
| Product | Google AI, VentureBeat AI, MarkTechPost |
| Capital | CB Insights |
| Talent | Pragmatic Engineer, TheirStack API |
| Opinion | The Gradient, One Useful Thing |

## API

```
GET  /api/entries?page=&limit=&source=  时间线条目
GET  /api/sources                       数据源列表
POST /api/sources                       新增数据源
PUT  /api/sources/:id                   更新数据源
DEL  /api/sources/:id                   删除数据源
POST /api/scrape                        手动触发抓取
GET  /api/insights                      洞察列表
GET  /api/insights/:id                  洞察详情
POST /api/insights/generate             触发生成洞察
DEL  /api/insights/:id                  删除洞察
```

## 页面

- `/` — Timeline：垂直时间线，按日期分组，来源筛选
- `/insights` — 趋势河流：每周洞察，趋势生命周期，维度交叉验证
- `/sources` — 数据源管理：状态监控，维度分类