# FullstackAgent Runtime Workflow

## 📖 Table of Contents

- [Overview](#overview)
- [Runtime Image Details](#runtime-image-details)
- [Complete Workflow](#complete-workflow)
- [Technology Stack Layers](#technology-stack-layers)
- [Development Flow Example](#development-flow-example)
- [Key Components](#key-components)
- [Conceptual Comparison](#conceptual-comparison)

---

## Overview

**FullstackAgent** is a cloud-based AI full-stack development platform that provides each user with an isolated development sandbox environment. Users access a web terminal through their browser to develop in the cloud, just like local development, with an AI assistant (Claude Code CLI) available throughout the process.

### Core Concept

```
No local environment setup required
    ↓
Open terminal in browser
    ↓
Develop in cloud container
    ↓
AI assistant throughout
    ↓
One-click deployment and sharing
```

---

## Runtime Image Details

### What is the Runtime Image?

The **Runtime Image** is the "operating system" of the user sandbox, containing all tools and environments needed for development.

**Image**: `fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9`

### Directory Structure

```
/runtime/
├── Dockerfile              ← Docker image definition (core)
├── entrypoint.sh          ← Container startup script
├── .bashrc                ← Shell configuration (auto-starts Claude)
├── VERSION                ← Version number (v0.0.1-alpha.9)
├── build.sh               ← Local build script
├── push-to-dockerhub.sh   ← Push to Docker Hub
└── README.md              ← Usage documentation
```

### Built-in Software and Tools

| Component | Version/Description | Purpose |
|-----------|-------------------|---------|
| **Ubuntu** | 24.04 | Base operating system |
| **Node.js** | 22.x LTS | JavaScript runtime |
| **Next.js** | Latest | React full-stack framework |
| **Claude Code CLI** | Latest | AI-assisted development tool ⭐ |
| **ttyd** | Latest | Web terminal service 🖥️ |
| **PostgreSQL Client** | 16 | Database tools |
| **Git + GitHub CLI** | Latest | Version control |
| **Buildah/Podman** | Latest | Container build tools |
| **TypeScript** | Latest | Type system |
| **Prisma** | Latest | ORM tool |
| **Dev Tools** | - | vim, nano, jq, htop, tree, etc. |

### Key Dockerfile Sections

```dockerfile
FROM ubuntu:24.04

# Install Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Next.js and related tools
RUN npm install -g next@latest typescript prisma

# Install ttyd (Web Terminal)
RUN wget -O /tmp/ttyd https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64 && \
    chmod +x /tmp/ttyd && \
    mv /tmp/ttyd /usr/local/bin/ttyd

# Install PostgreSQL client
RUN apt-get install -y postgresql-client-16

# Working directory
WORKDIR /workspace

# Expose ports
EXPOSE 3000 7681

# Start ttyd
CMD ["/usr/local/bin/entrypoint.sh"]
```

### Startup Script

**entrypoint.sh**:
```bash
#!/bin/bash
ttyd -W bash
```

**.bashrc** (auto-start Claude):
```bash
# Custom prompt
PROMPT_COMMAND='PS1="\u@${PROJECT_NAME}:$(_path)\$ "'

# Auto-start Claude Code CLI on first connection
if [ ! -f "/tmp/.claude_started" ]; then
    touch "/tmp/.claude_started"
    echo "🤖 Starting Claude Code CLI..."
    claude
fi
```

### Exposed Ports

| Port | Purpose |
|------|---------|
| **7681** | ttyd Web Terminal (WebSocket) |
| **3000** | Next.js development server |
| 3001 | Next.js production server |
| 5000 | Python/Flask applications |
| 5173 | Vite development server |
| 8000/8080 | General HTTP services |

---

## Complete Workflow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Browser                                                 │
│  http://localhost:3000                                        │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 1. Login/Create Project
                ↓
┌─────────────────────────────────────────────────────────────┐
│  FullstackAgent Main Application (Next.js)                   │
│  / (root directory)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Features:                                            │   │
│  │  ✓ User authentication (GitHub OAuth)                │   │
│  │  ✓ Project management (create/delete/list)           │   │
│  │  ✓ Environment variable configuration                │   │
│  │  ✓ Database management                                │   │
│  │  ✓ Sandbox lifecycle control (start/stop/restart)    │   │
│  │  ✓ GitHub integration                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 2. User clicks "Start Sandbox"
                ↓
┌─────────────────────────────────────────────────────────────┐
│  Kubernetes Cluster (usw.sealos.io)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  lib/kubernetes.ts - KubernetesService              │    │
│  │                                                     │    │
│  │  Steps:                                             │    │
│  │  1. Create PostgreSQL database (KubeBlocks)        │    │
│  │  2. Create Deployment (using runtime image) ────┐  │    │
│  │  3. Create Service (internal service discovery)  │  │    │
│  │  4. Create Ingress - app access                  │  │    │
│  │  5. Create Ingress - terminal access (WebSocket) │  │    │
│  │  6. Inject environment variables (DATABASE_URL)  │  │    │
│  └─────────────────────────────────────┬───────────────┘    │
│                                         │                    │
│                    3. Deploy Sandbox Pod │                   │
│  ┌──────────────────────────────────────┼───────────┐       │
│  │  Pod: {project}-agentruntime-abc123  │           │       │
│  │  Namespace: ns-ajno7yq7              │           │       │
│  │  ┌────────────────────────────────┐ │           │       │
│  │  │ Container: fullstack-sandbox   │ │           │       │
│  │  │ Image: fullstackagent/         │ │           │       │
│  │  │   fullstack-web-runtime:...  ←─┘            │       │
│  │  │                                │             │       │
│  │  │  ┌──────────────────────────┐ │             │       │
│  │  │  │ 🐳 Runtime Environment  │ │             │       │
│  │  │  │ (Ubuntu 24.04 + tools)  │ │             │       │
│  │  │  │                          │ │             │       │
│  │  │  │  📦 Processes:           │ │             │       │
│  │  │  │  ├─ ttyd (PID 1)        │ │             │       │
│  │  │  │  │  └─ bash             │ │             │       │
│  │  │  │  │     └─ claude (auto) │ │             │       │
│  │  │  │  │                      │ │             │       │
│  │  │  │  └─ (user processes)    │ │             │       │
│  │  │  │     └─ npm run dev:3000│ │             │       │
│  │  │  │                          │ │             │       │
│  │  │  │  📂 Directories:         │ │             │       │
│  │  │  │  └─ /workspace/ (code)  │ │             │       │
│  │  │  │                          │ │             │       │
│  │  │  │  🌐 Listening Ports:     │ │             │       │
│  │  │  │  ├─ 7681 (ttyd) ──────┐ │ │             │       │
│  │  │  │  └─ 3000 (Next.js) ─┐ │ │ │             │       │
│  │  │  └──────────────────────┼─┼─┘ │             │       │
│  │  └───────────────────────────┼─┼────┘             │       │
│  └────────────────────────────┼─┼────────────────────┘       │
│                                │ │                            │
│                    4. Generate Public URLs                    │
│                                │ │                            │
│  ┌────────────────────────────┼─┼──────────────────┐         │
│  │ Ingress (app)              ↓ │                  │         │
│  │ https://{random}.usw.sealos.io                  │         │
│  │   → Forward to Pod:3000 ──────┘                 │         │
│  └──────────────────────────────────────────────────┘         │
│                                 │                              │
│  ┌─────────────────────────────┼────────────────────┐         │
│  │ Ingress (terminal WebSocket) ↓                   │         │
│  │ https://{random}-ttyd.usw.sealos.io              │         │
│  │   → Forward to Pod:7681 (WebSocket) ──────┐      │         │
│  └─────────────────────────────────────────────┼────┘         │
└────────────────────────────────────────────────┼──────────────┘
                                                 │
                                                 │
                        5. Return URLs to user    │
                                                 │
                ┌────────────────────────────────┘
                │
                │ 6. User accesses terminal via browser
                ↓
┌─────────────────────────────────────────────────────────────┐
│  User Browser - Web Terminal                                 │
│  https://{random}-ttyd.usw.sealos.io                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ developer@sandbox:/workspace$                          │ │
│  │                                                        │ │
│  │ 🤖 Starting Claude Code CLI...                        │ │
│  │                                                        │ │
│  │ Welcome to Claude Code!                               │ │
│  │                                                        │ │
│  │ claude> create a blog with next.js and tailwind      │ │
│  │                                                        │ │
│  │ [Claude starts creating project...]                   │ │
│  │                                                        │ │
│  │ ✓ Created package.json                                │ │
│  │ ✓ Created app/page.tsx                                │ │
│  │ ✓ Created tailwind.config.ts                          │ │
│  │                                                        │ │
│  │ claude> exit                                          │ │
│  │                                                        │ │
│  │ developer@sandbox:/workspace$ npm install             │ │
│  │ developer@sandbox:/workspace$ npm run dev             │ │
│  │ > next dev                                            │ │
│  │ ▲ Next.js 15.5.4                                      │ │
│  │ - Local: http://localhost:3000 ✓                      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ 7. Access application
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  User Browser - Application                                  │
│  https://{random}.usw.sealos.io                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │         🎉 My Awesome Blog 🎉                         │ │
│  │                                                        │ │
│  │  [User's Next.js app running in cloud sandbox]       │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Steps

#### Step 1: User Login and Project Creation

```typescript
// User operations in main application
1. Visit http://localhost:3000
2. Login with GitHub OAuth
3. Click "Create New Project"
4. Fill in project name, description
5. Configure environment variables (optional)
```

#### Step 2: Trigger Sandbox Creation

```typescript
// API call: POST /api/sandbox/[projectId]
// Code location: app/api/sandbox/[projectId]/route.ts

const response = await fetch(`/api/sandbox/${projectId}`, {
  method: 'POST',
  body: JSON.stringify({
    projectName: 'my-blog',
    environmentVariables: {
      DATABASE_URL: 'postgresql://...',
      NEXT_PUBLIC_API_URL: 'https://api.example.com'
    }
  })
});
```

#### Step 3: Kubernetes Resource Creation

```typescript
// Code location: lib/kubernetes.ts
// KubernetesService.createSandbox()

// 1. Create PostgreSQL database
await this.createDatabase(projectId);

// 2. Create Deployment
const deployment = {
  metadata: {
    name: `{project}-agentruntime-{suffix}`,
    namespace: 'ns-ajno7yq7'
  },
  spec: {
    replicas: 1,
    template: {
      spec: {
        containers: [{
          name: 'fullstack-sandbox',
          image: 'fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9',
          ports: [
            { containerPort: 3000 },
            { containerPort: 7681 }
          ],
          env: [
            { name: 'DATABASE_URL', value: dbConnectionString },
            { name: 'PROJECT_NAME', value: projectName }
          ]
        }]
      }
    }
  }
};

// 3. Create Service (internal access)
// 4. Create Ingress (app access)
// 5. Create Ingress (terminal access - WebSocket)
```

#### Step 4: Container Startup Flow

```bash
# 1. Kubernetes pulls image
docker pull fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9

# 2. Start container
docker run -d \
  --name sandbox-abc123 \
  -p 3000:3000 \
  -p 7681:7681 \
  -e DATABASE_URL="postgresql://..." \
  -e PROJECT_NAME="my-blog" \
  fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9

# 3. Container executes entrypoint.sh
/usr/local/bin/entrypoint.sh
  └─> ttyd -W bash
      └─> bash (waiting for user connection)
```

#### Step 5: User Connects to Terminal

```bash
# User browser visits
https://{random}-ttyd.usw.sealos.io

# WebSocket connection established
Browser ←─[WebSocket]─→ Ingress ←─→ Service ←─→ Pod:7681 (ttyd)

# ttyd creates bash session
ttyd spawns: bash

# .bashrc auto-executes
if [ ! -f "/tmp/.claude_started" ]; then
    touch "/tmp/.claude_started"
    echo "🤖 Starting Claude Code CLI..."
    claude
fi

# User sees interface
developer@my-blog:/workspace$
🤖 Starting Claude Code CLI...
Welcome to Claude Code!
claude>
```

---

## Technology Stack Layers

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: User Layer                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Browser Interface                                    │ │
│ │ - Project management UI (main app)                  │ │
│ │ - Web terminal UI (ttyd)                            │ │
│ │ - Application preview (user's Next.js app)          │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Platform Management (FullstackAgent Main App)  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Next.js 15.5.4 + React 19                           │ │
│ │ - User authentication (NextAuth + GitHub OAuth)     │ │
│ │ - Project CRUD                                       │ │
│ │ - Sandbox lifecycle management                       │ │
│ │ - Environment variable configuration                 │ │
│ │ - Database management                                │ │
│ │                                                      │ │
│ │ Tech Stack:                                          │ │
│ │ - Prisma ORM (PostgreSQL)                           │ │
│ │ - Kubernetes Client (@kubernetes/client-node)       │ │
│ │ - Shadcn/UI + Tailwind CSS                          │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ Kubernetes API
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Container Orchestration (Kubernetes)           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Kubernetes Cluster (usw.sealos.io)                  │ │
│ │ Namespace: ns-ajno7yq7                              │ │
│ │                                                      │ │
│ │ Resource Types:                                      │ │
│ │ - Deployment (sandbox pod management)               │ │
│ │ - Service (internal service discovery)              │ │
│ │ - Ingress (external access entry)                   │ │
│ │ - Secret (database credentials)                     │ │
│ │ - KubeBlocks Cluster (PostgreSQL)                   │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ Container Runtime
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Runtime Environment (Runtime Container)        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Container Image: fullstackagent/fullstack-web-runtime│ │
│ │ Version: v0.0.1-alpha.9                             │ │
│ │ Base: Ubuntu 24.04                                  │ │
│ │                                                      │ │
│ │ Built-in Software:                                   │ │
│ │ ├─ Node.js 22.x (JavaScript/TypeScript runtime)    │ │
│ │ ├─ Next.js (Web framework)                          │ │
│ │ ├─ Claude Code CLI (AI assistant) ⭐                │ │
│ │ ├─ ttyd (Web terminal service) 🖥️                  │ │
│ │ ├─ PostgreSQL Client (database tools)              │ │
│ │ ├─ Git + GitHub CLI (version control)               │ │
│ │ ├─ Buildah/Podman (container building)             │ │
│ │ ├─ Prisma (ORM)                                     │ │
│ │ └─ Dev tools (vim, nano, jq, curl, wget...)        │ │
│ │                                                      │ │
│ │ Process Tree:                                        │ │
│ │ PID 1: /usr/local/bin/entrypoint.sh                │ │
│ │   └─ ttyd -W bash                                   │ │
│ │       └─ bash (user Shell)                          │ │
│ │           ├─ claude (AI assistant, auto-started)    │ │
│ │           └─ npm run dev (user-started app)         │ │
│ │               └─ node .next/server.js (Next.js)    │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ File System
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 5: User Code Layer                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Working Directory: /workspace/                       │ │
│ │                                                      │ │
│ │ User Project Structure:                              │ │
│ │ my-blog/                                             │ │
│ │ ├─ package.json                                     │ │
│ │ ├─ next.config.ts                                   │ │
│ │ ├─ tsconfig.json                                    │ │
│ │ ├─ app/                                             │ │
│ │ │   ├─ layout.tsx                                   │ │
│ │ │   ├─ page.tsx                                     │ │
│ │ │   └─ api/                                         │ │
│ │ ├─ components/                                      │ │
│ │ ├─ lib/                                             │ │
│ │ ├─ prisma/                                          │ │
│ │ │   └─ schema.prisma                                │ │
│ │ └─ public/                                          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Development Flow Example

### Scenario: Creating a Blog Application

#### 1. Preparation Phase

```bash
# User logs into FullstackAgent
https://fullstackagent.example.com

# Create project
Project Name: my-awesome-blog
Description: A personal blog with Next.js and Prisma
```

#### 2. Start Sandbox

```bash
# Click "Start Sandbox" button
# System background execution:
1. Creating PostgreSQL database... ✓
2. Deploying sandbox container... ✓
3. Setting up networking... ✓
4. Injecting environment variables... ✓
5. Starting ttyd service... ✓

# Generated URLs:
Application: https://{random}.usw.sealos.io
Terminal: https://{random}-ttyd.usw.sealos.io
```

#### 3. Open Terminal

```bash
# Click "Open Terminal" button
# Browser opens: https://{random}-ttyd.usw.sealos.io

# Interface shown:
developer@my-awesome-blog:/workspace$

🤖 Starting Claude Code CLI...
Welcome to Claude Code!

claude>
```

#### 4. Use Claude to Create Project

```bash
claude> I want to create a blog application with:
        - Next.js 15 with App Router
        - Tailwind CSS for styling
        - Prisma with PostgreSQL
        - Markdown support for blog posts
        - Dark mode toggle

# Claude executes:
✓ Analyzing requirements...
✓ Creating Next.js project...
✓ Installing dependencies (next, react, typescript, tailwindcss, prisma)...
✓ Setting up Prisma schema...
✓ Configuring Tailwind CSS...
✓ Creating initial components...
✓ Setting up dark mode provider...

Done! Your blog project is ready.

claude> exit
```

#### 5. Configure Database

```bash
developer@my-awesome-blog:/workspace$ cat prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  # Auto-injected
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}

# Sync database
developer@my-awesome-blog:/workspace$ npx prisma db push
✓ Database schema pushed successfully
```

#### 6. Start Development Server

```bash
developer@my-awesome-blog:/workspace$ npm run dev

> my-awesome-blog@0.1.0 dev
> next dev

▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000

✓ Ready in 1.8s
```

#### 7. Access Application

```bash
# Open in new browser tab
https://{random}.usw.sealos.io

# See blog homepage
┌─────────────────────────────────────┐
│                                     │
│        🌙 My Awesome Blog           │
│                                     │
│  [Home] [Posts] [About] [Dark Mode] │
│                                     │
│  Welcome to my blog!                │
│  Built with Next.js 15              │
│                                     │
└─────────────────────────────────────┘
```

---

## Key Components

### 1. FullstackAgent Main Application

**Location**: `/` (root directory - **Updated from /fullstack-agent/**)

**Features**:
- User authentication and authorization
- Project lifecycle management
- Sandbox orchestration and control
- Environment variable configuration
- Database management

**Tech Stack**:
- Next.js 15.5.4 (App Router)
- React 19
- NextAuth v5 (GitHub OAuth)
- Prisma ORM
- Kubernetes Client
- Shadcn/UI + Tailwind CSS v4

**Key Services**:
```typescript
// lib/kubernetes.ts
export class KubernetesService {
  async createSandbox(projectId: string): Promise<SandboxInfo> {
    // Create database, deploy container, configure network
  }

  async startSandbox(projectId: string): Promise<void> {
    // Start stopped sandbox
  }

  async stopSandbox(projectId: string): Promise<void> {
    // Stop running sandbox
  }

  async deleteSandbox(projectId: string): Promise<void> {
    // Delete sandbox and related resources
  }
}

// lib/auth.ts - **Updated path**
export const { handlers, auth } = NextAuth({
  providers: [GitHub],
  // User authentication configuration
});

// lib/db.ts - **Updated path**
export const prisma = new PrismaClient();
// Database client
```

### 2. Runtime Container

**Location**: `/runtime/` (**Updated from /fullstack-agent/runtime/**)

**Purpose**:
- Provide complete development environment
- Run user code
- Provide web terminal service
- Integrate AI assistant

**Core Files**:
```bash
runtime/
├── Dockerfile              # Image definition
├── entrypoint.sh           # Start ttyd
├── .bashrc                 # Auto-start Claude
├── VERSION                 # v0.0.1-alpha.9
└── README.md               # Documentation
```

### 3. Kubernetes Configuration

**Location**: `/yaml/` (**Updated from /fullstack-agent/yaml/**)

**Resource Types**:

#### Deployment (Sandbox Container)
```yaml
# yaml/sandbox/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {project}-agentruntime-{suffix}
  namespace: ns-ajno7yq7
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {deployment-name}
  template:
    spec:
      containers:
      - name: fullstack-sandbox
        image: fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9
        ports:
        - containerPort: 3000
        - containerPort: 7681
        env:
        - name: DATABASE_URL
          value: "postgresql://..."
        - name: PROJECT_NAME
          value: "{projectName}"
        resources:
          requests:
            cpu: 20m
            memory: 25Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

---

## Conceptual Comparison

### Traditional Development vs FullstackAgent

| Traditional Local Development | FullstackAgent Cloud Development |
|------------------------------|----------------------------------|
| 💻 Your Computer (MacBook/PC) | 🐳 Runtime Container (cloud VM) |
| 🖥️ VS Code | 🤖 Claude Code CLI |
| ⌨️ Terminal | 🌐 ttyd Web Terminal |
| 🌐 localhost:3000 | 🔗 https://{random}.usw.sealos.io |
| 📁 ~/Projects/my-app | 📂 /workspace (in container) |
| 🔒 Local PostgreSQL | ☁️ KubeBlocks PostgreSQL |
| 🚀 Manual deploy to Vercel | ⚡ One-click deployment |
| ⚙️ Need environment setup | ✅ Ready out of box |

### Experience Comparison

**Traditional Development Flow**:
```bash
# 1. Install Node.js
brew install node

# 2. Install PostgreSQL
brew install postgresql

# 3. Create project
npx create-next-app my-app

# 4. Configure database
createdb myapp
echo "DATABASE_URL=postgresql://localhost/myapp" > .env

# 5. Develop
cd my-app
npm install
npm run dev

# 6. Open browser
open http://localhost:3000
```

**FullstackAgent Flow**:
```bash
# 1. Open browser, login to FullstackAgent

# 2. Create project (click button)

# 3. Start sandbox (click button)
# ✓ Database automatically created
# ✓ Environment automatically configured
# ✓ Terminal automatically ready

# 4. Open terminal (click button)

# 5. Use Claude to develop
claude> create a next.js blog app

# 6. Access app (click link)
https://{random}.usw.sealos.io
```

**Advantages**:
- ✅ No local environment setup
- ✅ Access from multiple devices (laptop, tablet, phone)
- ✅ Team collaboration (share terminal link)
- ✅ AI assistance throughout
- ✅ Automatic backup and version control
- ✅ One-click deployment

---

## Summary

### Core Concepts

1. **Runtime Image** = Cloud development environment
   - Contains all development tools
   - Pre-installed Claude Code CLI
   - Provides web terminal service

2. **Main Application** = Management platform
   - User authentication and project management
   - Sandbox orchestration and lifecycle control
   - Environment configuration and database management

3. **Sandbox** = User's development space
   - Isolated container environment
   - Dedicated database
   - Independent public access URLs

4. **ttyd** = Browser terminal
   - WebSocket connection
   - Complete shell experience
   - Supports all terminal features

5. **Claude Code CLI** = AI assistant
   - Auto-starts
   - Understands project context
   - Generates and modifies code

### Workflow Key Points

```
Create Project → Start Sandbox → Open Terminal → Develop with Claude → Access App → Deploy
   ↓              ↓                ↓                ↓                    ↓            ↓
Main App    Kubernetes          ttyd         Runtime Container      Ingress     Vercel
```

### Technical Highlights

- 🎯 **Zero Configuration**: Out-of-box development environment
- 🤖 **AI-Driven**: Claude Code CLI assistance throughout
- 🌐 **Cloud Native**: Kubernetes-based elastic architecture
- 🖥️ **Browser Terminal**: Access development environment anytime, anywhere
- 🔒 **Security Isolation**: Each sandbox runs independently
- ⚡ **Fast Startup**: Second-level environment startup
- 📦 **Complete Toolchain**: Next.js + Prisma + TypeScript + Git

---

*Last Updated: 2025-10-26*
*Version: v0.0.1-alpha.9*
