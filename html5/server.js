var http = require("http");
var app = http.createServer(handler);
var socketsio = require("socket.io");;
var mime = require("mime");
var io = socketsio.listen(app);
var fs = require("fs");
var core = require("./core.js");
var format = require("util").format;
var serverState = require("./serverState.js");
var Body = require("./body.js");

var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('MUDADMIN :> ');
rl.prompt();

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

var timer = null;
var loop = function () {
    try {
        serverState.respawn();
        for (var bodyId in serverState.users) {
            var body = serverState.users[bodyId];
            if (body.quit) {
                console.log(format("%s quit", bodyId));
                delete serverState.users[bodyId];
            }
            else {
                body.update();
                while (body.inputQ.length > 0)
                    body.doCommand();
            }
        }
    }
    catch (exp) {
        process.stderr.write(format("%s {%s\n}\n",
            exp.message,
            core.hashMap(exp, function (k, v) {
                return format("\n\t%s: %s", k, v);
            }).join("\n")));
    }
};
timer = setInterval(loop, 100);

function handler(req, res) {
    console.log("REQUEST:", req.method, req.url);
    if (req.method === "GET" && req.url[0] === "/") {
        if (req.url.length == 1)
            req.url += "index.html";
        var path = __dirname + req.url;
        fs.readFile(path,
        function (err, data) {
            if (err) {
                serverError(res, req.url);
            }
            else {
                res.writeHead(200, { "Content-Type": mime.lookup(path) });
                res.end(data);
            }
        });
    }
    else {
        serverError(res);
    }
}

function serverError(res, path) {
    if (path) {
        res.writeHead(404);
        res.end("error loading " + path.substring(1));
    }
    else {
        res.writeHead(500);
        res.end("error");
    }
}

io.sockets.on("connection", function (socket) {
    socket.on("name", function (name) {
        console.log("naming", name);
        if (serverState.users[name]) {
            console.log("old name");
            socket.emit("news", "Name is already in use, try another one.");
        }
        else {
            console.log("new name");
            serverState.users[name] = new Body("welcome", 100, { "gold": 10 }, null, name, socket);
            socket.emit("good name", name);
        }
    });
    socket.emit("news", "Please enter a name.");
});
