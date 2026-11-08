/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { join } from 'node:path';
import {
  exists,
  makeDir,
  makeFile
} from './sysUtils';
import { ExitStatus } from './types';

/**
 * Initializes a new GlideLite project at the specified working directory.
 * @param workingDirectory the working directory to create the new project at
 */
export function initProject(workingDirectory: string): void {
  const glConfig = join(workingDirectory, 'glconfig.json');
  const tsConfig = join(workingDirectory, 'tsconfig.json');
  const backendDir = join(workingDirectory, 'backend');
  const apiDir = join(backendDir, 'api');
  const apiMiddlewareDir = join(apiDir, 'middleware');
  const apiMiddlewareKeep = join(apiMiddlewareDir, '.gitkeep');
  const apiRoutersDir = join(apiDir, 'routers');
  const apiRoutersKeep = join(apiRoutersDir, '.gitkeep');
  const workersDir = join(backendDir, 'workers');
  const workersKeep = join(workersDir, '.gitkeep');
  const frontendDir = join(workingDirectory, 'frontend');
  const frontendViteConfig = join(frontendDir, 'vite.config.ts');
  const frontendTsConfig = join(frontendDir, 'tsconfig.json');
  const frontendAppTsConfig = join(frontendDir, 'tsconfig.app.json');
  const frontendNodeTsConfig = join(frontendDir, 'tsconfig.node.json');
  const frontendIndex = join(frontendDir, 'index.html');
  const frontendPublicDir = join(frontendDir, 'public');
  const frontendPublicKeep = join(frontendPublicDir, '.gitkeep');
  const sharedDir = join(workingDirectory, 'shared');
  const sharedKeep = join(sharedDir, '.gitkeep');

  // Check if all required files are not yet available to prevent overwriting existing user data
  if (exists(glConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'glconfig.json' file already defined at: '${glConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(tsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${tsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendViteConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'vite.config.ts' file already defined at: '${frontendViteConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendTsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${frontendTsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendAppTsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.app.json' file already defined at: '${frontendAppTsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendNodeTsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.node.json' file already defined at: '${frontendNodeTsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendIndex)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'index.html' file already defined at: '${frontendIndex}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }

  // Create the file system structure if not exists, and create all required files
  makeFile(glConfig, '{\n}\n');
  makeFile(tsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["backend/**/*", "shared/**/*"]\n}\n');
  makeDir(backendDir);
  makeDir(apiMiddlewareDir);
  makeFile(apiMiddlewareKeep, '');
  makeDir(apiRoutersDir);
  makeFile(apiRoutersKeep, '');
  makeDir(workersDir);
  makeFile(workersKeep, '');
  makeDir(frontendDir);
  makeFile(frontendViteConfig, "import react from '@vitejs/plugin-react';\nimport { glConfig } from 'glidelite/vite';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  ...glConfig,\n  plugins: [react()]\n});\n");
  makeFile(frontendTsConfig, '{\n  "files": [],\n  "references": [\n    { "path": "./tsconfig.app.json" },\n    { "path": "./tsconfig.node.json" }\n  ]\n}\n');
  makeFile(frontendAppTsConfig, '{\n  "compilerOptions": {\n    "target": "es2023",\n    "lib": ["ES2023", "DOM"],\n    "module": "esnext",\n    "types": ["vite/client"],\n    "allowArbitraryExtensions": true,\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "react-jsx",\n\n    /* Linting */\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "erasableSyntaxOnly": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["src"]\n}\n');
  makeFile(frontendNodeTsConfig, '{\n  "compilerOptions": {\n    "target": "es2023",\n    "lib": ["ES2023"],\n    "types": ["node"],\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "module": "nodenext",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n\n    /* Linting */\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "erasableSyntaxOnly": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["vite.config.ts"]\n}\n');
  makeFile(frontendIndex, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
  makeDir(frontendPublicDir);
  makeFile(frontendPublicKeep, '');
  makeDir(sharedDir);
  makeFile(sharedKeep, '');

  console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
