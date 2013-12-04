var http = require("http");
var webServer = require("./webServer.js");
var app = http.createServer(webServer);
var socketsio = require("socket.io");
var io = socketsio.listen(app);
var fs = require("fs");
var format = require("util").format;
var serverState = require("./serverState.js");
var core = require("./core.js");
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
var timer = null;
var newConnections = {};

var loop = function () {
    try {
        serverState.pump(newConnections);
    }
    catch (exp) {
      if(exp.fileName) {
        console.error(format("%s:%d \"%s\"", exp.fileName, exp.lineNumber,  exp.message));
      }
      else{
        Error.captureStackTrace(exp);
        console.error(exp.stack);
      }
    }
};

io.sockets.on("connection", function (socket) {
    socket.on("name", function (name) {
        console.log("naming", name);
        if (serverState.users[name] || newConnections[name]) {
            console.log("old name");
            socket.emit("news", "Name is already in use, try another one.");
        }
        else {
            console.log("new name");
            newConnections[name] = socket;
            socket.emit("good name", name);
        }
    });
    socket.emit("news", "Please enter a name.");
});


app.listen(8080);
timer = setInterval(loop, 100);

rl.setPrompt('MUDADMIN :> ');
rl.on('line', function (line) {
    var cmd = line.trim();
    console.log(cmd);
    try {
        console.log(eval(cmd));
    }
    catch (exp) {
        process.stderr.write(exp.message + "\n");
    }
    rl.prompt();
}).on('close', function () {
    console.log('Have a great day!');
    process.exit(0);
});

rl.prompt();




