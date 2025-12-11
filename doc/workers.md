
# Workers

Workers are small applications with a specific purpose running in the background. Such workers can be used to automate administration, cleanup, maintenance, or any other job. There are two types of workers:

* _Service_: runs continuously and is started at each boot of the deployment system. When exited or crashed the system will automatically restart the service.
* _Task_: runs periodically at fixed time, date, or interval.

## Running your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first worker

In your editor, type the following TypeScript code in `backend/workers/writer.ts`:

```typescript
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeFile(data: string): void {
  const filePath = join(process.cwd(), Date.now().toString());
  writeFileSync(filePath, data);
  console.log('Written file:', filePath);
}

writeFile('Hello, World!');
```

You will notice that this TypeScript file is not yet started by the GlideLite Compiler because it is not yet a real worker, let's change this.

## Define as service or task

To ensure your code will be run as an actual worker, either service or task, you should give the GlideLite Compiler some instructions. This can be done by adding the instruction to the top of the TypeScript file.

To define the TypeScript file as a service:

```javascript
'glc service';
```

To define the TypeScript file as a task:

```javascript
'glc task * * * * *';     // Asterisk (*) means: any value and range
//        | | | | |
//        | | | | `------ Day of the week (0 - 7, where 0 or 7 is Sunday, or the first three letters the particular day: mon,tue,wed...)
//        | | | `-------- Month (1 - 12, or the first three letters the particular month: jan,feb,mar...)
//        | | `---------- Day of the month (1 - 31)
//        | `------------ Hour (0 - 23)
//        `-------------- Minute (0 - 59)

// Examples
'glc task 30 5 * * *';    // Runs each day at 5:30 AM
'glc task 15 14 1 * *';   // Runs the first of each month at 2:15 PM
'glc task 5 4 * * sun';   // Runs each sunday at 4:05 AM

// Ranges
'glc task 30-45 5 * * *'; // Runs each day at every minute from 5:30 AM till 5:45 AM
'glc task 0 22 * * 1-5';  // Runs all weekdays at 10:00 PM

// Steps
'glc task 0 0-5/2 * * *'; // Runs each day from 0:00 AM till 5:00 AM with steps of 2 hours (i.e. 0:00 AM, 2:00 AM, and 4:00 AM)

// Specials
'glc task @annually';     // Run once a year, i.e.  "0 0 1 1 *"
'glc task @yearly';       // Run once a year, i.e.  "0 0 1 1 *"
'glc task @monthly';      // Run once a month, i.e. "0 0 1 * *"
'glc task @weekly';       // Run once a week, i.e.  "0 0 * * 0"
'glc task @daily';        // Run once a day, i.e.   "0 0 * * *"
'glc task @hourly';       // Run once an hour, i.e. "0 * * * *"
'glc task @reboot';       // Run once after reboot
```

> [!WARNING]
> Non-existent times, such as the _missing hours_ during the daylight savings time conversion, will never match, causing workers scheduled during the _missing times_ not to be executed.  Similarly, times that occur more than once (again, during the daylight savings time conversion) will cause matching workers to be executed twice.

Open your editor and update `backend/workers/writer.ts` with the following TypeScript code:

```typescript
'glc service';

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeFile(data: string): void {
  const filePath = join(process.cwd(), Date.now().toString());
  writeFileSync(filePath, data);
  console.log('Written file:', filePath);
}

writeFile('Hello, World!');
```

After saving the TypeScript file, you'll notice that the GlideLite Compiler detects the changes and starts the worker causing a file to be written in your project root directory.

> [!IMPORTANT]
> Only workers defined as a service will be started by the GlideLite Compiler. Workers defined as a task will not run automatically and should be executed manually.

## Use configuration values

The `glconfig.json` configuration file can be used to define global configuration values used throughout the project.

In your editor, type the following JSON in `glconfig.json`:

```json
{
  "user": "John Doe"
}
```

Now make use of this configuration value, update `backend/workers/writer.ts` with the following TypeScript code:

```typescript
'glc service';

import { glconfig } from 'glidelite';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeFile(data: string): void {
  const filePath = join(process.cwd(), Date.now().toString());
  writeFileSync(filePath, data);
  console.log('Written file:', filePath);
}

writeFile(`Hello, ${glconfig.user}!`);
```

By importing the `glidelite` module, it is possible to directly use the values from the `glconfig.json` via the provided `glconfig` object. The GlideLite Compiler will ensure it is linked correctly.

## Use a logger

GlideLite provides a generic logger ensuring uniform output is written to the `/var/log/[project]` directory on the deployment system. These log files are automatically rotated and cleaned up to prevent overflooding the memory. To use a logger you should give it a dedicated name for the application you are working on:

```typescript
log.[name].debug('message');
log.[name].info('message');
log.[name].warn('message');
log.[name].error('message');
```

Let's name your worker `writer` and update `backend/workers/writer.ts` with the following TypeScript code:

```typescript
'glc service';

import { glconfig, log } from 'glidelite';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeFile(data: string): void {
  const filePath = join(process.cwd(), Date.now().toString());
  writeFileSync(filePath, data);
  log.writer.info('Written file:', filePath);
}

writeFile(`Hello, ${glconfig.user}!`);
```

The imported `glidelite` module contains the logger via the provided `log` object. The GlideLite Compiler will ensure a new logger is initiated for your worker.

## Use dependency packages

To use packages as dependency in your TypeScript code, you must list them as `dependencies` or `devDependencies` in your project's `package.json` file.

> [!WARNING]
> Make sure to add the dependencies required in runtime to the `dependencies` attribute and dependencies required only for local development and testing in the `devDependencies` attribute.

In your editor, add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "d3-random": "latest"
  },
  "devDependencies": {
    "@types/d3-random": "latest"
  }
}
```

Stop the local development run by pressing `Ctrl+C`, install the newly added dependencies by running `npm install` and use it in the `backend/workers/writer.ts` TypeScript code:

```typescript
'glc service';

import { randomInt } from 'd3-random';
import { glconfig, log } from 'glidelite';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeFile(data: string): void {
  const filePath = join(process.cwd(), Date.now().toString());
  writeFileSync(filePath, data);
  log.writer.info('Written file:', filePath);
}

writeFile(`Hello, ${glconfig.user} with ID: ${randomInt(1000)()}!`);
```

Restart the local development run to test it again. You should see a newly written file containing the configured value with a random ID.
