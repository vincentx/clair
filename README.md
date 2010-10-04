Clair
=====

Clair is an HTML5 + JavaScript + WebSocket VNC viewer/client, which makes use of a server written in [node.js](http://nodejs.org/ "node.js"). The server-side half of Clair exposes the TCP/IP socket over WebSocket as well as provides additional features to maximize the performance of the client. The client by itself, is also a fully implemented VNC viewer/client only using JavaScript and HTML 5 technologies. It can access to your VNC server through a WebSocket connection(may require a proxy or the support of WebSocket by VNC server), however for the sake of performance, the Clair Server is highly recommended.

Installation
------------

To get the Clair server running, you need to have [node.js](http://nodejs.org/ "node.js"), [node-wesocket-server](http://github.com/miksago/node-websocket-server "node-websocket-server") and [node-jpeg](http://github.com/pkrumins/node-jpeg, "node-jpeg") installed. Then you can start the server by:

node clair.js

For client side, please consult the examples folder
