
# Getting Started

This guide walks you through installing GlideLite and setting up your first project. It assumes you're already comfortable with `JavaScript`, `TypeScript`, `Node.js`, `npm`, `Vite`, and `Express`.

## Set up a project

Create a new project, or update an existing one, so Node.js treats `.js` files as ES modules:

```bash
npm init --init-type module
```

## Install GlideLite

Install the latest stable release:

```bash
npm install -D sanderveldhuis/glidelite#stable
```

Or try our nightly build for the newest features:

```bash
npm install -D sanderveldhuis/glidelite#next
```

## Initialize your first project

Run the initialize command:

```bash
npx glc -i
```

This creates the file structure for a GlideLite project:

```bash
├─ backend                  # contains all backend modules
│  ├─ api                   # contains code for the API
│  │  ├─ middleware         # contains Express middleware
│  │  └─ routers            # contains Express routers
│  └─ workers               # contains code for workers
├─ frontend                 # contains all frontend modules
│  ├─ public                # contains public assets
│  ├─ vite.config.ts        # Vite configuration for frontend code
│  ├─ tsconfig.json         # TypeScript configuration for frontend
│  ├─ tsconfig.app.json     # TypeScript configuration for frontend code
│  ├─ tsconfig.node.json    # TypeScript configuration for vite.config.ts
│  └─ index.html            # example index page
├─ shared                   # contains code shared between backend and frontend
├─ glconfig.json            # GlideLite project configuration
└─ tsconfig.json            # TypeScript configuration for backend and shared code
```

## Run your code

To run your project for local development, use the run command:

```bash
npx glc -r
```

This command keeps running until you press `Ctrl+C`. While it's active you can keep editing your code — the GlideLite Compiler picks up the changes automatically and restarts or updates the affected modules.

## Compile your code

You can compile the entire project, or just a single part of it, called a module. To compile everything:

```bash
npx glc
```

To compile a single module instead — the `backend` module, in this example:

```bash
npx glc -m backend
```

## Further Reading

Learn how to use the [configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) file to customize your project.
