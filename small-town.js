var format = require("util").format,
    fs = require("fs"),
    ServerState = require("./src/serverState.js"),
    Body = require("./src/body.js"),
    core = require('./src/core.js'),
    serverState = new ServerState();

if (process.argv.indexOf("--test") > -1)
{
    for(var userId in serverState.users)
        serverState.users[userId].dt = 0;

    var testUser = new Body(serverState, "testUser", "welcome", 10, {"gold": 10, "small-potion": 1});
    serverState.pump();
    function doIt(cmd){
        core.test("\n>>>>> COMMAND:", cmd);
        testUser.inputQ.push(cmd);
        serverState.pump();
    }

    var data = fs.readFileSync("./test/script.txt", {encoding:"utf8"});
    var commands = data.split("\n");
    while(commands.length > 0)
        doIt(commands.shift().trim());
    serverState.pump();
}
else
{
    var http = require("http"),
        webServer = require("./src/webServer.js"),
        socketio = require("socket.io"),
        app = http.createServer(webServer("./web/")),
        io = socketio.listen(app);

    io.sockets.on("connection", function (socket) {
        socket.on("name", function (name) {
            if (serverState.isNameInUse(name))
                socket.emit("bad name", "Name is already in use, try another one.");
            else if(!name.match(/^[a-zA-Z][a-zA-Z0-9\-]{3,}$/))
                socket.emit("bad name", "Bad name.\n\n"
+"Name must be at least 4 characters long and it can only be composed of letters,"
+"numbers, or dash '-'. The first character may not be a number.");
            else {
                var message = fs.existsSync("users/" + name + ".js")
                    ? "User account found:"
                    : "Create a new user account:";
                socket.set("userName", name, function(){
                    socket.emit("good name", message);
                });
            }
        });
        socket.on("password", function(password) {
            socket.get("userName", function(err, name){
                var fileName = "users/" + name + ".js";
                fs.readFile(fileName, {encoding:"utf8"}, function(err, jsn){
                    var roomId = "welcome";
                    var hp = 100;
                    var items = { "gold": 10 };
                    var equipment = null;
                    var passwordMessage = "";
                    if(!err){
                        var obj = JSON.parse(jsn);
                        if(password != obj.password)
                            passwordMessage = "Incorrect password";
                        else{
                            passwordMessage = "Success!";
                            roomId = obj.roomId;
                            hp = obj.hp;
                            items = obj.items;
                            equipment = obj.equipment;
                        }
                    }
                    else if(password.length < 8)
                        passwordMessage = "Password must be at least 8 characters long";
                    else
                        passwordMessage = "Success!";

                    if(passwordMessage != "Success!")
                        socket.emit("bad password", passwordMessage);
                    else {
                        socket.emit("good password", passwordMessage);
                        serverState.users[name] = new Body(serverState, name, roomId, hp, items, equipment, socket, password);
                    }
                });
            });
        });
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

    setInterval(function loop() {
        serverState.pump();
    }, 10);
}
