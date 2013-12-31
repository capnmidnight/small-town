var format = require("util").format;
var ServerState = require("./serverState.js");
var Body = require("./body.js");
var core = require('./core.js');

var serverState = new ServerState();
if (process.argv.indexOf("--test") > -1)
{
    for(var userId in serverState.users){
        var user = serverState.users[userId];
        user.dt = 0;
    }
    var testUser = new Body(serverState, "welcome", 10, {"gold": 10, "small-potion": 1}, null, "testUser");
    serverState.pump();
    function doIt(cmd){
        core.test("\n>>>>> COMMAND:", cmd);
        testUser.inputQ.push(cmd);
        serverState.pump();
    }

    var fs = require("fs");
    var data = fs.readFileSync("script.txt", {encoding:"utf8"});
    var commands = data.split("\n");
    while(commands.length > 0)
        doIt(commands.shift());
    serverState.pump();
}
else
{
    function loop() {
        serverState.pump();
    };

    var http = require("http");
    var webServer = require("./webServer.js");
    var socketio = require("socket.io");
    var app = http.createServer(webServer);
    var io = socketio.listen(app);

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

    if (process.argv.indexOf("--headless") > -1) {
        io.set("log level", 0);
    }
    else{
        io.set("log level", 2);

        var readline = require('readline');
        var rl = readline.createInterface(process.stdin, process.stdout);
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
}
