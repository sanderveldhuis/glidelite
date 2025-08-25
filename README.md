
# GlideLite

[![Continuous Integration](https://github.com/sanderveldhuis/glidelite/actions/workflows/ci.yaml/badge.svg)](https://github.com/sanderveldhuis/glidelite//actions/workflows/ci.yaml)
[![Nightly Build](https://github.com/sanderveldhuis/glidelite/actions/workflows/nightly.yaml/badge.svg)](https://github.com/sanderveldhuis/glidelite//actions/workflows/nightly.yaml)

Builds secure web applications including API, database, and worker support.

## Installing

For the latest stable version:

```bash
npm install -D sanderveldhuis/glidelite#stable
```

For our nightly builds:

```bash
npm install -D sanderveldhuis/glidelite#next
```

## ToDo

- Add unittests
- Check all code which minimum Node version is required and update the `engines` tag in `package.json`
- Add `main` tag and/or `typings` tag to the `package.json` file to ensure a developer can develop in JavaScript (e.g. API) with all types available to prevent errors in editor
