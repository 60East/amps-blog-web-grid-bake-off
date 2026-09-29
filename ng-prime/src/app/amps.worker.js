(() => {
  // src/app/amps.worker.ts
  importScripts("amps.js");
  function getTableData(filter) {
    let data = [];
    let client = new amps.Client("my-application");
    return new Promise((resolve, reject) => {
      client.connect("ws://localhost:9000/amps/json").then(() => client.sow(
        (message) => {
          if (message.c === "sow") {
            data.push(message.data);
          }
          if (message.c === "group_end") {
            client.disconnect();
            resolve(data);
          }
        },
        "orders",
        filter,
        { topN: 19700 }
      )).catch(reject);
    });
  }
  onmessage = (event) => {
    getTableData(event.data.filter).then(function(data) {
      postMessage({ success: true, data });
    }).catch(function(err) {
      postMessage({ success: false, error: err });
    });
  };
})();
//# sourceMappingURL=amps.worker.js.map
