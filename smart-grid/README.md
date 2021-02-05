## AMPS smart-grid React Demo

This demo is intended to demonstrate how AMPS can be used as a data source for smart-grid-based tables and
information panels built as React components.


#### Overview
- React Components are used to encapsulate interface elements and logic;
- Large sow queries performed in a WebWorker process so that the UI is not frozen.


#### Dependencies
- React 17
- smart-grid 0.3.1
- AMPS JavaScript client 5.3.2.0


#### Quick Start

In order to try this demo you need:

- Install project dependencies (Node.js and NPM are required):
    npm install

- navigate to the `server` directory and start AMPS server instance:

    <amps_binary_path>/ampServer config.xml

- in the project directory, start dev server:

    npm start

- navigate to `http://localhost:3000` in the browser of your choice.


#### Interface

- **Query Interface** allows to `sow_and_subscribe` to any topic, with optional *filter*, *bookmark*, *orderBy* and other values.


#### Design

- `OOF` option is set. This can be changed in the `src/query_worker.js` file;
- SOW queries are performed in a separate worker instance, thus preventing the user interface from 'freezing'.


#### Modifying the source code

All sources are located in `src/*.js` - components and logic handles user interface and the grid.
