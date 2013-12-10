var http = require("http");
var webServer = require("./webServer.js");
var socketio = require("socket.io");
var format = require("util").format;
var serverState = require("./serverState.js");
var readline = require('readline');
var core = require('./core.js');

var app = http.createServer(webServer);
var io = socketio.listen(app);
var rl = readline.createInterface(process.stdin, process.stdout);
var newConnections = {};

if(process.argv.indexOf("--headless") > -1)
{
    io.set("log level", 0);
}
else
{
    io.set("log level", 2);
}

function loop() {
    try {
        serverState.pump(newConnections);
    }
    catch (exp) {
      if(exp.fileName) {
        console.error(format("%s:%d \"%s\"", exp.fileName, exp.lineNumber,  exp.message));
      }
      else{
        console.error(exp.message);
        console.trace();
      }
    }
};

io.sockets.on("connection", function (socket) {
    socket.on("name", function (name) {
        if (serverState.users[name]
            || newConnections[name]) {
            socket.emit("news", "Name is already in use, try another one.");
        }
        else {
            newConnections[name] = socket;
            socket.emit("good name", name);
        }
    });
    socket.emit("news", "Please enter a name.");
});

if(process.argv.indexOf("--headless") == -1)
{
    rl.setPrompt('MUD ADMIN :> ');
    rl.on('line', function (line) {
        var cmd = line.trim();
        core.log(cmd);
        try {
            core.log(eval(cmd));
        }
        catch (exp) {
            process.stderr.write(exp.message + "\n");
        }
        rl.prompt();
    }).on('close', function () {
        serverState.write();
        process.exit(0);
    });
    rl.prompt();
}

app.listen(8080);
setInterval(loop, 100);
