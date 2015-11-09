/*
 * GPII Website Connector
 *
 * Copyright 2015 Emergya
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * The research leading to these results has received funding from the
 * European Union's Seventh Framework Programme (FP7/2007-2013) under
 * grant agreement no. 289016.
 *
 * You may obtain a copy of the license at
 * https://github.com/javihernandez/gwc-chrome/blob/master/LICENSE.txt
 */

var socketServer = 'http://localhost:8081/browserChannel';
var allSettings = {};

function connectToGPII (port) {
    // Here we will replace port.solutionId with port.sender.url
    var solutionId = port.solutionId;
    var socket = io.connect(socketServer, {'force new connection': true});

    socket.on("connect", function (data) {
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
        // We can tell the website what's going on
        console.log("## on disconnect: " + request);
    });

    socket.on("error", function (err) {
        // We can tell the website what's going on
    	console.log("## on error: " + err);
    });

    port.onDisconnect.addListener(function () {
        console.log("## port has been closed - closing socket");
        socket.disconnect();
    });
};

// Taken from http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
function extractDomain (url) {
    var domain;
    // Find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    // Find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg.type === "connectionRequest") {
            // Right now, we only check that the solutionId coming from the website
            // matches the domain. Also, we can ask to our privacy system whether this
            // solution is allowed to be used within chrome according to the user's
            // privacy settings.
            console.log("## received connection request from: " + JSON.stringify(msg.solutionId));

            // We'll check that the last two domain levels (i.e. example.com)
            // are the same. Of course, this may change in the future
            //var domain1 = msg.solutionId.split(".").reverse().slice(-2).join(".");
            //var domain2 = extractDomain(port.sender.url).split(".").slice(-2).join(".");

            //if (domain1 === domain2) {
            if (true) {
                port.solutionId = msg.solutionId;
                connectToGPII(port);
                port.postMessage({accepted: true});
                console.log("## accepted connection request from: " + JSON.stringify(msg.solutionId));
            } else {
                port.postMessage({accepted: false});
                console.log("## rejected connection request from: " + JSON.stringify(msg.solutionId));
            }
        };
    });
});
