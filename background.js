var socketServer = 'http://localhost:8081/browserChannel';
var allSettings = {};

function connectToGPII (port) {
    // Here we will replace port.solutionId with port.sender.url
    var solutionId = port.solutionId;
    var socket = io.connect(socketServer, {'force new connection': true});

    socket.on('connect', function (data) {
        socket.send(solutionId);
    });

    socket.on("connectionSucceeded", function (settings) {
        console.log("## on connectionSucceeded - got: " + JSON.stringify(settings));
        allSettings[solutionId] = settings;
        port.postMessage({settings: settings});
    });

    socket.on("onBrowserSettingsChanged", function (settings) {
        console.log("onBrowserSettingsChanged: " + JSON.stringify(settings));
        allSettings[solutionId] = settings;
        port.postMessage({settings: settings});
    });

    socket.socket.on("disconnect", function (request) {
        console.log("## on disconnect: " + request);
    });

    socket.on("error", function (err) {
    	console.log("## on error: " + err);
    });

    port.onDisconnect.addListener(function () {
        console.log("## port has been closed - closing socket");
        socket.disconnect();
    });
};

chrome.runtime.onConnectExternal.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
      if (msg.type === "connectionRequest") {
          // In a real scenario, we will check that this connection is trusted.
          // For instance, we can use port.sender.url to ensure that the solutionId
          // matches the domain. Also, we can ask to our privacy system whether this
          // solution is allowed to be used within chrome according to the user's
          // privacy settings.
          console.log("## received connection request from: " + JSON.stringify(msg.solutionId));
          port.solutionId = msg.solutionId;
          connectToGPII(port);
          port.postMessage({accepted: true});
      };
  });
});
