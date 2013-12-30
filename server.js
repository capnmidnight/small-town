var http = require("http");
var webServer = require("./webServer.js");
var socketio = require("socket.io");
var format = require("util").format;
var ServerState = require("./serverState.js");
var readline = require('readline');
var core = require('./core.js');

var app = http.createServer(webServer);
var io = socketio.listen(app);
var rl = readline.createInterface(process.stdin, process.stdout);

var serverState = new ServerState();

if (process.argv.indexOf("--headless") > -1) {
    io.set("log level", 0);
}
else {
    io.set("log level", 2);
}

function loop() {
    serverState.pump();
};

io.sockets.on("connection", function (socket) {
    socket.on("name", function (name) {
        if (serverState.isNameInUse(name)) {
            socket.emit("news", "Name is already in use, try another one.");
        }
        else {
            serverState.addConnection(name, socket);
            socket.emit("good name", name);
        }
    });
    socket.emit("news", "Please enter a name.");
});

if (process.argv.indexOf("--headless") == -1) {
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
        process.exit(0);
    });
    rl.prompt();
}

app.listen(8080);
setInterval(loop, 100);
