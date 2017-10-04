## AMPS HyperGrid Demo

This demo is intended to demonstrate how AMPS can be used as a data source for HyperGrid-based tables and 
information panels.


#### Overview
- No installation required
- No building required
- large SOW queries performed in a WebWorker process so that the UI is not frozen.
- The datatable is VERY snappy and responsive.


#### Dependencies
- HyperGrid 2.0.2
- AMPS JavaScript Client 5.2.2.0


#### Quick Start

In order to try this demo you need:

- navigate to the `server` directory and start AMPS server instance:

    <amps_binary_path>/ampServer config.xml

- in the project directory, start a simple HTTP server (it is required for WebSockets to work):

    python -m SimpleHTTPServer 8000

- navigate to `http://localhost:8000` in the browser of your choice.


#### Interface

- `Re-Populate SOW` button will erase everything in the `orders` topic and then will publish 20,000 messages to it.
  This behavior can be changed by modifying the `src/populate_sow.js` file.

- `Send Random Updates` checkbox, once activated, will publish random updates to the `orders` topic.
  This behavior can be changed by modifying the `src/populate_sow.js` file.

- **Query Interface** allows to `sow_and_subscribe` to any topic, with optional *filter*, *bookmark*, *orderBy* and other values.


#### Design

- `OOF` and the `conflation=1s` options are set. This can be changed in the `src/query_worker.js` file;
- SOW queries are performed in a separate worker instance, thus preventing the user interface from 'freezing'.


#### Modifying the source code

All sources are located in three files:

- `src/index.js` - main logic that handles user interface and the grid;
- `src/populate_sow.js` - helper script that populates the `orders` topic and can send random updates to it;
- `src/query_worker.js` - the WebWorker-encapsulated code that performs the query to AMPS, loads the response and reports back 
  to the main process. It contains connection settings;

