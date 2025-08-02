# 🧠 GitHub Copilot: Generate VS Code Configurations

## 🎯 **Step-by-Step Guide: Use Copilot for Full Stack Debug Setup**

### 🔹 **1. Open/Create launch.json**

```bash
# Navigate to your project root
cd C:\Projects\CleanCodeArchitecture\ai-scheduler

# Create .vscode folder if it doesn't exist
mkdir .vscode

# Open in VS Code
code .vscode/launch.json
```

### 🔹 **2. Add Copilot Instructions at the Top**

Paste this instruction block to guide Copilot:

```jsonc
// 🧠 Copilot: Clean Full Stack Debug Setup
// ✅ React (Vite) frontend and Express (TypeScript) backend
// ✅ Debug backend using ts-node/esm with --experimental-specifier-resolution=node
// ✅ Add Launch Frontend Dev Server and Launch Backend Dev Server
// ✅ Add compound: Launch Full Stack
// ✅ Add attach config for backend on port 9229 and frontend on port 9222
// ✅ Use internalConsoleOptions: "neverOpen" everywhere
{
  "version": "0.2.0",
  "configurations": [
    // 🔍 Place cursor here and wait for Copilot suggestions
  ],
  "compounds": [
    // 🧩 Place cursor here for compound configurations
  ]
}
```

### 🔹 **3. Generate with Copilot**

1. **Position cursor** where indicated in comments
2. **Wait 2-3 seconds** for Copilot to analyze the context
3. **Accept suggestions** with `Tab` or `Ctrl+Enter`
4. **Iterate** by adding more specific comments if needed

### 🔹 **4. Expected Copilot Output**

Based on your instructions, Copilot should generate configurations similar to:

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMaps": true,
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Backend (Node.js)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "runtimeArgs": [
        "--loader",
        "ts-node/esm",
        "--experimental-specifier-resolution=node"
      ],
      "env": { "NODE_ENV": "development" },
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Attach to Backend Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "internalConsoleOptions": "neverOpen"
    }
  ],
  "compounds": [
    {
      "name": "Launch Full Stack",
      "configurations": [
        "Launch Frontend Dev Server",
        "Launch Backend Dev Server"
      ]
    }
  ]
}
```

## 🚀 **How to Use Your VS Code Configuration**

### **Running Tasks:**

1. **Press `Ctrl+Shift+P`** → "Tasks: Run Task"
2. **Select from available tasks:**
   - `Start Full Stack Dev` - Launch both frontend and backend
   - `Install All Dependencies` - Setup project dependencies
   - `Lint All` - Check code quality in both projects
   - `Format All` - Auto-format code with Prettier
   - `Build All` - Compile TypeScript and build projects

### **Debugging:**

1. **Press `F5`** or go to Debug panel
2. **Select debug configuration:**
   - `Launch Full Stack` - Start both servers and debug
   - `Debug Frontend (Chrome)` - Debug React app in browser
   - `Debug Backend (Node.js)` - Debug Express API
   - `Attach to Backend Process` - Attach to running backend
   - `Attach to Frontend (Chrome)` - Attach to running frontend

### **Daily Development Workflow:**

```bash
# 1. Start development environment
Ctrl+Shift+P → Tasks: Run Task → "Start Full Stack Dev"

# 2. Begin debugging (opens both frontend and backend)
F5 → Select "Launch Full Stack"

# 3. Code quality checks before commit
Ctrl+Shift+P → Tasks: Run Task → "Lint All"
Ctrl+Shift+P → Tasks: Run Task → "Format All"
```

## 🚀 **Pro Tips for Better Copilot Suggestions**

### ✅ **Use Descriptive Comments**

```jsonc
// Debug React app in Chrome with source maps
// Launch Express server with TypeScript support
// Attach to running Node.js process on port 9229
```

### ✅ **Specify Technology Stack**

```jsonc
// Stack: Vite + React + TypeScript + Express + ts-node
// Ports: Frontend 5173, Backend 3001, Debug 9229
```

### ✅ **Add Context About Project Structure**

```jsonc
// Project structure: /frontend (Vite), /backend (Express)
// Backend uses ES modules with "type": "module"
```

### ✅ **Request Specific Features**

```jsonc
// Add preLaunchTask for auto-starting servers
// Include environment variables for development
// Configure source map support for debugging
```

## 🎯 **Current Status: Your VS Code Configuration**

### **launch.json** ✅

Your current `launch.json` already includes:

✅ **Copilot instruction header** - Guides future AI suggestions  
✅ **Frontend Chrome debugging** - Vite dev server on port 5173  
✅ **Backend Node.js debugging** - TypeScript with ts-node/esm  
✅ **Attach configurations** - For running processes (ports 9229, 9222)  
✅ **Dev server launchers** - npm run dev for both projects  
✅ **Full stack compound** - Launch both frontend and backend together  
✅ **Clean console management** - internalConsoleOptions: "neverOpen"

### **tasks.json** ✅

Your current `tasks.json` includes:

✅ **Copilot instruction header** - Guides AI-assisted task generation  
✅ **Install dependencies** - Frontend and backend npm install  
✅ **Dev server tasks** - Background tasks with problem matchers  
✅ **Lint and format tasks** - ESLint and Prettier for both projects  
✅ **Build tasks** - TypeScript compilation  
✅ **Compound tasks** - Full stack development workflow  
✅ **Proper working directories** - cwd set for each project

## 🔧 **Next Steps with Copilot**

### 🔹 **2. Open/Create tasks.json**

```bash
# Create or open tasks.json
code .vscode/tasks.json
```

Paste this instruction at the top:

```jsonc
// 🧠 Copilot: Define npm run dev tasks
// ✅ "Launch Frontend Dev Server": Run npm run dev in ./frontend
// ✅ "Launch Backend Dev Server": Run npm run dev in ./backend
// ✅ Set correct working directories (cwd)
// ✅ Use shell task, clean setup
// ✅ Background tasks with proper problem matchers
// ✅ Install, lint, format, and build tasks for full development workflow
{
  "version": "2.0.0",
  "tasks": [
    // 🚀 Place cursor here for Copilot to suggest dev server tasks
  ]
}
```

### **For tasks.json:**

```jsonc
// 🧠 Copilot: Generate VS Code Tasks for Full Stack Development
// ✅ Install dependencies for frontend and backend
// ✅ Build tasks for TypeScript compilation
// ✅ Lint and format tasks with ESLint and Prettier
// ✅ Start dev servers as background tasks
// ✅ Compound task to run full development environment
```

### **For settings.json:**

```jsonc
// 🧠 Copilot: Workspace Settings for React + TypeScript + Express
// ✅ Auto-format with Prettier on save
// ✅ ESLint integration with auto-fix
// ✅ TypeScript path mapping and import suggestions
// ✅ Tailwind CSS intellisense
// ✅ File exclusions for node_modules and dist folders
```

## 🎉 **Result**

Your VS Code workspace now has **production-ready debugging configurations** that work seamlessly with GitHub Copilot for future enhancements!

**Key Benefits:**

- 🔍 **Full stack debugging** in Chrome and Node.js
- 🔗 **Attach to running processes** for flexible debugging
- 🚀 **One-click development** with compound configurations
- 🧠 **Copilot-friendly** with clear instruction comments
- 🛠️ **TypeScript support** with proper ES module handling
