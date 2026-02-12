
# Configuration

The presence of a `glconfig.json` file in a directory indicates that the directory is the root of a GlideLite project. The file must be actual JSON and contains the configuration used by GlideLite to compile and run your code.

See [getting started](https://github.com/sanderveldhuis/glidelite/blob/main/doc/getting-started.md) for information on how to compile your code.

## Name - `name`

**Default:** inherit from `package.json`

Specifies the name of the project and ends up being part of multiple directory names. Therefore, the name can't contain any non-URL-safe characters. Make sure that the name is unique to ensure it does not interfere with other directories on your deployment system.

## Version - `version`

**Default:** inherit from `package.json`

Specifies the version of your code. The name and version together form an identifier that is assumed to be completely unique. It is advised to increment the version for each release of your code to ensure your project will run flawless without using unintended old version code cached by systems such as a client browser.

## Homepage - `homepage`

**Default:** inherit from `package.json`

Specifies the URL to the project homepage. This URL should containing the protocol and domain where a subdomain is optional. It is advised to use HTTPS to have a secure connection for which the certificates are installed on deployment.

```json
{
  "homepage": "https://subdomain.domain.com/"
}
```

## Packages - `packages`

**Default:** `[]`

Specifies an array of additional Linux APT packages which are required to run the project on your deployment system. These packages are only installed on deployment and not available for local testing.

```json
{
  "packages": ["redis-server", "mariadb-server"]
}
```

## Pre-install script - `preinstall`

**Default:** none

Specifies a `/bin/bash` script which will be executed at the start of the installation on your deployment system. This should be a relative path from the root directory in the project.

```json
{
  "preinstall": "./scripts/preinstall.sh"
}
```

## Post-install script - `postinstall`

**Default:** none

Specifies a `/bin/bash` script which will be executed at the end of the installation on your deployment system. This should be a relative path from the root directory in the project.

```json
{
  "postinstall": "./scripts/postinstall.sh"
}
```

## Ports - `ports`

Specifies the ports used for running the project on your deployment system. These ports should be set in case multiple GlideLite projects are running on the deployment system or if the ports are reserved by other applications.

### Gateway server - `gateway`

**Default:** `80`

Specifies the port for the gateway server which is the entrypoint webserver of the project.

> [!IMPORTANT]
> This configuration only works for GlideLite projects which are reachable for the local network only, i.e. no `homepage` configuration value is set.

```json
{
  "ports": {
    "gateway": 80
  }
}
```

### Proxy server - `proxy`

**Default:** `9001`

Specifies the port for the proxy server which passes requests towards the dedicated API or asset.

```json
{
  "ports": {
    "proxy": 9001
  }
}
```

### API server - `api`

**Default:** `9002`

Specifies the port for the API server which is responsible for all custom designed actions.

```json
{
  "ports": {
    "api": 9002
  }
}
```
