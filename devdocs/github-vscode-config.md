# Stillbytes GitHub + VSCode Configuration

## What You Need in `.github/` (CI/CD for AI-Generated Code)

### `.github/workflows/build.yml`
```yaml
name: Build Electron App

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm install
      - run: npm run build
      - run: npm run electron:build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ matrix.os }}
          path: dist/
```

**Why:** Catches build errors from AI-generated code before manual testing.

---

### `.github/workflows/test.yml`
```yaml
name: Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm install
      - run: npm run test
      - run: npm run lint
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**Why:** Validates Copilot-generated tests run without errors.

---

### `.github/workflows/release.yml`
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm install
      - run: npm run build
      - run: npm run electron:build
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/Stillbytes-*.dmg
            dist/Stillbytes-*.exe
```

**Why:** Auto-builds and publishes beta releases (DMG + EXE) to GitHub Releases when you tag.

---

### `.github/ISSUE_TEMPLATE/bug_report.md`
```markdown
---
name: Bug report
about: Report a bug in Stillbytes v1
title: '[BUG] '
labels: 'bug'
---

## Describe the bug
A clear description of what happened.

## Steps to reproduce
1. Import folder with X photos
2. Select photo
3. Edit HSL to [value]
4. Expected: [behavior]
5. Actual: [what happened instead]

## Screenshots
If applicable, add screenshots showing the issue.

## System info
- OS: [macOS 14 / Windows 11]
- App version: v1.0
- Number of photos imported: [X]

## Logs
Paste any error messages from console (F12).
```

**Why:** Standardizes bug reports for beta testers.

---

### `.github/ISSUE_TEMPLATE/feature_request.md`
```markdown
---
name: Feature request
about: Suggest an idea for v2+
title: '[FEATURE] '
labels: 'enhancement'
---

## Feature description
What feature are you requesting?

## Use case
Why do you need this? How would you use it?

## Alternatives
Have you considered other solutions?

## Additional context
Any other details?
```

---

## What You Need in `.vscode/` (AI-Friendly Development)

### `.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[tailwindcss]": {
    "editor.defaultFormatter": "bradlc.vscode-tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.exclude": {
    "**/.DS_Store": true,
    "**/node_modules": true,
    "dist/": true
  },
  "search.exclude": {
    "node_modules/": true,
    ".next/": true
  }
}
```

**Key settings:**
- `formatOnSave`: Auto-fixes Copilot-generated code style
- `tailwindCSS`: IntelliSense for Tailwind classes (critical!)
- `typescript.tsdk`: Use local TypeScript (catch type errors)

---

### `.vscode/extensions.json`
```json
{
  "recommendations": [
    "GitHub.Copilot",
    "GitHub.Copilot-Chat",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "EditorConfig.EditorConfig",
    "eamodio.gitlens"
  ]
}
```

**What each does:**
- **Copilot**: AI code generation (essential)
- **Copilot Chat**: Ask questions in chat (optional but useful)
- **Prettier**: Code formatter (catches AI style issues)
- **Tailwind CSS**: Class IntelliSense + dark mode preview
- **ESLint**: Find bugs in Copilot code
- **TypeScript**: Type checking (catches type mismatches)
- **EditorConfig**: Consistent spacing across files
- **GitLens**: Blame annotations (understand code history)

When you open repo, VSCode prompts: "Install recommended extensions?" â†’ Click **Install All**.

---

### `.vscode/launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron (Main)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["."],
      "restart": true,
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Vite Dev Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vite/bin/vite.js",
      "args": ["dev"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

**Usage:**
- Press **F5** in VSCode â†’ Select "Electron (Main)" â†’ App launches with debugger attached
- Set breakpoints in any TypeScript file
- Inspect variables, step through code
- **Critical for debugging Copilot-generated code**

---

## Additional Root Files (AI-First)

### `.editorconfig`
```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**Why:** Ensures Copilot + manual code follow same spacing/formatting rules.

---

### `.eslintrc.cjs`
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**Why:** Catches bugs in Copilot code (unused vars, wrong types, console.log in production).

---

### `.prettierrc.json`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

**Why:** Auto-formats Copilot code on save (consistent style).

---

### `tsconfig.json` (Strict Mode for AI)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // STRICT MODE (catches AI bugs)
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "electron"],
  "exclude": ["node_modules", "dist"]
}
```

**Key:** `"strict": true` catches type errors in Copilot code before runtime.

---

### `package.json` (Scripts for AI Workflow)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "electron .",
    "electron:build": "electron-builder",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0",
    "electron": "^latest",
    "vitest": "^1.0.0"
  }
}
```

**Common commands you'll use:**
```bash
npm run dev                # Start Vite + watch for changes
npm run build              # Production build
npm run electron:dev       # Launch Electron app
npm run test               # Run all tests
npm run lint               # Check for code issues
npm run type-check         # Verify TypeScript types
npm run format             # Auto-format code
```

---

## CI/CD + AI Workflow Summary

### What Happens When You Push Code:

1. **You paste Copilot prompt** â†’ AI generates code â†’ You copy to file
2. **You commit + push** â†’ GitHub Actions trigger automatically
3. **Build workflow runs:**
   - Installs deps
   - Compiles TypeScript (catches type errors)
   - Builds Vite bundle
   - Builds Electron app (macOS + Windows)
   - If errors: workflow fails, you fix
4. **Test workflow runs:**
   - Runs all unit tests
   - Runs ESLint (catches bugs)
   - If failures: workflow fails, you refine prompts
5. **Release workflow (on tag):**
   - Builds final DMG + EXE
   - Uploads to GitHub Releases
   - Beta testers download v1.0

---

## Your Actual Day-to-Day (AI-First):

```
Morning:
1. Open VSCode
2. Copilot chat â†’ Paste prompt from plan
3. AI generates code â†’ Copy to file
4. VSCode auto-formats on save (prettier)
5. TypeScript shows any type errors (hover)
6. ESLint shows bugs (red squiggles)
7. F5 to debug in Electron

Before commit:
1. npm run type-check (catch TS errors)
2. npm run lint (catch code issues)
3. npm run test (verify unit tests)
4. git commit + push

GitHub handles rest:
1. Actions run tests + build
2. If pass: all good
3. If fail: you see error, ask Copilot to fix
4. When ready: git tag v1.0 â†’ Release created
```

---

## Setup Checklist (Day 1)

- [ ] Create repo (GitHub)
- [ ] Clone locally
- [ ] Create `.github/workflows/` folder + three YAML files
- [ ] Create `.vscode/` folder + three JSON files
- [ ] Create root config files (`.editorconfig`, `.eslintrc.cjs`, `.prettierrc.json`)
- [ ] Run `npm install` (installs all extensions recommendations)
- [ ] Open `.vscode/extensions.json` â†’ VSCode prompts "Install recommended?"
- [ ] Click **Install All**
- [ ] Run `npm run dev` â†’ Vite starts
- [ ] Open Copilot â†’ Ready to build

---

**Result:** When Copilot generates code, your tools automatically:
- âœ… Format it (Prettier)
- âœ… Check types (TypeScript strict mode)
- âœ… Find bugs (ESLint)
- âœ… Run tests (Vitest)
- âœ… Build it (Vite + Electron Builder)

**This is what "AI-first" looks like: AI generates, tools validate, you review.**