
# Deployment

Deployment is the process of installing your compiled project on a Linux-based system and getting it up and running.

## Requirements

Your deployment system needs:

* Linux Debian/Ubuntu, or a derivative (e.g. Raspberry Pi OS)
* Advanced Packaging Tool (i.e. `apt-get`)
* Admin privileges (i.e. `sudo`)

## Configure your project

By default, compiled projects are only reachable from the local network. To make your project reachable on a public domain, set the `homepage` value in [configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md). If you're running multiple GlideLite projects on the same deployment system, or some ports are already taken by other applications, set the `ports` values in [configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) too.

## Compile your code

Run the GlideLite Compiler to compile the full project:

```bash
npx glc
```

## Install your project

Copy the `output` directory to your deployment machine, then run the installer:

```bash
cd /path/to/copied/output
chmod +x install
sudo ./install
```

Follow the instructions from the installer. When it finishes, it tells you how long your project takes to boot up.

## Further Reading

That's it — you now know your way around GlideLite! Here's everything you explored:

* [Getting started](https://github.com/sanderveldhuis/glidelite/blob/main/doc/getting-started.md)
* [Configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md)

**Backend**

* [API](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api.md)
* [Workers](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md)
* [Using configuration values](https://github.com/sanderveldhuis/glidelite/blob/main/doc/using-configuration-values.md)
* [Using dependencies](https://github.com/sanderveldhuis/glidelite/blob/main/doc/using-dependencies.md)
* [Logging](https://github.com/sanderveldhuis/glidelite/blob/main/doc/logging.md)
* [Inter-process communication](https://github.com/sanderveldhuis/glidelite/blob/main/doc/inter-process-communication.md)

**Frontend**

* [User interface](https://github.com/sanderveldhuis/glidelite/blob/main/doc/user-interface.md)
* [API requests](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api-requests.md)

**Shipping your app**

* [Deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md)
