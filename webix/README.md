## AMPS Webix DataTable Demo

This project provides a quick introduction into using Webix DataTable with AMPS 
JavaScript client by building a simple web application which utilizes the AMPS 
JavaScript client in order to provide web UI for subscriptions.


#### Prerequisites

- Node.js (**v6.9.1** or higher) with NPM (Node Package Manager). It can be 
  downloaded from [the official website](https://nodejs.org/en/download/) or via 
  your operating system's 
  [package manager](https://nodejs.org/en/download/package-manager/) (preferred).
- AMPS Server **v5.2** or higher.



#### Installation

From the project directory, run the following command:

```bash
npm install --save
```

The above command installs packages required for this application to work. The 
command installs these packages locally in the project directory.


#### Usage

Run the following command:

```bash
npm start
```

Once started, the web interface will be available at `http://localhost:8000`.

Any code modified in the `src` directory will be recompiled automatically while
the `npm start` command is running.



#### AMPS Application settings

Settings are available in `src/constants.ts`, such as:

- *CLIENT_NAME*: The JavaScript Client name;
- *TRANSPORT*: either `ws` or `wss` (`websocket` or `websocket secure` protocol)
- *HOST*: the hostname or IP-address of the AMPS server instance;
- *PORT*: the connection port for sending messages.



#### Quick Demo

This package comes with the AMPS server configuration file and sample data. This 
allows to see the web interface in action without preparing data on the server 
side.

The server demo config is available in `server` directory.

1. Start the AMPS Server with the provided configuration file:

```bash
<PATH_TO_AMPS_SERVER_BINARY>/ampServer amps_instance/amps-config.xml
```

2. When running for the first time, populate the server SOW with the sample data:

```bash
npm run populate-sow
```

3. In web interface, subscribe to a topic `orders` with the filter 
`/id > 500 AND /id < 1000`.

4. Observe the result of the query!



#### Modifying the source code

All code of the application is located in the `src` directory. The application 
consists of the following parts:

- `sql.ts` - Model
- `ui.ts` - View
- `main.ts` - Entry point
- `constants.js` - Client settings

When `npm start` is running, any modifications to the source code will recompile 
and refresh the web interface.

