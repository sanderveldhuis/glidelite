
# Deployment

Deployment is the process of installing your compiled project on a Linux-based operating system to make it operational.

## Requirements

The following requirements apply on the deployment system:

* Linux Debian/Ubuntu, or a derivative (e.g. Raspberry Pi OS)
* Advanced Packaging Tool (i.e. `apt-get`)
* Admin privileges (i.e. `sudo`)

## Compiling your code

At the command line, run the GlideLite Compiler to compile the full project:

```bash
npx glc
```

## Installing your project

Copy the `output` directory to your deployment machine. Run the installer using the command line on the deployment machine:

```bash
cd /path/to/copied/output
chmod +x install
sudo ./install
```

Follow the instructions given by the installer. Once the installer is finished it will indicate how long it takes to boot up your project.
