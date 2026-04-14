# Web Chat X

一个基于 libp2p 的去中心化 Web 聊天应用，支持实时通信和对等网络连接。

## 项目特性

- 去中心化对等通信
- 基于 libp2p 的 P2P 网络
- 支持 GossipSub 消息广播
- Kademlia DHT 节点发现
- 内置 Prometheus 监控指标
- Docker 部署支持
- 完整的测试框架

## 技术栈

- libp2p 及其生态系统
- Express (后端)
- Vue 3 (前端)
- TypeScript
- Docker
- PM2 进程管理
- Vitest 测试框架
- Husky & Commitlint

## 环境要求

- Node.js: 18.18.1
- pnpm: 9.3.0

## 安装

```bash
# 安装依赖
pnpm install
```

## 项目结构

```
webchatx/
├── packages/
│   ├── web-chat-x-vue/        # Vue 3 前端应用
│   └── web-chat-x-express/    # Express 后端服务
├── .github/                    # GitHub Actions 工作流
├── .husky/                     # Git 钩子
├── docker/                     # Docker 配置
├── certs/                      # 证书文件
├── prometheus/                 # Prometheus 监控配置
├── test-kad-dht/               # Kademlia DHT 测试
└── turnserver.conf             # TURN 服务器配置
```

## 可用脚本

```bash
# 开发环境部署
pnpm dev-deploy

# 生产环境部署
pnpm prod-deploy

# 构建后端
pnpm build:b

# 构建前端
pnpm build:f

# 构建所有
pnpm build

# 类型检查
pnpm tsc

# 代码行数统计
pnpm countLines
```

## 部署

项目支持 Docker 部署，配置文件位于 `docker/` 目录。

## License

ISC
