# SONIC FORGE · Fish Audio S2.1 Pro 可视化合成台

一个面向 [Fish Audio S2.1 Pro Free](https://fish.audio) 的纯前端 + Serverless 可视化工作台。**全栈部署在 Cloudflare Pages**：前端静态资源 + Pages Functions 反向代理 Fish Audio API。API Key 内嵌于 Pages 环境变量，前端零配置即可使用。

> 模型 `s2.1-pro-free` 在 2026 年 7 月底前免费可用。

---

## ✨ 特性

- **纯 Cloudflare Pages 部署**：前端 + Serverless Functions 一体化，无需独立后端
- **文本转语音（TTS）**：流式合成、波形可视化、参数面板（格式 / 延迟 / 语速 / 音量 / 比特率）、本地历史记录
- **声音克隆**：拖拽上传音频样本 → fast 模式训练 → 即时拿到 `trained` 模型 → 直接用于 TTS
- **声音管理**：列表 / 详情 / 删除 / 状态刷新，全部对接 Fish Audio `/model` 端点
- **API Key 内嵌**：Key 仅存在 Pages 环境变量，前端不暴露、不输入
- **无 multer / express / undici**：Pages Functions 原生 `fetch` + `formData()`，零 Node 依赖
- **设计语言**：深空霓虹风格、毛玻璃质感、framer-motion 微交互、移动端响应式
- **端到端可测**：基于 Playwright CLI（chromium）的拖拽上传 / 克隆 / 跨页选择 / 合成验证

---

## 🧱 技术栈

| 层 | 技术 |
| --- | --- |
| 前端框架 | React 18 + TypeScript + Vite 6 |
| 路由 | react-router-dom v7 |
| 状态管理 | zustand |
| 动效 | framer-motion |
| 样式 | Tailwind CSS 3 |
| 图标 | lucide-react |
| Serverless | Cloudflare Pages Functions（Web 标准 Request/Response）|
| 部署 | Cloudflare Pages（一体化）|

---

## 📁 项目结构

```
s2.1-pro-free/
├── functions/                  # Cloudflare Pages Functions（后端）
│   ├── _lib.ts                 # 公共工具（Key/headers/json），下划线开头不暴露为路由
│   ├── tsconfig.json           # Functions 独立类型检查（@cloudflare/workers-types）
│   └── api/
│       ├── tts.ts              # POST /api/tts
│       ├── health.ts           # GET /api/health
│       ├── voices.ts           # GET  /api/voices
│       ├── tts/
│       │   └── health.ts       # GET  /api/tts/health
│       └── voices/
│           ├── clone.ts        # POST /api/voices/clone
│           └── [id].ts         # GET / DELETE /api/voices/:id
├── src/                        # 前端 React 应用
│   ├── pages/
│   │   ├── Home.tsx            # 合成台首页
│   │   └── Clone.tsx           # 声音克隆工作台
│   ├── components/
│   │   ├── TopBar.tsx          # 顶部导航
│   │   ├── ParameterPanel.tsx  # 合成参数面板（含声音选择器）
│   │   ├── WaveformCanvas.tsx  # 音频波形可视化
│   │   ├── PlayerBar.tsx       # 播放器
│   │   ├── HistoryStrip.tsx    # 历史记录条
│   │   ├── ParticleBackground.tsx
│   │   └── Empty.tsx
│   ├── store/
│   │   ├── useTTSStore.ts      # TTS 状态 + 合成动作
│   │   └── useVoicesStore.ts   # 声音克隆状态 + 动作
│   ├── hooks/                  # useAudioPlayer / useTheme
│   ├── lib/utils.ts            # cn 等工具
│   ├── types.ts                # 全局类型定义
│   ├── App.tsx                 # 路由根
│   └── main.tsx
├── .dev.vars.example           # 本地开发环境变量模板
├── .dev.vars                   # 本地开发环境变量（从 .dev.vars.example 复制，已 gitignore）
├── .gitignore
├── vite.config.ts              # Vite 构建
├── tailwind.config.js
├── tsconfig.json               # 前端类型检查
└── package.json
```

### 为什么是纯 CF Pages？

Fish Audio 本身就是 HTTP API，我们的"后端"只做两件事：**藏 API Key** + **转发请求**。Express + multer + undici 这套只是为了本地 Node 环境凑出来的。Cloudflare Pages Functions 原生支持 `fetch` + `formData()`，完美匹配这个场景：

| 旧方案（Express） | 新方案（Pages Functions） |
| --- | --- |
| Express + cors + multer + undici | 零依赖，Web 标准 API |
| Node.js 服务器 / Vercel Serverless | CF Pages 一体化 |
| `process.env.FISH_API_KEY` | `context.env.FISH_API_KEY` |
| `req.body` / `req.files` | `await request.json()` / `await request.formData()` |
| undici ProxyAgent（代理） | CF 全球网络，不需要代理 |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地环境变量

复制模板并填入 Fish Audio API Key：

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars`：

```bash
# 必填：Fish Audio API Key
FISH_API_KEY=your_fish_audio_api_key
```

> `.dev.vars` 是 Wrangler 的标准环境变量文件，已 gitignore，不会提交。

### 3. 启动本地开发

```bash
npm run dev
```

这一条命令会同时启动：
- Vite 开发服务器（5173，HMR）
- Wrangler Pages Dev（8788，运行 Functions + 代理到 Vite）

访问 **http://localhost:8788** 即可（不要访问 5173，否则 `/api/*` 请求无人处理）。

也可以分开运行：

```bash
npm run client:dev          # 仅前端（5173）
npx wrangler pages dev dist --proxy 5173   # 仅 Functions，代理到 Vite
```

### 4. 类型检查与构建

```bash
npm run check               # 前端类型检查
npm run check:functions     # Pages Functions 类型检查
npm run build               # 构建前端到 dist/
npm run lint                # ESLint
```

---

## 🔌 Pages Functions API

所有路由前缀 `/api`，由 `functions/api/` 目录提供。API Key 从 `context.env.FISH_API_KEY` 读取。

### TTS 端点

| 方法 | 路径 | 文件 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/api/tts` | [functions/api/tts.ts](functions/api/tts.ts) | 透传至 `https://api.fish.audio/v1/tts`，**流式回传音频** |
| `GET` | `/api/tts/health` | [functions/api/tts/health.ts](functions/api/tts/health.ts) | 用极短文本探测 Key 是否可用 |

`POST /api/tts` 请求体（与 Fish Audio 官方字段对齐）：

```jsonc
{
  "text": "要合成的文本",
  "reference_id": "可选 · 已克隆声音的 _id",
  "format": "mp3",        // mp3 | wav | opus
  "bitrate": 128,
  "speed": 1.0,           // 0.5 ~ 2.0
  "volume": 0,            // 0 ~ 100
  "latency": "normal",    // normal | low
  "chunk_length": 200,
  "normalize": true,
  "enable_logging": false
}
```

### 声音克隆端点

| 方法 | 路径 | 文件 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/api/voices/clone` | [functions/api/voices/clone.ts](functions/api/voices/clone.ts) | multipart 上传音频，转发至 `POST /model` |
| `GET` | `/api/voices` | [functions/api/voices.ts](functions/api/voices.ts) | 列出声音模型（默认 `self=true`） |
| `GET` | `/api/voices/:id` | [functions/api/voices/[id\].ts](functions/api/voices/[id].ts) | 获取详情（用于轮询 `state`） |
| `DELETE` | `/api/voices/:id` | [functions/api/voices/[id\].ts](functions/api/voices/[id].ts) | 删除声音模型 |

`POST /api/voices/clone` 字段（`multipart/form-data`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `voices` | File[] | ✅ | 音频样本，支持 `.wav` / `.mp3` / `.m4a` / `.opus`，每段至少 10 秒 |
| `title` | string | ✅ | 声音标题 |
| `description` | string | | 声音描述 |
| `visibility` | `private` \| `unlist` \| `public` | | 默认 `private` |
| `texts` | string[] | | 对应每个音频的文本，提升发音精度 |
| `tags` | string[] | | 标签，如 `male` / `narration` |
| `enhance_audio_quality` | `true` \| `false` | | 默认 `true`，降噪 + 响度归一 |
| `generate_sample` | `true` \| `false` | | 默认 `false` |

后端固定附加 `type=tts` 与 `train_mode=fast`。fast 模式下克隆后通常立即返回 `state: "trained"`。

### 健康检查

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 返回 `{ success: true, message: "ok" }` |

---

## 🖥️ 前端页面

### 合成台 `/`（[src/pages/Home.tsx](src/pages/Home.tsx)）

- 左侧：文本输入区 + 波形可视化 + 播放器 + 下载按钮
- 右侧：连接状态卡 + 合成参数面板 + 历史记录条
- 顶部 TopBar 显示服务连接状态（READY / CHECKING / CONNECTED / OFFLINE）

### 声音克隆 `/clone`（[src/pages/Clone.tsx](src/pages/Clone.tsx)）

- 左栏：拖拽上传区 + 样本列表（播放 / 对应文本 / 删除）+ 状态提示
- 右栏：克隆配置（标题 / 描述 / 可见性 / 音频增强 / 生成示例）+ "开始克隆"按钮
- 底部：声音库网格，每张卡片提供"用于 TTS" / "刷新状态" / "删除"按钮

### 声音选择器（[src/components/ParameterPanel.tsx](src/components/ParameterPanel.tsx)）

`reference_id` 字段为下拉选择器：默认声音 / 已克隆声音列表 / 手动输入 ID / 跳转克隆页。跨页状态通过 zustand 持久化。

---

## ☁️ 部署到 Cloudflare Pages

### 架构

```
浏览器 ──> Cloudflare Pages（同域）
              ├── 静态资源（dist/）           ← 前端 React 应用
              └── /api/*  →  Pages Function  ← 调用 Fish Audio API
                            (context.env.FISH_API_KEY)
```

- 前端与 API 同域，**无跨域问题**
- Pages Function 支持流式响应（TTS 音频流）和 `multipart/form-data`（声音克隆文件上传）
- `FISH_API_KEY` 仅在 Pages 环境变量中，**不进代码仓库**
- CF Pages 免费版请求体上限 100 MB，足够上传音频样本
- CF 全球边缘网络，**不需要配置代理**

### 前置条件

1. 注册 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
2. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)：`npm install -g wrangler`（项目已含本地依赖）
3. 登录 Cloudflare：`wrangler login`

### 方式一：Git 集成自动部署（推荐）

1. 把仓库推送到 GitHub / GitLab
2. 进入 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择仓库，配置构建：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. 在 **Environment variables** 中添加：
   - `FISH_API_KEY` = `your_fish_audio_api_key`
5. **Save and Deploy**

后续每次 `git push`，Cloudflare 会自动构建并部署。`functions/` 目录会被自动识别为 Pages Functions。

### 方式二：Wrangler CLI 手动部署

```bash
# 1. 构建前端
npm run build

# 2. 部署（首次会创建项目）
npm run deploy
# 等价于：wrangler pages deploy dist --project-name=sonic-forge

# 3. 设置环境变量（在 Cloudflare Dashboard → Pages 项目 → Settings → Functions）
#    FISH_API_KEY = your_fish_audio_api_key
```

部署成功后会得到一个 `https://sonic-forge.pages.dev` 的访问地址。

### 配置环境变量

无论哪种部署方式，都需要在 Pages 项目中配置环境变量：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `FISH_API_KEY` | ✅ | Fish Audio API Key |

设置路径：Cloudflare Dashboard → 你的 Pages 项目 → **Settings** → **Functions** → **Environment variables**

> 生产环境与预览环境可分别配置，建议只在 Production 配置真实 Key。

### 自定义域名

1. 在 Cloudflare Dashboard → Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名（需先将域名 DNS 托管到 Cloudflare）
3. CF 会自动配置 DNS 记录和 SSL 证书

### 验证部署

访问 `https://your-project.pages.dev`：

1. 点击"测试"按钮，状态栏显示 **CONNECTED**（说明 `/api/tts/health` 走通）
2. 进入"声音克隆"页面，声音库应能正常拉取列表
3. 输入文本 → 点击"锻造声音"，应能正常合成并播放

---

## 🛠️ 本地开发指南

### 端口说明

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| Vite 开发服务器 | 5173 | HMR + 前端代码 |
| Wrangler Pages Dev | 8788 | 入口，提供 Functions + 代理到 Vite |

**开发时访问 `http://localhost:8788`**（不是 5173），否则 `/api/*` 请求无人处理。

### 环境变量

本地开发用 `.dev.vars`（Wrangler 自动读取），生产用 Pages Dashboard 配置。两者内容一致：

```bash
# .dev.vars
FISH_API_KEY=your_key
```

### 本地预览生产构建

```bash
npm run build
npx wrangler pages dev dist
```

### Windows 用户注意

如果你的系统设置了 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量（如 Clash / V2Ray），wrangler 可能尝试使用代理但失败。本地开发时请清除代理变量：

```powershell
# PowerShell 临时清除代理
Remove-Item Env:HTTP_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:HTTPS_PROXY -ErrorAction SilentlyContinue
npm run dev
```

> 生产环境（CF Pages）不受影响，CF 全球网络直连 Fish Audio，不需要代理。

---

## 🧪 端到端测试（Playwright CLI）

项目使用 [Playwright CLI](https://github.com/microsoft/playwright-cli)（chromium）做端到端验证。已验证的全流程：

1. 加载 `/clone` 页面（0 console error）
2. 拖拽上传音频样本
3. 填写标题 → 点击"开始克隆" → ~8 秒后返回 `state: trained`
4. 声音库数量 +1
5. 点击"用于 TTS" → `reference_id` 写入 store
6. 导航到 `/` → 声音选择器显示选中的克隆声音
7. 输入文本 → 点击"锻造声音" → 流式合成成功，HISTORY 计数 +1

常用命令：

```bash
npx playwright-cli install-browser chromium   # 首次安装浏览器
npx playwright-cli open http://localhost:8788 # 打开页面
npx playwright-cli snapshot                   # 获取元素 ref
npx playwright-cli click <ref>                # 点击元素
npx playwright-cli fill <ref> "文本"          # 填充输入
npx playwright-cli drop <ref> --path=xxx.mp3 # 拖拽上传文件
npx playwright-cli console error              # 查看 console 错误
npx playwright-cli close                      # 关闭浏览器
```

---

## 🔒 安全说明

- `FISH_API_KEY` 仅存于 Pages 环境变量，不进代码仓库
- 前端不持有、不输入、不传输 Key
- 所有上游请求由 Pages Functions 代理发起，浏览器只看到 `/api/*` 同源请求
- `enable_logging` 默认 `false`，避免文本被 Fish Audio 用于训练
- `.dev.vars` 已在 `.gitignore` 中排除

---

## 📚 参考文档

- [Fish Audio 官网](https://fish.audio)
- [Voice Cloning 文档](https://docs.fish.audio/features/voice-cloning)
- [Text to Speech 文档](https://docs.fish.audio/features/text-to-speech)
- [Create Model API](https://docs.fish.audio/api-reference/endpoint/model/create-model)
- [Cloudflare Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## 📝 许可

个人私用项目，不对外发布。`s2.1-pro-free` 模型由 Fish Audio 提供，使用前请遵守其服务条款。
