## AMPS PrimeNG Angular4 Demo

This demo is intended to demonstrate how AMPS can be used as a data source for ag-Grid-based tables and
information panels built as Angular components.


#### Overview
- PrimeNG DataTable is used to display SOW query results;
- large SOW queries performed in a WebWorker process so that the UI is not frozen.


#### Dependencies
- Angular 4.0.0
- PrimeNG 2.0.6
- AMPS JavaScript Client 5.2.2.3


#### Quick Start

In order to try this demo you need:

- Install project dependencies (Node.js and NPM are required):
    npm install

- navigate to the `server` directory and start AMPS server instance:

    <amps_binary_path>/ampServer config.xml

- in the project directory, start dev server:

    npm start

- navigate to `http://localhost:3000` in the browser of your choice.


#### Design

- `OOF` option is set. This can be changed in the `src/app/amps.worker.ts` file;
- SOW queries are performed in a separate worker instance, thus preventing the user interface from 'freezing'.


#### Modifying the source code

All sources are located in three files:

- `src/app/*.component.ts` - components and logic handles user interface and the grid;
- `src/app/*.service.ts` - AMPS connection logic;
- `app/amps.worker.ts` - the WebWorker-encapsulated code that performs the query to AMPS, loads the response and reports back
  to the main process. It contains connection settings.

