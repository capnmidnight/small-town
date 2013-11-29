var http = require("http");
var app = http.createServer(handler);
var socketsio = require("socket.io");;
var io = socketsio.listen(app);
var fs = require("fs");
var core = require("./core.js");
var serverState = require("./serverState.js");

app.listen(8080);

done = false;

// gives every object in an associative array access to its
// own key name.

serverState.everyone.player.inputQ.push("look");

var timer = null;
var loop = function ()
{
    if (done)
    {
        clearInterval(timer);
    }
    else
    {
        for (var bodyId in serverState.everyone)
        {
            var body = serverState.everyone[bodyId];
            body["update"]();
            while (body.inputQ.length > 0)
                body.doCommand();
        }
    }
};
timer = setInterval(loop, 100);

function handler(req, res)
{
    fs.readFile(__dirname + "/index.html",
    function(err, data)
    {
        if(err)
        {
            res.writeHead(500);
            res.end("error loading index.html");
        }
        else
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        }
    });
}

function getCommand(data)
{
    console.log(data);
    serverState.everyone.player.inputQ.push(data);
}

io.sockets.on("connection", function(socket)
{
    serverState.everyone.player.socket = socket;
    socket.on("cmd", getCommand);
});
