
# Configuration

A `glconfig.json` file marks the root of a GlideLite project. It must be valid JSON, and it holds the configuration GlideLite uses to compile and run your code.

See [getting started](https://github.com/sanderveldhuis/glidelite/blob/main/doc/getting-started.md) to learn how to compile your code.

## `name`

**Default:** inherited from `package.json`

The name of your project. It's used as part of several directory names, so it can only contain URL-safe characters. Make sure it's unique so it doesn't clash with other directories on your deployment system.

## `version`

**Default:** inherited from `package.json`

The version of your code. Together, the name and version form an identifier that's assumed to be unique. Increment the version with every release so clients don't keep running an old version of your code cached by, for example, a browser.

## `homepage`

**Default:** inherited from `package.json`

The URL of your project's homepage, including the protocol and domain (a subdomain is optional). Use HTTPS to keep the connection secure, for which the certificates are installed on your deployment system by GlideLite automatically.

```json
{
  "homepage": "https://subdomain.domain.com/"
}
```

## `packages`

**Default:** `[]`

Additional Linux APT packages required to run the project on your deployment system. These are only installed during deployment, not for local development.

```json
{
  "packages": ["redis-server", "mariadb-server"]
}
```

## `preinstall`

**Default:** none

A `/bin/bash` script that runs at the start of the installation on your deployment system. Use a path relative to the project's root directory.

```json
{
  "preinstall": "./scripts/preinstall.sh"
}
```

## `postinstall`

**Default:** none

A `/bin/bash` script that runs at the end of the installation on your deployment system. Use a path relative to the project's root directory.

```json
{
  "postinstall": "./scripts/postinstall.sh"
}
```

## `ports`

The ports used when running the project on your deployment system. Set these if you're running multiple GlideLite projects on the same machine, or if the default ports are already taken by other applications.

### `ports.gateway`

**Default:** `80`

The port for the gateway server, the entry point of your project.

> [!IMPORTANT]
> This setting only applies to GlideLite projects reachable from the local network, i.e. projects without a `homepage` value configured.

```json
{
  "ports": {
    "gateway": 80
  }
}
```

### `ports.proxy`

**Default:** `9001`

The port for the proxy server, which forwards requests to the right API or asset.

```json
{
  "ports": {
    "proxy": 9001
  }
}
```

### `ports.api`

**Default:** `9002`

The port for the API server, which handles all your custom logic.

```json
{
  "ports": {
    "api": 9002
  }
}
```

## Further Reading

Ready to dive in? Start building your first [API](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api.md).
