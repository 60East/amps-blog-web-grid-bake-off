## AMPS Kendo React Demo

This demo is intended to demonstrate how AMPS can be used as a data source for ag-Grid-based tables and
information panels built as React components.


#### Overview
- React Components are used to encapsulate interface elements and logic;
- Large sow queries performed in a WebWorker process so that the UI is not frozen.


#### Dependencies
- React 16.12.0
- Kendo React Grid 3.10.1
- AMPS JavaScript client 5.2.2.3


#### Quick Start

In order to try this demo you need:

- Install project dependencies (Node.js and NPM are required):
    npm install

- navigate to the `server` directory and start AMPS server instance:

    <amps_binary_path>/ampServer config.xml

- in the project directory, start dev server:

    npm start

- navigate to `http://localhost:8080` in the browser of your choice.


#### Interface

- `Re-Populate SOW` button will erase everything in the `orders` topic and then will publish 20,000 messages to it.
  This behavior can be changed by modifying the `src/populate_sow.js` file.

- `Send Random Updates` checkbox, once activated, will publish random updates to the `orders` topic.
  This behavior can be changed by modifying the `src/populate_sow.js` file.

- **Query Interface** allows to `sow_and_subscribe` to any topic, with optional *filter*, *bookmark*, *orderBy* and other values.


#### Design

- `OOF` option is set. This can be changed in the `src/query_worker.js` file;
- SOW queries are performed in a separate worker instance, thus preventing the user interface from 'freezing'.


#### Modifying the source code

All sources are located in three files:

- `src/*.jsx` - components and logic handles user interface and the grid;
- `src/populate_sow.js` - helper script that populates the `orders` topic and can send random updates to it;
- `src/query_worker.js` - the WebWorker-encapsulated code that performs the query to AMPS, loads the response and reports back
  to the main process. It contains connection settings.

