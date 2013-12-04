var http = require("http");
var webServer = require("./webServer.js");
var socketsio = require("socket.io");
var format = require("util").format;
var serverState = require("./serverState.js");
var readline = require('readline');
var core = require('./core.js');

var app = http.createServer(webServer);
var io = socketsio.listen(app);
var rl = readline.createInterface(process.stdin, process.stdout);
var newConnections = {};

function loop() {
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
        if (serverState.users[name]
            || newConnections[name]) {
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

rl.setPrompt('MUD ADMIN :> ');
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


app.listen(8080);
setInterval(loop, 100);
rl.prompt();








