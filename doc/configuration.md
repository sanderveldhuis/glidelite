
# Configuration

The precense of a `glconfig.json` file in a directory indicates that the directory is the root of a GlideLite project. The file must be actual JSON and contains the configuration used by GlideLite to compile and run your code.

See [getting started](https://github.com/sanderveldhuis/glidelite/blob/main/doc/getting-started.md) for information on how to compile your code.

## Name - `name`

 **Default:** inherit from `package.json`

Specifies the name of the project and ends up being part of multiple directory names. Therefore, the name can't contain any non-URL-safe characters. Make sure that the name is unique to ensure it does not interfer with other directories on your deployment system (e.g. Linux).

## Version - `version`

 **Default:** inherit from `package.json`

Specifies the version of your code. The name and version together form an identifier that is assumed to be completely unique. It is adviced to increment the version for each release of your code to ensure your project will run flawless without using unintended old version code cached by systems such as a client browser.
