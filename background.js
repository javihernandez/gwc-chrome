console.log("Loading background.js ...")

var socketServer = 'http://localhost:8081/browserChannel'
var connected = {};

function connectToGPII (solutionId) {
    connected[solutionId] = {};
    var socket = io.connect(socketServer, {'force new connection': true});

    socket.on('connect', function (data) {
        console.log("## on connect");
        console.log("## Sending solutionId");
        socket.send(solutionId);
        connected[solutionId] = { connect: true };
    });

    socket.on("connectionSucceeded", function (settings) {       
        console.log("## on connectionSucceeded - got: " + JSON.stringify(settings));
        connected[solutionId].settings = settings;
    });

    socket.on("onBrowserSettingsChanged", function(settings){
        console.log("onBrowserSettingsChanged: " + JSON.stringify(settings));
        connected[solutionId].settings = settings;
    });

    connected[solutionId].socket = socket;

    socket.socket.on("disconnect", function (request){
        console.log("## on disconnect: " + request);
        connected[solutionId].connect = false;
    });
    
    socket.on("error", function (err){
    	console.log("## on error: " + err);
    	connected[solutionId].connect = false;
    });
};

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    // New client arrives
    if (request.requestNewConnection) {
        console.log("## Received connection request from web page with id '" + request.webId + "'");
        console.log("## request: " + JSON.stringify(request));
        console.log("## sender: " + JSON.stringify(sender));
        // Create a socket connection passing the received webId as solution id
        connectToGPII(request.webId);

        sendResponse({
            success: true,
            settings: connected[request.webId].settings
        });
    }

    if (request.requestSettings) {
        console.log("## Web site with id '" + request.webId + "' has requested its settings");
        console.log("## connected = " + JSON.stringify(connected[request.webId]));
        sendResponse({
            success: true,
            settings: connected[request.webId].settings
        });
    }
});
