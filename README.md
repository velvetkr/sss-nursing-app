# 智慧护理平台

基于 Uni-app、Vue 3、Pinia 和 uView Plus 的智慧护理平台前端项目。

## 项目启动

### 环境要求

- Node.js 20 或更高版本
- npm 或 pnpm
- HBuilderX 或 Uni-app CLI（可选）

### 安装依赖

```bash
npm install
```

### 启动项目

```bash
npx uni
```

也可以使用：

```bash
npm run dev:h5
```

默认开发环境使用 Mock 数据，后端未启动时也可以直接浏览和测试页面。

### 联调真实后端

复制环境变量示例：

```bash
copy .env.example .env.local
```

修改 `.env.local`：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080
```

不要提交 `.env.local`、Token、密钥或真实用户隐私数据。

## 常用命令

```bash
npm run lint          # ESLint 检查
npm run test:run      # 执行单元测试
npm run build:h5     # 构建 H5
```

Windows PowerShell 如果提示 `npm.ps1` 被禁止，可以使用：

```bash
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build:h5
```

## 主要目录

```text
src/pages/       页面
src/components/ 公共组件
src/store/      Pinia 状态管理
src/utils/      请求和本地存储工具
src/mock/       开发环境 Mock 数据
src/pages.json  页面和 TabBar 配置
docs/           接口联调和测试数据文档
```

## 开发流程

不要直接修改 `main`。开发前先同步主分支并创建自己的功能分支：

```bash
git switch main
git pull --ff-only
git switch -c feat/your-feature
```

完成后：

```bash
git add <修改的文件>
git commit -m "feat: 描述你的修改"
git push -u origin feat/your-feature
```

然后在 GitHub 创建 Pull Request，等待至少一名成员审核后合并。

完整分支、提交、Review 和提交流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 测试账号

- 手机号：`13800138000`
- 密码：`123456`
- 验证码：`123456`

## 当前功能

- 登录和注册
- 首页、服务列表、服务详情、搜索
- 地址管理
- 下单预约和模拟支付
- 订单列表、订单详情和状态操作
- 评价和投诉
- 团队成员协作

