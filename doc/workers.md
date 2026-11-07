
# Workers

Workers are small applications with a specific purpose that run in the background. You can use them to automate administration, cleanup, maintenance, or any other job. There are two types:

* _Service_: runs continuously and starts automatically when the deployment system boots. If it exits or crashes, the system restarts it within a minute.
* _Task_: runs periodically, at a fixed time, date, or interval.

## Run your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first worker

In your editor, add the following TypeScript code to `backend/workers/heartbeat.ts`:

```typescript
// Log a heartbeat each 10 seconds
const heartbeatTimer = setInterval(() => {
  console.log('Heartbeat expired');
}, 10000);

// Stop the heartbeat on interrupt
process.on('SIGINT', () => {
  console.log('Heartbeat stopped');
  clearInterval(heartbeatTimer);
});

console.log('Heartbeat started');
```

The GlideLite Compiler won't start this file yet, because it isn't defined as a worker. Let's fix that.

## Define a service or task

To have the GlideLite Compiler run your code as an actual worker — either a service or a task — add an instruction to the top of the TypeScript file.

To define the file as a service:

```javascript
'glc service';
```

To define the file as a task:

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
> Non-existent times, such as the _missing hours_ during the daylight savings time conversion, will never match, causing workers scheduled during the _missing times_ not to be executed. Similarly, times that occur more than once (again, during the daylight savings time conversion) will cause matching workers to be executed twice.

Open your editor and update `backend/workers/heartbeat.ts` with the following TypeScript code:

```typescript
'glc service';

...
```

After saving the file, the GlideLite Compiler detects the change and starts the worker, writing a heartbeat log to the console continuously.

> [!IMPORTANT]
> Only workers defined as a service are started automatically by the GlideLite Compiler. Workers defined as a task need to be run manually.

## Manually run a task

In your editor, add the following TypeScript code to `backend/workers/reset.ts`:

```typescript
// In production this task will be executed once a day
'glc task @daily';

console.log('Nothing to be done');
```

After saving the file, the GlideLite Compiler warns that the worker is skipped and needs to be run manually — handy for testing it during development:

```bash
npx ts-node ./backend/workers/reset.ts
```

## Further Reading

Get more out of GlideLite and learn how to [use configuration values](https://github.com/sanderveldhuis/glidelite/blob/main/doc/using-configuration-values.md) in your code.
