
# Getting Started

To get started you have to install GlideLite and initialize a project. For this, the assumption is made that you are familiar with `JavaScript`, `TypeScript`, `Node.js`, `npm`, `Vite`, and `Express`.

## Installing GlideLite

For the latest stable version:

```bash
npm install -D sanderveldhuis/glidelite#stable
```

For our nightly builds:

```bash
npm install -D sanderveldhuis/glidelite#next
```

## Initialize your first GlideLite project

Run the initialize command:

```bash
npx glc -i
```

This will create the filesystem structure with required files for a GlideLite project:

```bash
├─ backend              # contains all backend modules
│  ├─ api               # contains code for the API
│  │  ├─ middleware     # contains Express middleware
│  │  ├─ routers        # contains Express routers
│  │  └─ tsconfig.json  # TypeScript configuration for API code
│  └─ workers           # contains code for workers
│     └─ tsconfig.json  # TypeScript configuration for workers code
├─ frontend             # contains all frontend modules
│  ├─ public            # contains public assets
│  │  ├─ 404.html       # Example 404 page
│  │  ├─ 429.html       # Example 429 page
│  │  └─ 500.html       # Example 500 page
│  ├─ vite.config.ts    # Vite configuration for frontend code
│  └─ index.html        # Example index page
└─ glconfig.json        # GlideLite configuration for the project
```

## Running your code

To run your project for local development use the run command:

```bash
npx glc -r
```

Until you hit `Ctrl+C` this command remains active and you can make changes to your code. The GlideLite Compiler will handle changes and restart or update the modules accordingly.

## Compiling your code

It is possible to compile the full project or only specific parts, called modules. Let's first compile the full project:

```bash
npx glc
```

Now compile a specific module of the project, in this example the `workers` module which is part of the `backend`:

```bash
npx glc -m workers
```

# What's next?

To dive deeper into GlideLite it is time to start coding your project:

* [Configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md)
* [Inter-process communication](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ipc.md)
* [API](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api.md)
* [Workers](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md)
* [Frontend](https://github.com/sanderveldhuis/glidelite/blob/main/doc/frontend.md)
* [Deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md)
